/* import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  query: z.string(),
});

interface TavilyResult {
  title: string;
  url: string;
  content?: string; 
  score?: number;
  raw_content?: string;
}

interface TavilyResponse {
  answer?: string;
  query?: string;
  response_time?: number;
  results?: TavilyResult[];
  error?: string; 
}

interface FormattedResult {
  title: string;
  url: string;
}

export async function POST(request: Request) {
  let validatedQuery: { query: string };
  try {
    const body = await request.json();
    validatedQuery = querySchema.parse(body);
  } catch (error) {
    console.error("Validation Error:", error);
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (!tavilyApiKey) {
    console.error("Tavily API key is not set.");
    return NextResponse.json(
      { error: "API key for search is missing." },
      { status: 500 },
    );
  }

  const tavilyUrl = "https://api.tavily.com/search";
  const tavilyPayload = {
    api_key: tavilyApiKey,
    query: validatedQuery.query,
    search_depth: "basic", 
    include_answer: false, 
    include_images: false,
    include_raw_content: false,
    max_results: 6, 
  };

  try {
    const response = await fetch(tavilyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tavilyPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Tavily API request failed with status ${response.status}:`,
        errorBody,
      );
      return NextResponse.json(
        {
          error: `Search API request failed: ${response.statusText || "Unknown error"}`,
        },
        { status: response.status },
      );
    }

    const tavilyData: TavilyResponse = await response.json();

    if (tavilyData.error) {
       console.error("Tavily API returned an error:", tavilyData.error);
       return NextResponse.json({ error: `Search API error: ${tavilyData.error}` }, { status: 500 });
    }

    const formattedResults: FormattedResult[] = (tavilyData.results || [])
      .map((result) => ({
        title: result.title || "No Title", 
        url: result.url,
      }))
      .filter(result => result.url); 

     if (formattedResults.length === 0) {
       console.warn("Tavily search returned no usable results for query:", validatedQuery.query);
     }

    return NextResponse.json(formattedResults);

  } catch (error) {
    console.error("Error fetching sources from Tavily:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: `Failed to fetch search results: ${errorMessage}` },
      { status: 500 },
    );
  }
} */
  import { NextResponse } from "next/server";
  import { z } from "zod";
  
  // Define query schema
  const querySchema = z.object({
    query: z.string(),
  });
  
  // Configuration
  const CONFIG = {
    // Which search engine to use: "tavily", "serper", or "fallback" (try tavily, fallback to serper)
    searchEngine: process.env.SEARCH_ENGINE || "serper", 
    // Sites to exclude from results
    excludedSites: ["youtube.com", "facebook.com", "twitter.com"],
    // Number of results to return
    maxResults: 6
  };
  
  // Tavily interface definitions
  interface TavilyResult {
    title: string;
    url: string;
    content?: string; 
    score?: number;
    raw_content?: string;
  }
  
  interface TavilyResponse {
    answer?: string;
    query?: string;
    response_time?: number;
    results?: TavilyResult[];
    error?: string; 
  }
  
  // Common result interface
  interface FormattedResult {
    title: string;
    url: string;
    snippet?: string;
  }
  
  // Main handler
  export async function POST(request: Request) {
    let validatedQuery: { query: string };
    try {
      const body = await request.json();
      validatedQuery = querySchema.parse(body);
    } catch (error) {
      console.error("Validation Error:", error);
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }
  
    // Choose search engine based on configuration
    switch (CONFIG.searchEngine.toLowerCase()) {
      case "serper":
        return await searchWithSerper(validatedQuery.query);
      case "tavily":
        return await searchWithTavily(validatedQuery.query);
      case "fallback":
      default:
        try {
          // Try Tavily first
          return await searchWithTavily(validatedQuery.query);
        } catch (error) {
          console.warn("Tavily search failed, falling back to Serper:", error);
          return await searchWithSerper(validatedQuery.query);
        }
    }
  }
  
  // Tavily search implementation
  async function searchWithTavily(query: string) {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
      console.error("Tavily API key is not set.");
      return NextResponse.json(
        { error: "API key for Tavily search is missing." },
        { status: 500 },
      );
    }
  
    const tavilyUrl = "https://api.tavily.com/search";
    const tavilyPayload = {
      api_key: tavilyApiKey,
      query: query,
      search_depth: "basic", 
      include_answer: false, 
      include_images: false,
      include_raw_content: false,
      max_results: CONFIG.maxResults, 
    };
  
    try {
      const response = await fetch(tavilyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tavilyPayload),
      });
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Tavily API request failed with status ${response.status}:`,
          errorBody,
        );
        return NextResponse.json(
          {
            error: `Tavily search API failed: ${response.statusText || "Unknown error"}`,
          },
          { status: response.status },
        );
      }
  
      const tavilyData: TavilyResponse = await response.json();
  
      if (tavilyData.error) {
        console.error("Tavily API returned an error:", tavilyData.error);
        return NextResponse.json({ error: `Tavily search error: ${tavilyData.error}` }, { status: 500 });
      }
  
      const formattedResults: FormattedResult[] = (tavilyData.results || [])
        .map((result) => ({
          title: result.title || "No Title", 
          url: result.url,
          snippet: result.content,
        }))
        .filter(result => {
          if (!result.url) return false;
          
          // Filter out excluded sites
          try {
            const url = new URL(result.url);
            return !CONFIG.excludedSites.some(site => url.hostname.includes(site));
          } catch {
            return true; // Keep results with invalid URLs
          }
        });
  
      if (formattedResults.length === 0) {
        console.warn("Tavily search returned no usable results for query:", query);
      }
  
      return NextResponse.json(formattedResults);
  
    } catch (error) {
      console.error("Error fetching sources from Tavily:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      throw error; // Rethrow for fallback handling
    }
  }
  
  // Serper search implementation
  async function searchWithSerper(query: string) {
    const SERPER_API_KEY = process.env.SERPER_API_KEY;
    if (!SERPER_API_KEY) {
      console.error("Serper API key is not set.");
      return NextResponse.json(
        { error: "API key for Serper search is missing." },
        { status: 500 },
      );
    }
  
    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: query,
          num: CONFIG.maxResults,
        }),
      });
  
      if (!response.ok) {
        console.error(`Serper API request failed with status ${response.status}`);
        return NextResponse.json(
          { error: `Serper search API failed: ${response.statusText || "Unknown error"}` },
          { status: response.status },
        );
      }
  
      const rawJSON = await response.json();
  
      // Define and validate the expected Serper response format
      const SerperJSONSchema = z.object({
        organic: z.array(z.object({ 
          title: z.string(), 
          link: z.string(),
          snippet: z.string().optional()
        })),
      });
  
      // Validate the response structure
      const data = SerperJSONSchema.parse(rawJSON);
  
      // Format results to match our expected structure
      const formattedResults: FormattedResult[] = data.organic
        .map(result => ({
          title: result.title,
          url: result.link,
          snippet: result.snippet
        }))
        .filter(result => {
          // Filter out excluded sites
          try {
            const url = new URL(result.url);
            return !CONFIG.excludedSites.some(site => url.hostname.includes(site));
          } catch {
            return true; // Keep results with invalid URLs
          }
        });
  
      if (formattedResults.length === 0) {
        console.warn("Serper search returned no usable results for query:", query);
      }
  
      return NextResponse.json(formattedResults);
    } catch (error) {
      console.error("Error fetching sources from Serper:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json(
        { error: `Failed to fetch Serper search results: ${errorMessage}` },
        { status: 500 },
      );
    }
  }