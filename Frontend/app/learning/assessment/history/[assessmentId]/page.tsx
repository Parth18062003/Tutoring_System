import AssessmentResultView from '@/components/assessment/assessment-result-view';

const AssessmentHistoryDetailPage: React.FC<{ params: { assessmentId: string } }> = async props => {
  const params = await props.params;
  const { assessmentId } = params;

  return <AssessmentResultView assessmentId={assessmentId} />;
};

export default AssessmentHistoryDetailPage;
