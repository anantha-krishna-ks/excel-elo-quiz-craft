import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Edit3, FileText, Download, Save } from "lucide-react";
import { QuizQuestion } from "./QuizQuestion";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  elo: string;
  taxonomy: string;
}

interface QuizPreviewProps {
  questions: Question[];
  onEdit: (questionId: string, updatedQuestion: Partial<Question>) => void;
}

export const QuizPreview = ({ questions, onEdit }: QuizPreviewProps) => {
  const [viewMode, setViewMode] = useState<"teacher" | "student">("teacher");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const handleEditQuestion = (questionId: string, updatedQuestion: Partial<Question>) => {
    onEdit(questionId, updatedQuestion);
    setEditingQuestionId(null);
  };

  const handleExport = (format: "pdf" | "docx") => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving quiz");
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Quiz Summary Card */}
      <Card className="border-quiz-border bg-quiz-bg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-primary">Quiz Summary</CardTitle>
              <CardDescription>
                {questions.length} questions generated
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "teacher" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("teacher")}
                className="gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Teacher View
              </Button>
              <Button
                variant={viewMode === "student" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("student")}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Student View
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from(new Set(questions.map(q => q.difficulty))).map(difficulty => (
              <Badge key={difficulty} variant="secondary" className="capitalize">
                {difficulty}: {questions.filter(q => q.difficulty === difficulty).length}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("pdf")}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("docx")}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Word
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">
          Questions ({questions.length})
        </h3>

        {questions.map((question, index) => (
          <div key={question.id}>
            <QuizQuestion
              question={question}
              index={index + 1}
              viewMode={viewMode}
              isEditing={editingQuestionId === question.id}
              onEdit={(updatedQuestion) => handleEditQuestion(question.id, updatedQuestion)}
              onStartEdit={() => setEditingQuestionId(question.id)}
              onCancelEdit={() => setEditingQuestionId(null)}
            />
            {index < questions.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </div>
    </div>
  );
};