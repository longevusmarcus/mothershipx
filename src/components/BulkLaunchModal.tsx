import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, AlertTriangle, Check, Loader2, ExternalLink, Terminal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProblems } from "@/hooks/useProblems";
import { generateLovablePrompt } from "@/lib/buildLovablePrompt";
import lovableLogo from "@/assets/lovable-logo.png";

type Platform = "lovable" | "claude";

interface BulkLaunchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkLaunchModal({ open, onOpenChange }: BulkLaunchModalProps) {
  const { toast } = useToast();
  const { data: problems } = useProblems();
  const [isLaunching, setIsLaunching] = useState(false);
  const [launched, setLaunched] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("lovable");

  const LAUNCH_COUNT = 10;
  const DELAY_MS = 1500; // 1.5 seconds between each launch

  const getPlatformUrl = (prompt: string, platform: Platform): string => {
    const encodedPrompt = encodeURIComponent(prompt);
    
    if (platform === "claude") {
      // Claude desktop app URL scheme
      return `claude://new?prompt=${encodedPrompt}`;
    }
    
    // Lovable URL
    return `https://lovable.dev/?autosubmit=true#prompt=${encodedPrompt}`;
  };

  const handleLaunch = async () => {
    if (!problems || problems.length === 0) {
      toast({
        title: "No ideas available",
        description: "There are no ideas to launch.",
        variant: "destructive",
      });
      return;
    }

    setShowInstructions(false);
    setIsLaunching(true);
    setLaunched(0);

    // Take first 10 problems (or fewer if not enough)
    const ideasToLaunch = problems.slice(0, LAUNCH_COUNT);

    for (let i = 0; i < ideasToLaunch.length; i++) {
      const problem = ideasToLaunch[i];
      
      // Generate prompt for this idea
      const prompt = generateLovablePrompt({
        problem: {
          title: problem.title,
          subtitle: problem.subtitle,
          category: problem.category,
          niche: problem.niche,
          painPoints: problem.painPoints,
          marketSize: problem.marketSize,
          opportunityScore: problem.opportunityScore,
          sentiment: problem.sentiment,
          hiddenInsight: problem.hiddenInsight,
        },
      });

      // Get URL based on selected platform
      const url = getPlatformUrl(prompt, selectedPlatform);
      
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow || newWindow.closed) {
        toast({
          title: "Popup blocked",
          description: `Browser blocked tab ${i + 1}. Please allow popups for this site.`,
          variant: "destructive",
        });
        setIsLaunching(false);
        return;
      }

      setLaunched(i + 1);

      // Wait before opening the next tab
      if (i < ideasToLaunch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    setIsLaunching(false);
    const platformName = selectedPlatform === "lovable" ? "Lovable" : "Claude";
    toast({
      title: "All ideas launched!",
      description: `Successfully opened ${ideasToLaunch.length} ${platformName} sessions.`,
    });
  };

  const handleClose = () => {
    if (!isLaunching) {
      setShowInstructions(true);
      setLaunched(0);
      onOpenChange(false);
    }
  };

  const progress = (launched / LAUNCH_COUNT) * 100;
  const platformName = selectedPlatform === "lovable" ? "Lovable" : "Claude";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Launch 10 Ideas
          </DialogTitle>
          <DialogDescription>
            Choose your AI platform and launch 10 ideas at once
          </DialogDescription>
        </DialogHeader>

        {showInstructions ? (
          <div className="space-y-4">
            {/* Platform Selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Choose your platform:</p>
              <RadioGroup 
                value={selectedPlatform} 
                onValueChange={(v) => setSelectedPlatform(v as Platform)}
                className="grid grid-cols-2 gap-3"
              >
                {/* Lovable Option */}
                <div>
                  <RadioGroupItem
                    value="lovable"
                    id="lovable"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="lovable"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                  >
                    <img 
                      src={lovableLogo} 
                      alt="Lovable" 
                      className="h-8 w-8 object-contain"
                    />
                    <span className="text-sm font-medium">Lovable</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Visual AI builder
                    </span>
                  </Label>
                </div>

                {/* Claude Option */}
                <div>
                  <RadioGroupItem
                    value="claude"
                    id="claude"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="claude"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                  >
                    <Terminal className="h-8 w-8 text-foreground" />
                    <span className="text-sm font-medium">Claude Desktop</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Opens local app
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-warning">Popup Blocker Warning</p>
                <p className="text-muted-foreground mt-1">
                  Your browser may block multiple tabs. You'll need to allow popups for this site.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <p className="text-sm font-medium">How to allow popups:</p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Click "Start Launching" below</li>
                <li>If blocked, look for a popup icon in your address bar</li>
                <li>Click it and select "Always allow popups"</li>
                <li>Try again after allowing</li>
              </ol>
            </div>

            {/* What will happen */}
            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
              <p className="text-muted-foreground">
                This will open <span className="text-foreground font-medium">10 new {platformName} tabs</span>, 
                each with a different startup idea ready to build.
              </p>
            </div>

            <Button onClick={handleLaunch} className="w-full gap-2">
              {selectedPlatform === "lovable" ? (
                <Rocket className="h-4 w-4" />
              ) : (
                <Terminal className="h-4 w-4" />
              )}
              Launch in {platformName}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Launching to {platformName}...</span>
                <span className="font-mono">{launched}/{LAUNCH_COUNT}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Status */}
            <div className="space-y-2">
            {Array.from({ length: Math.min(launched, 5) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm"
              >
                <Check className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">
                  Idea {launched - Math.min(launched, 5) + i + 1} launched
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </motion.div>
            ))}
            {isLaunching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-primary"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Opening next tab...</span>
                </motion.div>
              )}
            </div>

            {!isLaunching && launched === LAUNCH_COUNT && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 rounded-lg bg-success/10 border border-success/20"
              >
                <Check className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="font-medium text-success">All ideas launched!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check your {platformName} tabs
                </p>
              </motion.div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
