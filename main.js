require('dotenv').config();
const ContentScraper = require('./contentScraper');
const AIContentGenerator = require('./aiContentGenerator');
const VideoCreator = require('./videoCreator');
const SocialPoster = require('./socialPoster');
const GoogleSheetsManager = require('./googleSheetsManager');

class VideoAutomationWorkflow {
  constructor() {
    this.scraper = new ContentScraper();
    this.aiGenerator = new AIContentGenerator();
    this.videoCreator = new VideoCreator();
    this.socialPoster = new SocialPoster();
    this.sheetsManager = new GoogleSheetsManager();
    this.stats = {
      startTime: null,
      endTime: null,
      videosCreated: 0,
      ideasCollected: 0,
      successfulPosts: 0
    };
  }

  async executeDailyWorkflow() {
    this.stats.startTime = new Date();
    console.log('🎬 Starting Daily Video Automation Workflow...');
    console.log('=' .repeat(60));
    
    try {
      // Step 1: Scrape fresh video ideas
      console.log('\n📝 STEP 1: Gathering video ideas...');
      const ideas = await this.scraper.getVideoIdeas(5);
      this.stats.ideasCollected = ideas.length;
      
      // Save ideas to Google Sheets
      await this.sheetsManager.saveVideoIdeas(ideas);
      
      // Use the best idea for today's video
      const bestIdea = ideas[0] || null;
      
      // Step 2: Generate AI content
      console.log('\n🤖 STEP 2: Generating AI video script...');
      const content = await this.aiGenerator.generateVideoScript(bestIdea);
      
      // Step 3: Create video
      console.log('\n🎥 STEP 3: Creating video content...');
      const videoResult = await this.videoCreator.createVideo(content);
      
      if (videoResult.success) {
        this.stats.videosCreated = 1;
        
        // Step 4: Distribute to social media
        console.log('\n📱 STEP 4: Posting to social media platforms...');
        const socialResults = await this.socialPoster.postToAllPlatforms(videoResult, content);
        this.stats.successfulPosts = socialResults.successful.length;
        
        // Step 5: Log everything to Google Sheets
        console.log('\n📊 STEP 5: Logging to Google Sheets...');
        await this.sheetsManager.logVideoCreation(videoResult, socialResults, content);
        
        // Step 6: Show analytics
        console.log('\n📈 STEP 6: Generating analytics...');
        const analytics = await this.sheetsManager.getAnalytics();
        this.showAnalytics(analytics);
        
        this.showWorkflowSummary(content, socialResults, videoResult);
      } else {
        console.log('❌ Workflow stopped: Video creation failed');
      }
      
    } catch (error) {
      console.log('❌ Workflow error:', error.message);
    } finally {
      this.stats.endTime = new Date();
      this.showFinalStats();
    }
  }

  showAnalytics(analytics) {
    if (analytics) {
      console.log('   📊 Platform Analytics:');
      console.log(`      • Total Videos: ${analytics.totalVideos}`);
      console.log(`      • Videos Today: ${analytics.videosToday}`);
      console.log(`      • Success Rate: ${analytics.successRate}%`);
    }
  }

  showWorkflowSummary(content, socialResults, videoResult) {
    console.log('\n🎉 WORKFLOW SUMMARY');
    console.log('=' .repeat(40));
    console.log(`📹 Video: "${content.title}"`);
    console.log(`🤖 AI Model: ${content.aiModel}`);
    console.log(`📱 Platforms: ${socialResults.successful.length}/5 successful`);
    console.log(`💡 Source: ${content.sourceIdea}`);
    console.log(`⏱️  Duration: ${videoResult.metadata.duration}s`);
    console.log(`📁 File: ${videoResult.filePath}`);
  }

  showFinalStats() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    console.log('\n📈 FINAL STATISTICS');
    console.log('=' .repeat(40));
    console.log(`⏱️  Total Duration: ${duration.toFixed(1)} seconds`);
    console.log(`💡 Ideas Collected: ${this.stats.ideasCollected}`);
    console.log(`🎬 Videos Created: ${this.stats.videosCreated}`);
    console.log(`📱 Successful Posts: ${this.stats.successfulPosts}`);
    console.log(`📊 Sheets Updated: ${this.stats.videosCreated > 0 ? 'Yes' : 'No'}`);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const workflow = new VideoAutomationWorkflow();
  
  if (args.includes('--daily') || args.includes('--test')) {
    await workflow.executeDailyWorkflow();
  } else {
    console.log('🎬 Video Automation Node.js');
    console.log('Usage:');
    console.log('  npm start          - Run default workflow');
    console.log('  npm run daily      - Run daily automation');
    console.log('  npm run test       - Run test workflow');
    console.log('\nStarting default workflow...\n');
    await workflow.executeDailyWorkflow();
  }
}

// Run if this is the main module
if (require.main === module) {
  main().catch(console.error);
}

module.exports = VideoAutomationWorkflow;