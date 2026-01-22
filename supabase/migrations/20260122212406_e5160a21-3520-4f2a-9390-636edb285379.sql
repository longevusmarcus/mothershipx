-- Create audit_logs table for tracking sensitive operations
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for common queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- No direct inserts from clients - only via functions
CREATE POLICY "No direct client inserts"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (false);

-- Create helper function for inserting audit logs (used by edge functions/triggers)
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, entity_type, entity_id, 
    old_value, new_value, metadata, ip_address, user_agent
  )
  VALUES (
    p_user_id, p_action, p_entity_type, p_entity_id,
    p_old_value, p_new_value, p_metadata, p_ip_address, p_user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create trigger to auto-log role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM insert_audit_log(
      NEW.user_id,
      'role_granted',
      'user_roles',
      NEW.id::text,
      NULL,
      jsonb_build_object('role', NEW.role),
      jsonb_build_object('granted_at', NEW.created_at)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM insert_audit_log(
      OLD.user_id,
      'role_revoked',
      'user_roles',
      OLD.id::text,
      jsonb_build_object('role', OLD.role),
      NULL,
      jsonb_build_object('revoked_at', now())
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_user_roles_changes
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_role_changes();

-- Create trigger to auto-log subscription changes
CREATE OR REPLACE FUNCTION public.audit_subscription_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM insert_audit_log(
      NEW.user_id,
      'subscription_created',
      'subscriptions',
      NEW.id::text,
      NULL,
      jsonb_build_object('status', NEW.status, 'price_id', NEW.price_id),
      jsonb_build_object('stripe_subscription_id', NEW.stripe_subscription_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM insert_audit_log(
        NEW.user_id,
        'subscription_updated',
        'subscriptions',
        NEW.id::text,
        jsonb_build_object('status', OLD.status, 'cancel_at_period_end', OLD.cancel_at_period_end),
        jsonb_build_object('status', NEW.status, 'cancel_at_period_end', NEW.cancel_at_period_end),
        jsonb_build_object('stripe_subscription_id', NEW.stripe_subscription_id)
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_subscription_changes
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.audit_subscription_changes();