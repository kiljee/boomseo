import { CheckCircle2, Circle } from 'lucide-react';

type ArticleOutlineProps = {
  article: any;
  content: string;
};

type OutlineItem = {
  title?: string;
  level?: string;
};

type ContentBrief = {
  outline?: OutlineItem[];
};

export function ArticleOutline({
  article,
  content,
}: ArticleOutlineProps) {
  const contentBrief = (article?.contentBrief ?? {}) as ContentBrief;
  const outline = contentBrief.outline ?? [];

  if (outline.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm font-medium text-foreground">
          No outline available
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Generate a content brief to see the recommended article structure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Article outline
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Track which recommended sections are already covered.
        </p>
      </div>

      <div className="space-y-1">
                {outline.map((item, index) => {
          const heading = item.title ?? '';
          const level = parseInt(
            (item.level ?? 'h2').replace('h', ''),
            10
          );

          const covered = isHeadingCovered(heading, content);

          return (
            <div
              key={`${heading}-${index}`}
              className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/50"
              style={{
                paddingLeft: `${10 + Math.max(level - 2, 0) * 14}px`,
              }}
            >
              {covered ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}

              <div className="min-w-0">
                <p
                  className={`text-xs leading-5 ${
                    covered
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {heading || 'Untitled section'}
                </p>

                <p className="text-[10px] text-muted-foreground">
                  H{level}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Sections covered
          </span>

          <span className="font-medium text-foreground">
            {
              outline.filter((item) =>
                isHeadingCovered(item.title ?? '', content)
              ).length
            }{' '}
            / {outline.length}
          </span>
        </div>
      </div>
    </div>
  );
}

function isHeadingCovered(
  heading: string,
  content: string
): boolean {
  const normalizedHeading = normalizeText(heading);

  if (!normalizedHeading) {
    return false;
  }

  const markdownHeadings = content
    .split('\n')
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) =>
      normalizeText(line.replace(/^#{1,6}\s+/, ''))
    );

  return markdownHeadings.some(
    (existingHeading) =>
      existingHeading === normalizedHeading ||
      existingHeading.includes(normalizedHeading) ||
      normalizedHeading.includes(existingHeading)
  );
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}