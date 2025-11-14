// ApexGrowthScorecard.jsx
'use client';

import React, { useState, useEffect, useCallback } from "react";
import type { ErrorInfo } from "react";

import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Target,
  Mail,
  Loader,
} from 'lucide-react';

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

const allQuestions = dimensions.flatMap((dim, dimIndex) =>
  dim.questions.map((q) => ({
    ...q,
    dimensionIndex: dimIndex,
    dimensionName: dim.name,
    dimensionColor: dim.color,
    weight: dim.weight,
  }))
);

/* -------------------------------------------------------------------------- */
/* Error Boundary                                                             */
/* -------------------------------------------------------------------------- */

interface ScorecardErrorBoundaryProps {
  children: React.ReactNode;
}

interface ScorecardErrorBoundaryState {
  hasError: boolean;
}

class ScorecardErrorBoundary extends React.Component<
  ScorecardErrorBoundaryProps,
  ScorecardErrorBoundaryState
> {
  constructor(props: ScorecardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_error: Error): ScorecardErrorBoundaryState {
    // We don’t need the error value here, just flip the flag
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Here we actually use the error + info, so ESLint is happy
    console.error("Scorecard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We encountered an issue loading the scorecard. Please try
              refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Restart Scorecard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}



/* --------------------------------------------------------------------------
 * Main Component
 * -------------------------------------------------------------------------- */
const ApexGrowthScorecard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  /* ------------------------ Tracking Helper ------------------------ */
  const trackEvent = useCallback(
  (event: string, data: Record<string, unknown> = {}) => {
    if (typeof window !== "undefined") {
      if ((window as any).gtag) {
        (window as any).gtag("event", event, data);
      }

      if ((window as any).fbq) {
        (window as any).fbq("track", event, data);
      }

      console.log(`Track: ${event}`, data);
    }
  },
  []
);


  /* ------------------------ Input Sanitization ------------------------ */
  const sanitizeInput = useCallback((input) => {
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
        } = JSON.parse(saved);
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
    const dimensionScores = dimensions.map((dim) => {
      let totalPoints = 0;
      let maxPoints = 0;

      dim.questions.forEach((q) => {
        const answer = answers[q.id];
        if (Array.isArray(answer)) {
          totalPoints += answer.reduce((sum, p) => sum + p, 0);
          maxPoints += 25;
        } else {
          totalPoints += answer || 0;
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

  const getScoreStage = (score) => {
    if (score >= 80)
      return { stage: 'Leading', color: 'text-green-600', icon: '🏆' };
    if (score >= 60)
      return { stage: 'Scaling', color: 'text-blue-600', icon: '📈' };
    if (score >= 40)
      return { stage: 'Building', color: 'text-yellow-600', icon: '🔨' };
    return { stage: 'Foundation', color: 'text-red-600', icon: '🚧' };
  };

  const getRecommendations = useCallback((dimensionScores) => {
    return dimensionScores.map((dim) => {
      let recommendations = [];

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
  }, []);

  /* ------------------------ Answer Handler (Debounced, Safe) ------------------------ */
  const handleAnswer = useCallback(
    debounce((questionId, points, multiSelect = false) => {
      setAnswers((prev) => {
        if (multiSelect) {
          const current = prev[questionId] || [];
          const exists = current.includes(points);
          const updated = exists
            ? current.filter((p) => p !== points)
            : [...current, points];

          trackEvent('question_answered', {
            questionId,
            action: exists ? 'deselected' : 'selected',
            points,
            multiSelect: true,
          });

          return { ...prev, [questionId]: updated };
        } else {
          trackEvent('question_answered', {
            questionId,
            action: 'selected',
            points,
            multiSelect: false,
          });

          return { ...prev, [questionId]: points };
        }
      });
    }, 300),
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
  const handleEmailChange = (e) => {
    const sanitized = sanitizeInput(e.target.value);
    setEmail(sanitized);
    setError('');
  };

  const handleCompanyChange = (e) => {
    const sanitized = sanitizeInput(e.target.value);
    setCompany(sanitized);
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
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        trackEvent('form_submission_success', { email, company });
        setShowResults(true);
        localStorage.removeItem(SCORECARD_STORAGE_KEY);
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit. Please check your connection and try again.');
      trackEvent('form_submission_error', { error: err.message });
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
      ? (answers[currentQuestion.id] || []).length > 0
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

  /* ------------------------ Results View ------------------------ */
  if (showResults) {
    const { dimensionScores, totalScore } = calculateScores();
    const scoreInfo = getScoreStage(totalScore);

    // Sort by weakest dimension first
    const sortedByScore = [...dimensionScores].sort(
      (a, b) => a.percentage - b.percentage
    );
    const topPriorities = sortedByScore.slice(0, 3);
    const recommendations = getRecommendations(sortedByScore);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-8">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png"
                alt="Apex Digital Africa"
                className="h-12 sm:h-16 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Your Growth Score
            </h1>
            <p className="text-gray-600">Comprehensive analysis for {company}</p>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white text-center mb-8">
            <div className="text-5xl sm:text-6xl font-bold mb-2">
              {totalScore}/100
            </div>
            <div className="text-xl sm:text-2xl mb-2">
              {scoreInfo.icon} {scoreInfo.stage} Stage
            </div>
            <div className="text-blue-100 text-sm sm:text-base">
              {scoreInfo.stage === 'Leading' &&
                "Best-in-class performance! You're setting the benchmark."}
              {scoreInfo.stage === 'Scaling' &&
                'Strong foundation. Ready for aggressive growth.'}
              {scoreInfo.stage === 'Building' &&
                'Good foundation. Optimization will accelerate growth.'}
              {scoreInfo.stage === 'Foundation' &&
                'Significant opportunities for improvement ahead.'}
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
                className="bg-indigo-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition"
                onClick={() => {
                  trackEvent('cta_click', { type: 'download_report' });
                  // TODO: Replace window.print() with real PDF generation & download
                  window.print();
                }}
              >
                Download Full Report (PDF)
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-600">
            <p>Results sent to: {email}</p>
            <p className="mt-2">
              © {new Date().getFullYear()} Apex Digital Africa. All rights
              reserved.
            </p>
          </div>
        </div>
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
              <img
                src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png"
                alt="Apex Digital Africa"
                className="h-10 sm:h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
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

        {/* Loading Overlay */}
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
            <img
              src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png"
              alt="Apex Digital Africa"
              className="h-10 sm:h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
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
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentStep + 1} of {allQuestions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mb-6">
            {/* Dimension Badge */}
            <div className="mb-6">
              <span
                className={`${currentQuestion.dimensionColor} text-white px-4 py-2 rounded-full text-sm font-semibold`}
              >
                {currentQuestion.dimensionName}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = currentQuestion.multiSelect
                  ? (answers[currentQuestion.id] || []).includes(option.points)
                  : answers[currentQuestion.id] === option.points;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      handleAnswer(
                        currentQuestion.id,
                        option.points,
                        currentQuestion.multiSelect
                      )
                    }
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all
                      ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    aria-pressed={isSelected}
                    role={currentQuestion.multiSelect ? 'checkbox' : 'radio'}
                    aria-label={`Select option: ${option.text}`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-6 h-6 rounded-full border-2 mr-3 flex-shrink-0 mt-0.5 flex items-center justify-center
                        ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {option.text}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {currentQuestion.multiSelect && (
              <div className="mt-4 text-sm text-blue-600 font-medium">
                ✓ Select all that apply
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition
              ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-white hover:shadow-md'
              }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className={`flex items-center px-6 sm:px-8 py-3 rounded-lg font-semibold transition
              ${
                !isAnswered
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              }`}
          >
            {currentStep === allQuestions.length - 1 ? 'Complete' : 'Next'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
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
 * Export with Error Boundary
 * -------------------------------------------------------------------------- */
const ApexGrowthScorecardWithErrorBoundary = () => (
  <ScorecardErrorBoundary>
    <ApexGrowthScorecard />
  </ScorecardErrorBoundary>
);

export default ApexGrowthScorecardWithErrorBoundary;
