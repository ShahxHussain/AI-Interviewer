'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Brain,
  Camera,
  Mic,
  BarChart3,
  Users,
  Zap,
  Shield,
  Globe,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles,
  Target,
  Clock,
  Award,
  MessageSquare,
  Video,
  Headphones,
  Eye,
  TrendingUp,
  Code,
  Database,
  Cloud,
  Smartphone,
  Laptop,
  Monitor,
  Building,
  FileText,
  User
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAuthNavigation = () => {
    router.push('/auth');
  };

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-gold-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center luxury-glow">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold luxury-text-gold font-playfair">AI Interviewer</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleAuthNavigation}
                variant="outline"
                className="luxury-button-outline"
              >
                Login
              </Button>
              <Button
                onClick={handleAuthNavigation}
                className="luxury-button-primary"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 luxury-badge-gold">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Kiro AI
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold luxury-text-gold font-playfair mb-6 leading-tight">
              The Future of
              <span className="block bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent">
                AI-Powered Interviews
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl luxury-text-secondary mb-8 max-w-4xl mx-auto leading-relaxed">
              Revolutionize your hiring process with our advanced AI interviewer that conducts 
              intelligent, fair, and comprehensive interviews with real-time analysis and feedback.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="luxury-button-primary text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                size="lg"
                className="luxury-button-outline text-lg px-8 py-4"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-dark-800/50 to-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Interviews Conducted" },
              { number: "95%", label: "Accuracy Rate" },
              { number: "50+", label: "Companies Trust Us" },
              { number: "24/7", label: "Available" }
            ].map((stat, index) => (
              <div key={index} className="text-center luxury-fade-in">
                <div className="text-3xl md:text-4xl font-bold luxury-text-gold mb-2">
                  {stat.number}
                </div>
                <div className="luxury-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold luxury-text-gold font-playfair mb-6">
              Revolutionary Features
            </h2>
            <p className="text-xl luxury-text-secondary max-w-3xl mx-auto">
              Experience the most advanced AI-powered interview platform with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Resume Analysis & Parsing",
                description: "Advanced AI extracts key information from resumes and generates personalized questions",
                features: ["Smart resume parsing", "Skills extraction", "Personalized questions", "Career insights"]
              },
              {
                icon: Brain,
                title: "AI Question Generation",
                description: "Intelligent, context-aware questions generated using Llama 3.3-70B model",
                features: ["Resume-based questions", "Industry-specific topics", "Difficulty adaptation"]
              },
              {
                icon: Camera,
                title: "Real-time Facial Analysis",
                description: "Advanced emotion detection and eye contact tracking using Face-api.js",
                features: ["Emotion recognition", "Eye contact percentage", "Head pose analysis"]
              },
              {
                icon: Mic,
                title: "Voice Synthesis & Analysis",
                description: "High-quality voice synthesis with Murf AI and speech analysis",
                features: ["Natural voice generation", "Speech recognition", "Audio quality metrics"]
              },
              {
                icon: BarChart3,
                title: "Live Performance Metrics",
                description: "Real-time analytics and engagement scoring during interviews",
                features: ["Confidence tracking", "Engagement scoring", "Performance insights"]
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                description: "Enterprise-grade security with GDPR compliance and data protection",
                features: ["End-to-end encryption", "Data privacy", "Secure storage"]
              },
              {
                icon: Globe,
                title: "Multi-platform Support",
                description: "Access from any device with responsive design and cross-platform compatibility",
                features: ["Web application", "Mobile responsive", "Cross-browser support"]
              }
            ].map((feature, index) => (
              <Card key={index} className="luxury-card group hover:scale-105 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mb-6 luxury-glow group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl font-bold luxury-text-gold mb-4 font-playfair">
                    {feature.title}
                  </h3>
                  <p className="luxury-text-secondary mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center luxury-text-secondary">
                        <CheckCircle className="w-4 h-4 text-gold-400 mr-3 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Analysis Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold luxury-text-gold font-playfair mb-6">
              AI-Powered Resume Analysis
            </h2>
            <p className="text-xl luxury-text-secondary max-w-3xl mx-auto">
              Intelligent resume parsing and personalized interview generation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center luxury-glow flex-shrink-0">
                  <FileText className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold luxury-text-gold mb-2 font-playfair">Smart Resume Parsing</h3>
                  <p className="luxury-text-secondary">
                    Advanced AI extracts key information from your resume including skills, experience, education, and achievements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center luxury-glow flex-shrink-0">
                  <Target className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold luxury-text-gold mb-2 font-playfair">Personalized Questions</h3>
                  <p className="luxury-text-secondary">
                    Generate interview questions tailored to your specific background, experience, and career goals.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center luxury-glow flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold luxury-text-gold mb-2 font-playfair">Skills Assessment</h3>
                  <p className="luxury-text-secondary">
                    AI analyzes your skills and creates targeted questions to evaluate your expertise in specific areas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center luxury-glow flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold luxury-text-gold mb-2 font-playfair">Career Path Analysis</h3>
                  <p className="luxury-text-secondary">
                    Get insights into your career trajectory and suggestions for professional development.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative">
              <Card className="luxury-card p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center luxury-glow">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold luxury-text-gold">Resume Analysis Results</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="luxury-text-secondary">Technical Skills</span>
                      <Badge className="luxury-badge-gold">95% Match</Badge>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gold-400 to-gold-600 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="luxury-text-secondary">Experience Level</span>
                      <Badge className="luxury-badge-gold">Senior</Badge>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gold-400 to-gold-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="luxury-text-secondary">Education Match</span>
                      <Badge className="luxury-badge-gold">100%</Badge>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gold-400 to-gold-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gold-400/20">
                    <h5 className="text-sm font-semibold luxury-text-gold mb-2">Generated Questions</h5>
                    <ul className="space-y-1 text-xs luxury-text-secondary">
                      <li>• "Tell me about your experience with React and TypeScript"</li>
                      <li>• "How do you approach system architecture design?"</li>
                      <li>• "Describe a challenging project you led"</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-gradient-to-r from-dark-800/50 to-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold luxury-text-gold font-playfair mb-6">
              Powered by Cutting-Edge Technology
            </h2>
            <p className="text-xl luxury-text-secondary max-w-3xl mx-auto">
              Built with the latest AI models and modern web technologies
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "Next.js 15", icon: Code, color: "text-white" },
              { name: "React 19", icon: Zap, color: "text-white" },
              { name: "TypeScript", icon: Code, color: "text-white" },
              { name: "MongoDB", icon: Database, color: "text-white" },
              { name: "Tailwind CSS", icon: Sparkles, color: "text-white" },
              { name: "Vercel", icon: Cloud, color: "text-white" },
              { name: "Llama 3.3", icon: Brain, color: "text-white" },
              { name: "Murf AI", icon: Headphones, color: "text-white" },
              { name: "Face-api.js", icon: Eye, color: "text-white" },
              { name: "TensorFlow", icon: Brain, color: "text-white" },
              { name: "JWT Auth", icon: Shield, color: "text-white" },
              { name: "WebRTC", icon: Video, color: "text-white" }
            ].map((tech, index) => (
              <div key={index} className="text-center luxury-fade-in">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gold-400/50 to-gold-600/50 flex items-center justify-center mb-4 mx-auto luxury-glow border border-gold-400/40">
                  {tech.icon && <tech.icon className={`w-10 h-10 ${tech.color} drop-shadow-lg`} />}
                </div>
                <div className="luxury-text-secondary font-medium text-sm">
                  {tech.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gradient-to-r from-dark-800/50 to-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold luxury-text-gold font-playfair mb-6">
              Built for Everyone
            </h2>
            <p className="text-xl luxury-text-secondary max-w-3xl mx-auto">
              Comprehensive solutions for both job seekers and hiring professionals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Candidates */}
            <Card className="luxury-card group hover:scale-105 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mr-4 luxury-glow">
                    <Users className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold luxury-text-gold font-playfair">For Candidates</h3>
                    <p className="luxury-text-secondary">Job seekers and career builders</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold luxury-text-gold mb-1">Practice Interviews</h4>
                      <p className="luxury-text-secondary text-sm">Mock interviews with AI to improve your skills</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold luxury-text-gold mb-1">Real-time Feedback</h4>
                      <p className="luxury-text-secondary text-sm">Instant analysis of your performance and areas for improvement</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold luxury-text-gold mb-1">Resume Analysis</h4>
                      <p className="luxury-text-secondary text-sm">AI-powered resume parsing and personalized questions</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold luxury-text-gold mb-1">Performance Tracking</h4>
                      <p className="luxury-text-secondary text-sm">Track your progress over time with detailed analytics</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recruiters */}
            <Card className="luxury-card group hover:scale-105 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mr-4 luxury-glow">
                    <Building className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold luxury-text-gold font-playfair">For Recruiters</h3>
                    <p className="luxury-text-secondary">Hiring managers and HR professionals</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold luxury-text-gold mb-1">Job Posting Management</h4>
                      <p className="luxury-text-secondary text-sm">Create and manage job postings with AI-optimized descriptions</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold luxury-text-gold mb-1">Candidate Screening</h4>
                      <p className="luxury-text-secondary text-sm">Automated initial screening with AI-powered assessments</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold luxury-text-gold mb-1">Interview Analytics</h4>
                      <p className="luxury-text-secondary text-sm">Comprehensive reports on candidate performance and engagement</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold luxury-text-gold mb-1">Team Collaboration</h4>
                      <p className="luxury-text-secondary text-sm">Share insights and collaborate with your hiring team</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold luxury-text-gold font-playfair mb-6">
              Step-by-Step Process
            </h2>
            <p className="text-xl luxury-text-secondary max-w-3xl mx-auto">
              Detailed workflows for both candidates and recruiters
            </p>
          </div>

          {/* Candidate Process */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold luxury-text-gold font-playfair mb-4">For Candidates</h3>
              <p className="text-lg luxury-text-secondary">Your journey from practice to success</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Sign Up & Profile",
                  description: "Create your account, upload your resume, and set up your professional profile",
                  details: ["Account creation", "Resume upload", "Profile completion", "Skills assessment"],
                  icon: User
                },
                {
                  step: "02",
                  title: "Choose Interview Type",
                  description: "Select from various interview formats and difficulty levels",
                  details: ["Technical interviews", "Behavioral questions", "Industry-specific", "Custom difficulty"],
                  icon: Target
                },
                {
                  step: "03",
                  title: "AI-Powered Interview",
                  description: "Conduct the interview with real-time AI analysis and feedback",
                  details: ["Live video interview", "AI question generation", "Real-time analysis", "Performance tracking"],
                  icon: Video
                },
                {
                  step: "04",
                  title: "Review & Improve",
                  description: "Analyze your performance and get personalized improvement suggestions",
                  details: ["Detailed feedback", "Performance metrics", "Improvement tips", "Progress tracking"],
                  icon: TrendingUp
                }
              ].map((step, index) => (
                <Card key={index} className="luxury-card group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto luxury-glow">
                        <step.icon className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark-900 border-2 border-gold-400 flex items-center justify-center">
                        <span className="text-gold-400 font-bold text-xs">{step.step}</span>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold luxury-text-gold mb-3 font-playfair text-center">
                      {step.title}
                    </h4>
                    <p className="luxury-text-secondary text-sm mb-4 text-center leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center luxury-text-secondary text-xs">
                          <div className="w-1 h-1 bg-gold-400 rounded-full mr-2 flex-shrink-0"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recruiter Process */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold luxury-text-gold font-playfair mb-4">For Recruiters</h3>
              <p className="text-lg luxury-text-secondary">Streamline your hiring process with AI</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Company Setup",
                  description: "Set up your company profile and configure hiring preferences",
                  details: ["Company profile", "Job requirements", "Team setup", "Hiring criteria"],
                  icon: Building
                },
                {
                  step: "02",
                  title: "Create Job Postings",
                  description: "Post job openings with AI-optimized descriptions and requirements",
                  details: ["Job description", "Requirements", "AI optimization", "Publishing"],
                  icon: FileText
                },
                {
                  step: "03",
                  title: "Candidate Screening",
                  description: "Review applications and conduct AI-powered initial screenings",
                  details: ["Application review", "AI screening", "Candidate ranking", "Shortlisting"],
                  icon: Users
                },
                {
                  step: "04",
                  title: "Interview & Analysis",
                  description: "Conduct interviews and analyze candidate performance with detailed reports",
                  details: ["Interview scheduling", "Live monitoring", "Performance analysis", "Final reports"],
                  icon: BarChart3
                }
              ].map((step, index) => (
                <Card key={index} className="luxury-card group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto luxury-glow">
                        <step.icon className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark-900 border-2 border-gold-400 flex items-center justify-center">
                        <span className="text-gold-400 font-bold text-xs">{step.step}</span>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold luxury-text-gold mb-3 font-playfair text-center">
                      {step.title}
                    </h4>
                    <p className="luxury-text-secondary text-sm mb-4 text-center leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center luxury-text-secondary text-xs">
                          <div className="w-1 h-1 bg-gold-400 rounded-full mr-2 flex-shrink-0"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gold-400/10 via-gold-500/10 to-gold-400/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold luxury-text-gold font-playfair mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl luxury-text-secondary mb-8 leading-relaxed">
            Join thousands of companies already using AI Interviewer to find the best talent
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="luxury-button-primary text-lg px-8 py-4"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
            <Button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              size="lg"
              className="luxury-button-outline text-lg px-8 py-4"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-gold-400/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center luxury-glow">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold luxury-text-gold font-playfair">AI Interviewer</span>
              </div>
              <p className="luxury-text-secondary mb-4">
                The future of intelligent hiring with AI-powered interviews and real-time analysis.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center luxury-glow">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center luxury-glow">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center luxury-glow">
                  <Laptop className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold luxury-text-gold mb-4">Features</h3>
              <ul className="space-y-2">
                {["AI Question Generation", "Real-time Analysis", "Voice Synthesis", "Facial Recognition", "Performance Metrics", "Secure Platform"].map((item, index) => (
                  <li key={index} className="luxury-text-secondary hover:luxury-text-gold transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold luxury-text-gold mb-4">Technology</h3>
              <ul className="space-y-2">
                {["Next.js 15", "React 19", "TypeScript", "MongoDB", "Llama 3.3", "Murf AI"].map((item, index) => (
                  <li key={index} className="luxury-text-secondary hover:luxury-text-gold transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gold-400/20 mt-8 pt-8 text-center">
            <p className="luxury-text-secondary">
              Developed by <span className="luxury-text-gold font-semibold">Syed Shah Hussain</span> - Full Stack AI Engineer
            </p>
            <p className="luxury-text-secondary mt-2">
              Powered by <span className="luxury-text-gold font-semibold">Kiro</span> - The Future of AI Development
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
