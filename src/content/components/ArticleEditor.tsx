import type { Dispatch, SetStateAction } from 'react';

type ArticleEditorProps = {
  title: string;
  content: string;
  setTitle: Dispatch<SetStateAction<string>>;
  setContent: Dispatch<SetStateAction<string>>;
};

export function ArticleEditor({
  title,
  content,
  setTitle,
  setContent,
}: ArticleEditorProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <p className="text-sm font-medium text-foreground">
          Article editor
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Write and refine your article using Markdown.
        </p>
      </div>

      <div className="p-5">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Article title"
          className="w-full border-0 bg-transparent px-0 text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
        />

        <div className="mt-4 border-t border-border pt-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Start writing your article..."
            className="min-h-[700px] w-full resize-none border-0 bg-transparent p-0 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
            spellCheck
          />
        </div>
      </div>
    </div>
  );
}