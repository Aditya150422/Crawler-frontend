"use client";

import React, { useState, memo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy, ChevronDown, ChevronRight, Code2, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

// Code block with copy functionality and language badge
const CodeBlock = memo(({ 
  children, 
  className, 
  inline,
  ...props 
}: { 
  children?: React.ReactNode; 
  className?: string; 
  inline?: boolean;
  [key: string]: unknown;
}) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract language from className (format: "language-javascript")
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "code";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codeString]);

  // Inline code
  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 rounded-md bg-dark-700/80 text-primary-300 text-sm font-mono border border-dark-600/50"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Count lines
  const lines = codeString.split("\n").length;
  const shouldBeCollapsible = lines > 15;

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-dark-600/50 bg-dark-900/80 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800/80 border-b border-dark-700/50">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {language}
          </span>
          <span className="text-xs text-gray-500">
            {lines} {lines === 1 ? "line" : "lines"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {shouldBeCollapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white rounded-md hover:bg-dark-700 transition-all"
            >
              {isCollapsed ? (
                <>
                  <ChevronRight className="w-3 h-3" />
                  Expand
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Collapse
                </>
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
              copied 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "text-gray-400 hover:text-white hover:bg-dark-700"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div
        className={cn(
          "overflow-x-auto transition-all duration-300",
          isCollapsed ? "max-h-0" : "max-h-[600px]"
        )}
      >
        <pre className="p-4 text-sm leading-relaxed overflow-x-auto">
          <code className={cn(className, "font-mono")} {...props}>
            {children}
          </code>
        </pre>
      </div>

      {/* Collapsed indicator */}
      {isCollapsed && (
        <div 
          className="px-4 py-3 text-center cursor-pointer hover:bg-dark-800/50 transition-colors"
          onClick={() => setIsCollapsed(false)}
        >
          <span className="text-xs text-gray-500">
            Click to expand {lines} lines of code
          </span>
        </div>
      )}
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

// Custom heading components with better styling
const HeadingComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 
      className="text-2xl font-bold text-white mt-6 mb-4 pb-2 border-b border-dark-700/50 first:mt-0" 
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 
      className="text-xl font-semibold text-white mt-6 mb-3 flex items-center gap-2" 
      {...props}
    >
      <span className="w-1 h-6 bg-primary-500 rounded-full" />
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 
      className="text-lg font-semibold text-gray-100 mt-5 mb-2" 
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 
      className="text-base font-medium text-gray-200 mt-4 mb-2" 
      {...props}
    >
      {children}
    </h4>
  ),
};

// List components
const ListComponents = {
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-3 ml-4 space-y-2 list-none" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-3 ml-4 space-y-2 list-decimal list-inside" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-gray-300 flex items-start gap-2" {...props}>
      <span className="w-1.5 h-1.5 rounded-full bg-primary-400/60 mt-2 flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
};

// Other element components
const ElementComponents = {
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-200 leading-relaxed my-3 first:mt-0 last:mb-0" {...props}>
      {children}
    </p>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-white" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-gray-300" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote 
      className="my-4 pl-4 border-l-4 border-primary-500/50 bg-dark-800/50 py-3 pr-4 rounded-r-lg italic text-gray-300" 
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/50 hover:decoration-blue-400 transition-colors font-medium"
      style={{ color: '#60a5fa' }}
      {...props}
    >
      {children}
      <svg className="w-3 h-3 inline-block ml-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  ),
  hr: () => (
    <hr className="my-6 border-dark-700/50" />
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-dark-700/50">
      <table className="min-w-full divide-y divide-dark-700/50" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-dark-800/80" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="divide-y divide-dark-700/50 bg-dark-900/50" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="hover:bg-dark-800/50 transition-colors" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 text-sm text-gray-300" {...props}>
      {children}
    </td>
  ),
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = memo(({ content, className }: MarkdownRendererProps) => {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: CodeBlock as any,
          ...HeadingComponents,
          ...ListComponents,
          ...ElementComponents,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
