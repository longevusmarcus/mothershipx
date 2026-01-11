-- Add moderation policies for squad_messages

-- Allow message authors to delete their own messages
CREATE POLICY "Authors can delete their own messages"
ON public.squad_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Allow squad leads to delete any message in their squad
CREATE POLICY "Squad leads can delete messages"
ON public.squad_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.squads
    WHERE squads.id = squad_messages.squad_id
    AND squads.lead_id = auth.uid()
  )
);

-- Allow authors to update their own messages (for editing)
CREATE POLICY "Authors can update their own messages"
ON public.squad_messages
FOR UPDATE
USING (auth.uid() = user_id);