import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateProfile, useUpdateProfile, useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Brain, GraduationCap, Zap, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Computer Science"];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey(), retry: false },
  });

  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    subjects: profile?.subjects || [],
    difficulty: profile?.difficulty || "intermediate",
    learningStyle: profile?.learningStyle || "example-based",
  });

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      toast({ title: "Name required", description: "Please enter your name", variant: "destructive" });
      return;
    }
    if (step === 2 && formData.subjects.length === 0) {
      toast({ title: "Subjects required", description: "Please select at least one subject", variant: "destructive" });
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const mutation = profile ? updateProfile : createProfile;
    
    mutation.mutate({ data: formData as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        toast({ title: "Profile setup complete", description: "Welcome to Mentora AI!" });
        setLocation("/chat");
      },
      onError: (err) => {
        toast({ title: "Failed to save profile", description: "Please try again later.", variant: "destructive" });
      }
    });
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-widest text-foreground uppercase">MENTORA</span>
          <span className="text-xs text-muted-foreground tracking-wider">Mentorship | Education | Growth</span>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {step === 1 && <><Sparkles className="h-6 w-6 text-accent" /> Let's get to know you</>}
            {step === 2 && <><Brain className="h-6 w-6 text-primary" /> What are you studying?</>}
            {step === 3 && <><Zap className="h-6 w-6 text-accent" /> How do you learn best?</>}
          </CardTitle>
          <CardDescription>
            Step {step} of 3
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-lg py-6"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Select your subjects</Label>
                <div className="grid grid-cols-2 gap-4">
                  {SUBJECTS.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-secondary/50 cursor-pointer" onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        subjects: prev.subjects.includes(subject) 
                          ? prev.subjects.filter(s => s !== subject)
                          : [...prev.subjects, subject]
                      }));
                    }}>
                      <Checkbox 
                        id={subject} 
                        checked={formData.subjects.includes(subject)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            subjects: checked 
                              ? [...prev.subjects, subject]
                              : prev.subjects.filter(s => s !== subject)
                          }));
                        }}
                      />
                      <label htmlFor={subject} className="text-sm font-medium leading-none cursor-pointer flex-1">
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                <Label>Difficulty Level</Label>
                <RadioGroup 
                  value={formData.difficulty} 
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v as any })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="d-beginner" />
                    <Label htmlFor="d-beginner">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="d-intermediate" />
                    <Label htmlFor="d-intermediate">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="d-advanced" />
                    <Label htmlFor="d-advanced">Advanced</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Learning Style</Label>
              <RadioGroup 
                value={formData.learningStyle} 
                onValueChange={(v) => setFormData({ ...formData, learningStyle: v as any })}
                className="space-y-4"
              >
                <Label htmlFor="l-visual" className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="visual" id="l-visual" className="mt-1" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Visual</span>
                    <span className="text-sm text-muted-foreground">I learn best with diagrams, charts, and spatial representations.</span>
                  </div>
                </Label>
                <Label htmlFor="l-detailed" className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="detailed" id="l-detailed" className="mt-1" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Detailed</span>
                    <span className="text-sm text-muted-foreground">I prefer comprehensive explanations that cover every nuance.</span>
                  </div>
                </Label>
                <Label htmlFor="l-example" className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="example-based" id="l-example" className="mt-1" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Example-based</span>
                    <span className="text-sm text-muted-foreground">Show me practical examples and real-world applications.</span>
                  </div>
                </Label>
                <Label htmlFor="l-concise" className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="concise" id="l-concise" className="mt-1" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Concise</span>
                    <span className="text-sm text-muted-foreground">Just give me the bottom line, quick summaries, and bullet points.</span>
                  </div>
                </Label>
              </RadioGroup>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border pt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>Back</Button>
          ) : (
            <div></div>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="min-w-[100px]">Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createProfile.isPending || updateProfile.isPending} className="min-w-[100px]">
              {createProfile.isPending || updateProfile.isPending ? "Saving..." : "Finish"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
