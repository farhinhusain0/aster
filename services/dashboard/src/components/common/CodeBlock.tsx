import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as baseStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

// The default githubGist theme applies backgroundColor on hljs-addition/deletion
// *token spans* (inline elements), so the color only covers the text, not the
// full line width. We clear those and re-apply the backgrounds at the line-wrapper
// level via lineProps so they stretch edge-to-edge like GitHub's diff view.
const style: Record<string, React.CSSProperties> = {
  ...baseStyle,
  "hljs-addition": {
    ...(baseStyle["hljs-addition"] as React.CSSProperties),
    backgroundColor: "transparent",
  },
  "hljs-deletion": {
    ...(baseStyle["hljs-deletion"] as React.CSSProperties),
    backgroundColor: "transparent",
  },
};

interface CodeBlockProps {
  children: string | string[];
  language?: string;
  startingLineNumber?: number;
  highlightLine?: number;
}

export default function CodeBlock({
  children,
  language = "javascript",
  startingLineNumber = 1,
  highlightLine,
}: CodeBlockProps) {
  // Split the children into lines for diff highlighting
  const lines = typeof children === "string" ? children.split("\n") : children;

  return (
    <SyntaxHighlighter
      language={language}
      style={style}
      showLineNumbers
      startingLineNumber={startingLineNumber}
      wrapLines
      // The inner <code> is inline by default, which caps line backgrounds at
      // the visible width. inline-block + minWidth lets it grow with content so
      // backgrounds persist when scrolling horizontally.
      codeTagProps={{
        style: { display: "inline-block", minWidth: "100%" },
      }}
      lineProps={(lineNumber: number) => {
        const lineStyle: Record<string, string> = {
          display: "block",
          fontSize: "12px",
          lineHeight: "18px",
          marginBottom: "2px",
        };

        if (highlightLine === lineNumber) {
          lineStyle.backgroundColor = "var(--color-gray-100)";
        }

        if (language === "diff") {
          const line = lines[lineNumber - 1];
          if (line?.startsWith("+")) {
            lineStyle.backgroundColor = "var(--color-error-100)";
          } else if (line?.startsWith("-")) {
            lineStyle.backgroundColor = "var(--color-error-100)";
            lineStyle.textDecoration = "line-through";
            lineStyle.textDecorationColor = "var(--color-blue-600)";
          }
        }

        return { style: lineStyle };
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
}
