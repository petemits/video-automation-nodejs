const axios = require('axios');
const config = require('./config');

class AIContentGenerator {
  constructor() {
    this.config = config;
  }

  async generateVideoScript(idea = null) {
    console.log('🤖 Generating AI video script...');
    
    if (!this.config.openRouter.apiKey) {
      console.log('⚠️  No OpenRouter API key, using fallback content');
      return this.generateFallbackContent();
    }

    try {
      const prompt = idea 
        ? `Create a short, engaging social media video script about: "${idea.title}". Include a catchy title and 3-4 key points. Keep it under 100 words.`
        : `Create a short, engaging social media video script about ${this.getRandomCategory()}. Include a catchy title and 3-4 key points. Keep it under 100 words.`;

      const response = await axios.post(
        `${this.config.openRouter.baseURL}/chat/completions`,
        {
          model: this.config.openRouter.model,
          messages: [
            {
              role: "system",
              content: "You are a social media content creator. Create engaging, short video scripts optimized for platforms like Instagram, TikTok, and YouTube."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.openRouter.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/video-automation',
            'X-Title': 'Video Automation'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      const parsedContent = this.parseAIContent(aiResponse);
      
      console.log(`✅ AI generated: "${parsedContent.title}"`);
      return {
        ...parsedContent,
        sourceIdea: idea ? idea.title : 'AI Generated',
        aiModel: this.config.openRouter.model
      };
      
    } catch (error) {
      console.log('❌ AI generation failed:', error.message);
      return this.generateFallbackContent(idea);
    }
  }

  parseAIContent(aiResponse) {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    // Extract title (first line usually)
    let title = lines[0] || 'Engaging Content';
    title = title.replace(/^title:\s*/i, '').replace(/["']/g, '').trim();
    
    // Extract points
    const points = [];
    for (const line of lines.slice(1)) {
      const cleanLine = line.replace(/^[•\-*\d\.\s]+/, '').trim();
      if (cleanLine && cleanLine.length > 10 && !cleanLine.toLowerCase().includes('title')) {
        points.push(cleanLine);
      }
    }
    
    // Ensure we have enough points
    while (points.length < 3) {
      points.push(this.getFallbackPoint());
    }

    return {
      title: title || 'AI Generated Content',
      points: points.slice(0, 4),
      fullScript: aiResponse,
      estimatedDuration: 45
    };
  }

  getRandomCategory() {
    return this.config.videoCategories[
      Math.floor(Math.random() * this.config.videoCategories.length)
    ];
  }

  generateFallbackContent(idea = null) {
    const topics = [
      {
        title: "AI Technology Trends Transforming Industries",
        points: [
          "Machine learning is revolutionizing business processes",
          "Natural language processing enables better customer service",
          "Computer vision applications are growing rapidly",
          "Ethical AI considerations are more important than ever"
        ]
      },
      {
        title: "Boost Your Productivity with These Simple Tips",
        points: [
          "Use the Pomodoro technique for focused work sessions",
          "Eliminate digital distractions during deep work",
          "Prioritize tasks using the Eisenhower Matrix",
          "Take regular breaks to maintain mental freshness"
        ]
      },
      {
        title: "Digital Marketing Strategies for 2024",
        points: [
          "Video content continues to dominate social media",
          "Personalization drives higher engagement rates",
          "AI-powered tools optimize marketing campaigns",
          "Authenticity builds stronger customer relationships"
        ]
      }
    ];

    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    return {
      title: idea ? `Insights: ${idea.title}` : topic.title,
      points: topic.points,
      fullScript: `${topic.title}\n\n${topic.points.join('\n• ')}`,
      estimatedDuration: 50,
      sourceIdea: idea ? idea.title : 'Fallback Content',
      aiModel: 'fallback'
    };
  }

  getFallbackPoint() {
    const points = [
      "Start implementing these strategies today for better results",
      "Consistency is the key to long-term success and growth",
      "Measure your progress regularly to track improvements",
      "Adapt these tips to fit your specific needs and goals"
    ];
    return points[Math.floor(Math.random() * points.length)];
  }
}

module.exports = AIContentGenerator;