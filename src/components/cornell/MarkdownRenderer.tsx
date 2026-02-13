import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mermaidRef.current) {
      const mermaidBlocks = mermaidRef.current.querySelectorAll('.language-mermaid');
      mermaidBlocks.forEach((block, index) => {
        const code = block.textContent || '';
        const id = `mermaid-${Date.now()}-${index}`;
        const container = document.createElement('div');
        container.id = id;
        container.className = 'mermaid-diagram';
        block.parentElement?.replaceWith(container);
        
        mermaid.render(id, code).then(({ svg }) => {
          const element = document.getElementById(id);
          if (element) {
            element.innerHTML = svg;
          }
        }).catch(console.error);
      });
    }
  }, [content]);

  return (
    <div ref={mermaidRef} className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            
            if (!inline && lang === 'mermaid') {
              return (
                <pre className={className}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            
            return inline ? (
              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
