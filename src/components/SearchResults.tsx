import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { SearchResultCard, SearchResult } from "./SearchResultCard";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  searchQuery: string;
}

export function SearchResults({ results, isLoading, searchQuery }: SearchResultsProps) {
  const viralCount = results.filter(r => r.isViral).length;
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Search Query Display */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 max-w-md">
            <p className="text-sm text-foreground">{searchQuery}</p>
          </div>
        </motion.div>
      )}

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
              <span>Analyzing TikTok trends and pain points...</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence mode="popLayout">
        {results.length > 0 && (
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
              <div className="bg-card border border-border rounded-xl px-4 py-3">
                <p className="text-sm">
                  Found <span className="font-medium text-foreground">{results.length} problems</span> related to your search.
                  {viralCount > 0 && (
                    <span className="text-primary"> {viralCount} meet virality criteria and will be added to the Library.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Result Cards */}
            <div className="pl-11 space-y-3">
              {results.map((result, index) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  delay={0.1 * index}
                  isLatest={index === 0}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && results.length === 0 && searchQuery && (
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
              No problems found for "{searchQuery}". Try a different search term.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
