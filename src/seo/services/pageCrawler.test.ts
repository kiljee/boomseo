import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractCompetitorPage } from './pageCrawler';

const filler = Array.from({ length: 100 }, () => 'content').join(' ');

const HTML = `
<html>
  <body>
    <article>
      <p>best<span>contractor</span> services ${filler}</p>
      <h2>Find<span>a</span>pro</h2>
    </article>
  </body>
</html>
`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('extractCompetitorPage', () => {
  it('inserts spaces between adjacent inline elements', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(HTML, {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        })
      )
    );

    const page = await extractCompetitorPage('https://example.com/page');

    expect(page.text).toMatch(/best contractor services/);
    expect(page.h2).toContain('Find a pro');
  });
});
