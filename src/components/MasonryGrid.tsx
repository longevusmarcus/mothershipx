import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Lock, LayoutGrid } from "lucide-react";
import { MarketProblemCard } from "@/components/MarketProblemCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserPins } from "@/hooks/useUserPins";
import type { MarketProblem } from "@/data/marketIntelligence";
import { Button } from "@/components/ui/button";

const FREE_CARD_LIMIT_ALL = 12;
const FREE_CARD_LIMIT_CATEGORY = 2;
const STORAGE_KEY = "mothership_problems_order";
const COLUMNS_KEY = "mothership_columns_count";

type ColumnCount = 2 | 3 | 4;

interface MasonryGridProps {
  problems: MarketProblem[];
  shouldBlurExcess: boolean;
  isAllCategory?: boolean;
}

interface SortableCardProps {
  problem: MarketProblem;
  index: number;
  isDragging?: boolean;
  isPinned?: boolean;
  onTogglePin?: (problemId: string) => void;
}

function SortableCard({ problem, index, isDragging, isPinned, onTogglePin }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: problem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    zIndex: isSortableDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MarketProblemCard problem={problem} delay={0} isPinned={isPinned} onTogglePin={onTogglePin} />
    </div>
  );
}

function DragOverlayCard({ problem }: { problem: MarketProblem }) {
  return (
    <div className="rotate-3 scale-105 shadow-2xl">
      <MarketProblemCard problem={problem} delay={0} />
    </div>
  );
}

export function MasonryGrid({ problems, shouldBlurExcess, isAllCategory = true }: MasonryGridProps) {
  const freeCardLimit = isAllCategory ? FREE_CARD_LIMIT_ALL : FREE_CARD_LIMIT_CATEGORY;
  const [orderedProblems, setOrderedProblems] = useState<MarketProblem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columnCount, setColumnCount] = useState<ColumnCount>(() => {
    const saved = localStorage.getItem(COLUMNS_KEY);
    return (saved ? parseInt(saved) : 3) as ColumnCount;
  });
  const isMobile = useIsMobile();
  
  // Use database-backed pins for authenticated users
  const { pinnedIds, togglePin } = useUserPins();

  // Persist column count
  const cycleColumns = useCallback(() => {
    setColumnCount(prev => {
      const next = prev === 2 ? 3 : prev === 3 ? 4 : 2;
      localStorage.setItem(COLUMNS_KEY, String(next));
      return next;
    });
  }, []);

  // Get column classes based on count
  const columnClasses = useMemo(() => {
    switch (columnCount) {
      case 2: return "columns-1 sm:columns-2 gap-4";
      case 3: return "columns-1 sm:columns-2 lg:columns-3 gap-4";
      case 4: return "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4";
      default: return "columns-1 sm:columns-2 gap-4";
    }
  }, [columnCount]);

  // Disable drag and drop on mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? Infinity : 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const orderIds: string[] = JSON.parse(savedOrder);
        const problemMap = new Map(problems.map((p) => [p.id, p]));
        
        const ordered: MarketProblem[] = [];
        for (const id of orderIds) {
          const problem = problemMap.get(id);
          if (problem) {
            ordered.push(problem);
            problemMap.delete(id);
          }
        }
        
        for (const problem of problemMap.values()) {
          ordered.push(problem);
        }
        
        setOrderedProblems(ordered);
      } catch {
        setOrderedProblems(problems);
      }
    } else {
      setOrderedProblems(problems);
    }
  }, [problems]);

  // Sort problems with pinned items first
  const sortedProblems = useMemo(() => {
    const pinned = orderedProblems.filter(p => pinnedIds.has(p.id));
    const unpinned = orderedProblems.filter(p => !pinnedIds.has(p.id));
    return [...pinned, ...unpinned];
  }, [orderedProblems, pinnedIds]);

  const handleTogglePin = useCallback((problemId: string) => {
    togglePin(problemId);
  }, [togglePin]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setOrderedProblems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.map((p) => p.id)));

        return newItems;
      });
    }
  }, []);

  const activeItem = useMemo(
    () => orderedProblems.find((p) => p.id === activeId),
    [activeId, orderedProblems]
  );

  if (sortedProblems.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Column Switcher - Desktop only */}
      {!isMobile && (
        <div className="flex justify-end mb-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleColumns}
              className="h-7 px-2 text-muted-foreground hover:text-foreground gap-1.5"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-xs font-medium tabular-nums">{columnCount}</span>
            </Button>
          </motion.div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortedProblems.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className={columnClasses}>
            {sortedProblems.map((problem, index) => {
              const isBlurred = shouldBlurExcess && index >= freeCardLimit;
              const isPinned = pinnedIds.has(problem.id);
              
              return (
                <div key={problem.id} className="break-inside-avoid mb-4 relative">
                  {isBlurred ? (
                    <div className="relative">
                      <div className="blur-sm pointer-events-none select-none">
                        <MarketProblemCard problem={problem} delay={0} />
                      </div>
                      {index === freeCardLimit && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                          <div className="text-center p-4">
                            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">Subscribe to unlock all problems</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {sortedProblems.length - freeCardLimit}+ more discoveries waiting
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <SortableCard 
                      problem={problem} 
                      index={index} 
                      isPinned={isPinned}
                      onTogglePin={handleTogglePin}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem ? <DragOverlayCard problem={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
