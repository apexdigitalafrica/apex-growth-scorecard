import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from '@react-email/components';

interface ScorecardEmailProps {
  company: string;
  totalScore: number;
  stage: string;
  dimensionScores: Array<{
    name: string;
    percentage: number;
    recommendations: string[];
  }>;
}

export default function ScorecardResultsEmail({
  company,
  totalScore,
  stage,
  dimensionScores,
}: ScorecardEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png"
              alt="Apex Digital Africa"
              width="120"
              style={logo}
            />
            <Text style={title}>Your Growth Scorecard Results</Text>
          </Section>

          {/* Score Summary */}
          <Section style={scoreSection}>
            <Text style={greeting}>Hi {company} Team! 👋</Text>
            <Text style={paragraph}>
			Thank you for completing the Apex Growth Scorecard™. Here&apos;s your comprehensive digital growth assessment:
            </Text>
            
            <div style={scoreCard}>
              <Text style={scoreNumber}>{totalScore}/100</Text>
              <Text style={scoreLabel}>Overall Score</Text>
              <Text style={stageText}>Growth Stage: {stage}</Text>
            </div>
          </Section>

          {/* Dimension Breakdown */}
          <Section>
            <Text style={sectionTitle}>📊 Your Dimension Breakdown</Text>
            {dimensionScores.map((dim, index) => (
              <div key={index} style={dimensionCard}>
                <Text style={dimensionName}>{dim.name}</Text>
                <div style={progressBar}>
                  <div style={{...progressFill, width: `${dim.percentage}%`}} />
                </div>
                <Text style={dimensionScore}>{dim.percentage}%</Text>
                
                <Text style={recommendationsTitle}>Recommendations:</Text>
                <ul style={recommendationsList}>
                  {dim.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} style={recommendationItem}>{rec}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              🚀 Ready to transform these insights into growth?
            </Text>
            <Button
              style={button}
              href="https://apexdigitalafrica.com/contact"
            >
              Schedule Your Free Strategy Session
            </Button>
            <Text style={smallText}>
              Our team will help you create a customized action plan based on your results.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Apex Digital Africa. All rights reserved.
            </Text>
            <Text style={footerText}>
              Need help? Reply to this email or visit apexdigitalafrica.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#1e40af',
};

const logo = {
  margin: '0 auto',
  marginBottom: '16px',
};

const title = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const scoreSection = {
  padding: '24px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#666',
};

const scoreCard = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const scoreNumber = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0',
};

const scoreLabel = {
  fontSize: '14px',
  color: '#666',
  margin: '8px 0',
};

const stageText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#059669',
  margin: '8px 0',
};

const sectionTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333',
  margin: '24px 24px 16px',
};

const dimensionCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 24px',
};

const dimensionName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333',
  margin: '0 0 8px 0',
};

const progressBar = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden',
  margin: '8px 0',
};

const progressFill = {
  height: '100%',
  backgroundColor: '#3b82f6',
};

const dimensionScore = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#3b82f6',
  margin: '4px 0 12px 0',
};

const recommendationsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#666',
  margin: '12px 0 8px 0',
};

const recommendationsList = {
  margin: '0',
  paddingLeft: '20px',
};

const recommendationItem = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '8px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 24px',
};

const ctaSection = {
  padding: '0 24px',
  textAlign: 'center' as const,
};

const ctaText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  margin: '16px 0',
};

const smallText = {
  fontSize: '14px',
  color: '#666',
  margin: '16px 0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

const footerText = {
  fontSize: '12px',
  color: '#999',
  margin: '4px 0',
};
