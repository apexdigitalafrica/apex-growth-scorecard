// app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  BarChart3, 
  Award, 
  Star,
  Zap,
  Target,
  Users,
  Shield,
  Rocket,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Stats counter animation
  const [submissions, setSubmissions] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [companies, setCompanies] = useState(0);

  useEffect(() => {
    const animateCounters = () => {
      let subCount = 0;
      let scoreCount = 0;
      let compCount = 0;

      const subInterval = setInterval(() => {
        subCount += 23;
        if (subCount >= 127) {
          subCount = 127;
          clearInterval(subInterval);
        }
        setSubmissions(subCount);
      }, 30);

      const scoreInterval = setInterval(() => {
        scoreCount += 1.2;
        if (scoreCount >= 68) {
          scoreCount = 68;
          clearInterval(scoreInterval);
        }
        setAverageScore(Math.round(scoreCount));
      }, 40);

      const compInterval = setInterval(() => {
        compCount += 4;
        if (compCount >= 89) {
          compCount = 89;
          clearInterval(compInterval);
        }
        setCompanies(compCount);
      }, 35);
    };

    animateCounters();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png" 
                  alt="Apex Digital Africa" 
                  className="h-10 w-auto transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm group-hover:blur-md transition-all"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Apex Digital
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-blue-200/80 hover:text-white font-medium flex items-center space-x-2 transition-all hover:scale-105 group"
              >
                <BarChart3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>Analytics Dashboard</span>
              </Link>
              
              <Link
                href="/scorecard"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-400 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center space-x-2 group"
              >
                <Zap className="w-4 h-4 group-hover:animate-pulse" />
                <span>Take Assessment</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 px-6 py-3 rounded-2xl text-blue-200 mb-8 backdrop-blur-sm hover:scale-105 transition-transform group cursor-pointer">
              <Sparkles className="w-4 h-4 group-hover:animate-spin" />
              <span className="font-semibold">Trusted by {companies}+ African Businesses</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            
            {/* Main Headline */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                Unlock Your
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  Digital Growth
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-200/80 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                Discover your true potential with our <span className="font-semibold text-white">AI-powered growth assessment</span>. 
                Get actionable insights, benchmark against industry leaders, and receive a professional certification that sets you apart.
              </p>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-2xl mx-auto">
              {[
                { value: submissions, label: 'Assessments Completed', icon: Users },
                { value: averageScore, label: 'Average Score', suffix: '/100', icon: TrendingUp },
                { value: companies, label: 'Companies Trust Us', icon: Shield }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 group"
                >
                  <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-blue-200/70 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Link
                href="/scorecard"
                className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center space-x-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine"></div>
                <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                <span className="relative">Start Free Assessment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/dashboard"
                className="group bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-5 rounded-2xl font-semibold text-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
              >
                <BarChart3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>View Live Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 bg-gradient-to-b from-transparent to-slate-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Choose Our <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Scorecard?</span>
            </h2>
            <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">
              We&apos;ve redefined digital growth assessment with cutting-edge technology and unparalleled insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "5-Minute AI Assessment",
                description: "Get comprehensive insights in just minutes with our intelligent question engine",
                color: "from-cyan-500 to-blue-500"
              },
              {
                icon: Target,
                title: "8 Key Dimensions",
                description: "Deep analysis across digital foundation, content strategy, lead generation & more",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Award,
                title: "Verified Certificate",
                description: "Receive a professional, shareable certificate that boosts your credibility",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: BarChart3,
                title: "Live Analytics Dashboard",
                description: "Track your progress and benchmark against industry standards in real-time",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Users,
                title: "Industry Benchmarking",
                description: "See how you stack up against competitors and industry leaders",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Rocket,
                title: "Actionable Roadmap",
                description: "Get personalized recommendations to accelerate your growth journey",
                color: "from-red-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-blue-200/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-3xl p-12 backdrop-blur-md">
            <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Growth?
            </h2>
            <p className="text-xl text-blue-200/80 mb-8 max-w-2xl mx-auto">
              Join {companies}+ forward-thinking companies that have already unlocked their digital potential.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/scorecard"
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center space-x-3"
              >
                <Star className="w-5 h-5 group-hover:animate-pulse" />
                <span>Start Your Journey Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="text-blue-200/60 font-medium">
                🚀 No credit card required • 100% Free
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img 
                src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png" 
                alt="Apex Digital Africa" 
                className="h-8 w-auto"
              />
              <span className="text-blue-200/80">© 2025 Apex Digital Africa. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-blue-200/60">
              <Link href="/scorecard" className="hover:text-white transition-colors">Take Assessment</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Analytics</Link>
              <a href="https://apexdigitalafrica.com" className="hover:text-white transition-colors">Main Website</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
