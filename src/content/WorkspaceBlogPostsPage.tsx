import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery, useAction } from "wasp/client/operations";
import {
  getWorkspaceArticles,
  generateSEOArticle,
  deleteSEOArticle
} from "wasp/client/operations";
import { exportArticleAsMarkdown, exportArticleAsHTML, exportArticleAsJSON } from "./exportUtils";

import {
  FileText,
  Plus,
  Sparkles,
  Loader2,
  Calendar,
  Hash,
  ArrowRight,
  Download,
  Trash2,
} from "lucide-react";

import { Link, routes } from "wasp/client/router";

export function WorkspaceBlogPostsPage() {

  const { data: articles, isLoading, refetch } = useQuery(getWorkspaceArticles);

  const generateArticleFn = useAction(generateSEOArticle);
  const deleteArticleFn = useAction(deleteSEOArticle);

  const [keywordInput, setKeywordInput] = useState("");
  const [tone, setTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [showGenerator, setShowGenerator] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any | null>(null);

  useEffect(() => {
      if (!selectedArticle) return;

      const updatedArticle = articles?.find(
        (article: any) => article.id === selectedArticle.id
      );

      if (updatedArticle) {
        setSelectedArticle(updatedArticle);
      }
    }, [articles]);

  const hasGeneratingArticle =
  Array.isArray(articles) &&
  articles.some((a: any) => a.status === "GENERATING");

  useEffect(() => {
      if (!hasGeneratingArticle) return;

      console.log(
        "[Polling] Found article in GENERATING state. Polling every 3s..."
      );

      const interval = setInterval(() => {
        refetch();
  }, 500);

  return () => clearInterval(interval);
}, [hasGeneratingArticle, refetch]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keywordInput.trim()) return;

    setIsGenerating(true);

    try {
      const article = await generateArticleFn({
        targetKeyword: keywordInput,
        tone,
      });

      setKeywordInput("");
      await refetch();

      setSelectedArticle(article);
      setShowGenerator(false);
    } catch (err: any) {
      alert(`Failed to generate article: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectArticle = (article: any) => {
    setSelectedArticle(article);
    setShowGenerator(false);
  };

  const handleDelete = async (articleId: string, title: string) => {
    setDeletingId(articleId);

    try {
      await deleteArticleFn({ articleId });
      await refetch();

      if (selectedArticle?.id === articleId) {
        setSelectedArticle(null);
        setShowGenerator(true);
      }

      setArticleToDelete(null);
    } catch (err: any) {
      alert(`Failed to delete article: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            LEFT SIDEBAR
        ====================================================== */}
        <aside className="sticky top-0 flex h-screen w-72 shrink-0
          flex-col border-r border-border pr-5">

          {/* Sidebar header */}
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Blog Posts
                </h1>

                <p className="mt-1 text-xs text-muted-foreground">
                  Create and manage SEO content
                </p>
              </div>

              {articles && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs
                  font-medium text-muted-foreground">
                  {articles.length}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedArticle(null);
                setShowGenerator(true);
              }}
              className="mt-5 inline-flex w-full items-center justify-center
                gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm
                font-semibold text-primary-foreground shadow-sm
                transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New article
            </button>
          </div>

          <div className="h-px bg-border" />

          {/* Article list */}
          <div className="flex-1 overflow-y-auto py-3 pr-1">

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !articles || articles.length === 0 ? (
              <div className="px-3 py-10 text-center">

                <div className="mx-auto mb-3 flex h-10 w-10 items-center
                  justify-center rounded-xl bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium">
                  No articles yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first SEO article.
                </p>

              </div>
            ) : (
              <div className="space-y-1">
                {articles.map((article: any) => {
                  const isSelected =
                    selectedArticle?.id === article.id;

                  return (
                    <button
                      key={article.id}
                      onClick={() => selectArticle(article)}
                      className={`
                        w-full rounded-xl p-3 text-left transition
                        ${
                          isSelected
                            ? "bg-primary/10 text-foreground"
                            : "hover:bg-muted"
                        }
                      `}
                    >
                      <div className="flex gap-3">

                        <div
                          className={`
                            mt-0.5 flex h-9 w-9 shrink-0 items-center
                            justify-center rounded-lg border
                            ${
                              isSelected
                                ? "border-primary/20 bg-background"
                                : "border-border bg-muted"
                            }
                          `}
                        >
                          <FileText
                            className={`h-4 w-4 ${
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium">
                            {article.title || "Untitled article"}
                          </p>

                          <div className="mt-1 flex items-center gap-1">
                            <Hash className="h-3 w-3 shrink-0
                              text-muted-foreground" />

                            <p className="truncate text-xs
                              text-muted-foreground">
                              {article.keyword?.keyword ||
                                "Target keyword"}
                            </p>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <ArticleStatus
                              status={article.status}
                            />

                            <span className="text-[10px]
                              text-muted-foreground">
                              {new Date(
                                article.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>

                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        </aside>

        {/* =====================================================
            MAIN PANE
        ====================================================== */}
        <section className="min-w-0 flex-1">

          {/* ===================================================
              GENERATOR
          ==================================================== */}
          {showGenerator ? (
            <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">

              <div className="mb-8">

                <div className="mb-3 inline-flex items-center gap-1.5
                  rounded-full bg-primary/10 px-2.5 py-1 text-xs
                  font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Content
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Create a new SEO article
                </h2>

                <p className="mt-2 max-w-2xl text-sm
                  text-muted-foreground">
                  Analyze competitor content gaps and generate a
                  comprehensive article optimized for your target keyword.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card
                shadow-sm">

                <div className="p-6 sm:p-8">

                  <form
                    onSubmit={handleGenerate}
                    className="space-y-6"
                  >

                    {/* Keyword */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Target keyword
                      </label>

                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) =>
                          setKeywordInput(e.target.value)
                        }
                        placeholder="e.g. best email marketing tools"
                        disabled={isGenerating}
                        className="w-full rounded-xl border border-border
                          bg-background px-4 py-3 text-sm
                          text-foreground outline-none
                          placeholder:text-muted-foreground
                          transition
                          focus:border-primary
                          focus:ring-2 focus:ring-primary/20
                          disabled:cursor-not-allowed
                          disabled:opacity-50"
                      />

                      <p className="mt-2 text-xs text-muted-foreground">
                        The primary keyword this article will target.
                      </p>
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Tone of voice
                      </label>

                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        disabled={isGenerating}
                        className="w-full rounded-xl border border-border
                          bg-background px-4 py-3 text-sm
                          text-foreground outline-none
                          transition
                          focus:border-primary
                          focus:ring-2 focus:ring-primary/20
                          disabled:cursor-not-allowed
                          disabled:opacity-50"
                      >
                        <option value="Professional">
                          Professional
                        </option>
                        <option value="Casual">
                          Casual
                        </option>
                        <option value="Technical">
                          Technical
                        </option>
                      </select>
                    </div>

                    {/* Process */}
                    <div className="rounded-xl border border-border
                      bg-muted/40 p-4">

                      <p className="mb-3 text-sm font-semibold">
                        Generation process
                      </p>

                      <div className="space-y-2.5">
                        {[
                          "Analyze competitor content",
                          "Identify H1/H2 content gaps",
                          "Create a recommended outline",
                          "Generate the SEO article",
                        ].map((step, index) => (
                          <div
                            key={step}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-6 w-6 shrink-0
                              items-center justify-center rounded-full
                              border border-border bg-background
                              text-xs font-medium"
                            >
                              {index + 1}
                            </div>

                            <span className="text-sm
                              text-muted-foreground">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={
                        isGenerating ||
                        !keywordInput.trim()
                      }
                      className="inline-flex w-full items-center
                        justify-center gap-2 rounded-xl bg-primary
                        px-5 py-3 text-sm font-semibold
                        text-primary-foreground shadow-sm
                        transition hover:bg-primary/90
                        disabled:cursor-not-allowed
                        disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing & generating...
                        </>
                      ) : (
                        <>
                          Generate SEO article
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                  </form>
                </div>
              </div>
            </div>

          ) : selectedArticle ? (

            /* =================================================
               ARTICLE VIEW
            ================================================== */
            <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">

              {/* Header */}
              <div className="mb-8">

                <div className="mb-4 flex items-center justify-between
                  gap-4">

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5
                      rounded-full border border-border bg-card
                      px-2.5 py-1 text-xs font-medium">
                      <FileText className="h-3 w-3" />
                      SEO Article
                    </span>

                    <ArticleStatus
                      status={selectedArticle.status}
                    />
                  </div>

                  <div className="flex items-center gap-2">

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-2 rounded-xl
                border border-border bg-background px-3.5 py-2
                text-sm font-medium transition hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 z-10 mt-2 w-44
                rounded-xl border border-border bg-card p-1.5
                shadow-lg">

                <button
                  onClick={() => {
                    exportArticleAsMarkdown(selectedArticle);
                    setShowExportMenu(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left
                    text-sm transition hover:bg-muted"
                >
                  Markdown
                </button>

                <button
                  onClick={() => {
                    exportArticleAsHTML(selectedArticle);
                    setShowExportMenu(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left
                    text-sm transition hover:bg-muted"
                >
                  HTML
                </button>

                <button
                  onClick={() => {
                    exportArticleAsJSON(selectedArticle);
                    setShowExportMenu(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left
                    text-sm transition hover:bg-muted"
                >
                  JSON
                </button>
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => setArticleToDelete(selectedArticle)}
            disabled={deletingId === selectedArticle?.id}
            className="inline-flex items-center gap-2 rounded-xl
              border border-destructive/30 bg-destructive/5
              px-3.5 py-2 text-sm font-medium text-destructive
              transition hover:bg-destructive/10
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>

          {/* New article */}
          {/*<button
            onClick={() => {
              setSelectedArticle(null);
              setShowGenerator(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl
              border border-border bg-background px-3.5 py-2
              text-sm font-medium transition hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            New article
          </button>*/}


          <button>
            <Link
              to="/article/:articleId"
              params= {{ articleId: selectedArticle.id} }
               className="inline-flex items-center gap-2 rounded-xl
              border border-border bg-background px-3.5 py-2
              text-sm font-medium transition hover:bg-muted"
              >
            {"Edit"}
            </Link>
          </button>

        </div>
                </div>

                <h2 className="max-w-4xl text-3xl font-bold
                  tracking-tight leading-tight sm:text-4xl">
                  {selectedArticle.title || "Untitled article"}
                </h2>

                <div className="mt-4 flex flex-wrap items-center gap-4
                  text-sm text-muted-foreground">

                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    {selectedArticle.keyword?.keyword ||
                      "Target keyword"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {selectedArticle.wordCount || 0} words
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(
                      selectedArticle.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  /{selectedArticle.slug}
                </p>
              </div>

              {/* Content gaps */}
              <ContentGaps article={selectedArticle} />

              {/* Markdown article */}
              <article className="rounded-2xl border border-border
                bg-card shadow-sm">

                <div className="px-6 py-8 sm:px-10 sm:py-10">

                  <div
                    className="
                      prose
                      prose-slate
                      dark:prose-invert
                      max-w-none

                      prose-headings:font-semibold
                      prose-headings:tracking-tight

                      prose-h1:mb-6
                      prose-h1:text-3xl
                      prose-h1:leading-tight

                      prose-h2:mt-10
                      prose-h2:text-2xl

                      prose-h3:mt-8
                      prose-h3:text-xl

                      prose-p:leading-7

                      prose-a:text-primary
                      prose-a:no-underline
                      hover:prose-a:underline

                      prose-strong:text-foreground

                      prose-li:leading-7

                      prose-blockquote:border-primary/40
                      prose-blockquote:text-muted-foreground

                      prose-code:text-foreground

                      prose-pre:border
                      prose-pre:border-border
                      prose-pre:bg-muted

                      prose-table:border
                      prose-table:border-border

                      prose-th:bg-muted
                      prose-th:text-foreground

                      prose-td:border-border
                    "
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {selectedArticle.content || ""}
                    </ReactMarkdown>
                  </div>

                </div>
              </article>

            </div>

          ) : (

            /* =================================================
               EMPTY STATE
            ================================================== */
            <div className="flex min-h-[70vh] items-center
              justify-center px-6">

              <div className="max-w-md text-center">

                <div className="mx-auto mb-5 flex h-14 w-14
                  items-center justify-center rounded-2xl bg-muted">
                  <FileText className="h-7 w-7 text-muted-foreground" />
                </div>

                <h2 className="text-xl font-semibold">
                  Select an article
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a blog post from the sidebar to view its
                  content, or create a new SEO article.
                </p>

                <button
                  onClick={() => setShowGenerator(true)}
                  className="mt-5 inline-flex items-center gap-2
                    rounded-xl bg-primary px-4 py-2.5 text-sm
                    font-semibold text-primary-foreground
                    transition hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Create new article
                </button>

              </div>
            </div>
          )}

        </section>
      </main>


{articleToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => {
        if (!deletingId) {
          setArticleToDelete(null);
        }
      }}
    />

    {/* Dialog */}
    <div className="relative w-full max-w-md rounded-2xl
      border border-border bg-card p-6 shadow-xl">

      {/* Icon */}
      <div className="mb-5 flex h-11 w-11 items-center
        justify-center rounded-xl bg-destructive/10">
        <Trash2 className="h-5 w-5 text-destructive" />
      </div>

      {/* Content */}
      <h2 className="text-lg font-semibold">
        Delete article?
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-medium text-foreground">
          "{articleToDelete.title || "Untitled article"}"
        </span>
        ?
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        This action cannot be undone.
      </p>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => setArticleToDelete(null)}
          disabled={deletingId === articleToDelete.id}
          className="rounded-xl border border-border
            bg-background px-4 py-2.5 text-sm font-medium
            transition hover:bg-muted
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={() =>
            handleDelete(
              articleToDelete.id,
              articleToDelete.title || "Untitled article"
            )
          }
          disabled={deletingId === articleToDelete.id}
          className="inline-flex items-center gap-2 rounded-xl
            bg-destructive px-4 py-2.5 text-sm font-semibold
            text-destructive-foreground transition
            hover:bg-destructive/90
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deletingId === articleToDelete.id && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {deletingId === articleToDelete.id
            ? "Deleting..."
            : "Delete article"}
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  );

}


/* =============================================================
   ARTICLE STATUS
============================================================= */

function ArticleStatus({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1
          text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Completed
        </span>
      );

    case "GENERATING":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full
          bg-amber-500/10 px-2.5 py-1 text-xs font-semibold
          text-amber-600 dark:text-amber-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating
        </span>
      );

    case "FAILED":
      return (
        <span className="rounded-full bg-destructive/10 px-2.5 py-1
          text-xs font-semibold text-destructive">
          Failed
        </span>
      );

    default:
      return (
        <span className="rounded-full bg-muted px-2.5 py-1
          text-xs font-semibold text-muted-foreground">
          {status || "Draft"}
        </span>
      );
  }
}


/* =============================================================
   CONTENT GAPS
============================================================= */

function ContentGaps({ article }: { article: any }) {
  const brief = article.contentBrief as any;
  const contentGaps = brief?.contentGaps || [];

  if (contentGaps.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card
      shadow-sm">

      <div className="flex items-center justify-between gap-4 p-5">
        <div>
          <h3 className="text-sm font-semibold">
            Content gaps addressed
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Topics identified from competitor H1/H2 analysis.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-2.5
          py-1 text-xs font-semibold text-primary">
          {contentGaps.length} gaps
        </span>
      </div>

      <div className="border-t border-border" />

      <div className="flex flex-wrap gap-2 p-5">
        {contentGaps.map((gap: string, index: number) => (
          <span
            key={index}
            className="rounded-lg border border-border bg-muted/50
              px-2.5 py-1.5 text-xs text-muted-foreground"
          >
            {gap}
          </span>
        ))}
      </div>
    </div>
  );



}