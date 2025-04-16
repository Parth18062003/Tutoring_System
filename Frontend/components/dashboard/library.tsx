"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSavedContentList, deleteSavedContent } from "@/lib/saved-content";
import { SavedContentItem } from "@/types/api-types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Trash2, Filter, X, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ReturnButtons from "../return-buttons";

export default function Library() {
  const router = useRouter();
  const [savedContent, setSavedContent] = useState<SavedContentItem[]>([]);
  const [allContent, setAllContent] = useState<SavedContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Extract unique subjects and topics for filtering
  const subjects = useMemo(() => {
    if (!allContent.length) return [];
    return Array.from(new Set(allContent.map((item) => item.subject))).sort();
  }, [allContent]);

  // Filter topics based on selected subject
  const topics = useMemo(() => {
    if (!allContent.length) return [];

    let filteredContent = allContent;
    if (selectedSubject) {
      filteredContent = allContent.filter(
        (item) => item.subject === selectedSubject
      );
    }

    return Array.from(
      new Set(filteredContent.map((item) => item.topic))
    ).sort();
  }, [allContent, selectedSubject]);

  // Load content initially
  useEffect(() => {
    loadAllSavedContent();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [activeTab, selectedSubject, selectedTopic, searchQuery, allContent]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadAllSavedContent = async () => {
    setLoading(true);
    try {
      const contentList = await getSavedContentList();
      setAllContent(contentList);
      setSavedContent(contentList); // Initially show all content
    } catch (error) {
      console.error("Failed to load saved content:", error);
      toast.error("Unable to load your saved content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!allContent.length) return;

    let filteredContent = [...allContent];

    // Filter by content type
    if (activeTab !== "all") {
      filteredContent = filteredContent.filter(
        (item) => item.content_type === activeTab
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredContent = filteredContent.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(query)) ||
          (item.topic && item.topic.toLowerCase().includes(query)) ||
          (item.subject && item.subject.toLowerCase().includes(query))
      );
    }

    // Filter by subject
    if (selectedSubject) {
      filteredContent = filteredContent.filter(
        (item) => item.subject === selectedSubject
      );
    }

    // Filter by topic
    if (selectedTopic) {
      filteredContent = filteredContent.filter(
        (item) => item.topic === selectedTopic
      );
    }

    setSavedContent(filteredContent);
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value === "all_subjects" ? null : value);
    setSelectedTopic(null); // Reset topic when subject changes
  };

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value === "all_topics" ? null : value);
  };

  const clearFilters = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setActiveTab("all");
    setSearchQuery("");
  };

  const handleViewContent = (contentId: string, contentType: string) => {
    router.push(`/dashboard/library/${contentId}`);
  };

  const handleDeleteContent = async (contentId: string) => {
    setIsDeleting(contentId);
    try {
      await deleteSavedContent(contentId);

      // Update both content lists
      const updatedContent = allContent.filter(
        (item) => item.content_id !== contentId
      );
      setAllContent(updatedContent);
      setSavedContent(
        savedContent.filter((item) => item.content_id !== contentId)
      );

      toast.info(
        "Content Deleted. The saved content has been removed from your library."
      );
    } catch (error) {
      console.error("Failed to delete content:", error);
      toast.error("Delete Failed. Unable to delete content. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "lesson":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const activeFiltersCount = [
    activeTab !== "all",
    !!selectedSubject,
    !!selectedTopic,
    !!searchQuery.trim(),
  ].filter(Boolean).length;

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <ReturnButtons/>
        <h1 className="text-2xl font-bold mt-10">My Learning Library</h1>
      </div>
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full lg:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="lesson">Lessons</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end gap-3">
            <div className="w-full sm:w-48 shrink-0">
              <Select
                value={selectedSubject || "all_subjects"}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_subjects">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 shrink-0">
              <Select
                value={selectedTopic || "all_topics"}
                onValueChange={handleTopicChange}
                disabled={!selectedSubject || topics.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_topics">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, topic or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="px-2 py-1">
              {activeFiltersCount}{" "}
              {activeFiltersCount === 1 ? "filter" : "filters"} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-muted rounded w-20"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : savedContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedContent.map((item) => (
            <Card key={item.content_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {getContentIcon(item.content_type)}
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {item.content_type}
                  </span>
                </div>
                <CardTitle className="text-lg mt-2 line-clamp-1">
                  {item.title || item.topic}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {item.subject}
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <div>Topic: {item.topic}</div>
                  <div>
                    Strategy: {item.metadata?.strategy || "Not specified"}
                  </div>
                  <div>Saved on: {format(new Date(item.created_at), "PP")}</div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between pt-3 border-t">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleViewContent(item.content_id, item.content_type)
                  }
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDeleting === item.content_id}
                  onClick={() => handleDeleteContent(item.content_id)}
                >
                  {isDeleting === item.content_id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          {activeFiltersCount > 0 ? (
            <>
              <div className="text-4xl">🔍</div>
              <h3 className="text-lg font-medium">No matching content</h3>
              <p className="text-muted-foreground">
                Try changing your filter selections or clear all filters.
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <div className="text-4xl">📚</div>
              <h3 className="text-lg font-medium">No saved content yet</h3>
              <p className="text-muted-foreground">
                Save lessons and learning content to access them anytime.
              </p>
              <Button
                variant="default"
                onClick={() => router.push("/learning")}
                className="mt-4"
              >
                Start Learning
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
