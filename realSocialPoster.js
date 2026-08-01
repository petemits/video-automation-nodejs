const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class RealSocialPoster {
  constructor() {
    this.authFiles = {
      instagram: 'instagram-auth.json',
      twitter: 'twitter-auth.json'
    };
  }

  async postToInstagram(videoPath, caption) {
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 500
    });
    
    const context = await browser.newContext();
    
    if (fs.existsSync(this.authFiles.instagram)) {
      await context.storageState({ path: this.authFiles.instagram });
      console.log('🔑 Loaded existing Instagram login');
    }
    
    const page = await context.newPage();
    
    try {
      console.log('📱 Opening Instagram...');
      await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });
      
      const isLoggedIn = await page.$('a[href="/direct/inbox/"]');
      
      if (!isLoggedIn) {
        console.log('🔐 Not logged in. Please log in manually in the browser window...');
        console.log('⏳ Waiting 60 seconds for manual login...');
        await page.waitForTimeout(60000);
        
        await context.storageState({ path: this.authFiles.instagram });
        console.log('💾 Saved login for future use');
      }
      
      console.log('🎬 Creating new post...');
      await page.click('div[role="button"]:has-text("Create")');
      await page.waitForTimeout(2000);
      
      const fileInput = await page.$('input[type="file"]');
      await fileInput.setInputFiles(videoPath);
      await page.waitForTimeout(3000);
      
      await page.click('div[aria-label="Write a caption..."]');
      await page.keyboard.type(caption);
      await page.waitForTimeout(1000);
      
      await page.click('div[role="button"]:has-text("Share")');
      await page.waitForTimeout(5000);
      
      console.log('✅ Instagram post completed!');
      return { success: true, platform: 'Instagram' };
      
    } catch (error) {
      console.log('❌ Instagram post failed:', error.message);
      return { success: false, platform: 'Instagram', error: error.message };
    } finally {
      await browser.close();
    }
  }

  async postToTwitter(text) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      console.log('🐦 Opening Twitter...');
      await page.goto('https://twitter.com/home', { waitUntil: 'networkidle' });
      
      const isLoggedIn = await page.$('[data-testid="tweetTextarea_0"]');
      
      if (!isLoggedIn) {
        console.log('🔐 Please log in to Twitter manually...');
        await page.waitForTimeout(60000);
      }
      
      await page.click('[data-testid="tweetTextarea_0"]');
      await page.keyboard.type(text);
      await page.waitForTimeout(1000);
      
      await page.click('[data-testid="tweetButton"]');
      await page.waitForTimeout(3000);
      
      console.log('✅ Tweet posted!');
      return { success: true, platform: 'Twitter' };
      
    } catch (error) {
      console.log('❌ Twitter post failed:', error.message);
      return { success: false, platform: 'Twitter', error: error.message };
    } finally {
      await browser.close();
    }
  }
}

module.exports = RealSocialPoster;