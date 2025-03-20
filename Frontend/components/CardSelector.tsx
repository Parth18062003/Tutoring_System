"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardOption {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
}

interface CardSelectorProps {
  options: CardOption[];
  title: string;
  subtitle?: string;
  onSelect: (option: CardOption) => void;
  selectedId?: string;
  className?: string;
}

export default function CardSelector({
  options,
  title,
  subtitle,
  onSelect,
  selectedId,
  className,
}: CardSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          
          return (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(option)}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-colors",
                isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
              )}
            >
              {isSelected && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              
              <div className="flex items-start gap-4">
                {option.icon && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    {option.icon}
                  </div>
                )}
                {option.image && (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    <img 
                      src={option.image} 
                      alt={option.title} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="font-semibold">{option.title}</h3>
                  {option.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}