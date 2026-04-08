import { Layout } from "@/components/layout";
import { useState } from "react";
import { useListOpenaiConversations, useDeleteOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Trash2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Library() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: conversations, isLoading } = useListOpenaiConversations({
    query: { queryKey: getListOpenaiConversationsQueryKey() },
  });

  const deleteConversation = useDeleteOpenaiConversation();

  const handleDelete = (id: number) => {
    deleteConversation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        toast({ title: "Conversation deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    });
  };

  const filteredConversations = conversations?.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-secondary/20 p-8 flex flex-col h-full">
        <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
              <p className="text-muted-foreground">All your past learning sessions and notes.</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                {filteredConversations.map((conv) => (
                  <Card key={conv.id} className="flex flex-col hover:border-primary/50 transition-colors group cursor-pointer bg-card overflow-hidden">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="space-y-1 pr-4">
                        <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          <Link href={`/chat?id=${conv.id}`}>{conv.title}</Link>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {format(new Date(conv.createdAt), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the learning session.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(conv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardHeader>
                    <div className="mt-auto p-4 pt-0">
                      <Link href={`/chat?id=${conv.id}`}>
                        <Button variant="secondary" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <span>Review</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-border rounded-xl bg-card">
                <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No conversations found</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  {searchTerm ? "No results match your search." : "You haven't started any learning sessions yet."}
                </p>
                <Link href="/chat">
                  <Button>Start a New Session</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
