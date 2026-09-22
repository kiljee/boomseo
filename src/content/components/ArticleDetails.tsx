import { FileText, Hash, Link as LinkIcon, Target } from 'lucide-react';

type ArticleDetailsProps = {
  article: any;

  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;

  setTitle: (value: string) => void;
  setMetaTitle: (value: string) => void;
  setMetaDescription: (value: string) => void;
  setSlug: (value: string) => void;
};

export function ArticleDetails({
  article,
  title,
  metaTitle,
  metaDescription,
  slug,
  setTitle,
  setMetaTitle,
  setMetaDescription,
  setSlug,
}: ArticleDetailsProps) {
  const keyword = article?.keyword?.keyword ?? '';
  const intent = article?.keyword?.intent ?? '';

  return (
    <div className="space-y-6">
      {/* Article */}
      <section>
        <SectionHeader
          icon={FileText}
          title="Article"
          description="Basic article information"
        />

        <div className="mt-4 space-y-4">
          <Field
            label="Title"
            value={title}
            onChange={setTitle}
            placeholder="Article title"
          />

          <Field
            label="Slug"
            value={slug}
            onChange={setSlug}
            placeholder="article-slug"
            prefix="/"
          />
        </div>
      </section>

      {/* SEO metadata */}
      <section className="border-t border-border pt-5">
        <SectionHeader
          icon={Hash}
          title="SEO metadata"
          description="Search engine title and description"
        />

        <div className="mt-4 space-y-4">
          <Field
            label="Meta title"
            value={metaTitle}
            onChange={setMetaTitle}
            placeholder="SEO title"
            maxLength={60}
            counter
          />

          <TextareaField
            label="Meta description"
            value={metaDescription}
            onChange={setMetaDescription}
            placeholder="Describe the article for search engines..."
            maxLength={160}
          />
        </div>
      </section>

      {/* Target */}
      <section className="border-t border-border pt-5">
        <SectionHeader
          icon={Target}
          title="Target"
          description="Keyword information"
        />

        <div className="mt-4 space-y-3">
          <InfoRow
            label="Target keyword"
            value={keyword || 'Not specified'}
          />

          <InfoRow
            label="Search intent"
            value={intent || 'Not specified'}
          />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

      <div>
        <p className="text-sm font-semibold text-foreground">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  maxLength,
  counter = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  maxLength?: number;
  counter?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">
          {label}
        </label>

        {counter && maxLength && (
          <span
            className={`text-[10px] ${
              value.length > maxLength
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="flex items-center rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20">
        {prefix && (
          <span className="pl-3 text-xs text-muted-foreground">
            {prefix}
          </span>
        )}

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="h-9 min-w-0 flex-1 border-0 bg-transparent px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
        />
      </div>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">
          {label}
        </label>

        {maxLength && (
          <span
            className={`text-[10px] ${
              value.length > maxLength
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs leading-5 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}