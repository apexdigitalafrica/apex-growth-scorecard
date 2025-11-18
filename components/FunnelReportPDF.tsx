// components/FunnelReportPDF.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
  Font,
  Svg,
  Path,
} from '@react-pdf/renderer';
import { FunnelSnapshot } from '@/lib/funnelTypes';
import { computeFunnelScore, generateFunnelInsights, estimateLeakImpact } from '@/lib/funnelUtils';

// Register premium fonts (optional but elite)
Font.register({
  family: 'Geist',
  src: 'https://assets.vercel.com/raw/upload/v1682349483/fonts/geist-sans.woff2',
});

const styles = StyleSheet.create({
  page: { backgroundColor: '#0f172a', padding: 40, fontFamily: 'Geist' },
  header: { marginBottom: 30, alignItems: 'center' },
  logo: { width: 60, height: 60, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#10b981',
    margin: '20 0',
  },
  scoreText: { fontSize: 64, fontWeight: 900, color: '#10b981' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#06b6d4', marginBottom: 12 },
  text: { fontSize: 12, color: '#e2e8f0', lineHeight: 1.6, marginBottom: 8 },
  highlight: { fontSize: 14, fontWeight: 700, color: '#10b981' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 10, color: '#475569' },
});

export const FunnelReportPDF = ({ snapshot }: { snapshot: FunnelSnapshot }) => {
  const summary = computeFunnelScore(snapshot);
  const insights = generateFunnelInsights(snapshot, summary);
  const impact = estimateLeakImpact(snapshot, summary);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src="/logo-white.png" style={styles.logo} />
          <Text style={styles.title}>Funnel Scorecard Report</Text>
          <Text style={styles.subtitle}>{snapshot.businessName} • {snapshot.periodLabel}</Text>
        </View>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{summary.overallScore}</Text>
          <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>/100</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.text}>
            Overall Funnel Score: <Text style={styles.highlight}>{summary.overallScore}/100</Text>
          </Text>
          <Text style={styles.text}>
            Biggest Leak: <Text style={styles.highlight}>{summary.biggestLeakStage?.label || 'N/A'}</Text>
          </Text>
          {impact?.estimatedExtraRevenue && (
            <Text style={styles.text}>
              Revenue Opportunity: <Text style={styles.highlight}>
                {snapshot.currency}{Math.round(impact.estimatedExtraRevenue).toLocaleString()}
              </Text>
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Powered Insights</Text>
          {insights.slice(0, 4).map((insight, i) => (
            <Text key={i} style={styles.text}>• {insight.title}: {insight.body}</Text>
          ))}
        </View>

        <Text style={styles.footer}>
          Powered by Apex Growth Intelligence • apexdigitalafrica.com • Confidential Report
        </Text>
      </Page>
    </Document>
  );
};

// Function to trigger download
export const generateAndDownloadPDF = async (snapshot: FunnelSnapshot) => {
  const blob = await pdf(<FunnelReportPDF snapshot={snapshot} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${snapshot.businessName.replace(/\s+/g, '-')}-Funnel-Report-Apex.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};