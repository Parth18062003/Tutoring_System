"use client";

import {
  AssessmentHistoryData,
  HeatmapData,
  LearningPathData,
  StudentAnalyticsSummaryData,
} from "@/types/analytics-types";
import { MetricCard } from "./MetricCard";
import { MasteryHeatmap } from "./MasteryHeatmap";
import { BubbleChartStrategyComparison } from "../charts/BubbleChartStrategyComparison";
import { AreaChartLearningTrajectory } from "../charts/AreaChartLearningTrajectory";
import { StagnationAreaCard } from "./StagnationAreaCard";
import { PieChartTimeDistribution } from "../charts/PieChartTimeDistribution";
import { RadarChartTopicMastery } from "../charts/RadarChartTopicMastery";
import { TimePatternVisualizer } from "../time-pattern-visualizer";
import { AssessmentHistoryTable } from "./AssessmentHistoryTable";
import { LearningPathTable } from "./LearningPathTable";
import { PaginationControls } from "../pagination-controls";

// Import analytics API functions
import {
  getStudentAnalyticsSummary,
  getStudentLearningPath,
  getStudentAssessmentHistory,
  getStudentMasteryHeatmap,
} from "@/lib/analytics-api";
import { Button } from "@/components/ui/button";
import { Activity, Award, Clock, RefreshCw, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReturnButtons from "@/components/return-buttons";

// Define page limits for pagination
const PATH_PAGE_LIMIT = 10;
const ASSESSMENT_PAGE_LIMIT = 10;

interface AnalyticsDashboardProps {
  userId: string;
}

export default function AnalyticsDashboard({
  userId,
}: AnalyticsDashboardProps) {
  // State for data
  const [summaryData, setSummaryData] =
    useState<StudentAnalyticsSummaryData | null>(null);
  const [pathData, setPathData] = useState<LearningPathData | null>(null);
  const [assessmentData, setAssessmentData] =
    useState<AssessmentHistoryData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);

  // State for pagination
  const [pathPage, setPathPage] = useState(1);
  const [assessmentPage, setAssessmentPage] = useState(1);

  // State for loading and errors
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pathLoading, setPathLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Data fetch functions using analytics-api
  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    try {
      setSummaryLoading(true);
      const data = await getStudentAnalyticsSummary(userId);
      setSummaryData(data);
    } catch (error) {
      setFetchError(
        `Error fetching summary data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [userId]);

  const fetchPath = useCallback(
    async (page: number) => {
      if (!userId) return;
      try {
        setPathLoading(true);
        const data = await getStudentLearningPath(
          userId,
          page,
          PATH_PAGE_LIMIT
        );
        setPathData(data as LearningPathData);
      } catch (error) {
        console.error("Error fetching learning path:", error);
      } finally {
        setPathLoading(false);
      }
    },
    [userId]
  );

  const fetchAssessments = useCallback(
    async (page: number) => {
      if (!userId) return;
      try {
        setAssessmentLoading(true);
        const data = await getStudentAssessmentHistory(
          userId,
          page,
          ASSESSMENT_PAGE_LIMIT
        );
        setAssessmentData(data as AssessmentHistoryData);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setAssessmentLoading(false);
      }
    },
    [userId]
  );

  const fetchHeatmap = useCallback(async () => {
    if (!userId) return;
    try {
      setHeatmapLoading(true);
      const data = await getStudentMasteryHeatmap(userId);
      setHeatmapData(data);
    } catch (error) {
      console.error("Error fetching heatmap:", error);
    } finally {
      setHeatmapLoading(false);
    }
  }, [userId]);

  // Initial data load
  const fetchAllInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    await Promise.all([
      fetchSummary(),
      fetchPath(1),
      fetchAssessments(1),
      fetchHeatmap(),
    ]);
    setIsInitialLoading(false);
  }, [fetchSummary, fetchPath, fetchAssessments, fetchHeatmap]);

  useEffect(() => {
    if (userId) {
      fetchAllInitialData();
    }
  }, [userId, fetchAllInitialData]);

  // Pagination handlers
  const handlePathPageChange = (newPage: number) => {
    setPathPage(newPage);
    fetchPath(newPage);
  };

  const handleAssessmentPageChange = (newPage: number) => {
    setAssessmentPage(newPage);
    fetchAssessments(newPage);
  };

  // Refresh handler
  const handleRefreshAll = () => {
    fetchAllInitialData();
  };

  // Helper format functions
  const formatNum = (num: number | null | undefined, digits = 1): string =>
    num != null && !isNaN(num) ? num.toFixed(digits) : "N/A";

  const formatDuration = (seconds: number | null | undefined): string => {
    if (seconds == null || isNaN(Number(seconds))) return "N/A";

    const s = Number(seconds);
    if (s < 60) return `${Math.round(s)}s`;
    if (s < 3600) return `${Math.round(s / 60)}m`;
    return `${(s / 3600).toFixed(1)}h`;
  };

  const getDayName = (dayIndex?: number | null): string => {
    if (dayIndex == null || isNaN(Number(dayIndex))) return "N/A";

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days[dayIndex] || "N/A";
  };

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <h2 className="text-xl font-medium">Loading analytics data...</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we fetch your learning analytics.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || !summaryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4 max-w-lg">
          <h2 className="text-xl font-medium text-destructive">
            Unable to load analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {fetchError ||
              "An unknown error occurred while loading the analytics data."}
          </p>
          <Button onClick={handleRefreshAll} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Destructure summary data
  const {
    mastery_summary,
    learning_velocity,
    strategy_effectiveness,
    stagnation_areas,
    time_patterns,
    learning_trajectory,
  } = summaryData;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="p-4 md:p-6 space-y-6">
        {/* Dashboard Header with Refresh Button */}
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-x-4">
            <ReturnButtons />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Learning Analytics
              </h1>
              <span className="text-muted-foreground">
                Insights from your learning journey
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={summaryLoading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${summaryLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Overall Mastery"
            value={`${formatNum(mastery_summary?.average ? mastery_summary.average * 100 : 0)}%`} // Fallback to 0 if null/undefined
            description={`${mastery_summary?.count || 0} topics tracked`}
            icon={<Award className="h-4 w-4 text-foreground/60" />}
            loading={summaryLoading}
            tooltip="Average mastery level across all topics"
          />

          <MetricCard
            title="Learning Velocity"
            value={formatNum(
              learning_velocity?.average_velocity
                ? learning_velocity.average_velocity * 100
                : 0
            )} // Fallback to 0 if null/undefined
            description="Average gain per interaction"
            icon={<Zap className="h-4 w-4 text-foreground/60" />}
            trend="up"
            trendValue={`${formatNum(learning_velocity?.fastest_learning?.velocity ? learning_velocity.fastest_learning.velocity * 100 : 0)}%`} // Safe access with fallback
            loading={summaryLoading}
            tooltip="How quickly you gain mastery in topics over time"
          />

          <MetricCard
            title="Most Effective Strategy"
            value={
              strategy_effectiveness?.most_effective_strategies?.[0]?.strategy?.replace(
                "_",
                " "
              ) || "N/A"
            } // Fallback to "N/A" if null/undefined
            description={`${formatNum(strategy_effectiveness?.most_effective_strategies?.[0]?.avg_gain ? strategy_effectiveness.most_effective_strategies[0].avg_gain * 100 : 0)}% gain per use`} // Fallback to 0
            icon={<Activity className="h-4 w-4 text-foreground/60" />}
            loading={summaryLoading}
            tooltip="Learning strategy that has been most effective for you"
          />

          <MetricCard
            title="Session Patterns"
            value={formatDuration(time_patterns?.avg_session_duration_seconds)}
            description={`Most active: ${getDayName(time_patterns?.most_active_day ? Number(time_patterns.most_active_day) - 1 : null)}`}
            icon={<Clock className="h-4 w-4 text-foreground/60" />}
            loading={summaryLoading}
            tooltip="Your typical learning session patterns"
          />
        </div>

        {/* Mastery Visualization Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Mastery Heatmap */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">
                Topic Mastery Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              {heatmapData ? (
                <MasteryHeatmap
                  heatmapData={heatmapData}
                  loading={heatmapLoading}
                  className="w-full h-full min-h-[200px]"
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] bg-muted/20 rounded-md animate-pulse">
                  <p className="text-sm text-muted-foreground">
                    Loading heatmap...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strategy Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Strategy Effectiveness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BubbleChartStrategyComparison
                strategyData={strategy_effectiveness}
              />
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Learning Trajectory */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Learning Trajectory</CardTitle>
            </CardHeader>
            <CardContent>
              <AreaChartLearningTrajectory
                data={learning_trajectory}
                showHeader={false}
              />
            </CardContent>
          </Card>

          {/* Areas Needing Focus */}
          <StagnationAreaCard stagnationAreas={stagnation_areas} />
        </div>

        {/* Additional Charts and Activity Data */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChartTimeDistribution
                timePatterns={time_patterns}
                donut={true}
                title=""
              />
            </CardContent>
          </Card>

          {/* Topic Mastery Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChartTopicMastery masteryData={mastery_summary} />
            </CardContent>
          </Card>

          {/* Hourly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Daily Activity</p>
                <TimePatternVisualizer
                  timePatterns={time_patterns}
                  type="day"
                  showLabels={true}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Hourly Activity</p>
                <TimePatternVisualizer
                  timePatterns={time_patterns}
                  type="hour"
                  showLabels={false}
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historical Data Tables */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Assessment History */}
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-base">Assessment History</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <AssessmentHistoryTable
                assessments={assessmentData?.items || []}
                isLoading={assessmentLoading}
              />
            </CardContent>
            {assessmentData && (
              <PaginationControls
                currentPage={assessmentPage}
                totalPages={Math.ceil(
                  assessmentData.total / ASSESSMENT_PAGE_LIMIT
                )}
                onPageChange={handleAssessmentPageChange}
                isLoading={assessmentLoading}
                itemCount={assessmentData.items.length}
                itemsPerPage={ASSESSMENT_PAGE_LIMIT}
                totalItems={assessmentData.total}
              />
            )}
          </Card>

          {/* Learning Path Timeline */}
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-base">Learning Path</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <LearningPathTable
                pathItems={pathData?.items || []}
                isLoading={pathLoading}
              />
            </CardContent>
            {pathData && (
              <PaginationControls
                currentPage={pathPage}
                totalPages={Math.ceil(pathData.total / PATH_PAGE_LIMIT)}
                onPageChange={handlePathPageChange}
                isLoading={pathLoading}
                itemCount={pathData.items.length}
                itemsPerPage={PATH_PAGE_LIMIT}
                totalItems={pathData.total}
              />
            )}
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
