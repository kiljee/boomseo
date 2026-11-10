
function triggerDownload(filename: string, content: string, contentType: string) {
	const blob = new Blob([content], {type: contentType});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');

	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Export as Markdown (.md)
 */

export function exportArticleAsMarkdown(article: any) {
      const filename = `${article.slug || 'article'}.md`;
      const markdownText = `---
    title: "${article.title}"
    metaTitle: "${article.metaTitle || ''}"
    metaDescription: "${article.metaDescription || ''}"
    wordCount: ${article.wordCount || 0}
    date: ${new Date(article.createdAt).toISOString()}
    ---
    
    ${article.content || ''}`;
    
  triggerDownload(filename, markdownText, 'text/markdown;charset=utf-8;');
}


/**
 * Export as clean HTML (.html)
 */

/**
     * Export as Clean HTML (.html)
     */
    export function exportArticleAsHTML(article: any) {
      const filename = `${article.slug || 'article'}.html`;
      
      // Basic markdown-to-HTML conversion for headings and paragraphs
      let htmlBody = (article.content || '')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>');
    
      const fullHTML = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${article.metaTitle || article.title}</title>
      <meta name="description" content="${article.metaDescription || ''}">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 
  1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
        h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-
  bottom: 1rem; }
        h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top:
  2rem; }
        h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-top: 
  1.5rem; }
        p { margin-bottom: 1.2rem; }
        li { margin-bottom: 0.5rem; }
      </style>
    </head>
    <body>
      ${htmlBody}
    </body>
    </html>`;
    
      triggerDownload(filename, fullHTML, 'text/html;charset=utf-8;');
}


/**
 * Export as JSON (.json)
 */

export function exportArticleAsJSON(article: any) {
  const filename = `${article.slug || 'article'}.json`;
  const jsonContent = JSON.stringify(article, null, 2);
  triggerDownload(filename, jsonContent, 'application/json;charset=utf-8;');
}
