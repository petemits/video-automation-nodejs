const { google } = require('googleapis');
const fs = require('fs');
const config = require('./config');

class GoogleSheetsManager {
  constructor() {
    this.config = config.googleSheets;
    this.sheets = null;
    this.setupClient();
  }

  setupClient() {
    try {
      if (fs.existsSync(this.config.credentials)) {
        const credentials = JSON.parse(fs.readFileSync(this.config.credentials, 'utf8'));
        const auth = new google.auth.JWT(
          credentials.client_email,
          null,
          credentials.private_key,
          ['https://www.googleapis.com/auth/spreadsheets']
        );
        
        this.sheets = google.sheets({ version: 'v4', auth });
        console.log('✅ Google Sheets client initialized');
      } else {
        console.log('⚠️  Google Sheets credentials file not found');
      }
    } catch (error) {
      console.log('❌ Google Sheets setup failed:', error.message);
    }
  }

  async logVideoCreation(videoData, socialResults, content) {
    if (!this.sheets) {
      console.log('⚠️  Google Sheets not available, skipping logging');
      return false;
    }

    try {
      const timestamp = new Date().toISOString();
      
      const row = [
        timestamp,                                  // A: Timestamp
        videoData.metadata.id,                      // B: Video ID
        content.title,                              // C: Title
        content.sourceIdea || 'AI Generated',       // D: Category
        videoData.filePath,                         // E: Video Path
        `${videoData.metadata.duration}s`,          // F: Duration
        videoData.metadata.fileSize,                // G: File Size
        socialResults.successful.join(', '),        // H: Platforms Posted
        this.calculateEngagementScore(content),     // I: Engagement Score
        content.aiModel || 'unknown',               // J: AI Model Used
        content.sourceIdea || 'AI Generated'        // K: Source Idea
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.trackingSheet}!A:K`,
        valueInputOption: 'RAW',
        resource: { values: [row] }
      });

      console.log('✅ Successfully logged to Google Sheets');
      return true;
      
    } catch (error) {
      console.log('❌ Google Sheets logging failed:', error.message);
      return false;
    }
  }

  async saveVideoIdeas(ideas) {
    if (!this.sheets) {
      console.log('⚠️  Google Sheets not available, skipping ideas save');
      return false;
    }

    try {
      const timestamp = new Date().toISOString();
      const rows = ideas.map(idea => [
        timestamp,
        idea.title,
        idea.source,
        idea.engagement,
        idea.url,
        'No'  // Not used yet
      ]);

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.ideasSheet}!A:F`,
        valueInputOption: 'RAW',
        resource: { values: rows }
      });

      console.log(`✅ Saved ${ideas.length} video ideas to Google Sheets`);
      return true;
      
    } catch (error) {
      console.log('❌ Failed to save video ideas:', error.message);
      return false;
    }
  }

  calculateEngagementScore(content) {
    // Simple engagement score based on content quality
    let score = 50; // Base score
    
    // Add points for title length (optimal 5-10 words)
    const titleWords = content.title.split(' ').length;
    if (titleWords >= 5 && titleWords <= 10) score += 20;
    
    // Add points for number of points (optimal 3-4)
    if (content.points.length >= 3) score += 15;
    
    // Add points for AI model usage
    if (content.aiModel && content.aiModel !== 'fallback') score += 15;
    
    // Random variation
    score += Math.floor(Math.random() * 20);
    
    return Math.min(score, 100);
  }

  async getAnalytics() {
    if (!this.sheets) {
      return null;
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.trackingSheet}!A:K`
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        return { totalVideos: 0, videosToday: 0 };
      }

      // Skip header row
      const dataRows = rows.slice(1);
      const today = new Date().toISOString().split('T')[0];
      
      const videosToday = dataRows.filter(row => 
        row[0] && row[0].includes(today)
      ).length;

      return {
        totalVideos: dataRows.length,
        videosToday: videosToday,
        successRate: Math.round((videosToday / dataRows.length) * 100) || 0
      };
      
    } catch (error) {
      console.log('❌ Analytics failed:', error.message);
      return null;
    }
  }
}

module.exports = GoogleSheetsManager;