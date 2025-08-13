import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { LoginForm } from "@/components/auth/LoginForm";
import { CreateQuizForm } from "@/components/quiz/CreateQuizForm";
import { QuizPreview } from "@/components/quiz/QuizPreview";

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

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleQuizGenerated = (generatedQuestions: Question[]) => {
    setQuestions(generatedQuestions);
    // Smooth scroll to quiz preview
    setTimeout(() => {
      const previewElement = document.getElementById('quiz-preview');
      if (previewElement) {
        previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleEditQuestion = (questionId: string, updatedQuestion: Partial<Question>) => {
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, ...updatedQuestion } : q)
    );
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Create Quiz Section */}
        <CreateQuizForm onQuizGenerated={handleQuizGenerated} />

        {/* Quiz Preview Section */}
        {questions.length > 0 && (
          <div id="quiz-preview" className="scroll-mt-24">
            <QuizPreview 
              questions={questions} 
              onEdit={handleEditQuestion}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
