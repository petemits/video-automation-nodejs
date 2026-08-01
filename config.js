require('dotenv').config();

const config = {
  // OpenRouter AI Configuration
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL,
    baseURL: 'https://openrouter.ai/api/v1'
  },
  
  // Google Sheets Configuration
  googleSheets: {
    credentials: process.env.GOOGLE_SHEETS_CREDENTIALS,
    spreadsheetId: process.env.SPREADSHEET_ID,
    trackingSheet: 'VideoAutomationLog',
    ideasSheet: 'VideoIdeas'
  },
  
  // Video Settings
  video: {
    resolution: { width: 1080, height: 1920 },
    duration: parseInt(process.env.VIDEO_DURATION) || 60,
    backgroundColor: '#000000'
  },
  
  // Social Media Settings
  simulatePosting: process.env.SIMULATE_POSTING === 'true',
  useRealPosting: process.env.USE_REAL_POSTING === 'true',
  
  // Content Categories
  videoCategories: [
    "Tech Innovation & AI Trends",
    "Personal Development & Productivity", 
    "Business Growth Strategies",
    "Digital Marketing Tips",
    "Health & Wellness Advice",
    "Entrepreneurship Lessons"
  ],
  
  // Web Scraping Sources
  scrapingSources: [
    "https://www.reddit.com/r/Entrepreneur/top/.json?limit=5",
    "https://www.reddit.com/r/productivity/top/.json?limit=5"
  ]
};

module.exports = config;