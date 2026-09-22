import { useEffect, useMemo, useState } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { useParams } from 'react-router';

import {
  getSEOArticle,
  updateSEOArticle,
} from 'wasp/client/operations';

import { ArticleHeader } from './components/ArticleHeader';
import { ArticleEditor } from './components/ArticleEditor';
import { ArticlePreview } from './components/ArticlePreview';
import { SEOArticleSidebar } from './components/SEOArticleSidebar';


type ArticleMode = 'edit' | 'preview';

export function SEOArticlePage() {

  const { articleId } = useParams<'articleId'>();

  if (!articleId) {
    return <div>Article ID is missing.</div>;
  }

  console.log('ROUTE ARTICLE ID:', articleId);
  const {
    data: rawArticle,
    isLoading,
    error,
  } = useQuery(getSEOArticle, {
    id: articleId,
  });

  const updateArticle = useAction(updateSEOArticle);

  /*
   * Keep the operation result separate from the local editing state.
   *
   * The cast is mainly needed because Prisma JSON fields such as
   * contentBrief and wdfIdfAnalysis are represented as generic
   * SuperJSON values.
   */
  const article = rawArticle as any;

  const [mode, setMode] = useState<ArticleMode>('edit');

  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');

  const [title, setTitle] = useState('');
  const [savedTitle, setSavedTitle] = useState('');

  const [metaTitle, setMetaTitle] = useState('');
  const [savedMetaTitle, setSavedMetaTitle] = useState('');

  const [metaDescription, setMetaDescription] = useState('');
  const [savedMetaDescription, setSavedMetaDescription] =
    useState('');

  const [slug, setSlug] = useState('');
  const [savedSlug, setSavedSlug] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  /*
   * Load the article whenever a different article is opened.
   */
  useEffect(() => {
    if (!article) return;

    const articleContent = article.content ?? '';
    const articleTitle = article.title ?? '';
    const articleMetaTitle = article.metaTitle ?? '';
    const articleMetaDescription =
      article.metaDescription ?? '';
    const articleSlug = article.slug ?? '';

    setContent(articleContent);
    setSavedContent(articleContent);

    setTitle(articleTitle);
    setSavedTitle(articleTitle);

    setMetaTitle(articleMetaTitle);
    setSavedMetaTitle(articleMetaTitle);

    setMetaDescription(articleMetaDescription);
    setSavedMetaDescription(articleMetaDescription);

    setSlug(articleSlug);
    setSavedSlug(articleSlug);
  }, [article?.id, article]);

  console.log('ROUTE ARTICLE ID:', articleId);
console.log('FETCHED ARTICLE ID:', article?.id);
console.log('FETCHED ARTICLE TITLE:', article?.title);

  /*
   * Word count from the current editor content.
   */
  const wordCount = useMemo(() => {
    return content
      .replace(/[#>*_`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean).length;
  }, [content]);

  /*
   * Check whether the current editor state differs from
   * the last saved version.
   */
  const hasUnsavedChanges =
    content !== savedContent ||
    title !== savedTitle ||
    metaTitle !== savedMetaTitle ||
    metaDescription !== savedMetaDescription ||
    slug !== savedSlug;

  /*
   * Save article.
   */
  const handleSave = async () => {
    if (!article || isSaving || !hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);

    try {
      await updateArticle({
        id: article.id,
        content,
        title,
        metaTitle,
        metaDescription,
        slug,
      });

      setSavedContent(content);
      setSavedTitle(title);
      setSavedMetaTitle(metaTitle);
      setSavedMetaDescription(metaDescription);
      setSavedSlug(slug);
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Copy the current Markdown article.
   */
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading article...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">
          Failed to load article
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : 'Something went wrong while loading the article.'}
        </p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">
          Article not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          The article may have been deleted or you may not have
          access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ArticleHeader
        article={article}
        wordCount={wordCount}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={handleSave}
        onCopy={handleCopy}
      />

      {/* Edit / Preview toggle */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1600px] justify-end px-4 py-2 sm:px-6">
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'edit'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'preview'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Editor / preview */}
          <section className="min-w-0">
            {mode === 'edit' ? (
              <ArticleEditor
                title={title}
                content={content}
                setTitle={setTitle}
                setContent={setContent}
              />
            ) : (
              <ArticlePreview
                title={title}
                metaDescription={metaDescription}
                content={content}
              />
            )}
          </section>

          {/* SEO sidebar */}
          <section className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <SEOArticleSidebar
              article={article}
              content={content}
              title={title}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              slug={slug}
              setTitle={setTitle}
              setMetaTitle={setMetaTitle}
              setMetaDescription={setMetaDescription}
              setSlug={setSlug}
              wordCount={wordCount}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default SEOArticlePage;