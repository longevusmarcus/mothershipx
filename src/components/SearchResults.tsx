import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchResultCard, SearchResult } from "./SearchResultCard";
import { Button } from "./ui/button";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  selectedNiche: string | null;
}

export function SearchResults({ results, isLoading, selectedNiche }: SearchResultsProps) {
  const navigate = useNavigate();
  const viralCount = results.filter(r => r.addedToLibrary).length;
  
  return (
    <div className="w-full space-y-4">
      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3"
        >
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing {selectedNiche?.replace("-", " ")} pain points and trends...</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence mode="popLayout">
        {results.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* AI Response Header */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                  <p className="text-sm">
                    Found <span className="font-medium text-foreground">{results.length} pain points</span> in {selectedNiche?.replace("-", " ")}.
                    {viralCount > 0 && (
                      <span className="text-success"> {viralCount} meet virality criteria and were added to the Library.</span>
                    )}
                  </p>
                </div>

                {/* View Library Button */}
                {viralCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/problems")}
                    className="gap-2"
                  >
                    <Library className="h-4 w-4" />
                    View in Library ({viralCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Result Cards - Vertical Layout */}
            <div className="pl-11 space-y-3">
              {results.map((result, index) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  delay={0.05 * index}
                  isLatest={index === 0}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && results.length === 0 && selectedNiche && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3"
        >
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-sm text-muted-foreground">
              No pain points found for {selectedNiche.replace("-", " ")}. Try another niche.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
