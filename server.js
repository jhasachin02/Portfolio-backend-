const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173', 'http://127.0.0.1:5173', 'https://sachin-portfolio-sigma.vercel.app', 'https://jhasachin02.github.io'], // Allow multiple origins for development and production
  credentials: true
}));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Portfolio information for context
const portfolioContext = `
You are Sachin Jha's intelligent portfolio assistant. You have comprehensive knowledge about Sachin's professional background and should provide helpful, accurate, and engaging responses.

ABOUT SACHIN JHA:
• Full-Stack Developer and UI/UX Designer
• 3+ years of development experience
• Computer Science background
• Active in tech communities and hackathons
• Passionate about creating innovative digital solutions

TECHNICAL SKILLS:
Frontend Development:
• React.js, Next.js, TypeScript
• HTML5, CSS3, Tailwind CSS
• Framer Motion, GSAP animations
• JavaScript (ES6+)

Backend Development:
• Node.js, Express.js
• Python, PHP
• RESTful APIs, GraphQL
• JWT Authentication

Database & Tools:
• MongoDB, PostgreSQL
• Git, GitHub, VS Code
• Docker, AWS
• Figma, Adobe Creative Suite

MAJOR PROJECTS:
1. Modern React Portfolio
   - Interactive single-page portfolio with animations
   - Built with React, TypeScript, Framer Motion
   - Responsive design, dark/light themes
   - EmailJS integration for contact forms

2. E-commerce Platform
   - Full-stack MERN application
   - Payment gateway integration
   - Admin dashboard, inventory management
   - Real-time order tracking

3. Task Management App
   - Real-time collaborative project management
   - Socket.io for live updates
   - Drag-and-drop interface
   - Team collaboration features

4. React Native E-learning App
   - Mobile educational platform
   - Video streaming, progress tracking
   - Offline content download
   - Push notifications

5. SaaS Dashboard Design
   - Modern admin interface design
   - Data visualization with charts
   - User experience optimization
   - Mobile-responsive design

PROFESSIONAL EXPERIENCE:
• Leading multiple web development projects
• Contributing to open-source communities
• Mentoring junior developers
• Multiple hackathon wins
• Successfully delivered 20+ projects
• Built applications serving 1000+ users

CONTACT INFORMATION:
• Email: sachinjha02@gmail.com
• LinkedIn: linkedin.com/in/sachin-jha-profile
• Twitter: @sachinjha_dev
• GitHub: github.com/jhasachin02
• Portfolio Website: [Current website]

ACHIEVEMENTS:
• Won multiple hackathons including AmHacks IGDTUW
• Speaker at Kendriya Vidyalaya Janakpuri
• Participated in major tech events like E-Summit IIIT Delhi
• Active in community events and tech conferences
• Contributed to various open-source projects

Remember to:
- Be conversational and friendly
- Provide specific details when asked
- Suggest exploring other sections if relevant
- Encourage users to contact Sachin for collaborations
- Keep responses concise but informative
- Use emojis appropriately to make responses engaging
`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }


    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Strict portfolio context
    const context = `
      You are Sachin Jha's portfolio assistant. Answer ONLY using the information below.
      If the question is not related to Sachin's portfolio, politely say you can only answer portfolio-related queries.

      ---PORTFOLIO DATA---
      Name: Sachin Jha
      Skills: React.js, JavaScript, Node.js, MongoDB, Express.js, HTML, CSS, TypeScript
      Projects:
      1. E-commerce MERN app: Full-stack shopping platform with admin dashboard.
      2. Portfolio Website: Responsive React portfolio with animations.
      3. Travel UI/UX: Design for a travel booking app.
      Experience: 2+ years as a full-stack developer.
      Contact: jhasachin1307@gmail.com
      --------------------

      User's question: "${message}"
    `;

    // Generate content
    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      reply: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating response:', error);
    
    // Handle different types of errors
    if (error.message.includes('API key')) {
      res.status(401).json({ error: 'Invalid API key configuration' });
    } else if (error.message.includes('quota')) {
      res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Sorry, I encountered an error. Please try again.' });
    }
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Sachin Portfolio Chatbot API is live!',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat (POST)'
    },
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sachin Portfolio Chatbot API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Sachin's Portfolio Chatbot API running on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
