'use client';
import { Calendar, RefreshCw } from 'lucide-react';
import { calculateLeadQuality } from '@/lib/lead-scoring';
//import AIGrowthChatbot from '@/components/AIGrowthChatbot';
import Image from 'next/image';
import dynamic from 'next/dynamic';  
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type ChangeEvent,
} from 'react';
import type { ErrorInfo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Target,
  Mail,
  Loader,
  Rocket,
  Sparkles,
  Clock,
  Play,
  Award,
  BarChart3,
} from 'lucide-react';

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}
const AIGrowthChatbot = dynamic(() => import('@/components/AIGrowthChatbot'), {
  loading: () => <div className="text-blue-600">Loading AI...</div>,
  ssr: false
});
/* --------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */
type AnswerValue = number | number[];
type AnswerMap = Record<string, AnswerValue>;

interface DimensionScore {
  name: string;
  percentage: number;
  weight: number;
  color: string;
  weightedScore: number;
}

interface DimensionScoreWithRecommendations extends DimensionScore {
  recommendations: string[];
}

interface Question {
  id: string;
  text: string;
  options: { text: string; points: number }[];
  multiSelect: boolean;
  dimensionIndex: number;
  dimensionName: string;
  dimensionColor: string;
  weight: number;
  helpText?: string;
  skipLogic?: (answers: AnswerMap) => boolean;
}

/* --------------------------------------------------------------------------
 * Utility: Debounce
 * -------------------------------------------------------------------------- */
const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return (...args: T) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/* --------------------------------------------------------------------------
 * PDF Generation Utility
 * -------------------------------------------------------------------------- */
const generatePDF = async (company: string, totalScore: number, stage: string, dimensionScores: DimensionScore[]) => {
  try {
    // Method 1: Server-side PDF generation (Recommended)
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company,
        totalScore,
        stage,
        dimensionScores,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Apex-Growth-Scorecard-${company}-${totalScore}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    }
    
    // Fallback to client-side generation
    return await generateClientSidePDF(company, totalScore, stage, dimensionScores);
  } catch (error) {
    console.error('PDF generation failed:', error);
    // Final fallback - print
    window.print();
    return false;
  }
};

const generateClientSidePDF = async (company: string, totalScore: number, stage: string, dimensionScores: DimensionScore[]) => {
  try {
    // Dynamic import to reduce bundle size
    const { jsPDF } = await import('jspdf');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add branding
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('Apex Digital Africa', 20, 20);
    pdf.setFontSize(16);
    pdf.text('Growth Scorecard Report', 20, 30);

    // Company and score
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.text(`Company: ${company}`, 20, 60);
    pdf.text(`Overall Score: ${totalScore}/100`, 20, 70);
    pdf.text(`Growth Stage: ${stage}`, 20, 80);

    // Dimension scores
    pdf.setFontSize(14);
    pdf.text('Dimension Breakdown:', 20, 100);
    
    let yPosition = 110;
    dimensionScores.forEach((dim, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${dim.name}: ${dim.percentage}%`, 20, yPosition);
      
      // Simple progress bar
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(80, yPosition - 2, 100, 4);
      pdf.setFillColor(59, 130, 246);
      pdf.rect(80, yPosition - 2, dim.percentage, 4, 'F');
      
      yPosition += 15;
    });

    // Recommendations
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Key Recommendations', 20, 30);
    
    yPosition = 50;
    const topPriorities = [...dimensionScores].sort((a, b) => a.percentage - b.percentage).slice(0, 3);
    
    topPriorities.forEach((priority, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${priority.name} (${priority.percentage}%)`, 20, yPosition);
      
      const recommendations = getPriorityRecommendations(priority.percentage);
      recommendations.forEach((rec, i) => {
        yPosition += 6;
        pdf.setFontSize(10);
        pdf.text(`   • ${rec}`, 25, yPosition);
      });
      
      yPosition += 15;
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, 20, 290);
    }

    pdf.save(`Apex-Growth-Scorecard-${company}-${totalScore}.pdf`);
    return true;
  } catch (error) {
    console.error('Client-side PDF generation failed:', error);
    return false;
  }
};

const getPriorityRecommendations = (percentage: number): string[] => {
  if (percentage < 40) {
    return [
      'Allocate immediate resources to address critical gaps',
      'Conduct comprehensive audit and assessment',
      'Implement foundational improvements first'
    ];
  } else if (percentage < 70) {
    return [
      'Optimize existing processes and strategies',
      'Test and scale successful initiatives',
      'Benchmark against industry standards'
    ];
  } else {
    return [
      'Focus on advanced optimization techniques',
      'Explore automation and scaling opportunities',
      'Share best practices across organization'
    ];
  }
};

/* --------------------------------------------------------------------------
 * INTRO SCREEN COMPONENT
 * -------------------------------------------------------------------------- */
