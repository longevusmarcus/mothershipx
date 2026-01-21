import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { MarketProblemCard } from "@/components/MarketProblemCard";
import type { MarketProblem } from "@/data/marketIntelligence";

interface MasonryGridProps {
  problems: MarketProblem[];
}

interface SortableCardProps {
  problem: MarketProblem;
  index: number;
  isDragging?: boolean;
}

function SortableCard({ problem, index, isDragging }: SortableCardProps) {
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
      <MarketProblemCard problem={problem} delay={0} />
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

const STORAGE_KEY = "mothership_problems_order";

export function MasonryGrid({ problems }: MasonryGridProps) {
  const [orderedProblems, setOrderedProblems] = useState<MarketProblem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved order from localStorage and merge with current problems
  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const orderIds: string[] = JSON.parse(savedOrder);
        const problemMap = new Map(problems.map((p) => [p.id, p]));
        
        // First add problems in saved order
        const ordered: MarketProblem[] = [];
        for (const id of orderIds) {
          const problem = problemMap.get(id);
          if (problem) {
            ordered.push(problem);
            problemMap.delete(id);
          }
        }
        
        // Then add any new problems not in saved order
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

        // Save new order to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.map((p) => p.id)));

        return newItems;
      });
    }
  }, []);

  const activeItem = useMemo(
    () => orderedProblems.find((p) => p.id === activeId),
    [activeId, orderedProblems]
  );

  if (orderedProblems.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orderedProblems.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-0">
          {orderedProblems.map((problem, index) => (
            <div key={problem.id} className="break-inside-avoid mb-3">
              <SortableCard problem={problem} index={index} />
            </div>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? <DragOverlayCard problem={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
