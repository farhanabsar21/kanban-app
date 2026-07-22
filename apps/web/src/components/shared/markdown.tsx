import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type Props = {
  children: string;
};

export function Markdown({ children }: Props) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-code:text-emerald-300 prose-strong:text-white prose-li:text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
