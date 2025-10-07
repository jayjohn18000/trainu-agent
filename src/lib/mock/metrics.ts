import { getDB } from './db';

export interface MetricsTiles {
  paidToBooked72h: number;
  showRate: number;
  newMembers: number;
  affiliateGMV: number;
  creatorROI: number;
}

export interface TrendData {
  label: string;
  value: number;
}

export function computeMetrics(): MetricsTiles {
  const db = getDB();
  const latest = db.metrics[db.metrics.length - 1];
  
  if (latest) {
    return {
      paidToBooked72h: latest.paidToBooked72h,
      showRate: latest.showRate,
      newMembers: latest.newMembers,
      affiliateGMV: latest.affiliateGMV,
      creatorROI: latest.creatorROI,
    };
  }
  
  // Fallback computation
  const now = Date.now();
  const last7d = now - 7 * 24 * 60 * 60 * 1000;
  const last30d = now - 30 * 24 * 60 * 60 * 1000;
  
  // Paid → Booked (mock: 72% of paid members booked within 72h)
  const recentPurchases = db.purchases.filter(
    p => p.status === 'paid' && new Date(p.purchasedAt).getTime() > last7d
  );
  const paidToBooked72h = recentPurchases.length > 0 ? 72 : 0;
  
  // Show-rate (mock: 92% show rate)
  const recentSessions = db.sessions.filter(
    s => new Date(s.date).getTime() > last30d
  );
  const completedSessions = recentSessions.filter(s => s.status === 'completed').length;
  const showRate = recentSessions.length > 0 
    ? Math.round((completedSessions / recentSessions.length) * 100) 
    : 92;
  
  // New members (last 7 days)
  const newMembers = db.purchases.filter(
    p => p.status === 'paid' && new Date(p.purchasedAt).getTime() > last7d
  ).length;
  
  // Affiliate GMV (last 30 days)
  const affiliateGMV = db.purchases
    .filter(p => p.source === 'affiliate' && new Date(p.purchasedAt).getTime() > last30d)
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Creator ROI (mock calculation)
  const totalPayouts = db.payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 1);
  const creatorROI = totalPayouts > 0 ? 2.8 : 0;
  
  return {
    paidToBooked72h,
    showRate,
    newMembers,
    affiliateGMV,
    creatorROI,
  };
}

export function getTrendData(): {
  paidToBooked: TrendData[];
  showRate: TrendData[];
} {
  const db = getDB();
  
  if (db.metrics.length >= 2) {
    return {
      paidToBooked: db.metrics.map(m => ({
        label: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m.paidToBooked72h,
      })),
      showRate: db.metrics.map(m => ({
        label: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m.showRate,
      })),
    };
  }
  
  // Fallback mock trends
  return {
    paidToBooked: [
      { label: 'Week 1', value: 68 },
      { label: 'Week 2', value: 72 },
    ],
    showRate: [
      { label: 'Week 1', value: 88 },
      { label: 'Week 2', value: 92 },
    ],
  };
}

export function getCreatorMetrics() {
  const db = getDB();
  const last30d = Date.now() - 30 * 24 * 60 * 60 * 1000;
  
  const recentDeliverables = db.deliverables.filter(
    d => d.submittedAt && new Date(d.submittedAt).getTime() > last30d
  );
  
  const acceptedCount = recentDeliverables.filter(d => d.status === 'accepted').length;
  const acceptanceRate = recentDeliverables.length > 0
    ? Math.round((acceptedCount / recentDeliverables.length) * 100)
    : 0;
  
  const totalPayouts = db.payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const roi = totalPayouts > 0 ? 2.8 : 0;
  
  return {
    ugcCount: recentDeliverables.length,
    acceptanceRate,
    roi,
  };
}
