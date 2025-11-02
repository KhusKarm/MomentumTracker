import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { BookOpen, Plus, Calendar } from "lucide-react";
import type { JournalEntry } from "@shared/schema";
import { format } from "date-fns";

export default function Journal() {
  const { toast } = useToast();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [content, setContent] = useState("");

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/journal", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      setContent("");
      setShowNewEntry(false);
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createEntryMutation.mutate(content.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading journal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Daily Journal</h1>
              <p className="text-muted-foreground mt-1">
                Reflect on your progress and thoughts
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewEntry(!showNewEntry)}
            data-testid="button-toggle-new-entry"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showNewEntry ? "Cancel" : "New Entry"}
          </Button>
        </div>

        {showNewEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>New Journal Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind today? Reflect on your progress, challenges, or anything you'd like to remember..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                    data-testid="textarea-journal-content"
                  />
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={!content.trim() || createEntryMutation.isPending}
                      data-testid="button-save-entry"
                    >
                      {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewEntry(false);
                        setContent("");
                      }}
                      data-testid="button-cancel-entry"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Past Entries</h2>
          
          {entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No journal entries yet. Start writing to track your thoughts and progress!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card data-testid={`journal-entry-${entry.id}`}>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