const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 px-6 py-3 rounded-2xl text-cyan-200 mb-8 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">AI-Powered Growth Assessment</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your <br/>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Digital Growth Score
            </span>
          </h1>

          <p className="text-xl text-blue-200/80 max-w-3xl mx-auto leading-relaxed">
            Get a comprehensive analysis of your B2B digital marketing performance in just{' '}
            <span className="font-bold text-white">5 minutes</span>. Receive actionable insights, 
            benchmark data, and a professional certificate.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Clock,
              title: '5 Minutes',
              desc: 'Quick assessment',
              color: 'from-cyan-500 to-blue-500',
            },
            {
              icon: BarChart3,
              title: '8 Dimensions',
              desc: 'Comprehensive analysis',
              color: 'from-blue-500 to-indigo-500',
            },
            {
              icon: Award,
              title: 'Certificate',
              desc: 'Verified achievement',
              color: 'from-purple-500 to-pink-500',
            },
            {
              icon: Sparkles,
              title: 'AI Consultant',
              desc: 'Personal guidance',
              color: 'from-pink-500 to-red-500',
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 hover:scale-105 transition-all duration-300 group"
            >
              <div className={`bg-gradient-to-r ${benefit.color} p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{benefit.title}</div>
              <div className="text-blue-200/70 text-sm">{benefit.desc}</div>
            </div>
          ))}
        </div>

        {/* What You'll Get */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 mb-12">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">What You'll Receive</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              '📊 Overall Growth Score (0-100)',
              '🎯 8-Dimension Performance Breakdown',
              '📈 Industry Benchmark Comparison',
              '💡 Personalized Recommendations',
              '🏆 Professional Digital Certificate',
              '🤖 Access to AI Growth Consultant',
              '📧 Detailed Email Report',
              '🔒 100% Confidential & Secure',
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span className="text-blue-100 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsAnimating(true);
              setTimeout(() => onStart(), 300);
            }}
            className={`group relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-16 py-6 rounded-2xl font-bold text-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center space-x-4 mx-auto overflow-hidden ${
              isAnimating ? 'scale-95 opacity-50' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine"></div>
            <Play className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <span className="relative">Start Free Assessment</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-blue-300/70 text-sm mt-6 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> Takes 5 minutes
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> No credit card
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" /> 100% Free
            </span>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-blue-300/60 text-sm mb-6">Trusted by 127+ African Businesses</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-24 h-12 bg-white/5 rounded-lg flex items-center justify-center text-white/40 text-xs font-semibold"
              >
                Company {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
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
};

/* --------------------------------------------------------------------------
 * Static Config
 * -------------------------------------------------------------------------- */
const SCORECARD_STORAGE_KEY = 'apexScorecardProgress';

const dimensions = [
  {
    name: 'Digital Foundation',
    weight: 0.15,
    color: 'bg-blue-500',
    questions: [
      {
        id: 'q1',
        text: "What is your website's average load time on mobile devices?",
        options: [
          { text: 'Under 2 seconds', points: 25 },
          { text: '2-3 seconds', points: 18 },
          { text: '3-5 seconds', points: 10 },
          { text: "Over 5 seconds or don't know", points: 0 },
        ],
      },
      {
        id: 'q2',
        text: 'How would you rate your mobile user experience?',
        options: [
          { text: 'Fully responsive with mobile-specific features', points: 25 },
          { text: 'Responsive design, works well on mobile', points: 18 },
          { text: 'Somewhat responsive but has usability issues', points: 10 },
          { text: 'Not optimized for mobile', points: 0 },
        ],
      },
      {
        id: 'q3',
        text: 'What analytics tools do you currently use?',
        options: [
          {
            text: 'Google Analytics 4 + conversion tracking + CRM integration',
            points: 25,
          },
          { text: 'Google Analytics with goals/events set up', points: 18 },
          { text: 'Basic Google Analytics installed', points: 10 },
          { text: 'No analytics or rarely check them', points: 0 },
        ],
      },
      {
        id: 'q4',
        text: 'How well is your website optimized for search engines?',
        options: [
          {
            text: 'Comprehensive SEO (sitemap, schema, optimized meta tags)',
            points: 25,
          },
          {
            text: 'Basic SEO (meta descriptions, alt tags, decent structure)',
            points: 18,
          },
          { text: 'Minimal SEO (some keywords in content)', points: 10 },
          { text: 'No SEO optimization', points: 0 },
        ],
      },
    ],
  },
  {
    name: 'Brand Positioning',
    weight: 0.1,
    color: 'bg-purple-500',
    questions: [
      {
        id: 'q5',
        text: 'Can someone understand what you do within 5 seconds of visiting your website?',
        options: [
          { text: 'Yes, crystal clear with unique differentiation', points: 25 },
          { text: 'Yes, but could be clearer or more differentiated', points: 18 },
          { text: 'Somewhat clear but generic', points: 10 },
          { text: 'Confusing or unclear', points: 0 },
        ],
      },
      {
        id: 'q6',
        text: 'What makes you different from competitors?',
        options: [
          { text: 'Clear, defendable unique value proposition', points: 25 },
          {
            text: 'Some differentiation but not strongly communicated',
            points: 18,
          },
          {
            text: 'Similar to competitors with minor differences',
            points: 10,
          },
          { text: 'No clear differentiation', points: 0 },
        ],
      },
      {
        id: 'q7',
        text: 'Which trust-building elements are present on your website?',
        options: [
          {
            text: '4+ elements (logos, testimonials, case studies, certifications)',
            points: 25,
          },
          { text: '2-3 trust elements', points: 18 },
          { text: '1 trust element', points: 10 },
          { text: 'No trust signals', points: 0 },
        ],
      },
    ],
  },
  {
    name: 'Content Strategy',
    weight: 0.15,
    color: 'bg-green-500',
    questions: [
      {
        id: 'q8',
        text: 'How often do you publish valuable content?',
        options: [
          { text: 'Weekly or more, with strategic content plan', points: 25 },
          { text: '2-3 times per month', points: 18 },
          { text: 'Monthly or irregularly', points: 10 },
          { text: 'Rarely or never', points: 0 },
        ],
      },
      {
        id: 'q9',
        text: 'What type of content do you primarily create?',
        options: [
          {
            text: 'In-depth thought leadership (2,000+ word guides)',
            points: 25,
          },
          {
            text: 'Mix of educational and promotional (800-1,500 words)',
            points: 18,
          },
          {
            text: 'Short promotional posts (under 500 words)',
            points: 10,
          },
          { text: 'Minimal content creation', points: 0 },
        ],
      },
      {
        id: 'q10',
        text: 'Are your content pieces optimized for search engines?',
        options: [
          {
            text: 'Yes, keyword research + on-page SEO + internal linking',
            points: 25,
          },
          { text: 'Some keyword optimization', points: 18 },
          { text: 'Write naturally without SEO focus', points: 10 },
          { text: 'No SEO consideration', points: 0 },
        ],
      },
      {
        id: 'q11',
        text: 'How do you distribute your content?',
        options: [
          {
            text: 'Multi-channel strategy (email, social, partnerships, paid, SEO)',
            points: 25,
          },
          { text: '2-3 channels consistently', points: 18 },
          { text: '1 channel (usually social media)', points: 10 },
          { text: 'Publish and hope people find it', points: 0 },
        ],
      },
    ],
  },
  {
    name: 'Lead Generation',
    weight: 0.2,
    color: 'bg-orange-500',
    questions: [
      {
        id: 'q12',
        text: 'What do you offer to capture leads?',
        options: [
          {
            text: 'Multiple lead magnets tailored to buyer stages',
            points: 25,
          },
          { text: '1-2 lead magnets', points: 18 },
          { text: 'Just newsletter signup', points: 10 },
          { text: 'No lead capture mechanism', points: 0 },
        ],
      },
      {
        id: 'q13',
        text: 'What percentage of website visitors become leads?',
        options: [
          { text: '3% or higher', points: 25 },
          { text: '1.5-3%', points: 18 },
          { text: '0.5-1.5%', points: 10 },
          { text: "Under 0.5% or don't know", points: 0 },
        ],
      },
      {
        id: 'q14',
        text: 'How optimized are your landing pages?',
        options: [
          {
            text: 'A/B tested with clear CTAs, social proof, minimal friction',
            points: 25,
          },
          { text: 'Decent pages with clear CTAs', points: 18 },
          { text: 'Generic contact page or basic forms', points: 10 },
          { text: 'No dedicated landing pages', points: 0 },
        ],
      },
      {
        id: 'q15',
        text: 'How do you qualify leads?',
        options: [
          {
            text: 'Scoring system based on fit + engagement, automated routing',
            points: 25,
          },
          { text: 'Manual qualification based on criteria', points: 18 },
          { text: 'Basic filtering (company size, industry)', points: 10 },
          { text: 'All leads treated equally', points: 0 },
        ],
      },
    ],
  },
  {
    name: 'Paid Acquisition',
    weight: 0.15,
    color: 'bg-red-500',
    questions: [
      {
        id: 'q16',
        text: 'Which paid channels are you actively using?',
        options: [
          {
            text: '3+ channels tested and optimized',
            points: 25,
          },
          { text: '2 channels actively running', points: 18 },
          { text: '1 channel (usually Facebook or Google)', points: 10 },
          { text: 'No paid advertising', points: 0 },
        ],
      },
      {
        id: 'q17',
        text: 'Do you track CAC and is it profitable?',
        options: [
          {
            text: 'Yes, track by channel. CAC < 1/3 of LTV',
            points: 25,
          },
          {
            text: 'Track CAC, working to improve ratio',
            points: 18,
          },
          {
            text: 'Roughly track spending but not precise CAC',
            points: 10,
          },
          { text: "Don't track CAC", points: 0 },
        ],
      },
      {
        id: 'q18',
        text: "What's your average ROAS across paid channels?",
        options: [
          {
            text: '4:1 or higher',
            points: 25,
          },
          { text: '2:1 to 4:1', points: 18 },
          { text: '1:1 to 2:1', points: 10 },
          { text: 'Below 1:1 or dont measure', points: 0 },
        ],
      },
    ],
  },
  {
    name: 'Sales Enablement',
    weight: 0.1,
    color: 'bg-indigo-500',
    questions: [
      {
        id: 'q19',
        text: 'How do you manage your sales pipeline?',
        options: [
          {
            text: 'Full CRM with automation + sales workflows',
            points: 25,
          },
          {
            text: 'CRM in use but underutilized',
            points: 18,
          },
          {
            text: 'Spreadsheets or basic tools',
            points: 10,
          },
          { text: 'Email inbox or memory', points: 0 },
        ],
      },
      {
        id: 'q20',
        text: 'How well do marketing and sales teams collaborate?',
        options: [
          {
            text: 'Weekly syncs, shared goals, closed-loop reporting',
            points: 25,
          },
          {
            text: 'Regular communication and shared lead definitions',
            points: 18,
          },
          {
            text: 'Occasional communication when needed',
            points: 10,
          },
          {
            text: 'Siloed teams with minimal collaboration',
            points: 0,
          },
        ],
      },
      {
        id: 'q21',
        text: "How do you nurture leads who aren't ready to buy?",
        options: [
          {
            text: 'Automated nurture sequences based on behavior',
            points: 25,
          },
          {
            text: 'Email sequences for new leads',
            points: 18,
          },
          {
            text: 'Occasional email blasts',
            points: 10,
          },
          { text: 'No systematic nurturing', points: 0 },
        ],
      },
    ],
  },
  {
    name: 'Customer Retention',
    weight: 0.1,
    color: 'bg-pink-500',
    questions: [
      {
        id: 'q22',
        text: 'How effective is your email marketing?',
        options: [
          {
            text: 'Segmented campaigns with 25%+ open rates, 3%+ click rates',
            points: 25,
          },
          {
            text: 'Regular emails with average engagement (15-20% open)',
            points: 18,
          },
          {
            text: 'Occasional emails with low engagement',
            points: 10,
          },
          { text: 'Rarely send emails or no list', points: 0 },
        ],
      },
      {
        id: 'q23',
        text: 'Do you have campaigns for different customer stages?',
        options: [
          {
            text: 'Full lifecycle: onboarding → engagement → upsell → win-back',
            points: 25,
          },
          {
            text: 'Some automated sequences (onboarding + occasional)',
            points: 18,
          },
          {
            text: 'Manual outreach to existing customers',
            points: 10,
          },
          {
            text: 'Focus only on new customer acquisition',
            points: 0,
          },
        ],
      },
      {
        id: 'q24',
        text: 'How do you generate referrals?',
        options: [
          {
            text: 'Formal referral program with incentives',
            points: 25,
          },
          {
            text: 'Ask happy customers for referrals informally',
            points: 18,
          },
          {
            text: 'Hope for word-of-mouth',
            points: 10,
          },
          { text: 'No referral strategy', points: 0 },
        ],
      },
    ],
  },
  {
    name: 'African Market Fit',
    weight: 0.05,
    color: 'bg-yellow-500',
    questions: [
      {
        id: 'q25',
        text: 'How well are you optimized for African buyers? (Select all that apply)',
        options: [
          {
            text: 'Local payments (Paystack, Flutterwave, mobile money)',
            points: 6.25,
          },
          {
            text: 'WhatsApp Business integration for support',
            points: 6.25,
          },
          {
            text: 'Prices in local currency (Naira, Rand, Shilling)',
            points: 6.25,
          },
          {
            text: 'Content addressing local challenges/regulations',
            points: 6.25,
          },
        ],
        multiSelect: true,
      },
    ],
  },
];

const allQuestions: Question[] = dimensions.flatMap((dim, dimIndex) =>
  dim.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    multiSelect: (q as { multiSelect?: boolean }).multiSelect ?? false,
    dimensionIndex: dimIndex,
    dimensionName: dim.name,
    dimensionColor: dim.color,
    weight: dim.weight,
  }))
);

