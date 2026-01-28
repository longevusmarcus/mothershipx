import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ExternalLink, Sparkles, Code2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { generateLovablePrompt, openLovableBuilder } from "@/lib/buildLovablePrompt";
import lovableLogo from "@/assets/lovable-logo.png";

interface Solution {
  title: string;
  description: string;
  approach?: string;
  tech_stack?: string[];
}

interface Competitor {
  name: string;
  description?: string;
  ratingLabel?: string;
}

interface Problem {
  title: string;
  subtitle?: string;
  category: string;
  niche: string;
  painPoints?: string[];
  marketSize?: string;
  opportunityScore: number;
  sentiment: string;
  hiddenInsight?: {
    surfaceAsk?: string;
    realProblem?: string;
    hiddenSignal?: string;
  };
}

interface BuildWithLovableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: Problem;
  solutions?: Solution[];
  competitors?: Competitor[];
}

export function BuildWithLovableModal({
  open,
  onOpenChange,
  problem,
  solutions,
  competitors,
}: BuildWithLovableModalProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Generate prompt when modal opens
  useEffect(() => {
    if (open) {
      const generatedPrompt = generateLovablePrompt({
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
        solutions: solutions?.map(s => ({
          title: s.title,
          description: s.description,
          approach: s.approach,
          techStack: s.tech_stack,
        })),
        competitors: competitors?.map(c => ({
          name: c.name,
          description: c.description,
          rating_label: c.ratingLabel,
        })),
      });
      setPrompt(generatedPrompt);
      setIsEditing(false);
    }
  }, [open, problem, solutions, competitors]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Paste this prompt into any AI coding tool",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please select and copy manually",
        variant: "destructive",
      });
    }
  };

  const handleBuild = () => {
    openLovableBuilder(prompt);
    onOpenChange(false);
  };

  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  const charCount = prompt.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col z-[100]">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <img 
              src={lovableLogo} 
              alt="Lovable" 
              className="h-20 w-20 object-contain"
            />
            <div>
              <DialogTitle className="text-lg">Launch in Lovable</DialogTitle>
              <DialogDescription className="text-sm">
                Review and customize your expert prompt before launching
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="flex items-center gap-3 py-2 border-b border-border">
          <Badge variant="secondary" className="text-xs">
            <Code2 className="h-3 w-3 mr-1" />
            {wordCount} words
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {charCount.toLocaleString()} chars
          </Badge>
          {solutions && solutions.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              {solutions.length} ideas included
            </Badge>
          )}
          {competitors && competitors.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {competitors.length} competitors analyzed
            </Badge>
          )}
        </div>

        {/* Prompt Content */}
        <div className="flex-1 min-h-0 py-4">
          {isEditing ? (
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-full min-h-[400px] font-mono text-xs resize-none"
              placeholder="Your prompt..."
            />
          ) : (
            <ScrollArea className="h-[400px] rounded-lg border border-border bg-secondary/30 p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/90 leading-relaxed">
                {prompt}
              </pre>
            </ScrollArea>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Preview" : "Edit"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleBuild}
              className="gap-2"
              variant="glow"
            >
              <ExternalLink className="h-4 w-4" />
              Launch in Lovable
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
