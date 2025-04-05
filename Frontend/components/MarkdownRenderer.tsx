"use client";

import { cn } from "@/lib/utils";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({
  content
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
        ),
        p: ({ node, ...props }) => <p className="my-3" {...props} />,
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-6 my-3" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-6 my-3" {...props} />
        ),
        li: ({ node, ...props }) => <li className="my-1" {...props} />,
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 hover:underline dark:text-blue-400"
            {...props}
          />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4"
            {...props}
          />
        ),
        img: ({ node, ...props }) => (
          <img className="rounded-md my-4 max-w-full" {...props} />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table
              className="min-w-full divide-y divide-gray-300 dark:divide-gray-700"
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-4 py-2 text-left font-medium" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td
            className="px-4 py-2 border-t border-gray-200 dark:border-gray-700"
            {...props}
          />
        ),
      }}
    >
      {content || ""}
    </ReactMarkdown>
  );
}
