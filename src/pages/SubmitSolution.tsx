import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ExternalLink, 
  Github, 
  CreditCard, 
  Database, 
  FileText, 
  Target, 
  Users, 
  Rocket,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SubmissionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

const SubmitSolution = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Product Details
    productUrl: "",
    productName: "",
    demoUrl: "",
    
    // Narrative
    problemStatement: "",
    solutionNarrative: "",
    uniqueValue: "",
    
    // Target & GTM
    targetPersona: "",
    gtmStrategy: "",
    pricingModel: "",
    
    // Integrations
    githubRepo: "",
    stripePublicKey: "",
    supabaseProjectUrl: "",
    analyticsId: "",
  });

  const steps: SubmissionStep[] = [
    { id: "product", title: "Product Details", description: "URL, demo, and basic info", icon: ExternalLink, completed: currentStep > 0 },
    { id: "narrative", title: "Problem → Solution", description: "Your solution narrative", icon: FileText, completed: currentStep > 1 },
    { id: "gtm", title: "Target & GTM", description: "Persona and go-to-market", icon: Target, completed: currentStep > 2 },
    { id: "integrations", title: "Integrations", description: "Connect your data sources", icon: Database, completed: currentStep > 3 },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    toast({
      title: "Solution Submitted",
      description: "Your solution is now being verified. Check back soon for your fit score.",
    });
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <AppLayout title="Submit Solution">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <Badge variant="glow" className="mb-2">
            <Rocket className="h-3 w-3 mr-1" />
            New Submission
          </Badge>
          <h1 className="text-2xl font-bold">Submit Your Solution</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Connect your work to the verification engine. The market will judge your problem-solution fit.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-2 ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        index < currentStep 
                          ? 'bg-success text-success-foreground' 
                          : index === currentStep 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary text-muted-foreground'
                      }`}>
                        {index < currentStep ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 lg:w-24 h-0.5 mx-2 ${index < currentStep ? 'bg-success' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={progressValue} size="sm" indicatorColor="gradient" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Steps */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = steps[currentStep].icon;
                  return <StepIcon className="h-5 w-5 text-primary" />;
                })()}
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      placeholder="OnboardFlow"
                      value={formData.productName}
                      onChange={(e) => handleInputChange("productName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productUrl">Product URL</Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="productUrl"
                        placeholder="https://onboardflow.app"
                        className="pl-10"
                        value={formData.productUrl}
                        onChange={(e) => handleInputChange("productUrl", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demoUrl">Demo / Video URL (optional)</Label>
                    <Input
                      id="demoUrl"
                      placeholder="https://loom.com/share/..."
                      value={formData.demoUrl}
                      onChange={(e) => handleInputChange("demoUrl", e.target.value)}
                    />
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="problemStatement">Problem Statement</Label>
                    <p className="text-xs text-muted-foreground">What specific pain point does your solution address?</p>
                    <Textarea
                      id="problemStatement"
                      placeholder="Users struggle with complex onboarding flows in SaaS apps, leading to 40% drop-off rates..."
                      className="min-h-24"
                      value={formData.problemStatement}
                      onChange={(e) => handleInputChange("problemStatement", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solutionNarrative">Solution Narrative</Label>
                    <p className="text-xs text-muted-foreground">How does your product solve this problem?</p>
                    <Textarea
                      id="solutionNarrative"
                      placeholder="OnboardFlow provides a no-code builder for creating personalized onboarding experiences..."
                      className="min-h-24"
                      value={formData.solutionNarrative}
                      onChange={(e) => handleInputChange("solutionNarrative", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uniqueValue">Unique Value Proposition</Label>
                    <Textarea
                      id="uniqueValue"
                      placeholder="Unlike generic onboarding tools, OnboardFlow uses AI to adapt flows based on user behavior..."
                      className="min-h-20"
                      value={formData.uniqueValue}
                      onChange={(e) => handleInputChange("uniqueValue", e.target.value)}
                    />
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="targetPersona">Target Persona</Label>
                    <p className="text-xs text-muted-foreground">Who is your ideal customer?</p>
                    <Textarea
                      id="targetPersona"
                      placeholder="Product managers at B2B SaaS companies with 10-100 employees, struggling with user activation..."
                      className="min-h-24"
                      value={formData.targetPersona}
                      onChange={(e) => handleInputChange("targetPersona", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gtmStrategy">Go-to-Market Strategy</Label>
                    <Textarea
                      id="gtmStrategy"
                      placeholder="Product-led growth with freemium tier, targeting Product Hunt launch and content marketing..."
                      className="min-h-24"
                      value={formData.gtmStrategy}
                      onChange={(e) => handleInputChange("gtmStrategy", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricingModel">Pricing Model</Label>
                    <Input
                      id="pricingModel"
                      placeholder="Freemium with Pro at $49/mo"
                      value={formData.pricingModel}
                      onChange={(e) => handleInputChange("pricingModel", e.target.value)}
                    />
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Connect Your Data Sources</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          These integrations help verify your solution with real signals like adoption and revenue.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubRepo" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub Repository
                    </Label>
                    <Input
                      id="githubRepo"
                      placeholder="https://github.com/username/repo"
                      value={formData.githubRepo}
                      onChange={(e) => handleInputChange("githubRepo", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">We'll track build momentum and activity</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Stripe Publishable Key (optional)
                    </Label>
                    <Input
                      id="stripePublicKey"
                      placeholder="pk_live_..."
                      value={formData.stripePublicKey}
                      onChange={(e) => handleInputChange("stripePublicKey", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Read-only access to verify revenue signals</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supabaseProjectUrl" className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Supabase Project URL (optional)
                    </Label>
                    <Input
                      id="supabaseProjectUrl"
                      placeholder="https://xyzcompany.supabase.co"
                      value={formData.supabaseProjectUrl}
                      onChange={(e) => handleInputChange("supabaseProjectUrl", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Connect for adoption velocity data</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="analyticsId">Analytics ID (optional)</Label>
                    <Input
                      id="analyticsId"
                      placeholder="GA-XXXXXXXX or Plausible domain"
                      value={formData.analyticsId}
                      onChange={(e) => handleInputChange("analyticsId", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button onClick={handleNext}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    variant="glow" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Solution"}
                    <Rocket className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SubmitSolution;
