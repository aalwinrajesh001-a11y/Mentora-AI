import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Brain, Zap, Target } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-6 px-8 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-widest text-foreground uppercase">MENTORA</span>
            <span className="text-[10px] text-muted-foreground tracking-wider">Mentorship | Education | Growth</span>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/chat">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Smarter Learning Awaits</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl">
            Your personal expert, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">available 24/7.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Mentora AI adapts to your learning style, breaking down complex topics into digestible insights. For students who want to excel.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/onboarding">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                Start Learning Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-secondary/50 border-t border-border">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Adaptive Learning</h3>
                <p className="text-muted-foreground">Mentora learns how you learn. Whether you need concise summaries or detailed visual examples, we adapt instantly.</p>
              </div>
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Targeted Quizzes</h3>
                <p className="text-muted-foreground">Test your knowledge with auto-generated quizzes tailored to your difficulty level. Identify gaps and improve faster.</p>
              </div>
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-6">
                  <GraduationCap className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-3">Exam Ready</h3>
                <p className="text-muted-foreground">Built for competitive exams and tough undergrad courses. Master Physics, Chemistry, Math, and CS with confidence.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border text-center text-muted-foreground">
        <p>© {new Date().getFullYear()} Mentora AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
