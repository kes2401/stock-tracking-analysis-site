import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * A reusable component for rendering Markdown content with consistent styling and behavior.
 * It automatically handles opening links in a new tab.
 */
const MarkdownDisplay = ({ children }) => {
  if (!children) return null;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: props => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>
      {children}
    </ReactMarkdown>
  );
};

export default MarkdownDisplay;