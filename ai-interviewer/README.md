# 🚀 AI Interviewer Platform

A revolutionary AI-powered interview practice and recruitment platform built with Next.js 15, React 19, and multiple AI services. This platform provides realistic, personalized interview experiences with real-time analysis, voice synthesis, and comprehensive feedback.

## ✨ Features

### 👤 For Candidates
- **AI-Powered Interviews**: Multiple interviewer types (Tech Lead, HR Manager, Product Manager, Recruiter)
- **Real-Time Analysis**: Live facial expression analysis, eye contact tracking, and confidence scoring
- **Personalized Questions**: Resume-based question generation using AI
- **Comprehensive Feedback**: Multi-dimensional performance assessment with actionable insights
- **Interview History**: Complete session tracking and progress analytics

### 🏢 For Recruiters
- **Job Management**: Create and manage job postings with custom interview flows
- **Candidate Assessment**: Review interview sessions with detailed analytics
- **Performance Analytics**: Track recruitment metrics and candidate quality
- **Bulk Operations**: Manage multiple jobs and candidates efficiently

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, MongoDB, JWT Authentication
- **AI Services**: Together.ai, Murf AI, Face-api.js, TensorFlow.js
- **Development**: Built with Kiro's agentic IDE capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- API keys for AI services:
  - [Together.ai API key](https://api.together.xyz/)
  - [Murf AI API key](https://murf.ai/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-interviewer
   
   # AI Services
   TOGETHER_AI_API_KEY=your_together_ai_key
   MURF_AI_API_KEY=your_murf_ai_key
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key_here
   NEXTAUTH_SECRET=your_nextauth_secret_here
   
   # Next.js
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest and most optimized platform for Next.js applications.

#### Steps:
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables in Vercel dashboard
   - Click "Deploy"

3. **Environment Variables in Vercel**
   ```
   MONGODB_URI=your_mongodb_connection_string
   TOGETHER_AI_API_KEY=your_together_ai_key
   MURF_AI_API_KEY=your_murf_ai_key
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

#### Vercel Advantages:
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Automatic scaling
- ✅ Free tier available

### Option 2: Netlify

Great alternative with excellent performance.

#### Steps:
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "New site from Git"
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables
   - Click "Deploy site"

#### Netlify Advantages:
- ✅ Easy GitHub integration
- ✅ Form handling
- ✅ Edge functions
- ✅ Free tier available

### Option 3: Railway

Perfect for full-stack applications with database needs.

#### Steps:
1. **Connect GitHub**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure Environment**
   - Add MongoDB service
   - Set environment variables
   - Deploy automatically

#### Railway Advantages:
- ✅ Built-in database hosting
- ✅ Automatic deployments
- ✅ Simple pricing
- ✅ Great for full-stack apps

### Option 4: Render

Excellent for production applications with good free tier.

#### Steps:
1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Sign in with GitHub
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Service**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables
   - Deploy

#### Render Advantages:
- ✅ Free tier with good limits
- ✅ Automatic SSL
- ✅ Easy database integration
- ✅ Good performance

### Option 5: DigitalOcean App Platform

Professional hosting with great performance.

#### Steps:
1. **Create App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect GitHub repository

2. **Configure App**
   - Select Node.js
   - Set build command: `npm run build`
   - Set run command: `npm start`
   - Add environment variables
   - Deploy

#### DigitalOcean Advantages:
- ✅ Professional hosting
- ✅ Great performance
- ✅ Easy scaling
- ✅ Good documentation

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Account**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose free tier (M0)
   - Select region closest to your users
   - Create cluster

3. **Configure Access**
   - Create database user
   - Set network access (0.0.0.0/0 for all IPs)
   - Get connection string

4. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ai-interviewer?retryWrites=true&w=majority
   ```

### Local MongoDB (Development)

1. **Install MongoDB**
   ```bash
   # macOS
   brew install mongodb-community
   
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # Windows
   # Run MongoDB as service
   ```

3. **Connection String**
   ```
   mongodb://localhost:27017/ai-interviewer
   ```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-interviewer

# AI Services
TOGETHER_AI_API_KEY=your_together_ai_key_here
MURF_AI_API_KEY=your_murf_ai_key_here

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here

# Next.js
NEXTAUTH_URL=http://localhost:3000

# Optional: File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

## 📱 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking

# Data Management
npm run cleanup      # Run data cleanup
npm run cleanup:dry-run  # Test cleanup without changes
```

## 🏗️ Project Structure

```
ai-interviewer/
├── .kiro/                    # Kiro's intelligent project brain
│   ├── specs/               # Feature specifications
│   ├── hooks/               # Automated workflows
│   └── steering/            # AI guidance rules
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard pages
│   │   └── interview/      # Interview pages
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── interview/     # Interview components
│   │   ├── recruiter/     # Recruiter components
│   │   └── ui/            # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── services/      # AI service integrations
│   │   └── models/        # Database models
│   └── types/             # TypeScript type definitions
├── public/                 # Static assets
├── uploads/               # File uploads
└── docs/                  # Documentation
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Separate interfaces for candidates and recruiters
- **Input Validation**: Comprehensive data sanitization
- **File Upload Security**: Type and size validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## 📊 Performance Features

- **Next.js 15**: Latest React framework with App Router
- **Code Splitting**: Automatic bundle optimization
- **Image Optimization**: Built-in Next.js image optimization
- **Lazy Loading**: Component and route-based lazy loading
- **Caching Strategies**: Browser and CDN caching
- **Real-time Processing**: Optimized AI service integration

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Monitoring & Analytics

- **Real-time Metrics**: Live performance tracking
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: Built-in performance metrics
- **User Analytics**: Usage and engagement tracking

## 🚀 Production Checklist

Before deploying to production:

- [ ] Set up MongoDB Atlas or production database
- [ ] Configure all environment variables
- [ ] Set up AI service accounts (Together.ai, Murf AI)
- [ ] Configure file upload limits
- [ ] Set up monitoring and logging
- [ ] Test all features thoroughly
- [ ] Configure SSL certificates
- [ ] Set up backup strategies
- [ ] Configure error tracking
- [ ] Test performance under load

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Kiro**: For enabling rapid, intelligent development
- **Together.ai**: For AI question generation
- **Murf AI**: For voice synthesis services
- **Face-api.js**: For facial analysis capabilities
- **Next.js Team**: For the amazing React framework
- **Radix UI**: For accessible component primitives

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ai-interviewer/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Video recording and playback
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Third-party integrations
- [ ] Real-time collaboration features

---

## 🎯 Built with Kiro

This project was built using **Kiro's agentic IDE capabilities**, demonstrating the future of software development:

- **"Click Start" Development**: Features built by clicking "Start" above tasks
- **AI-Powered Generation**: Natural language becomes production code
- **Intelligent Automation**: Complex workflows orchestrated seamlessly
- **Zero Hardcoding**: Dynamic, adaptive, intelligent solutions

*"From idea to production—no hardcoding, maximum intelligence, powered by Kiro."*

---

*Built with ❤️ and powered by [Kiro](https://kiro.dev/docs/getting-started/)*