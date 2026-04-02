#!/usr/bin/env node

/**
 * Test script to verify user article URL generation
 * Tests that articles with author.role === "Authors" generate correct /{userId}/article/... URLs
 */

const http = require('http');

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testUserArticleURLs() {
  console.log('🧪 Testing User Article URL Generation...\n');

  // Get URL from command line argument or use default
  const testUrl = process.argv[2] || 'http://localhost:4321/';

  try {
    // Fetch the page
    console.log(`📡 Fetching ${testUrl} ...`);
    const html = await fetchPage(testUrl);

    // Check for auther-create article links
    const autherCreateMatches = html.match(/href="([^"]*auther-create[^"]*)"/g);

    if (!autherCreateMatches || autherCreateMatches.length === 0) {
      console.log('⚠️  No "auther-create" article found on the page');
      console.log('   This might be okay if the article is not in the current data set\n');
    } else {
      console.log(`✅ Found ${autherCreateMatches.length} "auther-create" link(s):\n`);

      autherCreateMatches.forEach((match, index) => {
        const url = match.match(/href="([^"]*)"/)[1];
        console.log(`   ${index + 1}. ${url}`);

        // Check if it's a user article URL (starts with /number/)
        if (url.match(/^\/\d+\/article\//)) {
          console.log(`      ✅ CORRECT: User article format (/{userId}/article/...)`);
        } else if (url.match(/^\/article\//)) {
          console.log(`      ❌ WRONG: Admin article format (/article/...) - should be /{userId}/article/...`);
        } else {
          console.log(`      ⚠️  UNKNOWN: Unexpected format`);
        }
      });
    }

    // Extract all article links
    console.log('\n📋 All article links on the page:\n');
    const allArticleLinks = html.match(/href="\/(?:\d+\/)?article\/[^"]+"/g) || [];

    const userArticles = allArticleLinks.filter(link => link.match(/href="\/\d+\/article\//));
    const adminArticles = allArticleLinks.filter(link => link.match(/href="\/article\//));

    console.log(`   User articles (/{userId}/article/...): ${userArticles.length}`);
    if (userArticles.length > 0) {
      userArticles.slice(0, 3).forEach(link => {
        const url = link.match(/href="([^"]*)"/)[1];
        console.log(`      - ${url}`);
      });
      if (userArticles.length > 3) {
        console.log(`      ... and ${userArticles.length - 3} more`);
      }
    }

    console.log(`\n   Admin articles (/article/...): ${adminArticles.length}`);
    if (adminArticles.length > 0) {
      adminArticles.slice(0, 3).forEach(link => {
        const url = link.match(/href="([^"]*)"/)[1];
        console.log(`      - ${url}`);
      });
      if (adminArticles.length > 3) {
        console.log(`      ... and ${adminArticles.length - 3} more`);
      }
    }

    console.log('\n✨ Test completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(`\n💡 Make sure the dev server is running and the URL is accessible: ${testUrl}\n`);
    process.exit(1);
  }
}

testUserArticleURLs();
