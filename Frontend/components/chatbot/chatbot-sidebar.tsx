"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SquarePen,
  MoreVertical,
  Trash2,
  Edit,
  Clock,
  X,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "../ui/sidebar";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  conversationId?: string;
  className?: string;
  onClose?: () => void;
}

const ChatSidebar = ({
  conversationId,
  className,
  onClose,
}: ChatSidebarProps) => {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chatbot/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const startNewChat = () => {
    router.push("/chatbot");
  };

  const selectConversation = (id: string) => {
    router.push(`/chatbot/${id}`);
  };

  const openDeleteDialog = (id: string) => {
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const deleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      const response = await fetch(
        `/api/chatbot/conversations/${conversationToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setConversations(
          conversations.filter((c) => c.id !== conversationToDelete)
        );

        if (conversationToDelete === conversationId) {
          router.push("/chatbot");
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const startEditingTitle = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveTitle = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/chatbot/conversations/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editTitle }),
      });

      if (response.ok) {
        setConversations(
          conversations.map((conv) =>
            conv.id === editingId ? { ...conv, title: editTitle } : conv
          )
        );
      }
    } catch (error) {
      console.error("Error updating title:", error);
    } finally {
      setEditingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Sidebar
      className={cn(
        "flex flex-col h-full border-r bg-zinc-50/80 dark:bg-zinc-900/50",
        className
      )}
      variant="inset"
    >
      <div className="px-3 py-4">
        <Button
          onClick={() => startNewChat()}
          className="w-full flex items-center justify-start gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-black dark:text-white border shadow-sm py-3 h-auto"
          variant="outline"
        >
          <SquarePen size={16} />
          <span>New chat</span>
        </Button>
      </div>

      <SidebarHeader className="px-4 pb-0 pt-1">
        <h2 className="font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Chat History
        </h2>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-1">
          {isLoading ? (
            <div className="p-3 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : conversations.length > 0 ? (
            <SidebarGroup className="p-2 space-y-0.5">
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.map((conv) => (
                    <SidebarMenuItem
                      key={conv.id}
                      className={cn(
                        "group/item flex flex-col p-2 rounded-md cursor-pointer transition-colors",
                        conversationId === conv.id
                          ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                      )}
                      onClick={() =>
                        editingId !== conv.id && selectConversation(conv.id)
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        {editingId === conv.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              saveTitle();
                            }}
                            className="flex-1 flex gap-1"
                          >
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              type="submit"
                              className="h-8 px-2 py-0"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-4"
                              onClick={() => setEditingId(null)}
                            >
                              <X />
                            </Button>
                          </form>
                        ) : (
                          <>
                            <div className="flex-1 pr-1 truncate">
                              <p className="font-medium text-sm truncate">
                                {conv.title.length > 20
                                  ? `${conv.title.substring(0, 20)}...`
                                  : conv.title || "Untitled conversation"}
                              </p>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                                {formatDate(conv.updatedAt)}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover/item:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => startEditingTitle(conv)}
                                >
                                  <Edit size={14} className="mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteDialog(conv.id);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
              <Clock size={32} className="opacity-50 mb-2" />
              <p className="text-sm">No conversation history</p>
              <p className="text-xs mt-1 text-zinc-400">
                Start a new chat to begin
              </p>
            </div>
          )}
        </ScrollArea>
      </SidebarContent>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this conversation? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteConversation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default ChatSidebar;
