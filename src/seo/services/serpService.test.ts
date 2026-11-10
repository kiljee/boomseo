import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	filterSERPResults,
	searchSERP,
	type SERPResult,
} from './serpService';
import { parseDuckDuckGoResults, searchDuckDuckGo } from './duckduckgoProvider';
import { searchSearXNG } from './searxngProvider';

// ─── DuckDuckGo HTML fixtures ────────────────────────────────────────────────

const DDG_RESULT_HTML = `
<html><body>
  <div class="result">
    <a class="result__a" href="https://duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Ffoo%2520bar&amp;rut=abc">Encoded result</a>
    <div class="result__snippet">Keeps the encoded space</div>
  </div>
  <div class="result result--ad">
    <a class="result__a" href="https://duckduckgo.com/l/?uddg=https%3A%2F%2Fads.example%2Fbuy">Ad</a>
    <div class="result__snippet">Buy now</div>
  </div>
  <div class="result">
    <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D1">Video</a>
    <div class="result__snippet">YouTube</div>
  </div>
  <div class="result">
    <a class="result__a" href="https://notexample.com/page">Similar name</a>
    <div class="result__snippet">Should stay</div>
  </div>
  <div class="result">
    <a class="result__a" href="https://blog.example.com/post">Own blog</a>
    <div class="result__snippet">Should drop</div>
  </div>
  <div class="result">
    <a class="result__a" href="https://docs.example.org/guide?ref=youtube.com">Docs</a>
    <div class="result__snippet">Mentions YouTube in the query string</div>
  </div>
  <div class="result">
    <a class="result__a" href="https://duckduckgo.com/l/?uddg=https%3A%2F%2Fx.com%2Fpost">Post</a>
    <div class="result__snippet">Social</div>
  </div>
</body></html>
`;

function ddgPage(titles: string[]): string {
	return `<html><body>${titles
		.map(
			(title, index) => `
        <div class="result">
          <a class="result__a" href="https://example.com/${index}-${title}">${title}</a>
          <div class="result__snippet">${title}</div>
        </div>`
		)
		.join('')}</body></html>`;
}

// ─── SearXNG JSON fixture ────────────────────────────────────────────────────

function searxngResponse(titles: string[]): object {
	return {
		results: titles.map((title, index) => ({
			url: `https://example.com/${index}-${title}`,
			title,
			content: title,
		})),
	};
}

// ─── Teardown ────────────────────────────────────────────────────────────────

afterEach(() => {
	vi.unstubAllGlobals();
});

// ─── parseDuckDuckGoResults ───────────────────────────────────────────────────

describe('parseDuckDuckGoResults', () => {
	it('unwraps redirect URLs once and skips ads', () => {
		const results = parseDuckDuckGoResults(DDG_RESULT_HTML);

		expect(results.map((result) => result.url)).toEqual([
			'https://example.com/foo%20bar',
			'https://www.youtube.com/watch?v=1',
			'https://notexample.com/page',
			'https://blog.example.com/post',
			'https://docs.example.org/guide?ref=youtube.com',
			'https://x.com/post',
		]);
		expect(results.map((result) => result.position)).toEqual([
			1, 2, 3, 4, 5, 6,
		]);
	});
});

// ─── filterSERPResults ────────────────────────────────────────────────────────

describe('filterSERPResults', () => {
	const results = parseDuckDuckGoResults(DDG_RESULT_HTML);

	it('drops the owned domain and social hosts without matching substrings', () => {
		const filtered = filterSERPResults(results, 'example.com');

		expect(filtered.map((result) => result.url)).toEqual([
			'https://notexample.com/page',
			'https://docs.example.org/guide?ref=youtube.com',
		]);
	});

	it('does not cap the result count', () => {
		const many: SERPResult[] = Array.from({ length: 20 }, (_, index) => ({
			position: index + 1,
			title: `Result ${index}`,
			url: `https://site${index}.example.org/page`,
			snippet: 'snippet',
		}));

		expect(filterSERPResults(many)).toHaveLength(20);
	});
});

// ─── searchDuckDuckGo ────────────────────────────────────────────────────────

describe('searchDuckDuckGo', () => {
	it('paginates until the limit and fails closed on a block page', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(ddgPage(['one', 'two']), { status: 200 })
			)
			.mockResolvedValueOnce(
				new Response(ddgPage(['three']), { status: 200 })
			);
		vi.stubGlobal('fetch', fetchMock);

		const results = await searchDuckDuckGo('seo tools', 3);

		expect(results).toHaveLength(3);
		expect(results.map((result) => result.position)).toEqual([1, 2, 3]);
		expect(fetchMock).toHaveBeenCalledTimes(2);

		const secondBody = fetchMock.mock.calls[1][1].body as URLSearchParams;
		expect(secondBody.get('s')).toBe('10');
		expect(secondBody.get('dc')).toBe('11');

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					'<html><div class="anomaly-modal">bots use DuckDuckGo</div></html>',
					{ status: 200 }
				)
			)
		);

		await expect(searchDuckDuckGo('seo tools')).rejects.toThrow(
			/blocked the search request/
		);
	});

	it('fails when the first page has no organic results', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response('<html><body></body></html>', { status: 200 })
			)
		);

		await expect(searchDuckDuckGo('seo tools')).rejects.toThrow(
			/no results/
		);
	});
});

// ─── searchSearXNG ────────────────────────────────────────────────────────────

describe('searchSearXNG', () => {
	it('returns results from the JSON API', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify(searxngResponse(['alpha', 'beta', 'gamma'])),
					{ status: 200, headers: { 'Content-Type': 'application/json' } }
				)
			)
		);

		const results = await searchSearXNG('seo tools', 3);

		expect(results).toHaveLength(3);
		expect(results[0].title).toBe('alpha');
		expect(results[0].position).toBe(1);
		expect(results[1].position).toBe(2);
	});

	it('paginates when more results are needed', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify(
						searxngResponse(
							Array.from({ length: 10 }, (_, i) => `page1-${i}`)
						)
					),
					{ status: 200 }
				)
			)
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify(searxngResponse(['page2-0', 'page2-1'])),
					{ status: 200 }
				)
			);
		vi.stubGlobal('fetch', fetchMock);

		const results = await searchSearXNG('seo tools', 12);

		expect(results).toHaveLength(12);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('fails when the first page has no results', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ results: [] }), { status: 200 })
			)
		);

		await expect(searchSearXNG('seo tools')).rejects.toThrow(/no results/);
	});
});

// ─── searchSERP (unified entry point) ────────────────────────────────────────

describe('searchSERP', () => {
	it('delegates to SearXNG by default', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify(searxngResponse(['result-a'])),
					{ status: 200 }
				)
			)
		);

		const results = await searchSERP('test query');

		expect(results[0].title).toBe('result-a');
	});

	it('delegates to DuckDuckGo when provider is duckduckgo', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(ddgPage(['ddg-result']), { status: 200 })
			)
		);

		const results = await searchSERP('test query', 1, 'duckduckgo');

		expect(results[0].title).toBe('ddg-result');
	});
});
