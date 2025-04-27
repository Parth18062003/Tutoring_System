import { useState, useCallback } from "react";

export interface Source {
  title: string;
  url: string;
  snippet?: string;
  name?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function getSources() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);

  const fetchSources = useCallback(async (query: string) => {
    try {
      const sourcesResponse = await fetch("/api/chatbot/get-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!sourcesResponse.ok) {
        if (sourcesResponse.status === 404) {
          setError("Sources not found");
        } else if (sourcesResponse.status === 403) {
          setError("Access forbidden while fetching sources");
        } else {
          setError("Failed to fetch sources");
        }
        return [];
      }

      const fetchedSources = await sourcesResponse.json();
      const sourcesArray = Array.isArray(fetchedSources) ? fetchedSources : [];

      return sourcesArray.map((source: any) => ({
        ...source,
        name: source.title || "Unknown Source",
      }));
    } catch (error) {
      console.error("Error fetching sources:", error);
      setError("An error occurred while fetching sources");
      return [];
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string): Promise<Source[]> => {
      if (!content.trim()) return [];
  
      try {
        setError(null);
        setIsLoading(true);
        setSources([]);
        setMessages((prev) => [...prev, { role: "user", content }]);
  
        const fetchedSources = await fetchSources(content);
        setSources(fetchedSources);
        return fetchedSources; // ✅ Return it here
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
        return []; // Return empty array on error
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSources]
  );
  

  return {
    messages,
    isLoading,
    error,
    sources,
    sendMessage,
  };
}
