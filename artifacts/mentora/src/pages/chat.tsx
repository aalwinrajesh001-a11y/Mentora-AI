import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useGetOpenaiConversation,
  useDeleteOpenaiConversation,
  getListOpenaiConversationsQueryKey,
  getGetOpenaiConversationQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Send, MessageSquare, Bot, User } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [newConvTitle, setNewConvTitle] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: isLoadingConvs } = useListOpenaiConversations({
    query: { queryKey: getListOpenaiConversationsQueryKey() },
  });

  const { data: currentConv, isLoading: isLoadingMessages } = useGetOpenaiConversation(
    selectedConversationId!,
    {
      query: {
        enabled: !!selectedConversationId,
        queryKey: getGetOpenaiConversationQueryKey(selectedConversationId!),
      },
    }
  );

  const createConversation = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (conv) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setSelectedConversationId(conv.id);
        setShowNewConv(false);
        setNewConvTitle("");
      },
    },
  });

  const deleteConversation = useDeleteOpenaiConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        if (selectedConversationId) {
          setSelectedConversationId(null);
        }
      },
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConv?.messages, streamingContent, scrollToBottom]);

  const handleCreateConversation = () => {
    const title = newConvTitle.trim() || "New Conversation";
    createConversation.mutate({ data: { title } });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversationId || isStreaming) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsStreaming(true);
    setStreamingContent("");

    // Optimistically add user message
    queryClient.setQueryData(
      getGetOpenaiConversationQueryKey(selectedConversationId),
      (old: typeof currentConv) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: Date.now(),
              conversationId: selectedConversationId,
              role: "user",
              content: messageText,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
    );

    try {
      const response = await fetch(`/api/openai/conversations/${selectedConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setStreamingContent(fullContent);
              }
              if (data.done) {
                setStreamingContent("");
                queryClient.invalidateQueries({
                  queryKey: getGetOpenaiConversationQueryKey(selectedConversationId),
                });
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error", err);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const messages = currentConv?.messages ?? [];

  return (
    <Layout>
      <div className="flex h-full" data-testid="chat-page">
        {/* Sidebar: Conversation List */}
        <div className="w-72 border-r border-border bg-secondary/20 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-foreground">Conversations</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNewConv(true)}
                data-testid="button-new-conversation"
                className="h-7 w-7 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {showNewConv && (
              <div className="flex gap-2">
                <Input
                  value={newConvTitle}
                  onChange={(e) => setNewConvTitle(e.target.value)}
                  placeholder="Topic (e.g. Calculus)"
                  className="h-8 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateConversation()}
                  autoFocus
                  data-testid="input-new-conversation-title"
                />
                <Button
                  size="sm"
                  onClick={handleCreateConversation}
                  disabled={createConversation.isPending}
                  className="h-8"
                  data-testid="button-create-conversation"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoadingConvs ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer group transition-colors",
                      selectedConversationId === conv.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary text-foreground"
                    )}
                    onClick={() => setSelectedConversationId(conv.id)}
                    data-testid={`conversation-item-${conv.id}`}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="text-xs flex-1 truncate font-medium">{conv.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation.mutate({ id: conv.id });
                      }}
                      data-testid={`button-delete-conversation-${conv.id}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No conversations yet</p>
                  <p>Create one to start learning</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversationId ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm">
                  {currentConv?.title || "Loading..."}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ask Mentora anything about your topic</p>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-6 max-w-3xl">
                  {isLoadingMessages ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                        <Skeleton className="h-16 w-64 rounded-xl" />
                      </div>
                    ))
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
                          data-testid={`message-${msg.id}`}
                        >
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent/20 text-accent"
                            )}
                          >
                            {msg.role === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={cn(
                              "px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed",
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-card border border-border rounded-tl-sm"
                            )}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isStreaming && streamingContent && (
                        <div className="flex gap-3" data-testid="streaming-message">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/20 text-accent">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed bg-card border border-border rounded-tl-sm">
                            <p className="whitespace-pre-wrap">{streamingContent}</p>
                            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                          </div>
                        </div>
                      )}
                      {isStreaming && !streamingContent && (
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/20 text-accent">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="px-4 py-3 rounded-2xl bg-card border border-border rounded-tl-sm">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="px-6 py-4 border-t border-border">
                <div className="flex gap-3 max-w-3xl">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Mentora a question..."
                    disabled={isStreaming}
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isStreaming}
                    className="gap-2"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Welcome to Mentora AI</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                  Select a conversation or start a new one to begin learning with your AI tutor.
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowNewConv(true);
                  createConversation.mutate({ data: { title: "New Conversation" } });
                }}
                className="gap-2"
                data-testid="button-start-chat"
              >
                <Plus className="h-4 w-4" />
                Start New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
