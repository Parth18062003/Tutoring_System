import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { LinkPreview } from "../ui/link-preview";

interface Source {
  title?: string;
  name?: string;
  url: string;
}

interface SourceListProps {
  sources: Source[];
}

export default function SourceList({ sources }: SourceListProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <motion.div layout className="space-y-1">
      {sources.map((source, i) => (
        <motion.span 
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <div className="flex-1 min-w-0">
            <LinkPreview url={source.url} className="text-sm font-medium text-blue-800 dark:text-blue-300 truncate">
              {source.title || source.name || "Reference"}
            </LinkPreview>
            <p className="text-xs text-blue-500 dark:text-blue-400 truncate mt-0.5">{source.url}</p>
          </div>

        </motion.span>
      ))}
    </motion.div>
  );
}