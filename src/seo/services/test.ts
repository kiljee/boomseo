import { filterSERPResults, searchDuckDuckGo } from './serpService';

const keyword = process.argv[2]?.trim() || 'best seo tools';
const limit = Number(process.argv[3]) || 10;

async function printSerpResults() {
	console.log(`Searching SERP for: "${keyword}" (limit ${limit})\n`);

	const serpResults = await searchDuckDuckGo(keyword, limit);

	console.log('Raw SERP results:');
	console.log(JSON.stringify(serpResults, null, 2));

	const filtered = filterSERPResults(serpResults);

	console.log('\nFiltered (competitors):');
	console.log(JSON.stringify(filtered, null, 2));
}

printSerpResults().catch((error) => {
	console.error(error);
	process.exit(1);
});
