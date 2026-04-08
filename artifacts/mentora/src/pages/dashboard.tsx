import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetProgress, getGetProgressQueryKey } from "@workspace/api-client-react";
import { Flame, MessageSquare, Target, Clock, Trophy, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: progress, isLoading } = useGetProgress({
    query: { queryKey: getGetProgressQueryKey() },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-secondary/20 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
            <p className="text-muted-foreground">Track your learning journey and stay consistent.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 shadow-sm bg-card hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Day Streak</CardTitle>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                  <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{progress?.dayStreak || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-sm bg-card hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hours Learned</CardTitle>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{progress?.hoursLearned || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Total time spent</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-card hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{progress?.averageScore || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Across all quizzes</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-card hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Taken</CardTitle>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                  <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{progress?.quizzesTaken || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Assessments completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Conversation Activity
                </CardTitle>
                <CardDescription>Your interaction with Mentora</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Total Conversations</span>
                    <span className="text-2xl font-bold">{progress?.totalConversations || 0}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-sm text-muted-foreground">Total Messages</span>
                    <span className="text-2xl font-bold">{progress?.totalMessages || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Topics Studied
                </CardTitle>
                <CardDescription>Areas you've focused on</CardDescription>
              </CardHeader>
              <CardContent>
                {progress?.topicsStudied && progress.topicsStudied.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {progress.topicsStudied.map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full border border-border">
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic py-4 text-center border border-dashed border-border rounded-lg">
                    No topics studied yet. Start chatting or take a quiz!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
