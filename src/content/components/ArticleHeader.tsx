import {
  ArrowLeft,
  Check,
  Copy,
  MoreHorizontal,
  Save,
  Sparkles,
} from 'lucide-react';
import { Link, routes } from 'wasp/client/router';
import { useState } from 'react';

type ArticleHeaderProps = {
  article: {
    id: string;
    title?: string | null;
    status: string;
    seoScore?: number | null;
    keyword?: {
      keyword: string;
      intent?: string | null;
    } | null;
  };

  wordCount: number;
  hasUnsavedChanges: boolean;
  isSaving: boolean;

  onSave: () => void;
  onCopy: () => void;
};

export function ArticleHeader({
  article,
  wordCount,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onCopy,
}: ArticleHeaderProps) {
  const [showOptimizeMenu, setShowOptimizeMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
        {/* Top row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={routes.NewArticleRoute.to}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Back to articles"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Content</span>
                <span>/</span>
                <span className="truncate">
                  {article.keyword?.keyword ?? 'Article'}
                </span>
              </div>

              <h1 className="mt-0.5 truncate text-lg font-semibold text-foreground">
                {article.title || 'Untitled article'}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Optimize */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOptimizeMenu((value) => !value)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Optimize</span>
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showOptimizeMenu && (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => setShowOptimizeMenu(false)}
                  >
                    Improve SEO
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => setShowOptimizeMenu(false)}
                  >
                    Analyze keywords
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => setShowOptimizeMenu(false)}
                  >
                    Analyze WDF-IDF
                  </button>
                </div>
              )}
            </div>

            {/* Copy */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              <span>
                {isSaving ? 'Saving...' : 'Save'}
              </span>
            </button>
          </div>
        </div>

        {/* Article metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={article.status} />

          {article.keyword?.keyword && (
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {article.keyword.keyword}
            </span>
          )}

          {article.keyword?.intent && (
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {article.keyword.intent}
            </span>
          )}

          <span className="text-xs text-muted-foreground">
            {wordCount.toLocaleString()} words
          </span>

          {article.seoScore != null && (
            <>
              <span className="text-muted-foreground">•</span>

              <span className="text-xs font-medium text-foreground">
                SEO score {article.seoScore}
              </span>
            </>
          )}

          {hasUnsavedChanges && (
            <>
              <span className="text-muted-foreground">•</span>

              <span className="text-xs text-muted-foreground">
                Unsaved changes
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase();

  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    GENERATING: 'Generating',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    PUBLISHED: 'Published',
  };

  return (
    <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {labels[normalizedStatus] ?? status}
    </span>
  );
}