/* --------------------------------------------------------------------------
 * SOCIAL SHARING COMPONENT
 * -------------------------------------------------------------------------- */
const SocialShareButtons: React.FC<{
  score: number;
  stage: string;
  companyName: string;
}> = ({ score, stage, companyName }) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `I just scored ${score}/100 on the Apex Growth Scorecard! 🚀 My company is at the "${stage}" stage. Take the free assessment: `;

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + shareUrl)}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'scorecard_result',
        item_id: companyName,
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText + shareUrl);
    alert('✅ Link copied to clipboard!');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Share Your Achievement
        </h3>
        <p className="text-gray-600">Let your network know about your progress!</p>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => handleShare('linkedin')}
          className="flex flex-col items-center gap-3 p-6 bg-[#0077B5] hover:bg-[#006399] text-white rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span className="font-semibold text-sm">LinkedIn</span>
        </button>

        <button
          onClick={() => handleShare('twitter')}
          className="flex flex-col items-center gap-3 p-6 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          <span className="font-semibold text-sm">Twitter</span>
        </button>

        <button
          onClick={() => handleShare('facebook')}
          className="flex flex-col items-center gap-3 p-6 bg-[#1877F2] hover:bg-[#1564d6] text-white rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="font-semibold text-sm">Facebook</span>
        </button>

        <button
          onClick={() => handleShare('whatsapp')}
          className="flex flex-col items-center gap-3 p-6 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.304-1.654a11.882 11.882 0 005.713 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="font-semibold text-sm">WhatsApp</span>
        </button>
      </div>

      {/* Copy Link Button */}
      <button
        onClick={copyToClipboard}
        className="w-full mt-4 flex items-center justify-center gap-2 p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy Link
      </button>
    </div>
  );
};

