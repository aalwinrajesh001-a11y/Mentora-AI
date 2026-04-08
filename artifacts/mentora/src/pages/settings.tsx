import { Layout } from "@/components/layout";
import { useState, useEffect } from "react";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, Settings as SettingsIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Computer Science"];

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() },
  });

  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: "",
    subjects: [] as string[],
    difficulty: "intermediate",
    learningStyle: "example-based",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        subjects: profile.subjects,
        difficulty: profile.difficulty,
        learningStyle: profile.learningStyle,
      });
    }
  }, [profile]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    
    if (formData.subjects.length === 0) {
      toast({ title: "Select at least one subject", variant: "destructive" });
      return;
    }

    updateProfile.mutate({ data: formData as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        toast({ title: "Settings updated successfully" });
      },
      onError: () => {
        toast({ title: "Failed to update settings", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <Layout><div className="p-8">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-secondary/20 p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and learning preferences.</p>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-accent" />
                Learning Preferences
              </CardTitle>
              <CardDescription>Customize how Mentora teaches you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base">Focus Subjects</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  {SUBJECTS.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2 border p-4 rounded-lg bg-card cursor-pointer hover:border-primary/50" onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        subjects: prev.subjects.includes(subject) 
                          ? prev.subjects.filter(s => s !== subject)
                          : [...prev.subjects, subject]
                      }));
                    }}>
                      <Checkbox 
                        id={`settings-${subject}`} 
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
                      <label htmlFor={`settings-${subject}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base">Difficulty Level</Label>
                <RadioGroup 
                  value={formData.difficulty} 
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v as any })}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="settings-d-beginner" />
                    <Label htmlFor="settings-d-beginner">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="settings-d-intermediate" />
                    <Label htmlFor="settings-d-intermediate">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="settings-d-advanced" />
                    <Label htmlFor="settings-d-advanced">Advanced</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base">Learning Style</Label>
                <RadioGroup 
                  value={formData.learningStyle} 
                  onValueChange={(v) => setFormData({ ...formData, learningStyle: v as any })}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl"
                >
                  <Label htmlFor="settings-l-visual" className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer bg-card hover:border-primary/50">
                    <RadioGroupItem value="visual" id="settings-l-visual" className="mt-1" />
                    <div className="flex flex-col">
                      <span className="font-semibold">Visual</span>
                      <span className="text-xs text-muted-foreground mt-1">Diagrams, charts, spatial reps</span>
                    </div>
                  </Label>
                  <Label htmlFor="settings-l-detailed" className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer bg-card hover:border-primary/50">
                    <RadioGroupItem value="detailed" id="settings-l-detailed" className="mt-1" />
                    <div className="flex flex-col">
                      <span className="font-semibold">Detailed</span>
                      <span className="text-xs text-muted-foreground mt-1">Comprehensive explanations</span>
                    </div>
                  </Label>
                  <Label htmlFor="settings-l-example" className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer bg-card hover:border-primary/50">
                    <RadioGroupItem value="example-based" id="settings-l-example" className="mt-1" />
                    <div className="flex flex-col">
                      <span className="font-semibold">Example-based</span>
                      <span className="text-xs text-muted-foreground mt-1">Practical real-world apps</span>
                    </div>
                  </Label>
                  <Label htmlFor="settings-l-concise" className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer bg-card hover:border-primary/50">
                    <RadioGroupItem value="concise" id="settings-l-concise" className="mt-1" />
                    <div className="flex flex-col">
                      <span className="font-semibold">Concise</span>
                      <span className="text-xs text-muted-foreground mt-1">Quick summaries, bottom line</span>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/30 border-t border-border/50 py-4">
              <Button onClick={handleSubmit} disabled={updateProfile.isPending} className="ml-auto">
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
