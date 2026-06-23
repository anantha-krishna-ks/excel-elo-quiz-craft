import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Sparkles } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Grade {
  classid: number;
  classname: string;
}

interface Subject {
  subjectid: number;
  subjectname: string;
}

interface Chapter {
  chapterid: number;
  chaptername: string;
  chaptercode: string;
  classid: number;
  subjectid: number;
}

interface ELO {
  elo: string;
  chapterid: number;
}

interface CreateQuizFormProps {
  onQuizGenerated: (questions: any[]) => void;
}

export const CreateQuizForm = ({ onQuizGenerated }: CreateQuizFormProps) => {
  const [quizName, setQuizName] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState("");
  const [selectedELOs, setSelectedELOs] = useState<string[]>([]);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [elos, setELOs] = useState<ELO[]>([]);

  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [isLoadingELOs, setIsLoadingELOs] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  const questionCountOptions = [
    { value: "5", label: "Create quiz with 5 questions" },
    { value: "10", label: "Create quiz with 10 questions" },
    { value: "12", label: "Create quiz with 12 questions" },
    { value: "3_per_elo", label: "Create quiz with 3 questions per selected ELO" },
  ];

  // Fetch grades on component mount
  useEffect(() => {
    fetchGrades();
  }, []);

  // Fetch subjects when grade changes
  useEffect(() => {
    if (selectedGrade) {
      fetchSubjects(selectedGrade);
      setSelectedSubject("");
      setSelectedChapter("");
      setSelectedELOs([]);
    }
  }, [selectedGrade]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (selectedGrade && selectedSubject) {
      fetchChapters(selectedGrade, selectedSubject);
      setSelectedChapter("");
      setSelectedELOs([]);
    }
  }, [selectedSubject]);

  // Fetch ELOs when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      fetchELOs(selectedChapter);
      setSelectedELOs([]);
    }
  }, [selectedChapter]);

  const fetchGrades = async () => {
    setIsLoadingGrades(true);
    try {
      const { data, error } = await supabase.functions.invoke('excelsoft-proxy', {
        body: { endpoint: 'get_classes', method: 'GET' },
      });
      if (error) throw error;
      setGrades(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch grades. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const fetchSubjects = async (gradeId: string) => {
    setIsLoadingSubjects(true);
    try {
      const { data, error } = await supabase.functions.invoke('excelsoft-proxy', {
        body: { endpoint: 'get_subject', method: 'GET', query: { classid: gradeId } },
      });
      if (error) throw error;
      setSubjects(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchChapters = async (gradeId: string, subjectId: string) => {
    setIsLoadingChapters(true);
    try {
      const { data, error } = await supabase.functions.invoke('excelsoft-proxy', {
        body: {
          endpoint: 'get_chapters',
          method: 'GET',
          query: { classid: gradeId, subjectid: subjectId },
        },
      });
      if (error) throw error;
      setChapters(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch chapters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingChapters(false);
    }
  };

  const fetchELOs = async (chapterId: string) => {
    setIsLoadingELOs(true);
    try {
      const { data, error } = await supabase.functions.invoke('excelsoft-proxy', {
        body: { endpoint: 'get-elo-details', method: 'GET', query: { chapterid: chapterId } },
      });
      if (error) throw error;
      setELOs(data.elo_details || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Expected Learning Outcomes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingELOs(false);
    }
  };

  const handleELOToggle = (elo: string) => {
    setSelectedELOs(prev => 
      prev.includes(elo) 
        ? prev.filter(e => e !== elo)
        : [...prev, elo]
    );
  };

  const handleGenerateQuiz = async () => {
    if (!quizName || !selectedGrade || !selectedSubject || !selectedChapter || !selectedQuestionCount || selectedELOs.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one ELO.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedGradeData = grades.find(g => g.classid.toString() === selectedGrade);
      const selectedSubjectData = subjects.find(s => s.subjectid.toString() === selectedSubject);
      const selectedChapterData = chapters.find(c => c.chapterid.toString() === selectedChapter);

      const questionCount = selectedQuestionCount === "3_per_elo" 
        ? selectedELOs.length * 3 
        : parseInt(selectedQuestionCount);

      const requestBody = {
        grade: selectedGradeData?.classname || "",
        subject: selectedSubjectData?.subjectname || "",
        chapter: selectedChapterData?.chaptername || "",
        questionCount,
        selectedELOs
      };

      const { data, error } = await supabase.functions.invoke('excelsoft-proxy', {
        body: { endpoint: 'generate-questions', method: 'POST', payload: requestBody },
      });
      if (error) throw error;
      
      if (data.questions && data.questions.length > 0) {
        onQuizGenerated(data.questions);
        toast({
          title: "Quiz Generated",
          description: `Successfully generated ${data.questions.length} questions for "${quizName}".`,
        });
      } else {
        throw new Error("No questions generated");
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-lg border-quiz-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Plus className="w-5 h-5" />
          Create Quiz
        </CardTitle>
        <CardDescription>
          Define quiz parameters and generate questions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quiz Name */}
        <div className="space-y-2">
          <Label htmlFor="quiz-name">Quiz Name</Label>
          <Input
            id="quiz-name"
            placeholder="Enter quiz name"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Grade, Subject, Chapter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Grade</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingGrades ? (
                  <div className="flex items-center justify-center p-4">
                    <Loading size="sm" />
                  </div>
                ) : (
                  grades.map((grade) => (
                    <SelectItem key={grade.classid} value={grade.classid.toString()}>
                      {grade.classname}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedGrade}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingSubjects ? (
                  <div className="flex items-center justify-center p-4">
                    <Loading size="sm" />
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <SelectItem key={subject.subjectid} value={subject.subjectid.toString()}>
                      {subject.subjectname}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Chapter</Label>
            <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedSubject}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select chapter" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingChapters ? (
                  <div className="flex items-center justify-center p-4">
                    <Loading size="sm" />
                  </div>
                ) : (
                  chapters.map((chapter) => (
                    <SelectItem key={chapter.chapterid} value={chapter.chapterid.toString()}>
                      {chapter.chaptername}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-2">
          <Label>Question Count</Label>
          <Select value={selectedQuestionCount} onValueChange={setSelectedQuestionCount}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select question count option" />
            </SelectTrigger>
            <SelectContent>
              {questionCountOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expected Learning Outcomes */}
        {selectedChapter && (
          <div className="space-y-3">
            <Label>Expected Learning Outcomes (ELOs)</Label>
            {isLoadingELOs ? (
              <div className="flex items-center justify-center p-4">
                <Loading size="sm" />
                <span className="ml-2 text-sm text-muted-foreground">Loading ELOs...</span>
              </div>
            ) : elos.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto border border-quiz-border rounded-lg p-4 bg-quiz-bg">
                {elos.map((elo, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Checkbox
                      id={`elo-${index}`}
                      checked={selectedELOs.includes(elo.elo)}
                      onCheckedChange={() => handleELOToggle(elo.elo)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={`elo-${index}`}
                      className="text-sm leading-relaxed cursor-pointer flex-1"
                    >
                      {elo.elo}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-4 text-center border border-dashed border-quiz-border rounded-lg">
                No Expected Learning Outcomes found for this chapter.
              </p>
            )}
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerateQuiz}
          disabled={isGenerating || !quizName || !selectedGrade || !selectedSubject || !selectedChapter || !selectedQuestionCount || selectedELOs.length === 0}
          className="w-full h-12 bg-primary hover:bg-primary-dark transition-all duration-200 text-base font-medium"
        >
          {isGenerating ? (
            <>
              <Loading size="sm" className="mr-2" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Quiz
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};