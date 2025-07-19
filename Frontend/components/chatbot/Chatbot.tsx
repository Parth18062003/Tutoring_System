"use client";

import { getSources, Source } from "@/hooks/get-sources";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Link2,
  Mic,
  Paperclip,
  RotateCw,
  X,
  Loader2,
  Copy,
  GlobeIcon,
  Square,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SourceList from "./source-list";
import { Button } from "../ui/button";
import { Message, useChat } from "@ai-sdk/react";
import { Markdown } from "../learning/markdown";
import { Alert } from "../ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Chatbot({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: Message[];
}) {
  const { sources, sendMessage } = getSources();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedSourcesMessageId, setExpandedSourcesMessageId] = useState<
    string | null
  >(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | undefined>(
    undefined
  );
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);

  const toggleSources = (messageId: string) => {
    setExpandedSourcesMessageId((prevId) =>
      prevId === messageId ? null : messageId
    );
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (!conversationId) return;

      try {
        const res = await fetch(`/api/chatbot/conversations/${conversationId}`);
        if (!res.ok) {
          console.error("Failed to load conversation");
        }

        const data: Message[] = await res.json();
        console.log("Loaded messages:", data);
        if (data?.length) {
          setConversation(data);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    loadHistory();
  }, [conversationId]);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    stop,
    setInput,
    reload,
    status,
    error,
  } = useChat({
    api: "/api/chatbot/get-answer",
    id: conversationId,
    initialMessages,
    headers: {
      authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (status !== "ready" && status !== "error") return;

      let fetchedSources: Source[] = [];
      if (webSearchEnabled) {
        fetchedSources = await sendMessage(input);
      }
      if (input?.trim()) {
        handleSubmit(e, {
          experimental_attachments: selectedFiles,
          body: {
            question: input,
            sources: fetchedSources,
            id: conversationId,
            messages,
          },
        });
      }
      clearSelectedFile();
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Voice input started");
      setIsRecording(true);
    };

    recognition.onend = () => {
      console.log("Voice input ended");
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Voice input error:", event);
      toast.error("Voice input error occurred.");
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Transcribed text:", transcript);
      setInput(transcript);
    };

    recognition.start();
  };

  const copytoClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.info("Text copied to clipboard");
        console.log("Text copied to clipboard:", text);
      })
      .catch((err) => {
        toast.error("Failed to copy text");
        console.error("Failed to copy text:", err);
      });
  };

  useEffect(() => {
    if (!selectedFiles) {
      setPreviewUrls([]);
      return;
    }

    const urls = Array.from(selectedFiles).map((file) => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        return URL.createObjectURL(file);
      }
      return "";
    });

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [selectedFiles]);

  const clearSelectedFile = () => {
    setSelectedFiles(undefined);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
    return (
      parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    );
  };
  const generateFallbackTitle = async () => {
    if (!conversationId) return;

    try {
      const firstUserMessage = messages.find((m) => m.role === "user");
      if (!firstUserMessage) return;

      const questionWords = firstUserMessage.content
        .split(" ")
        .filter((word) => word.length > 3)
        .slice(0, 3);

      let title = questionWords.join(" ");

      if (title.length > 10) {
        const timestamp = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
        });
        title = `${title.substring(0, 20)}... - ${timestamp}`;

        await fetch(`/api/chatbot/conversations/${conversationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
      }
    } catch (error) {
      console.error("Error generating fallback title:", error);
    }
  };
  const hasTitleBeenGenerated = useRef(false);
  useEffect(() => {
    if (!conversationId || hasTitleBeenGenerated.current) return;

    const gotAssistantReply = messages.some((m) => m.role === "assistant");
    if (gotAssistantReply) {
      hasTitleBeenGenerated.current = true;
      fetch(`/api/chatbot/conversations/${conversationId}/generate-title`, {
        method: "POST",
      }).catch((err) => {
        console.warn("Error generating title, falling back:", err);
        generateFallbackTitle();
      });
    }
  }, [messages, conversationId]);
  const isMessageProcessing = status === "submitted" || status === "streaming";

  return (
    <div className="relative flex flex-col h-[95vh] overflow-hidden">
      <div className="flex-1 overflow-hidden flex mx-auto w-full min-h-0">
        <div className="flex-1 flex flex-col">
          {error && (
            <Alert variant="destructive" className="mx-4 mt-4 mb-0">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <p>Error: {error.message}</p>
              </div>
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto w-full px-4 py-6 min-h-0">
            <div className="space-y-6 mx-auto max-w-3xl">
              {messages.length === 0 && (
                <div className="text-center p-10 rounded-2xl">
                  <h3 className="text-xl font-medium mb-3">
                    Hey there! Got a question? 🤔
                  </h3>
                  <p>
                    I'm here to help you learn and explore. Ask me anything
                    you're curious about — we'll figure it out together! 🚀
                  </p>
                </div>
              )}

              <div>
                {messages.map((message) =>
                  message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div>
                              <div
                                className={`p-2 rounded-2xl ${
                                  message.role === "user"
                                    ? "bg-blue-600/60 text-white shadow-sm"
                                    : "w-3xl"
                                }`}
                              >
                                <Markdown>{part.text}</Markdown>
                                {message?.experimental_attachments
                                  ?.filter(
                                    (attachment) =>
                                      attachment?.contentType?.startsWith(
                                        "image/"
                                      ) ||
                                      attachment?.contentType?.startsWith(
                                        "application/pdf"
                                      )
                                  )
                                  .map((attachment, index) =>
                                    attachment.contentType?.startsWith(
                                      "image/"
                                    ) ? (
                                      <Image
                                        key={`${message.id}-${index}`}
                                        src={attachment.url}
                                        width={500}
                                        height={500}
                                        alt={
                                          attachment.name ??
                                          `attachment-${index}`
                                        }
                                      />
                                    ) : attachment.contentType?.startsWith(
                                        "application/pdf"
                                      ) ? (
                                      <iframe
                                        key={`${message.id}-${index}`}
                                        src={attachment.url}
                                        width="500"
                                        height="600"
                                        title={
                                          attachment.name ??
                                          `attachment-${index}`
                                        }
                                      />
                                    ) : null
                                  )}
                              </div>

                              {message.role === "assistant" &&
                                sources &&
                                sources.length > 0 && (
                                  <div className="mt-2 border rounded-lg shadow-sm overflow-hidden">
                                    <button
                                      onClick={() => toggleSources(message.id)}
                                      className="flex items-center justify-between w-full p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-sm"
                                    >
                                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                                        <Link2 size={14} className="mr-1.5" />
                                        <span>
                                          {sources.length} Source
                                          {sources.length > 1 ? "s" : ""}
                                        </span>
                                      </div>
                                      {expandedSourcesMessageId ===
                                      message.id ? (
                                        <ChevronUp size={16} />
                                      ) : (
                                        <ChevronDown size={16} />
                                      )}
                                    </button>

                                    <AnimatePresence>
                                      {expandedSourcesMessageId ===
                                        message.id && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{
                                            height: "auto",
                                            opacity: 1,
                                          }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{
                                            duration: 0.25,
                                            ease: "easeInOut",
                                          }}
                                          className="overflow-hidden"
                                        >
                                          <div className="max-h-48 overflow-y-auto p-3">
                                            <SourceList sources={sources} />
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                )}

                              {message.role === "assistant" && (
                                <div className="mt-2 border-t flex justify-start">
                                  <Button
                                    onClick={() =>
                                      reload({
                                        body: {
                                          id: conversationId,
                                          messages,
                                          question:
                                            messages[
                                              messages.findIndex(
                                                (m) => m.id === message.id
                                              ) - 1
                                            ]?.content || "",
                                          sources,
                                        },
                                      })
                                    }
                                    className="flex items-center gap-1 text-xs py-1 px-2 rounded-md"
                                    variant="ghost"
                                    disabled={isMessageProcessing}
                                  >
                                    <RotateCw size={20} />
                                    <span className="sr-only">
                                      Regenerate Response for{" "}
                                      {messages.findIndex(
                                        (m) => m.id === message.id
                                      )}
                                    </span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() =>
                                      copytoClipboard(message.content)
                                    }
                                  >
                                    <Copy size={20} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      case "source":
                        return <p key={i}>{part.source.url}</p>;
                      case "reasoning":
                        return <div key={i}>{part.reasoning}</div>;
                      case "tool-invocation":
                        return (
                          <div key={i}>{part.toolInvocation.toolName}</div>
                        );
                      case "file":
                        return (
                          <img
                            key={i}
                            src={`data:${part.mimeType};base64,${part.data}`}
                          />
                        );
                    }
                  })
                )}
              </div>
              {status === "submitted" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                      {status === "submitted" && (
                        <>
                          <span
                            className={`text-[#b5b5b5a4] bg-clip-text inline-block animate-shine'`}
                            style={{
                              backgroundImage:
                                "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
                              backgroundSize: "200% 100%",
                              WebkitBackgroundClip: "text",
                              animationDuration: "5s",
                            }}
                          >
                            Generating...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="flex-shrink-0 w-full max-w-4xl mx-auto">
            <div className="p-4 max-w-3xl mx-auto">
              <AnimatePresence>
                {selectedFiles && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-3 rounded-lg border flex flex-col gap-3 overflow-hidden"
                  >
                    {Array.from(selectedFiles).map((file, index) => {
                      const type = file.type;
                      const isImage = type.startsWith("image/");
                      const isPdf = type === "application/pdf";
                      const isTextLike =
                        type.includes("text") ||
                        type === "application/msword" ||
                        type ===
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 w-full"
                        >
                          {isImage && previewUrls[index] ? (
                            <Image
                              height={64}
                              width={64}
                              src={previewUrls[index]}
                              alt={`Preview ${index}`}
                              className="w-26 h-26 object-cover rounded-md border border-zinc-200"
                            />
                          ) : isPdf ? (
                            <iframe
                              src={previewUrls[index]}
                              title={`PDF Preview ${index}`}
                              className="w-26 h-26 rounded-md border border-zinc-200"
                            />
                          ) : (
                            <div className="w-26 h-26 flex items-center justify-center border border-zinc-200 bg-zinc-100 rounded-md text-xs text-zinc-500">
                              {file.name.split(".").pop()?.toUpperCase() ||
                                "FILE"}
                            </div>
                          )}

                          <div className="flex-1 text-sm truncate">
                            <div className="font-medium text-zinc-800 truncate">
                              {file.name}
                            </div>
                            <div className="text-xs text-zinc-600">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={clearSelectedFile}
                      className="self-end text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 rounded-sm hover:bg-zinc-200 transition-colors"
                      aria-label="Clear selected files"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  let fetchedSources: Source[] = [];
                  if (webSearchEnabled) {
                    fetchedSources = await sendMessage(input);
                  }
                  handleSubmit(event, {
                    experimental_attachments: selectedFiles,
                    body: {
                      question: input,
                      sources: fetchedSources,
                      id: conversationId,
                      messages,
                    },
                  });
                  setSelectedFiles(undefined);
                  clearSelectedFile();
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="relative"
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) {
                      setSelectedFiles(event.target.files);
                    }
                  }}
                  multiple
                  ref={fileInputRef}
                />

                <div className="relative flex flex-col border rounded-xl shadow-lg overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isMessageProcessing
                        ? "Waiting for response..."
                        : "Type your message..."
                    }
                    className={cn(
                      "w-full resize-none py-3 px-4 focus:outline-none",
                      "bg-transparent text-zinc-900 dark:text-zinc-100",
                      "min-h-[56px] max-h-[150px]",
                      isMessageProcessing && "opacity-70"
                    )}
                    disabled={isMessageProcessing}
                  />

                  <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-100 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 w-9 rounded-full text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        disabled={isMessageProcessing}
                      >
                        <Paperclip size={18} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleVoiceInput}
                        className={`h-9 w-9 rounded-full ${isRecording ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-zinc-500"}`}
                        disabled={isMessageProcessing && !isRecording}
                      >
                        <Mic
                          size={18}
                          className={isRecording ? "animate-pulse" : ""}
                        />
                      </Button>
                      <Button
                        onClick={() => setWebSearchEnabled((prev) => !prev)}
                        variant="ghost"
                        disabled={isMessageProcessing}
                        className={`
        flex items-center justify-center 
        space-x-2 
        px-4 py-2 
        rounded-lg 
        text-sm 
        font-medium 
        ${
          webSearchEnabled
            ? "bg-blue-500/10 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-300/50 hover:bg-blue-500/10 dark:hover:bg-blue-900/20 hover:text-blue-700"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
        }
      `}
                      >
                        <GlobeIcon className="w-4 h-4" />
                        <span>Web Search</span>
                      </Button>
                    </div>

                    {status === "streaming" ? (
                      <Button
                        type="button"
                        onClick={stop}
                        variant="ghost"
                        className="rounded-full px-4 h-9"
                      >
                        <Square size={20} />
                        <span className="sr-only">Stop Response</span>
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={!input?.trim() || status === "submitted"}
                        size="sm"
                        className={`rounded-full px-4 h-9 ${isMessageProcessing ? "opacity-70" : ""}`}
                      >
                        {status === "submitted" ? (
                          <>
                            <Loader2 size={16} className="animate-spin mr-1" />
                          </>
                        ) : (
                          <>
                            <span className="sr-only">Send query</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
