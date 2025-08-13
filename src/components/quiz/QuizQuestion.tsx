import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Edit3, Check, X, BookOpen } from "lucide-react";

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

interface QuizQuestionProps {
  question: Question;
  index: number;
  viewMode: "teacher" | "student";
  isEditing: boolean;
  onEdit: (updatedQuestion: Partial<Question>) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export const QuizQuestion = ({
  question,
  index,
  viewMode,
  isEditing,
  onEdit,
  onStartEdit,
  onCancelEdit,
}: QuizQuestionProps) => {
  const [editedQuestion, setEditedQuestion] = useState(question);

  const handleSave = () => {
    onEdit(editedQuestion);
  };

  const handleCancel = () => {
    setEditedQuestion(question);
    onCancelEdit();
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[optionIndex] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-success text-success-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "hard":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className="border-quiz-border hover:border-primary/30 transition-colors">
      <CardContent className="pt-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="font-mono">
                Q{index}
              </Badge>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {question.taxonomy}
              </Badge>
            </div>
          </div>
          
          {viewMode === "teacher" && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartEdit}
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

        {/* Question Text */}
        <div className="mb-4">
          {isEditing ? (
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={editedQuestion.text}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          ) : (
            <p className="text-base leading-relaxed font-medium text-foreground">
              {question.text}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {question.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                viewMode === "teacher" && option === question.correctAnswer
                  ? "border-success bg-success-light"
                  : "border-quiz-border bg-quiz-hover hover:border-primary/30"
              }`}
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    viewMode === "teacher" && option === question.correctAnswer
                      ? "border-success bg-success text-success-foreground"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </div>
              </div>
              
              {isEditing ? (
                <Input
                  value={option}
                  onChange={(e) => updateOption(optionIndex, e.target.value)}
                  className="flex-1"
                />
              ) : (
                <span className="flex-1 text-sm">{option}</span>
              )}
            </div>
          ))}
        </div>

        {/* Teacher-only sections */}
        {viewMode === "teacher" && (
          <>
            {/* Correct Answer */}
            <div className="mb-4 p-3 bg-success-light border border-success rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Correct Answer:</span>
              </div>
              {isEditing ? (
                <Input
                  value={editedQuestion.correctAnswer}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
                />
              ) : (
                <p className="text-sm text-success">{question.correctAnswer}</p>
              )}
            </div>

            {/* Explanation */}
            <div className="mb-4 p-3 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Explanation:</span>
              </div>
              {isEditing ? (
                <Textarea
                  value={editedQuestion.explanation}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
                  className="min-h-[60px]"
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {question.explanation}
                </p>
              )}
            </div>

            {/* ELO */}
            <div className="p-3 bg-accent/50 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-accent-foreground">Expected Learning Outcome:</span>
              </div>
              <p className="text-xs text-accent-foreground/80 leading-relaxed">
                {question.elo}
              </p>
            </div>
          </>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Check className="w-4 h-4" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};