import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGenerateQuiz, useSaveQuizResult, getListQuizResultsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Trophy, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type GeneratedQuiz = {
  topic: string;
  questions: QuizQuestion[];
};

type AnswerState = {
  selected: number | null;
  revealed: boolean;
};

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Computer Science", "Biology", "English"];
const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function Quiz() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const generateQuiz = useGenerateQuiz({
    mutation: {
      onSuccess: (data) => {
        const generated = data as GeneratedQuiz;
        setQuiz(generated);
        setAnswers(generated.questions.map(() => ({ selected: null, revealed: false })));
        setCurrentIndex(0);
        setQuizFinished(false);
        setResultSaved(false);
      },
    },
  });

  const saveQuizResult = useSaveQuizResult({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuizResultsQueryKey() });
        setResultSaved(true);
      },
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) return;
    generateQuiz.mutate({
      data: {
        topic: topic.trim(),
        subject,
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        count: 5,
      },
    });
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (!quiz || answers[currentIndex].revealed) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = { selected: optionIndex, revealed: true };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // Calculate score
      const score = answers.filter((a, i) => a.selected === quiz.questions[i].correctIndex).length;
      if (!resultSaved) {
        saveQuizResult.mutate({
          data: {
            topic: quiz.topic,
            subject,
            score,
            totalQuestions: quiz.questions.length,
          },
        });
      }
    }
  };

  const handleReset = () => {
    setQuiz(null);
    setAnswers([]);
    setCurrentIndex(0);
    setQuizFinished(false);
    setResultSaved(false);
    setTopic("");
  };

  const score =
    quiz && quizFinished
      ? answers.filter((a, i) => a.selected === quiz.questions[i].correctIndex).length
      : 0;

  const currentQuestion = quiz?.questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const progress = quiz ? ((currentIndex + (currentAnswer?.revealed ? 1 : 0)) / quiz.questions.length) * 100 : 0;

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-6" data-testid="quiz-page">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">AI Quiz Generator</h1>
            <p className="text-muted-foreground text-sm mt-1">Test your knowledge with AI-generated questions</p>
          </div>

          {!quiz ? (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Generate a Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-select">Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="subject-select" data-testid="select-subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s} value={s} data-testid={`subject-option-${s}`}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty-select">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty-select" data-testid="select-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value} data-testid={`difficulty-option-${d.value}`}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic-input">Topic</Label>
                  <Input
                    id="topic-input"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Newton's Laws of Motion, Integration, Binary Trees..."
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    data-testid="input-topic"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generateQuiz.isPending || !topic.trim()}
                  className="w-full gap-2"
                  data-testid="button-generate-quiz"
                >
                  <Zap className="h-4 w-4" />
                  {generateQuiz.isPending ? "Generating Quiz..." : "Generate Quiz"}
                </Button>
              </CardContent>
            </Card>
          ) : quizFinished ? (
            // Results screen
            <div className="space-y-4">
              <Card className="border-border">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className={cn(
                      "h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold",
                      score / quiz.questions.length >= 0.8
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : score / quiz.questions.length >= 0.5
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      <Trophy className="h-8 w-8" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Quiz Complete!</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    {quiz.topic} — {subject}
                  </p>
                  <div className="text-4xl font-bold text-primary mb-1">
                    {score}/{quiz.questions.length}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {Math.round((score / quiz.questions.length) * 100)}% correct
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleReset} variant="outline" className="gap-2" data-testid="button-try-again">
                      <RotateCcw className="h-4 w-4" />
                      Try Again
                    </Button>
                    <Button
                      onClick={() => {
                        setQuiz(null);
                        setAnswers([]);
                        setQuizFinished(false);
                        setResultSaved(false);
                      }}
                      className="gap-2"
                      data-testid="button-new-quiz"
                    >
                      <Zap className="h-4 w-4" />
                      New Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Review answers */}
              <h3 className="font-semibold text-sm text-foreground mt-6 mb-3">Review Answers</h3>
              {quiz.questions.map((q, i) => {
                const ans = answers[i];
                const isCorrect = ans.selected === q.correctIndex;
                return (
                  <Card key={i} className={cn("border", isCorrect ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800")} data-testid={`review-question-${i}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-2 mb-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium text-foreground">{q.question}</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-7 mb-1">
                        Your answer: <span className={isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {ans.selected !== null ? q.options[ans.selected] : "Not answered"}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-muted-foreground ml-7 mb-1">
                          Correct: <span className="text-green-600 dark:text-green-400">{q.options[q.correctIndex]}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground ml-7 mt-2 italic">{q.explanation}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Active quiz
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
                <Badge variant="outline" className="capitalize">{difficulty}</Badge>
              </div>
              <Progress value={progress} className="h-1.5" />

              <Card className="border-border" data-testid="quiz-question-card">
                <CardContent className="pt-6 pb-6">
                  <p className="text-base font-medium text-foreground mb-6">{currentQuestion?.question}</p>
                  <div className="space-y-3">
                    {currentQuestion?.options.map((option, i) => {
                      const isSelected = currentAnswer?.selected === i;
                      const isRevealed = currentAnswer?.revealed;
                      const isCorrect = currentQuestion.correctIndex === i;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectAnswer(i)}
                          disabled={isRevealed}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                            isRevealed
                              ? isCorrect
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                : isSelected
                                ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                : "border-border text-muted-foreground opacity-60"
                              : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                          )}
                          data-testid={`quiz-option-${i}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0",
                              isRevealed && isCorrect ? "border-green-500 text-green-600" :
                              isRevealed && isSelected ? "border-red-500 text-red-600" :
                              "border-current"
                            )}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{option}</span>
                            {isRevealed && isCorrect && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                            {isRevealed && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500 ml-auto" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {currentAnswer?.revealed && (
                    <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <p className="text-xs text-accent-foreground/80 italic">{currentQuestion?.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {currentAnswer?.revealed && (
                <Button onClick={handleNext} className="w-full" data-testid="button-next-question">
                  {currentIndex < quiz.questions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
