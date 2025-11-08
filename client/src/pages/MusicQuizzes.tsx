import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GameController, Play, Trophy, Users, ArrowLeft } from '@phosphor-icons/react';

const DEMO_USER_ID = 'demo-user';

export default function MusicQuizzes() {
  const { toast } = useToast();
  const userId = DEMO_USER_ID;
  
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const { data: quizzes = [] } = useQuery({
    queryKey: ['/api/quizzes'],
  });

  const { data: selectedQuizData, isLoading: quizLoading, isError: quizError } = useQuery({
    queryKey: ['/api/quizzes', selectedQuiz?.id],
    enabled: !!selectedQuiz,
    queryFn: async () => {
      const res = await fetch(`/api/quizzes/${selectedQuiz!.id}`);
      if (!res.ok) throw new Error('Quiz konnte nicht geladen werden');
      return res.json();
    },
  });

  const { data: userScores } = useQuery({
    queryKey: ['/api/users', userId, 'quiz-scores'],
    enabled: !selectedQuiz,
  });

  const playQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      return apiRequest('POST', `/api/quizzes/${quizId}/play`, {});
    },
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (data: { quizId: string; userId: string; score: number; maxScore: number }) => {
      return apiRequest('POST', `/api/quizzes/${data.quizId}/scores`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'quiz-scores'] });
      toast({
        title: 'Score gespeichert!',
        description: `Du hast ${variables.score} von ${variables.maxScore} Punkten erreicht!`,
      });
    },
  });

  const handleStartQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setIsQuizComplete(false);
    setSelectedAnswer(null);
    playQuizMutation.mutate(quiz.id);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || !selectedQuizData) return;
    
    const questions = selectedQuizData.questions 
      ? (typeof selectedQuizData.questions === 'string' 
        ? JSON.parse(selectedQuizData.questions) 
        : selectedQuizData.questions) 
      : [];
    
    setSelectedAnswer(answerIndex);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctIndex;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (!selectedQuizData) return;
    
    const questions = selectedQuizData.questions 
      ? (typeof selectedQuizData.questions === 'string' 
        ? JSON.parse(selectedQuizData.questions) 
        : selectedQuizData.questions) 
      : [];
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsQuizComplete(true);
      if (selectedQuiz) {
        submitScoreMutation.mutate({
          quizId: selectedQuiz.id,
          userId,
          score,
          maxScore: questions.length,
        });
      }
    }
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setIsQuizComplete(false);
    setSelectedAnswer(null);
  };

  if (isQuizComplete && selectedQuiz && selectedQuizData) {
    const questions = selectedQuizData.questions 
      ? (typeof selectedQuizData.questions === 'string' 
        ? JSON.parse(selectedQuizData.questions) 
        : selectedQuizData.questions) 
      : [];
    
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <Trophy size={64} weight="fill" className="mx-auto text-primary mb-4" />
          <h2 className="text-3xl font-bold mb-2" data-testid="text-quiz-complete">
            Quiz abgeschlossen!
          </h2>
          <p className="text-muted-foreground mb-6">
            {selectedQuiz.title}
          </p>
          
          <div className="mb-8">
            <div className="text-6xl font-bold text-primary mb-2" data-testid="text-final-score">
              {score}/{questions.length}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% korrekt
            </div>
          </div>

          <div className="space-y-4">
            {percentage >= 80 && (
              <div className="p-4 bg-primary/10 rounded-md border border-primary/20">
                <p className="font-semibold text-primary">
                  🎉 Hervorragend! Du bist ein echter Musik-Experte!
                </p>
              </div>
            )}
            {percentage >= 50 && percentage < 80 && (
              <div className="p-4 bg-muted rounded-md">
                <p className="font-semibold">
                  👍 Gut gemacht! Du kennst dich aus!
                </p>
              </div>
            )}
            {percentage < 50 && (
              <div className="p-4 bg-muted rounded-md">
                <p className="font-semibold">
                  💪 Nicht schlecht! Versuch es nochmal!
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleStartQuiz(selectedQuiz)}
                data-testid="button-retry-quiz"
              >
                <Play size={20} weight="fill" className="mr-2" />
                Nochmal spielen
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToQuizzes}
                data-testid="button-back-to-quizzes"
              >
                <ArrowLeft size={20} weight="bold" className="mr-2" />
                Zurück zur Übersicht
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedQuiz) {
    // Error state if quiz couldn't be loaded
    if (quizError) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-destructive text-xl mb-4">❌ Quiz konnte nicht geladen werden</p>
            <p className="text-muted-foreground mb-6">
              Dieses Quiz existiert möglicherweise nicht oder es gab einen Fehler beim Laden.
            </p>
            <Button onClick={handleBackToQuizzes} data-testid="button-back-error">
              <ArrowLeft size={20} weight="bold" className="mr-2" />
              Zurück zur Übersicht
            </Button>
          </Card>
        </div>
      );
    }

    // Loading state while quiz data is being fetched
    if (quizLoading || !selectedQuizData) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" data-testid="spinner-loading"></div>
              <p className="text-muted-foreground">Quiz wird geladen...</p>
            </div>
          </div>
        </div>
      );
    }

    const questions = selectedQuizData.questions 
      ? (typeof selectedQuizData.questions === 'string' 
        ? JSON.parse(selectedQuizData.questions) 
        : selectedQuizData.questions) 
      : [];
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBackToQuizzes}
            data-testid="button-back"
          >
            <ArrowLeft size={20} weight="bold" className="mr-2" />
            Zurück
          </Button>
          <div className="text-sm text-muted-foreground" data-testid="text-question-counter">
            Frage {currentQuestionIndex + 1} von {questions.length}
          </div>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" data-testid="text-quiz-title">
                {selectedQuiz.title}
              </h2>
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-primary" />
                <span className="font-semibold" data-testid="text-current-score">
                  {score} Punkte
                </span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                data-testid="progress-bar"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-6">
              <GameController size={64} weight="bold" className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-6" data-testid="text-question">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuestion.correctIndex;
              const showCorrect = showResult && isCorrectOption;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  variant={showCorrect ? 'default' : showWrong ? 'destructive' : 'outline'}
                  className={`h-auto py-4 px-6 text-left justify-start ${
                    isSelected && !showResult ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  data-testid={`button-answer-${index}`}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              );
            })}
          </div>

          {showResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${isCorrect ? 'bg-primary/10 border border-primary/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <p className={`font-semibold ${isCorrect ? 'text-primary' : 'text-destructive'}`}>
                  {isCorrect ? '✅ Richtig!' : '❌ Leider falsch!'}
                </p>
                {!isCorrect && (
                  <p className="text-sm mt-1">
                    Die richtige Antwort war: <strong>{currentQuestion.options[currentQuestion.correctIndex]}</strong>
                  </p>
                )}
              </div>
              <Button
                onClick={handleNextQuestion}
                className="w-full"
                data-testid="button-next"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <GameController size={32} weight="bold" className="text-primary" />
        <h1 className="text-3xl font-bold" data-testid="heading-quizzes">Music Quizzes</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Teste dein Musikwissen mit verschiedenen Quizzes! Erkenne Songs, Künstler und mehr.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz: any) => (
          <Card
            key={quiz.id}
            className="p-6 hover-elevate cursor-pointer"
            onClick={() => handleStartQuiz(quiz)}
            data-testid={`card-quiz-${quiz.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2" data-testid={`text-title-${quiz.id}`}>
                  {quiz.title}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid={`text-description-${quiz.id}`}>
                  {quiz.description}
                </p>
              </div>
              <GameController size={32} weight="bold" className="text-primary" />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Users size={16} weight="bold" />
                <span>{quiz.playCount?.toLocaleString() || 0} Spieler</span>
              </div>
              <Badge variant="secondary">
                {quiz.tracks?.length || 5} Fragen
              </Badge>
            </div>

            <Button className="w-full" data-testid={`button-play-${quiz.id}`}>
              <Play size={20} weight="fill" className="mr-2" />
              Quiz starten
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