/* --------------------------------------------------------------------------
 * Score Stage Helper
 * -------------------------------------------------------------------------- */
const getScoreStage = (score: number) => {
  if (score >= 80)
    return { stage: 'Leading', color: 'text-green-600', icon: '🏆' };
  if (score >= 60)
    return { stage: 'Scaling', color: 'text-blue-600', icon: '📈' };
  if (score >= 40)
    return { stage: 'Building', color: 'text-yellow-600', icon: '🌱' };
  return { stage: 'Foundation', color: 'text-orange-600', icon: '🚀' };
};

/* --------------------------------------------------------------------------
 * ANIMATED SCORE DISPLAY WITH CONFETTI
 * -------------------------------------------------------------------------- */
const AnimatedScoreDisplay: React.FC<{
  totalScore: number;
  stage: string;
  companyName: string;
}> = ({ totalScore, stage, companyName }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = totalScore / steps;
    let currentScore = 0;

    const timer = setInterval(() => {
      currentScore += increment;
      if (currentScore >= totalScore) {
        currentScore = totalScore;
        clearInterval(timer);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      setDisplayScore(Math.round(currentScore));
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalScore]);

  const getScoreColor = () => {
    if (totalScore >= 80) return 'from-green-500 to-emerald-600';
    if (totalScore >= 60) return 'from-blue-500 to-indigo-600';
    if (totalScore >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreEmoji = () => {
    if (totalScore >= 80) return '🏆';
    if (totalScore >= 60) return '🎯';
    if (totalScore >= 40) return '📈';
    return '💪';
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-12 text-center overflow-hidden mb-8">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Animated Background Circles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        {/* Company Name */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-white font-semibold">{companyName}</span>
          </div>
        </div>

        {/* Main Score Circle */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(displayScore / 100) * 754} 754`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-7xl font-bold text-white mb-2 animate-scaleIn">
              {displayScore}
            </div>
            <div className="text-2xl text-blue-200 font-semibold">/ 100</div>
          </div>
        </div>

        {/* Stage Badge */}
        <div className="mb-6">
          <div
            className={`inline-flex items-center gap-3 bg-gradient-to-r ${getScoreColor()} px-8 py-4 rounded-2xl shadow-2xl`}
          >
            <span className="text-4xl">{getScoreEmoji()}</span>
            <div className="text-left">
              <div className="text-sm text-white/80 font-medium">Your Growth Stage</div>
              <div className="text-2xl text-white font-bold">{stage}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            {
              label: 'Percentile',
              value:
                totalScore >= 70
                  ? 'Top 25%'
                  : totalScore >= 50
                  ? 'Top 50%'
                  : 'Top 75%',
            },
            { label: 'Industry Avg', value: '58/100' },
            { label: 'Potential', value: `+${100 - totalScore}` },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="text-sm text-blue-200 mb-1">{stat.label}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

/* --------------------------------------------------------------------------
 * Main Component
 * -------------------------------------------------------------------------- */
const ApexGrowthScorecard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [leadQuality, setLeadQuality] = useState<any>(null); // 👈 add this


  /* ------------------------ Tracking Helper ------------------------ */
  const trackEvent = useCallback(
    (event: string, data: Record<string, unknown> = {}) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event, data);
      }
    },
    []
  );

  /* ------------------------ Input Sanitization ------------------------ */
  const sanitizeInput = useCallback((input: string | null | undefined): string => {
    if (!input) return '';
    return input.replace(/[<>]/g, '').trim();
  }, []);

  /* ------------------------ Load Saved Progress ------------------------ */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCORECARD_STORAGE_KEY);
      if (saved) {
        const {
          answers: savedAnswers,
          currentStep: savedStep,
          email: savedEmail,
          company: savedCompany,
        } = JSON.parse(saved) as {
          answers?: AnswerMap;
          currentStep?: number;
          email?: string;
          company?: string;
        };

        if (savedAnswers) setAnswers(savedAnswers);
        if (typeof savedStep === 'number') setCurrentStep(savedStep);
        if (savedEmail) setEmail(savedEmail);
        if (savedCompany) setCompany(savedCompany);
      }
    } catch (err) {
      console.error('Error loading saved progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ------------------------ Save Progress ------------------------ */
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        SCORECARD_STORAGE_KEY,
        JSON.stringify({
          answers,
          currentStep,
          email,
          company,
        })
      );
    }
  }, [answers, currentStep, email, company, isLoading]);

  /* ------------------------ Scoring Logic ------------------------ */
  const calculateScores = useCallback(() => {
    const dimensionScores: DimensionScore[] = dimensions.map((dim) => {
      let totalPoints = 0;
      let maxPoints = 0;

      dim.questions.forEach((q) => {
        const answer = answers[q.id];
        if (Array.isArray(answer)) {
          totalPoints += answer.reduce((sum, p) => sum + p, 0);
          maxPoints += 25;
        } else {
          totalPoints += (answer as number | undefined) ?? 0;
          maxPoints += 25;
        }
      });

      const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

      return {
        name: dim.name,
        percentage: Math.round(percentage),
        weight: dim.weight,
        color: dim.color,
        weightedScore: percentage * dim.weight,
      };
    });

    const totalScore = Math.round(
      dimensionScores.reduce((sum, dim) => sum + dim.weightedScore, 0)
    );

    return { dimensionScores, totalScore };
  }, [answers]);

  const getRecommendations = useCallback(
    (dimensionScores: DimensionScore[]): DimensionScoreWithRecommendations[] => {
      return dimensionScores.map((dim) => {
        let recommendations: string[];

        if (dim.percentage < 40) {
          recommendations = [
            `Conduct a comprehensive audit of your ${dim.name.toLowerCase()}`,
            'Allocate immediate resources to address critical gaps',
            'Set up tracking to measure improvements',
            'Consider professional consultation for rapid improvement',
          ];
        } else if (dim.percentage < 70) {
          recommendations = [
            `Optimize existing ${dim.name.toLowerCase()} processes`,
            'Test new strategies to improve performance',
            'Benchmark against industry leaders',
            'Implement A/B testing for continuous improvement',
          ];
        } else {
          recommendations = [
            `Scale successful ${dim.name.toLowerCase()} strategies`,
            'Explore advanced optimization techniques',
            'Consider automation to maintain excellence',
            'Share best practices across your organization',
          ];
        }

        return { ...dim, recommendations };
      });
    },
    []
  );

  /* ------------------------ Answer Handler (Debounced, Safe) ------------------------ */
  const handleAnswer = useCallback(
    debounce(
      (questionId: string, points: number, multiSelect: boolean = false) => {
        setAnswers((prev: AnswerMap) => {
          if (multiSelect) {
            const current = (prev[questionId] as number[] | undefined) || [];
            const exists = current.includes(points);
            const updated = exists
              ? current.filter((p) => p !== points)
              : [...current, points];

            return {
              ...prev,
              [questionId]: updated,
            };
          }

          return {
            ...prev,
            [questionId]: points,
          };
        });

        trackEvent('question_answered', {
          questionId,
          action: multiSelect ? 'multi' : 'single',
          points,
          multiSelect,
        });
      },
      300
    ),
    [trackEvent]
  );

  /* ------------------------ Navigation ------------------------ */
  const handleNext = () => {
    if (currentStep < allQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      trackEvent('progress_step', { step: currentStep + 1 });
    } else if (currentStep === allQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      trackEvent('reached_email_step');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      trackEvent('back_step', { step: currentStep - 1 });
    }
  };

  /* ------------------------ Inputs ------------------------ */
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setEmail(sanitized);
    setError('');
  };

  const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setCompany(sanitized);
  };

  /* ------------------------ PDF Download Handler ------------------------ */
  const handleDownloadPDF = async () => {
    if (!company) return;
    
    setIsGeneratingPDF(true);
    trackEvent('pdf_download_started', { company });

    try {
      const scores = calculateScores();
      const scoreInfo = getScoreStage(scores.totalScore);
      
      const success = await generatePDF(
        company,
        scores.totalScore,
        scoreInfo.stage,
        scores.dimensionScores
      );

      if (success) {
        trackEvent('pdf_download_success', { 
          company, 
          score: scores.totalScore 
        });
      } else {
        trackEvent('pdf_download_fallback', { 
          company, 
          score: scores.totalScore 
        });
      }
    } catch (error) {
      console.error('PDF download failed:', error);
      trackEvent('pdf_download_error', { error: error.message });
      // Fallback to print
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  /* ------------------------ Submit ------------------------ */
  const handleSubmit = async () => {
    if (!email || !company) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid work email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    trackEvent('form_submission_started', { email, company });

    try {
      const scores = calculateScores();

const leadQualityResult = calculateLeadQuality(
  scores.totalScore,
  scores.dimensionScores
);

setLeadQuality(leadQualityResult);

console.log('🎯 Lead Quality:', leadQualityResult);


      const response = await fetch('/api/submit-scorecard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizeInput(email),
          company: sanitizeInput(company),
          answers,
          score: scores,
          leadQuality,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const scoreInfo = getScoreStage(scores.totalScore);
      fetch('/api/send-results-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizeInput(email),
          company: sanitizeInput(company),
          totalScore: scores.totalScore,
          stage: scoreInfo.stage,
          dimensionScores: scores.dimensionScores,
        }),
      }).catch(err => {
        console.error('Email sending failed (non-critical):', err);
      });

      trackEvent('form_submission_success', { 
  email, 
  company,
  leadPriority: leadQualityResult.priority,
  leadScore: leadQualityResult.score,
});

      
      setShowResults(true);
      localStorage.removeItem(SCORECARD_STORAGE_KEY);

    } catch (err: unknown) {
      console.error('Submission error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError('Failed to submit. Please check your connection and try again.');
      trackEvent('form_submission_error', { error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------ Derived UI State ------------------------ */
  const currentQuestion = allQuestions[currentStep];
  const progress = ((currentStep + 1) / allQuestions.length) * 100;
  const isAnswered =
    currentQuestion &&
    (currentQuestion.multiSelect
      ? ((answers[currentQuestion.id] as number[] | undefined) ?? []).length > 0
      : answers[currentQuestion.id] !== undefined);

  /* ------------------------ Loading ------------------------ */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  /* ------------------------ Intro Screen ------------------------ */
  if (showIntro) {
    return <IntroScreen onStart={() => setShowIntro(false)} />;
  }

  /* ------------------------ Results View ------------------------ */
  if (showResults) {
    const { dimensionScores, totalScore } = calculateScores();
    const scoreInfo = getScoreStage(totalScore);
    const sortedByScore = [...dimensionScores].sort((a, b) => a.percentage - b.percentage);
    const topPriorities = sortedByScore.slice(0, 3);
   // const recommendations = getRecommendations(sortedByScore);
    const weakestDimensions = sortedByScore.slice(0, 3);
	 const recommendations = useMemo(
    () => getRecommendations(sortedByScore),
    [sortedByScore]
  );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
  src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png"
  alt="Apex Digital Africa"
  width={64}
  height={64}
  className="h-12 sm:h-16 object-contain"
/>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Your Growth Score
            </h1>
            <p className="text-gray-600">Comprehensive analysis for {company}</p>
          </div>

          {/* Animated Score Display */}
          <AnimatedScoreDisplay
            totalScore={totalScore}
            stage={scoreInfo.stage}
            companyName={company}
          />

          {/* Social Sharing */}
          <div className="mb-8">
            <SocialShareButtons
              score={totalScore}
              stage={scoreInfo.stage}
              companyName={company}
            />
          </div>

          {/* Premium Certificate Section */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-200 mb-8">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
              <div className="relative z-10">
                <Award className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h2 className="text-3xl font-bold mb-2">Digital Growth Certificate</h2>
                <p className="text-blue-100">Verified Achievement • Apex Digital Africa</p>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-12 text-center">
              <div className="mb-8">
                <p className="text-gray-600 text-lg mb-4">This certifies that</p>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{company}</h3>
                <p className="text-gray-600 text-lg mb-8">
                  has completed the Apex Growth Scorecard™ assessment
                </p>
              </div>

              {/* Score Badge */}
              <div className="inline-block mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-12 py-6 rounded-2xl shadow-xl">
                  <div className="text-sm font-semibold mb-2">Achieved Score</div>
                  <div className="text-6xl font-bold">{totalScore}</div>
                  <div className="text-2xl mt-2">/ 100</div>
                </div>
              </div>
			{/* Lead Quality Indicator (Only visible to you in dashboard) */}
{process.env.NODE_ENV === 'development' && (
  <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
    <div className="text-xs font-mono">
      <div>🎯 Lead Priority: {leadQuality?.priority}</div>
      <div>📊 Lead Score: {leadQuality?.score}/100</div>
      <div>🔥 Hot Lead: {leadQuality?.priority === 'High' ? 'Yes' : 'No'}</div>
    </div>
  </div>
)}

              {/* Growth Stage */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-8 py-4 rounded-full border-2 border-purple-300">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="text-sm text-purple-600 font-medium">Growth Stage</div>
                    <div className="text-xl font-bold text-purple-900">{scoreInfo.stage}</div>
                  </div>
                </div>
              </div>

              {/* Date & Signature */}
              <div className="border-t-2 border-gray-200 pt-8">
                <div className="flex justify-between items-end max-w-2xl mx-auto">
                  <div className="text-left">
                    <div className="text-sm text-gray-500 mb-2">Date of Assessment</div>
                    <div className="font-semibold text-gray-900">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="text-center">
                   <Image src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png"
  alt="Apex Digital Africa"
  width={64}
  height={64}
  className="h-12 sm:h-16 object-contain"
  priority
/>
                    <div className="text-sm font-medium text-gray-700">Apex Digital Africa</div>
                    <div className="text-xs text-gray-500">Certified Growth Partner</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-2">Certificate ID</div>
                    <div className="font-mono text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded">
                      AD-{Date.now().toString(36).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Footer Actions */}
            <div className="bg-gray-50 px-12 py-6 flex flex-wrap gap-4 justify-center border-t-2 border-gray-200">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Certificate
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const shareUrl = window.location.href;
                  navigator.clipboard.writeText(shareUrl);
                  alert('✅ Certificate link copied!');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Link
              </button>
            </div>

            {/* Verification Section */}
            <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-gray-200 m-4">
              <p className="text-xs text-gray-600 font-semibold">Certificate ID: APEX-{new Date().getFullYear()}-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
              <p className="text-[10px] text-gray-500 mt-1">Digitally verified and permanently stored</p>
            </div>
          </div>

          {/* Personalized Next Steps */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 border-2 border-indigo-200 mb-8">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
                <Rocket className="w-8 h-8 text-indigo-600" />
                Your Personalized Growth Roadmap
              </h3>
              <p className="text-lg text-gray-600">
                Based on your {totalScore}/100 score, here's what we recommend:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  priority: 'Immediate (This Week)',
                  icon: '🔥',
                  color: 'red',
                  actions: [
                    weakestDimensions[0] && `Focus on ${weakestDimensions[0].name} (currently at ${weakestDimensions[0].percentage}%)`,
                    'Book a free 30-min strategy call',
                    'Review automated recommendations'
                  ]
                },
                {
                  priority: 'Short-term (This Month)',
                  icon: '📈',
                  color: 'yellow',
                  actions: [
                    'Implement quick wins from assessment',
                    'Set up tracking metrics',
                    'Optimize weakest dimension'
                  ]
                },
                {
                  priority: 'Long-term (3 Months)',
                  icon: '🎯',
                  color: 'green',
                  actions: [
                    'Achieve 70+ overall score',
                    'Build comprehensive strategy',
                    'Retake assessment to track progress'
                  ]
                }
              ].map((step, idx) => (
                <div key={idx} className={`bg-white rounded-2xl p-6 border-2 border-${step.color}-200 shadow-lg`}>
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h4 className="font-bold text-lg text-gray-900 mb-4">{step.priority}</h4>
                  <ul className="space-y-2">
                    {step.actions.map((action, i) => (
                      action && (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className={`w-5 h-5 text-${step.color}-500 flex-shrink-0 mt-0.5`} />
                          <span className="text-sm text-gray-700">{action}</span>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://bit.ly/africa-website"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                <Calendar className="w-6 h-6" />
                Book Free Strategy Session
              </a>

              <button
                onClick={() => {
                  localStorage.removeItem(SCORECARD_STORAGE_KEY);
				window.location.reload();

                }}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                <RefreshCw className="w-6 h-6" />
                Retake Assessment
              </button>
            </div>
          </div>

          {/* Dimension Breakdown */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Dimension Breakdown
            </h2>
            <div className="space-y-4">
              {dimensionScores.map((dim, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">
                      {dim.name}
                    </span>
                    <span className="font-bold text-lg">
                      {dim.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${dim.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${dim.percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Weight: {Math.round(dim.weight * 100)}% | Contribution:{' '}
                    {Math.round(dim.weightedScore)} points
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations (Weakest Dimensions) */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-blue-600" />
              Actionable Recommendations
            </h2>
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 border-l-4 border-blue-500"
                >
                  <div className="font-semibold text-gray-900 mb-2">
                    {rec.name} ({rec.percentage}%)
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {rec.recommendations.slice(0, 2).map((recommendation, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Top Priorities */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="mr-2 text-yellow-600" />
              Top 3 Priorities
            </h2>
            <div className="space-y-4">
              {topPriorities.map((priority, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 border-l-4 border-yellow-500"
                >
                  <div className="font-semibold text-gray-900 mb-1">
                    {index + 1}. {priority.name} ({priority.percentage}%)
                  </div>
                  <div className="text-sm text-gray-700">
                    {priority.percentage < 40 &&
                      'Critical gaps requiring immediate attention'}
                    {priority.percentage >= 40 &&
                      priority.percentage < 60 &&
                      'Needs optimization for better performance'}
                    {priority.percentage >= 60 &&
                      'Good foundation, refine for excellence'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 sm:p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Improve Your Score?
            </h3>
            <p className="mb-6 text-blue-100">
              Book a free 30-minute strategy session to discuss your results and
              create a custom 90-day growth plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://bit.ly/africa-website"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-indigo-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-center"
                onClick={() =>
                  trackEvent('cta_click', { type: 'strategy_session' })
                }
              >
                Book Strategy Session
              </a>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-indigo-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  'Download Full Report (PDF)'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* AI Chatbot */}
        {showResults && (
          <AIGrowthChatbot
            company={company}
            totalScore={totalScore}
            stage={scoreInfo.stage}
            dimensionScores={dimensionScores}
          />
        )}
      </div>
    );
  }

  /* ------------------------ Email Collection View ------------------------ */
  if (currentStep === allQuestions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Image
  src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png"
  alt="Apex Digital Africa"
  width={64}
  height={64}
  className="h-12 sm:h-16 object-contain"
  priority
/>
            </div>
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Almost Done!
            </h2>
            <p className="text-gray-600">
              Enter your details to receive your comprehensive Growth Score
              report.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={company}
                onChange={handleCompanyChange}
                placeholder="Apex Digital Africa"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
              Your data is confidential and never shared. We respect your
              privacy.
            </div>

            <button
              onClick={handleSubmit}
              disabled={!email || !company || isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold text-white transition flex items-center justify-center
                ${
                  email && company && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  See My Results
                  <TrendingUp className="ml-2 w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
            >
              ← Back to Questions
            </button>
          </div>
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl text-center max-w-sm mx-4">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-900 font-semibold">
                Generating your personalized report...
              </p>
              <p className="text-gray-600 text-sm mt-2">
                This may take a few seconds
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ------------------------ Question View ------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <Image
  src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png"
  alt="Apex Digital Africa"
  width={64}
  height={64}
  className="h-12 sm:h-16 object-contain"
  priority
/>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Apex Growth Scorecard™
          </h1>
          <p className="text-gray-600">
            Discover Your B2B Growth Potential in 5 Minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-900">
                Question {currentStep + 1} of {allQuestions.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{Math.round(progress)}% Complete</span>
              {progress >= 75 && (
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
            
            {/* Milestone Markers */}
            {[25, 50, 75, 100].map((milestone) => (
              <div
                key={milestone}
                className={`absolute top-0 h-4 w-1 ${
                  progress >= milestone ? 'bg-green-500' : 'bg-gray-400'
                }`}
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
          
          {/* Milestone Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className={progress >= 25 ? 'text-blue-600 font-semibold' : ''}>¼</span>
            <span className={progress >= 50 ? 'text-blue-600 font-semibold' : ''}>½</span>
            <span className={progress >= 75 ? 'text-blue-600 font-semibold' : ''}>¾</span>
            <span className={progress >= 100 ? 'text-green-600 font-semibold' : ''}>Done!</span>
          </div>
        </div>

        {/* Enhanced Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-gray-100 relative overflow-hidden group">
          {/* Dimension Badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-bl-3xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-bold">{currentQuestion.dimensionName}</span>
            </div>
          </div>

          {/* Question Number & Icon */}
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${currentQuestion.dimensionColor}, ${currentQuestion.dimensionColor}cc)` }}
            >
              {currentStep + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-500 mb-1">
                {currentQuestion.dimensionName}
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStep + 1) / allQuestions.length) * 100}%`,
                    background: currentQuestion.dimensionColor
                  }}
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {currentQuestion.text}
          </h2>

          {/* Help Text (if available) */}
          {currentQuestion.helpText && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">{currentQuestion.helpText}</p>
              </div>
            </div>
          )}

          {/* Multi-select indicator */}
          {currentQuestion.multiSelect && (
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border-2 border-purple-300">
              <CheckCircle className="w-4 h-4" />
              <span>Select all that apply</span>
            </div>
          )}

          {/* Options Grid */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = currentQuestion.multiSelect
                ? (answers[currentQuestion.id] as number[] || []).includes(option.points)
                : answers[currentQuestion.id] === option.points;

              return (
                <button
                  key={optionIndex}
                  onClick={() => handleAnswer(currentQuestion.id, option.points, currentQuestion.multiSelect)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group/option ${
                    isSelected
                      ? `border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-[1.02]`
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Selection Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 bg-white group-hover/option:border-blue-400'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Option Text */}
                    <span className={`font-semibold text-lg flex-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-700 group-hover/option:text-blue-600'
                    }`}>
                      {option.text}
                    </span>

                    {/* Points Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover/option:bg-blue-100 group-hover/option:text-blue-600'
                    }`}>
                      {option.points} pts
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t-2 border-gray-100">
            {/* Back Button */}
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            )}

            {/* Next/Submit Button */}
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`ml-auto flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                isAnswered
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === allQuestions.length - 1 ? (
                <>
                  <span>Complete Assessment</span>
                  <CheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Save Indicator */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Your progress is automatically saved
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>🔒 Your responses are confidential and secure</p>
          <p className="mt-1">Progress automatically saved</p>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
 * Error Boundary Wrapper
 * -------------------------------------------------------------------------- */
class ScorecardErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Scorecard Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* --------------------------------------------------------------------------
 * Export with Error Boundary
 * -------------------------------------------------------------------------- */
const ApexGrowthScorecardWithErrorBoundary: React.FC = () => (
  <ScorecardErrorBoundary>
    <ApexGrowthScorecard />
  </ScorecardErrorBoundary>
);

export default ApexGrowthScorecardWithErrorBoundary;