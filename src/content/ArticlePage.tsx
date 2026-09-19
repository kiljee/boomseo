import React, { useState } from 'react';
import { routes } from 'wasp/client/router';

export function NewArticlePage() {
  const [keyword, setKeyword] = useState('best crm for real estate agents');
  const [tone, setTone] = useState('Professional');
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;

    setIsLoading(true);

    // Simulate backend SERP scraping & outline generation
    setTimeout(() => {
      const dummyArticle = {
        id: 'mock-article-123',
        primaryKeyword: keyword,
        title: `The Ultimate Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} (2026)`,
        tone,
        targetWordCount: 2200,
        headings: [
          { id: '1', level: 'h2', text: `What is a ${keyword}?`, talkingPoints: 'Define core concept and target audience' },
          { id: '2', level: 'h2', text: 'Key Features You Must Look For', talkingPoints: 'Lead capture, automated follow-ups, MLS integration' },
          { id: '3', level: 'h3', text: '1. Pipeline & Lead Management', talkingPoints: 'Visual kanban board workflows' },
          { id: '4', level: 'h3', text: '2. Mobile App Availability', talkingPoints: 'Crucial for on-the-go property viewings' },
          { id: '5', level: 'h2', text: 'Top 5 Options Compared', talkingPoints: 'Feature comparison table and pricing' },
          { id: '6', level: 'h2', text: 'Frequently Asked Questions (FAQ)', talkingPoints: 'Answer People Also Ask queries' },
        ],
        entities: [
          { term: 'pipeline management', targetCount: 3 },
          { term: 'lead scoring', targetCount: 2 },
          { term: 'MLS integration', targetCount: 3 },
          { term: 'pricing plans', targetCount: 2 },
          { term: 'client follow-up', targetCount: 4 },
        ],
      };

      localStorage.setItem('dummy_seo_article', JSON.stringify(dummyArticle));
      setIsLoading(false);

      // OpenSaaS Type-Safe Navigation
      //window.location.href = routes.OutlineRoute.build({ params: { id: dummyArticle.id } });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            AI SEO Engine
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Create New Article</h1>
          <p className="text-slate-500 mt-2 text-sm">Reverse-engineer Page 1 Google competitors in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Target Primary Keyword</label>
            <input
              type="text"
              placeholder="e.g. best email marketing software"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Professional">Professional & Authoritative</option>
                <option value="Casual">Casual & Conversational</option>
                <option value="Technical">Technical & In-Depth</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target SERP Location</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="US">United States (Google.com)</option>
                <option value="UK">United Kingdom (Google.co.uk)</option>
                <option value="CA">Canada (Google.ca)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFaq}
                onChange={(e) => setIncludeFaq(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">Extract & Include "People Also Ask" FAQ Schema</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">Auto-Generate Comparison Tables & AI Media</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Scraping Competitors & Analyzing SERP...</span>
              </>
            ) : (
              'Analyze Competitors & Build Outline ➔'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}