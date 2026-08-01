const axios = require('axios');
const config = require('./config');

class ContentScraper {
  constructor() {
    this.config = config;
  }

  async getVideoIdeas(numIdeas = 5) {
    console.log('🌐 Scraping video ideas from web...');
    
    try {
      const ideas = [];
      
      // Scrape from Reddit
      const redditIdeas = await this.scrapeReddit('Entrepreneur', 3);
      ideas.push(...redditIdeas);
      
      const productivityIdeas = await this.scrapeReddit('productivity', 3);
      ideas.push(...productivityIdeas);
      
      // Remove duplicates and sort by engagement
      const uniqueIdeas = this.removeDuplicates(ideas);
      const sortedIdeas = uniqueIdeas.sort((a, b) => b.engagement - a.engagement);
      
      console.log(`✅ Found ${sortedIdeas.length} unique ideas`);
      return sortedIdeas.slice(0, numIdeas);
      
    } catch (error) {
      console.log('❌ Scraping failed, using fallback ideas');
      return this.getFallbackIdeas(numIdeas);
    }
  }

  async scrapeReddit(subreddit, limit = 5) {
    try {
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/hot/.json?limit=${limit}`,
        { timeout: 10000 }
      );
      
      const ideas = [];
      const posts = response.data.data.children;
      
      for (const post of posts) {
        const postData = post.data;
        if (postData.score > 10) { // Only reasonably popular posts
          ideas.push({
            title: postData.title,
            source: `Reddit r/${subreddit}`,
            engagement: postData.score,
            url: `https://reddit.com${postData.permalink}`,
            created: new Date(postData.created_utc * 1000).toISOString()
          });
        }
      }
      
      return ideas;
    } catch (error) {
      console.log(`❌ Reddit r/${subreddit} scraping failed`);
      return [];
    }
  }

  removeDuplicates(ideas) {
    const seen = new Set();
    return ideas.filter(idea => {
      const key = idea.title.substring(0, 50).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  getFallbackIdeas(numIdeas) {
    const fallbackIdeas = [
      {
        title: 'AI and Machine Learning Trends 2024',
        source: 'Generated',
        engagement: 100,
        url: 'https://example.com/ai-trends',
        created: new Date().toISOString()
      },
      {
        title: 'Productivity Tips for Remote Work Success',
        source: 'Generated',
        engagement: 85,
        url: 'https://example.com/productivity',
        created: new Date().toISOString()
      },
      {
        title: 'Digital Marketing Strategies That Actually Work',
        source: 'Generated',
        engagement: 75,
        url: 'https://example.com/marketing',
        created: new Date().toISOString()
      },
      {
        title: 'Building a Successful Startup Culture',
        source: 'Generated',
        engagement: 90,
        url: 'https://example.com/startup',
        created: new Date().toISOString()
      },
      {
        title: 'Future of Work: Remote Team Management',
        source: 'Generated',
        engagement: 80,
        url: 'https://example.com/future-work',
        created: new Date().toISOString()
      }
    ];
    
    return fallbackIdeas.slice(0, numIdeas);
  }
}

module.exports = ContentScraper;