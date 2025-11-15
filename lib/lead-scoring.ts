interface DimensionScore {
  name: string;
  percentage: number;
  weight: number;
  color: string;
  weightedScore: number;
}

type AnswerMap = Record<string, number | number[]>;

export interface LeadQuality {
  score: number;
  priority: 'Hot' | 'Warm' | 'Cold';
  readiness: string;
  recommendedAction: string;
}

export const calculateLeadQuality = (
  totalScore: number,
  dimensionScores: DimensionScore[],
  answers: AnswerMap
): LeadQuality => {
  let leadScore = 0;
  
  // Score based on total score (0-40 points)
  if (totalScore < 40) leadScore += 10;
  else if (totalScore < 60) leadScore += 20;
  else if (totalScore < 80) leadScore += 30;
  else leadScore += 40;
  
  // Score based on weakest dimension (0-30 points)
  const sorted = [...dimensionScores].sort((a, b) => a.percentage - b.percentage);
  const weakestDim = sorted[0];
  
  if (weakestDim.percentage < 30) leadScore += 30; // Critical need
  else if (weakestDim.percentage < 50) leadScore += 20; // Moderate need
  else leadScore += 10; // Low need
  
  // Score based on high-value dimensions (0-30 points)
  const leadGenScore = dimensionScores.find(d => d.name === 'Lead Generation')?.percentage || 0;
  const contentScore = dimensionScores.find(d => d.name === 'Content Strategy')?.percentage || 0;
  
  if (leadGenScore < 50 || contentScore < 50) leadScore += 30; // High pain point
  else if (leadGenScore < 70 || contentScore < 70) leadScore += 20;
  else leadScore += 10;
  
  // Determine priority and actions
  let priority: 'Hot' | 'Warm' | 'Cold';
  let readiness: string;
  let recommendedAction: string;
  
  if (leadScore >= 70) {
    priority = 'Hot';
    readiness = 'Ready to Buy';
    recommendedAction = 'Schedule demo call within 24 hours. High intent, multiple pain points.';
  } else if (leadScore >= 50) {
    priority = 'Warm';
    readiness = 'Evaluating Solutions';
    recommendedAction = 'Send case study + schedule consultation within 3 days.';
  } else {
    priority = 'Cold';
    readiness = 'Early Research';
    recommendedAction = 'Add to nurture sequence. Send educational content weekly.';
  }
  
  return {
    score: leadScore,
    priority,
    readiness,
    recommendedAction,
  };
};
