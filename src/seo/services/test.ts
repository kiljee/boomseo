import { getSiteInventory, getOrCrawlSiteInventory } from './sitemapService';

async function runTest() {
  const targetDomain = process.argv[2] || 'example.com';

  console.log(`\n--- Testing getSiteInventory for: ${targetDomain} ---`);
  const results = await getOrCrawlSiteInventory(targetDomain);

  console.log(`\nFound ${results.length} URLs:`);
  console.log(JSON.stringify(results.slice(0, 5), null, 2));

  if (results.length > 5) {
    console.log(`... and ${results.length - 5} more items.`);
  }
}

runTest();
