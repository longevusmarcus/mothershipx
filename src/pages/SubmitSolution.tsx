import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  Github, 
  CreditCard, 
  Database, 
  Rocket,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
  Target,
  Users,
  Zap
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FitVerificationPanel } from "@/components/FitVerificationPanel";

interface SubmissionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

interface AIGeneratedData {
  problemStatement: string;
  solutionNarrative: string;
  uniqueValue: string;
  targetPersona: string;
  gtmStrategy: string;
  pricingModel: string;
}

interface FitVerificationData {
  sentimentFitScore: number;
  problemCoverage: number;
  adoptionVelocity: number;
  revenuePresent: boolean;
  revenueAmount?: string;
  buildMomentum: number;
  misalignments: string[];
}

const SubmitSolution = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    productUrl: "",
    productName: "",
    demoUrl: "",
    githubRepo: "",
    stripePublicKey: "",
    supabaseProjectUrl: "",
  });

  const [aiGeneratedData, setAiGeneratedData] = useState<AIGeneratedData | null>(null);
  const [fitVerificationData, setFitVerificationData] = useState<FitVerificationData | null>(null);

  const steps: SubmissionStep[] = [
    { id: "integrations", title: "Connect Sources", description: "Product URL & integrations", icon: Database, completed: currentStep > 0 },
    { id: "analysis", title: "AI Analysis", description: "Generating narrative & GTM", icon: Sparkles, completed: currentStep > 1 },
    { id: "verification", title: "Fit Verification", description: "Problem-solution fit score", icon: Target, completed: currentStep > 2 },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const simulateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(1);
    
    // Simulate progress
    const progressSteps = [
      { progress: 15, delay: 500 },
      { progress: 35, delay: 800 },
      { progress: 55, delay: 600 },
      { progress: 75, delay: 700 },
      { progress: 90, delay: 500 },
      { progress: 100, delay: 400 },
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setAnalysisProgress(step.progress);
    }

    // Mock AI-generated data based on product URL
    const productName = formData.productName || "Your Product";
    setAiGeneratedData({
      problemStatement: `Users struggle with inefficient workflows and manual processes that waste time and reduce productivity. ${productName} addresses the critical pain point of operational inefficiency in modern teams.`,
      solutionNarrative: `${productName} provides an intelligent automation platform that streamlines repetitive tasks, integrates seamlessly with existing tools, and learns from user behavior to continuously optimize workflows.`,
      uniqueValue: `Unlike generic automation tools, ${productName} uses AI-powered pattern recognition to proactively suggest optimizations and adapts to each team's unique processes.`,
      targetPersona: "Operations managers and team leads at growing tech companies (50-500 employees) who spend 10+ hours weekly on manual coordination tasks.",
      gtmStrategy: "Product-led growth with freemium tier targeting early-stage startups, combined with enterprise sales motion for larger organizations. Focus on Product Hunt launch and LinkedIn thought leadership.",
      pricingModel: "Freemium with Pro at $29/user/mo and Enterprise custom pricing",
    });

    // Calculate fit verification based on integrations provided
    const hasRevenue = formData.stripePublicKey.length > 0;
    const hasGithub = formData.githubRepo.length > 0;
    const hasSupabase = formData.supabaseProjectUrl.length > 0;
    
    const baseScore = 55;
    const integrationBonus = (hasGithub ? 15 : 0) + (hasRevenue ? 15 : 0) + (hasSupabase ? 10 : 0);
    
    const misalignments: string[] = [];
    if (!hasGithub) misalignments.push("No GitHub repository connected - build momentum cannot be verified");
    if (!hasRevenue) misalignments.push("No Stripe integration - revenue signals unavailable");
    if (!hasSupabase) misalignments.push("No Supabase connection - adoption velocity is estimated");

    setFitVerificationData({
      sentimentFitScore: Math.min(95, baseScore + integrationBonus + Math.floor(Math.random() * 15)),
      problemCoverage: Math.min(90, baseScore + Math.floor(Math.random() * 20)),
      adoptionVelocity: hasSupabase ? Math.floor(Math.random() * 150) + 50 : Math.floor(Math.random() * 30) + 10,
      revenuePresent: hasRevenue,
      revenueAmount: hasRevenue ? "$" + (Math.floor(Math.random() * 5000) + 500) + "/mo" : undefined,
      buildMomentum: hasGithub ? Math.min(95, 60 + Math.floor(Math.random() * 35)) : 25,
      misalignments,
    });

    setIsAnalyzing(false);
    setCurrentStep(2);
  };

  const handleSubmit = () => {
    toast({
      title: "Solution Submitted",
      description: "Your solution is now live on the problem dashboard. Good luck!",
    });
  };

  const canProceed = formData.productUrl.length > 0 && formData.productName.length > 0;
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <AppLayout title="New Build">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <Badge variant="glow" className="mb-2">
            <Rocket className="h-3 w-3 mr-1" />
            New Build
          </Badge>
          <h1 className="text-2xl font-bold">Submit Your Solution</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Connect your data sources and let AI analyze your problem-solution fit.
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
                        ) : index === 1 && isAnalyzing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
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

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Connect Your Sources
                  </CardTitle>
                  <CardDescription>
                    Provide your product details and connect data sources for verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Required Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        placeholder="OnboardFlow"
                        value={formData.productName}
                        onChange={(e) => handleInputChange("productName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productUrl">Product URL *</Label>
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
                  </div>

                  {/* Integration Fields */}
                  <div className="pt-4 border-t border-border">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Connect Data Sources</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            More integrations = higher verification accuracy & better fit scores
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
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
                        <p className="text-xs text-muted-foreground">Track build momentum & activity</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stripePublicKey" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Stripe Publishable Key
                        </Label>
                        <Input
                          id="stripePublicKey"
                          placeholder="pk_live_..."
                          value={formData.stripePublicKey}
                          onChange={(e) => handleInputChange("stripePublicKey", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Verify revenue signals</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supabaseProjectUrl" className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Supabase Project URL
                        </Label>
                        <Input
                          id="supabaseProjectUrl"
                          placeholder="https://xyzcompany.supabase.co"
                          value={formData.supabaseProjectUrl}
                          onChange={(e) => handleInputChange("supabaseProjectUrl", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Measure adoption velocity</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end pt-4 border-t border-border">
                    <Button onClick={simulateAIAnalysis} disabled={!canProceed} variant="glow">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze with AI
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 1 && isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glow">
                <CardContent className="py-12">
                  <div className="text-center space-y-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-16 w-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center"
                    >
                      <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">AI Analysis in Progress</h3>
                      <p className="text-muted-foreground">
                        Analyzing your product and generating insights...
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-3">
                      <Progress value={analysisProgress} size="lg" indicatorColor="gradient" />
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant={analysisProgress >= 20 ? "success" : "secondary"} className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Scraping Product
                        </Badge>
                        <Badge variant={analysisProgress >= 45 ? "success" : "secondary"} className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Identifying Persona
                        </Badge>
                        <Badge variant={analysisProgress >= 70 ? "success" : "secondary"} className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Generating GTM
                        </Badge>
                        <Badge variant={analysisProgress >= 90 ? "success" : "secondary"} className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Scoring Fit
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && aiGeneratedData && fitVerificationData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* AI Generated Narrative & GTM */}
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI-Generated Analysis</CardTitle>
                      <CardDescription>Based on your product data</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Problem-Solution Narrative */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Problem → Solution Narrative
                    </h4>
                    <div className="grid gap-3">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Problem Statement</p>
                        <p className="text-sm">{aiGeneratedData.problemStatement}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Solution Narrative</p>
                        <p className="text-sm">{aiGeneratedData.solutionNarrative}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Unique Value Proposition</p>
                        <p className="text-sm">{aiGeneratedData.uniqueValue}</p>
                      </div>
                    </div>
                  </div>

                  {/* Target & GTM */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Target Persona & GTM Strategy
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Target Persona</p>
                        <p className="text-sm">{aiGeneratedData.targetPersona}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Go-to-Market Strategy</p>
                        <p className="text-sm">{aiGeneratedData.gtmStrategy}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Suggested Pricing</p>
                      <p className="text-sm font-medium">{aiGeneratedData.pricingModel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fit Verification Panel */}
              <FitVerificationPanel {...fitVerificationData} />

              {/* Submit Button */}
              <Card variant="elevated">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Ready to compete?</p>
                      <p className="text-xs text-muted-foreground">Submit your solution to the problem dashboard</p>
                    </div>
                    <Button variant="glow" onClick={handleSubmit}>
                      <Rocket className="h-4 w-4 mr-2" />
                      Submit Solution
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default SubmitSolution;