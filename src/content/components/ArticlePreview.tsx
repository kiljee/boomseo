import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ArticlePreviewProps = {
  title: string;
  metaDescription: string;
  content: string;
};

export function ArticlePreview({
  title,
  metaDescription,
  content,
}: ArticlePreviewProps) {
  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Preview
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title || 'Untitled article'}
        </h1>

        {metaDescription && (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {metaDescription}
          </p>
        )}
      </div>

      <div className="px-6 py-8">
        <div
          className="
            prose prose-neutral max-w-none dark:prose-invert
            prose-headings:font-semibold
            prose-headings:tracking-tight
            prose-p:text-foreground
            prose-p:leading-7
            prose-a:text-primary
            prose-strong:text-foreground
            prose-code:text-foreground
            prose-li:text-foreground
            prose-blockquote:border-primary/40
            prose-blockquote:text-muted-foreground
          "
        >
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">
              No content yet.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}