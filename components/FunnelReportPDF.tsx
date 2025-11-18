// components/FunnelReportPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

// Define types
interface FunnelStage {
  input: number;
  output: number;
  label: string;
}

interface FunnelSnapshot {
  businessName: string;
  periodLabel: string;
  currency: string;
  estimatedRevenue: number;
  stages: FunnelStage[];
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#0f172a',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
    borderBottom: '2 solid #1e293b',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 3,
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#1e293b',
    borderRadius: 10,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10b98120',
    border: '4 solid #10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#10b981',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 10,
    borderBottom: '1 solid #334155',
    paddingBottom: 5,
  },
  text: {
    fontSize: 10,
    color: '#e2e8f0',
    lineHeight: 1.4,
    marginBottom: 6,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  insightItem: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricBox: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1e293b',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#64748b',
    borderTop: '1 solid #334155',
    paddingTop: 10,
  },
});

// Utility functions
const computeFunnelScore = (snapshot: FunnelSnapshot) => {
  if (!snapshot?.stages || snapshot.stages.length === 0) {
    return {
      overallScore: 0,
      avgConversionRate: 0,
      stageScores: [],
      biggestLeakStage: null,
      strongestStage: null
    };
  }

  const stageScores = snapshot.stages.map((stage, idx) => {
    const conversionRate = stage.input > 0 ? stage.output / stage.input : 0;
    const dropOffRate = 1 - conversionRate;
    const score = conversionRate * 100;
    
    return {
      stageId: idx,
      label: stage.label,
      conversionRate,
      dropOffRate,
      score,
    };
  });

  const avgConversionRate = stageScores.length > 0 
    ? stageScores.reduce((sum, s) => sum + s.conversionRate, 0) / stageScores.length 
    : 0;
  
  const overallScore = avgConversionRate * 100;
  
  const biggestLeakStage = stageScores.length > 0 
    ? stageScores.reduce((worst, current) => 
        current.dropOffRate > worst.dropOffRate ? current : worst
      )
    : null;
  
  const strongestStage = stageScores.length > 0
    ? stageScores.reduce((best, current) => 
        current.score > best.score ? current : best
      )
    : null;

  return {
    overallScore,
    avgConversionRate,
    stageScores,
    biggestLeakStage,
    strongestStage
  };
};

const generateFunnelInsights = (snapshot: FunnelSnapshot, summary: any) => {
  const insights = [];
  
  if (summary.biggestLeakStage) {
    insights.push({
      title: `${summary.biggestLeakStage.label} is Your Biggest Opportunity`,
      body: `With a ${(summary.biggestLeakStage.dropOffRate * 100).toFixed(1)}% drop-off rate, this stage needs immediate attention.`,
      severity: 'high',
      estimatedImpact: 'High Revenue Impact'
    });
  }
  
  if (summary.strongestStage) {
    insights.push({
      title: 'Replicate Your Top Performer',
      body: `${summary.strongestStage.label} is converting at ${(summary.strongestStage.conversionRate * 100).toFixed(1)}%. Study what's working here.`,
      severity: 'low',
      estimatedImpact: 'Process Improvement'
    });
  }

  return insights.length > 0 ? insights : [{
    title: 'Optimize Your Funnel',
    body: 'Focus on improving conversion rates across all stages.',
    severity: 'medium',
    estimatedImpact: 'General Improvement'
  }];
};

const estimateLeakImpact = (snapshot: FunnelSnapshot, summary: any) => {
  if (!summary?.biggestLeakStage || !snapshot?.stages || snapshot.stages.length === 0) {
    return {
      leadsLost: 0,
      potentialRecoveredLeads: 0,
      estimatedExtraRevenue: 0
    };
  }
  
  const stageIndex = summary.biggestLeakStage.stageId;
  const stageInput = snapshot.stages[stageIndex]?.input || 0;
  
  const leadsLost = Math.round(summary.biggestLeakStage.dropOffRate * stageInput);
  const potentialRecoveredLeads = Math.round(leadsLost * 0.25);
  
  const lastStageOutput = snapshot.stages[snapshot.stages.length - 1]?.output || 1;
  const avgDealValue = snapshot.estimatedRevenue / lastStageOutput;
  const estimatedExtraRevenue = potentialRecoveredLeads * avgDealValue;

  return {
    leadsLost,
    potentialRecoveredLeads,
    estimatedExtraRevenue
  };
};

const FunnelReportPDF = ({ snapshot }: { snapshot: FunnelSnapshot }) => {
  const summary = computeFunnelScore(snapshot);
  const insights = generateFunnelInsights(snapshot, summary);
  const impact = estimateLeakImpact(snapshot, summary);

  const lastStage = snapshot.stages[snapshot.stages.length - 1];
  const firstStage = snapshot.stages[0];
  const totalWon = lastStage?.output ?? 0;
  const totalTop = firstStage?.input ?? 0;
  const overallConversion = totalTop > 0 ? (totalWon / totalTop) * 100 : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Funnel Scorecard Report</Text>
          <Text style={styles.subtitle}>{snapshot.businessName}</Text>
          <Text style={styles.subtitle}>{snapshot.periodLabel}</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Score Section */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{Math.round(summary.overallScore)}</Text>
          </View>
          <Text style={styles.scoreLabel}>Overall Funnel Score /100</Text>
          <Text style={[styles.text, { textAlign: 'center', marginTop: 10 }]}>
            {summary.overallScore >= 80 
              ? 'Excellent Performance! 🚀' 
              : summary.overallScore >= 60 
              ? 'Room for Improvement 📈' 
              : 'Critical Issues Detected ⚠️'
            }
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {(summary.avgConversionRate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>Avg Conversion Rate</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {overallConversion.toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>Overall Flow</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {totalWon.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Customers Won</Text>
            </View>
          </View>
        </View>

        {/* Revenue Impact */}
        {impact.estimatedExtraRevenue > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Opportunity</Text>
            <Text style={styles.text}>
              🔍 <Text style={styles.highlight}>{impact.leadsLost.toLocaleString()}</Text> leads lost at critical stage
            </Text>
            <Text style={styles.text}>
              💰 Potential to recover: <Text style={styles.highlight}>{impact.potentialRecoveredLeads.toLocaleString()}</Text> opportunities
            </Text>
            <Text style={styles.text}>
              📈 Estimated revenue gain: <Text style={styles.highlight}>
                {snapshot.currency}{Math.round(impact.estimatedExtraRevenue).toLocaleString()}
              </Text>
            </Text>
          </View>
        )}

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Powered Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={[styles.text, { fontWeight: 'bold', color: '#06b6d4' }]}>
                {insight.title}
              </Text>
              <Text style={styles.text}>{insight.body}</Text>
              <Text style={[styles.text, { fontSize: 8, color: '#94a3b8' }]}>
                Impact: {insight.estimatedImpact}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Powered by Apex Growth Intelligence • apexdigitalafrica.com • Confidential Report
        </Text>
      </Page>
    </Document>
  );
};

// Function to trigger download
export const generateAndDownloadPDF = async (snapshot: FunnelSnapshot) => {
  try {
    const blob = await pdf(<FunnelReportPDF snapshot={snapshot} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snapshot.businessName.replace(/\s+/g, '-')}-Funnel-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('PDF generation failed. Please try again.');
  }
};

export default FunnelReportPDF;