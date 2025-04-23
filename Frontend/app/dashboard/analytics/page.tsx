import AnalyticsDashboard from '@/components/analytics/core-components/AnalyticsDashboard';
import { getUserId } from '@/lib/actions';

export default async function AnalyticsDashboardPage() {
  const { userId } = await getUserId();

  if (!userId) {
    return <div className="p-6">Please log in to view analytics.</div>;
  }

  return <AnalyticsDashboard userId={userId} />;
}
