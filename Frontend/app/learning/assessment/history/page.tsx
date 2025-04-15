// app/(dashboard)/assessment/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssessmentHistory } from "@/lib/assessment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { AssessmentHistory } from "@/types/assessment-types";

export default function AssessmentHistoryPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score" | "topic">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  const handleSort = (column: "date" | "score" | "topic") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const filteredAssessments = assessments
    .filter(assessment => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        assessment.topic.toLowerCase().includes(searchLower) ||
        assessment.subject.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      
      if (sortBy === "date") {
        return direction * (new Date(a.completed_at || a.created_at).getTime() - 
                           new Date(b.completed_at || b.created_at).getTime());
      }
      
      if (sortBy === "score") {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return direction * (scoreA - scoreB);
      }
      
      // Sort by topic
      return direction * a.topic.localeCompare(b.topic);
    });

  const viewAssessment = (assessmentId: string) => {
    router.push(`/assessment/${assessmentId}`);
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Assessment History</h1>
        </div>
        
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by topic or subject..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No assessments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No results match your search terms" : "You haven't taken any assessments yet"}
            </p>
            <Button onClick={() => router.push("/assessment")}>Start an Assessment</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">Your Assessment History</CardTitle>
          </CardHeader>
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
                  <TableHead>Questions</TableHead>
                  <TableHead onClick={() => handleSort("score")} className="cursor-pointer">
                    Score
                    {sortBy === "score" && (
                      <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                    )}
                  </TableHead>
                  <TableHead>Mastery Change</TableHead>
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
                          <Badge variant={assessment.score && assessment.score >= 70 ? "default" : "secondary"}>
                            {assessment.score !== undefined ? `${Math.round(assessment.score)}%` : "N/A"}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Incomplete</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {assessment.completed && masteryChange !== 0 ? (
                          masteryChange > 0 ? (
                            <Badge className="bg-green-600">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{(masteryChange * 100).toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
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
                          variant="outline"
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
      )}
    </div>
  );
}