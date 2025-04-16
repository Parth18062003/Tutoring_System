"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAssessmentHistory } from "@/lib/assessment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Search,
  ArrowUpDown,
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  Award,
  X,
  BarChart,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { AssessmentHistory } from "@/types/assessment-types";

export default function AssessmentHistoryPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score" | "topic" | "questions" | "mastery">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month" | "year">("all");
  const [activeView, setActiveView] = useState<"all" | "completed" | "pending">("all");
  const [minQuestions, setMinQuestions] = useState<number | null>(null);
  const [maxQuestions, setMaxQuestions] = useState<number | null>(null);
  const [minMasteryChange, setMinMasteryChange] = useState<number | null>(null); // e.g., -10
  const [maxMasteryChange, setMaxMasteryChange] = useState<number | null>(null); // e.g., +15
  
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const history = await getAssessmentHistory();
        setAssessments(history);
      } catch (error) {
        console.error("Failed to load assessment history:", error);
        toast.error("Could not load your assessment history");
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, []);

  // Extract unique subjects and topics for filters
  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(assessments.map(a => a.subject)));
    return uniqueSubjects.sort();
  }, [assessments]);
  
  const topics = useMemo(() => {
    let topicsList = assessments;
    if (selectedSubject) {
      topicsList = assessments.filter(a => a.subject === selectedSubject);
    }
    const uniqueTopics = Array.from(new Set(topicsList.map(a => a.topic)));
    return uniqueTopics.sort();
  }, [assessments, selectedSubject]);

  // Stats data
  const stats = useMemo(() => {
    const completed = assessments.filter(a => a.completed).length;
    const totalScore = assessments.reduce((sum, a) => sum + (a.score || 0), 0);
    const avgScore = completed > 0 ? totalScore / completed : 0;
    const masteryGain = assessments.reduce((sum, a) => {
      if (a.mastery_after && a.mastery_before) {
        return sum + (a.mastery_after - a.mastery_before);
      }
      return sum;
    }, 0);
    
    return {
      total: assessments.length,
      completed,
      avgScore,
      masteryGain
    };
  }, [assessments]);

  const handleSort = (column: "date" | "score" | "topic" | "questions" | "mastery") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };
  
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedTopic(""); // Reset topic when subject changes
  };
  
  const handleTimeRangeChange = (value: "all" | "week" | "month" | "year") => {
    setTimeRange(value);
  };
  
  const resetFilters = () => {
    setSelectedSubject("All Subjects");
    setSelectedTopic("All Topics");
    setTimeRange("all");
    setSearchTerm("");
  };

  const filteredAssessments = assessments
  .filter((assessment) => {
    // Text search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !assessment.topic.toLowerCase().includes(searchLower) &&
        !assessment.subject.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Subject filter
    if (
      selectedSubject &&
      selectedSubject !== "All Subjects" &&
      assessment.subject !== selectedSubject
    ) {
      return false;
    }

    // Topic filter
    if (
      selectedTopic &&
      selectedTopic !== "All Topics" &&
      assessment.topic !== selectedTopic
    ) {
      return false;
    }

    // Time range filter
    if (timeRange !== "all") {
      const assessmentDate = new Date(
        assessment.completed_at || assessment.created_at
      );
      const now = new Date();
      switch (timeRange) {
        case "week":
          if (assessmentDate < subDays(now, 7)) return false;
          break;
        case "month":
          if (assessmentDate < subDays(now, 30)) return false;
          break;
        case "year":
          if (assessmentDate < subDays(now, 365)) return false;
          break;
      }
    }

    // Tab filters
    if (activeView === "completed" && !assessment.completed) {
      return false;
    }
    if (activeView === "pending" && assessment.completed) {
      return false;
    }

    // Mastery change filter
    const masteryChange =
      (assessment.mastery_after ?? 0) - (assessment.mastery_before ?? 0);
    const masteryChangePercent = masteryChange * 100;

    if (
      minMasteryChange !== null &&
      masteryChangePercent < minMasteryChange
    ) {
      return false;
    }

    if (
      maxMasteryChange !== null &&
      masteryChangePercent > maxMasteryChange
    ) {
      return false;
    }

    // Question count filter
    const questionCount = assessment.question_count || 0;

    if (minQuestions !== null && questionCount < minQuestions) {
      return false;
    }

    if (maxQuestions !== null && questionCount > maxQuestions) {
      return false;
    }

    return true;
  })
  .sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    if (sortBy === "date") {
      return (
        direction *
        (new Date(a.completed_at || a.created_at).getTime() -
          new Date(b.completed_at || b.created_at).getTime())
      );
    }

    if (sortBy === "score") {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      return direction * (scoreA - scoreB);
    }

    if (sortBy === "topic") {
      return direction * a.topic.localeCompare(b.topic);
    }

    if (sortBy === "questions") {
      return direction * ((a.question_count || 0) - (b.question_count || 0));
    }

    if (sortBy === "mastery") {
      const changeA = (a.mastery_after ?? 0) - (a.mastery_before ?? 0);
      const changeB = (b.mastery_after ?? 0) - (b.mastery_before ?? 0);
      return direction * (changeA - changeB);
    }

    return 0;
  });

  
  const viewAssessment = (assessmentId: string) => {
    router.push(`/learning/assessment/history/${assessmentId}`);
  };
  
  const getScoreColor = (score?: number) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="container p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assessment History</h1>
            <p className="text-muted-foreground text-sm">
              Track your progress and review past assessments
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assessments..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <div className="grid gap-3 p-2">
                <div className="space-y-1 text-sm">
                  <h4 className="font-medium leading-none">Time Period</h4>
                  <Select value={timeRange} onValueChange={(v) => handleTimeRangeChange(v as any)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 text-sm">
                  <h4 className="font-medium leading-none">Sort By</h4>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="topic">Topic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="ghost" onClick={resetFilters} className="h-8 mt-1">
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reset Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Quick Stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-muted/30">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Assessments</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-primary/10 rounded-full p-2">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
              <div className="bg-green-500/10 rounded-full p-2">
                <Award className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Average Score</p>
                <p className="text-xl font-bold">{Math.round(stats.avgScore)}%</p>
              </div>
              <div className="bg-amber-500/10 rounded-full p-2">
                <BarChart className="h-4 w-4 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Mastery Gain</p>
                <div className="flex items-center text-xl font-bold">
                  {stats.masteryGain > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-0.5 text-green-500" />
                      <span className="text-green-600">+{(stats.masteryGain * 100).toFixed(1)}%</span>
                    </>
                  ) : stats.masteryGain < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 mr-0.5 text-red-500" />
                      <span className="text-red-500">{(stats.masteryGain * 100).toFixed(1)}%</span>
                    </>
                  ) : (
                    <span>0%</span>
                  )}
                </div>
              </div>
              <div className="bg-blue-500/10 rounded-full p-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filter Panel */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Subjects">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder={selectedSubject ? "Filter by Topic" : "Select a subject first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All topics">All Topics</SelectItem>
              {topics.map(topic => (
                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {(selectedSubject || selectedTopic || searchTerm || timeRange !== "all") && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="shrink-0"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Assessment History Table/Cards */}
      <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setActiveView(v as any)}>
        <TabsList className="mb-2">
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="outline">{assessments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            <Badge variant="outline">{assessments.filter(a => a.completed).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            <Badge variant="outline">{assessments.filter(a => !a.completed).length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {renderContent()}
        </TabsContent>
        <TabsContent value="completed" className="mt-0">
          {renderContent()}
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
  
  function renderContent() {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (filteredAssessments.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">No assessments found</h3>
            <p className="text-muted-foreground mb-4">
              {(selectedSubject || selectedTopic || searchTerm || timeRange !== "all") 
                ? "No results match your current filters" 
                : "You haven't taken any assessments yet"}
            </p>
            <div className="flex gap-2">
              {(selectedSubject || selectedTopic || searchTerm || timeRange !== "all") && (
                <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
              )}
              <Button onClick={() => router.push("/learning/assessment")}>Start an Assessment</Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // For small screens, use responsive cards
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    
    if (isSmallScreen) {
      return (
        <div className="space-y-3">
          {filteredAssessments.map((assessment) => {
            const masteryChange = assessment.mastery_after && assessment.mastery_before
              ? assessment.mastery_after - assessment.mastery_before
              : 0;
              
            return (
              <Card key={assessment.assessment_id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex justify-between items-stretch">
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium line-clamp-1">{assessment.topic}</h3>
                        {assessment.completed ? (
                          <Badge variant={assessment.score && assessment.score >= 70 ? "default" : "secondary"} className={getScoreColor(assessment.score)}>
                            {assessment.score !== undefined ? `${Math.round(assessment.score)}%` : "N/A"}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Incomplete</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-col text-sm space-y-1">
                        <span className="text-muted-foreground">{assessment.subject}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(assessment.completed_at || assessment.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <Button 
                        className="h-full rounded-none rounded-r-lg px-4"
                        onClick={() => viewAssessment(assessment.assessment_id)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }
    
    // For larger screens, use the table
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("topic")} className="cursor-pointer">
                  Topic 
                  {sortBy === "topic" && (
                    <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  )}
                </TableHead>
                <TableHead>Subject</TableHead>
                <TableHead  onClick={() => handleSort("questions")} className="cursor-pointer">Questions</TableHead>
                <TableHead onClick={() => handleSort("score")} className="cursor-pointer">
                  Score
                  {sortBy === "score" && (
                    <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  )}
                </TableHead>
                <TableHead  onClick={() => handleSort("mastery")} className="cursor-pointer">Mastery Change</TableHead>
                <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                  Date
                  {sortBy === "date" && (
                    <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  )}
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => {
                const masteryChange = assessment.mastery_after && assessment.mastery_before
                  ? assessment.mastery_after - assessment.mastery_before
                  : 0;
                  
                return (
                  <TableRow key={assessment.assessment_id}>
                    <TableCell className="font-medium">{assessment.topic}</TableCell>
                    <TableCell>{assessment.subject}</TableCell>
                    <TableCell>{assessment.question_count}</TableCell>
                    <TableCell>
                      {assessment.completed ? (
                        <Badge variant="default" className={getScoreColor(assessment.score)}>
                          {assessment.score !== undefined ? `${Math.round(assessment.score)}%` : "N/A"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Incomplete</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {assessment.completed && masteryChange !== 0 ? (
                        masteryChange > 0 ? (
                          <Badge className="bg-green-600 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{(masteryChange * 100).toFixed(1)}%
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {(masteryChange * 100).toFixed(1)}%
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline">No change</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(assessment.completed_at || assessment.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => viewAssessment(assessment.assessment_id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
}