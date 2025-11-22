// app/whatsapp-funnel/page.tsx
import WhatsAppFunnelScorecard from '@/components/WhatsAppFunnelScorecard';
import type { WhatsAppFunnelSnapshot } from '@/lib/whatsappTypes';

const mockWhatsAppSnapshot: WhatsAppFunnelSnapshot = {
  id: 'wa-demo',
  businessName: 'FinConnect SaaS – Nigeria',
  periodLabel: 'Last 7 Days',
  currency: '₦',
  estimatedRevenue: 9500000,
  stages: [
    {
      id: 'new_inbound',
      label: 'New Inbound Chats',
      input: 1200,
      output: 900,
      avgResponseMinutes: 3,
      targetResponseMinutes: 5,
      targetConversion: 0.7,
    },
    {
      id: 'first_response',
      label: 'First Response → Active Conversation',
      input: 900,
      output: 650,
      avgResponseMinutes: 7,
      targetResponseMinutes: 5,
      targetConversion: 0.75,
    },
    {
      id: 'qualified',
      label: 'Qualified Lead',
      input: 650,
      output: 260,
      avgResponseMinutes: 10,
      targetResponseMinutes: 8,
      targetConversion: 0.4,
    },
    {
      id: 'booking',
      label: 'Call / Demo Booked',
      input: 260,
      output: 110,
      avgResponseMinutes: 12,
      targetResponseMinutes: 10,
      targetConversion: 0.45,
    },
    {
      id: 'closed_won',
      label: 'Closed Won',
      input: 110,
      output: 38,
      avgResponseMinutes: 15,
      targetResponseMinutes: 15,
      targetConversion: 0.35,
    },
  ],
};

export default function WhatsAppFunnelPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <WhatsAppFunnelScorecard snapshot={mockWhatsAppSnapshot} />
      </div>
    </main>
  );
}
