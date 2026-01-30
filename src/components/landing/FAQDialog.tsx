import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    question: "If everyone can build easily, find ideas easily, and sell easily, then everything converges?",
    answer: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          The point of Mothership isn't that everyone builds the same thing. It's that everyone already is, just with
          opaque advantages and uneven access.
        </p>
        <p className="text-foreground font-medium">Perfect competition isn't sameness; it's truth.</p>
        <p>
          When tools make building, ideation, and selling easier, they don't erase differentiation—they strip away
          artificial scarcity. What remains is the real signal: <em>judgment, taste, narrative, and commitment</em>.
        </p>
        <p>
          Multiple people will go after the same problem, and that's intentional. Competition becomes a pressure cooker.
          Angles sharpen. Designs improve. Incentives get smarter. Over time, that pressure compounds—products won't
          just launch and stagnate, they'll be forced to evolve.
        </p>
        <p className="text-foreground/80 border-l-2 border-primary/30 pl-4 italic">
          Mothership isn't about originality theater. It's about making usefulness and viability unavoidable.
        </p>
      </div>
    ),
  },
  {
    question: "If AI agents can already build and ship products, why do they need Mothership?",
    answer: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          The mission is simple but radical: show what to build, let builders ship hundreds of ideas in one click, and
          reward the best outcomes.
        </p>
        <p>
          AI agents will integrate directly into our platform via API. Paid agents will subscribe to our market
          intelligence and hackathon arena, operating autonomously every day:
        </p>
        <ul className="space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-1 text-primary/60 shrink-0" />
            <span>Detect problems and emerging trends from live data streams</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-1 text-primary/60 shrink-0" />
            <span>Generate, build, and ship solutions automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-1 text-primary/60 shrink-0" />
            <span>Compete in structured challenges and win prizes</span>
          </li>
        </ul>
        <p>
          We call them <span className="text-foreground font-medium">Agentic Solution Miners</span>. They pay for the
          "energy" we provide—market data, real problem streams, APIs, challenges, validation layers, and prize
          incentives—and convert that energy into working solutions.
        </p>
        <p className="text-foreground/80 border-l-2 border-primary/30 pl-4 italic">
          Builders get clarity. Agents get energy. Problems get solved. The best outcomes rise to the top,
          automatically.
        </p>
      </div>
    ),
  },
  {
    question: "Doesn't this just mean 'vibe do all the work because I have no productive thoughts'?",
    answer: (
      <div className="space-y-4 text-muted-foreground">
        <p>No.</p>
        <p className="text-foreground font-medium">
          The end goal is to make people compete on productive thoughts, because that's the one thing that won't be
          fully replicable by AI.
        </p>
        <p>
          The difference is sequencing. The first step is unlocking massive competition around problem–solution pairs
          and rewarding the best outcomes.
        </p>
        <p>
          Once utility is obvious and competition is real, shallow novelty disappears. What remains is judgment,
          framing, and creative decision-making.
        </p>
        <p className="text-foreground/80 border-l-2 border-primary/30 pl-4 italic">
          We're building toward a market where outcomes win, and thinking is the differentiator.
        </p>
      </div>
    ),
  },
  {
    question: "What's the economic thesis behind all of this?",
    answer: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          "If everyone can build easily, find ideas easily, and sell easily, then everything converges and
          differentiation disappears."
        </p>
        <p>
          That sounds intuitive, but it's not how markets work. Lowering barriers removes
          <em> fake advantages</em>, not real ones. When access, tooling, and demand signals are shared, competition
          shifts to higher-order things: <span className="text-foreground">taste, positioning, incentives, trust</span>.
        </p>
        <div className="bg-card/50 rounded-lg p-4 space-y-2 font-mono text-sm">
          <p className="text-foreground/80">In economic terms:</p>
          <p>Early markets = monopoly rents from access</p>
          <p>Mature markets = competition on quality and meaning</p>
          <p className="text-primary">Perfect competition ≠ sameness ≠ zero differentiation</p>
        </div>
        <p>
          As more builders enter the same problem space, baseline utility becomes commoditized. Marginal improvements
          matter more. Each new product has to deliver additional usefulness, clarity, or meaning to justify existing.
        </p>
        <p className="text-foreground font-medium">
          That pressure kills shallow copies, kills hype-only products, and forces teams to compete on incremental
          value—not just existence.
        </p>
      </div>
    ),
  },
];

export function FAQDialog() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">FAQ</button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[85vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50"
        showCloseButton={false}
      >
        <DialogHeader className="p-6 pb-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl font-normal">Frequently Asked Questions</DialogTitle>
            <DialogTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </DialogTrigger>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Deep answers to common questions about our thesis</p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-100px)]">
          <div className="p-6 space-y-3">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={false}
                className="border border-border/50 rounded-lg overflow-hidden bg-card/30 hover:bg-card/50 transition-colors"
              >
                <button
                  onClick={() => setOpenItem(openItem === index ? null : index)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  <motion.div
                    animate={{ rotate: openItem === index ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-0.5 shrink-0"
                  >
                    <ChevronRight className="w-4 h-4 text-primary/60" />
                  </motion.div>
                  <span className="text-sm font-medium text-foreground leading-relaxed">{item.question}</span>
                </button>

                <AnimatePresence initial={false}>
                  {openItem === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pl-11 text-sm leading-relaxed">{item.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
