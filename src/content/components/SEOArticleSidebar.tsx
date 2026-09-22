import { FileText, List, Search } from 'lucide-react';
import { useState } from 'react';

import { SEOOverview } from './SEOOverview';
import { ArticleOutline } from './ArticleOutline';
import { ArticleDetails } from './ArticleDetails';

type SidebarTab = 'seo' | 'outline' | 'details';

type SEOArticleSidebarProps = {
  article: any;

  content: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;

  setTitle: (value: string) => void;
  setMetaTitle: (value: string) => void;
  setMetaDescription: (value: string) => void;
  setSlug: (value: string) => void;

  wordCount: number;
};

export function SEOArticleSidebar({
  article,
  content,
  title,
  metaTitle,
  metaDescription,
  slug,
  setTitle,
  setMetaTitle,
  setMetaDescription,
  setSlug,
  wordCount,
}: SEOArticleSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('seo');

  const tabs = [
    {
      id: 'seo' as const,
      label: 'SEO',
      icon: Search,
    },
    {
      id: 'outline' as const,
      label: 'Outline',
      icon: List,
    },
    {
      id: 'details' as const,
      label: 'Details',
      icon: FileText,
    },
  ];

  return (
    <aside className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Tabs */}
      <div className="border-b border-border px-2">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}

                {isActive && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'seo' && (
          <SEOOverview
            article={article}
            content={content}
            wordCount={wordCount}
          />
        )}

        {activeTab === 'outline' && (
          <ArticleOutline
            article={article}
            content={content}
          />
        )}

        {activeTab === 'details' && (
          <ArticleDetails
            article={article}
            title={title}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            slug={slug}
            setTitle={setTitle}
            setMetaTitle={setMetaTitle}
            setMetaDescription={setMetaDescription}
            setSlug={setSlug}
          />
        )}
      </div>
    </aside>
  );
}