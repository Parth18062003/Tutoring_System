import AssessmentResultView from '@/components/assessment/assessment-result-view';

const AssessmentHistoryDetailPage: React.FC<{ params: { assessmentId: string } }> = ({ params }) => {
  const { assessmentId } = params;

  return <AssessmentResultView assessmentId={assessmentId} />;
};

export default AssessmentHistoryDetailPage;
