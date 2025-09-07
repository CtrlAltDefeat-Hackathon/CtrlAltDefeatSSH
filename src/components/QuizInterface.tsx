"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Timer, 
  TimerOff, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Home, 
  Trophy, 
  Coins, 
  Zap, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Languages, 
  SkipForward, 
  Flag,
  Pause,
  Play,
  X,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface QuizInterfaceProps {
  subject: {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
  };
  questions: Array<{
    id: number;
    questionText: string;
    explanation: string;
    difficultyLevel: string;
    xpReward: number;
    coinReward: number;
    options: Array<{
      id: number;
      optionText: string;
      isCorrect: boolean;
      optionOrder: number;
      translations?: Array<{
        languageCode: string;
        optionText: string;
      }>;
    }>;
    translations?: Array<{
      languageCode: string;
      questionText: string;
      explanation: string;
    }>;
  }>;
  userSession: any;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'od', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
];

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200'
};

const STORAGE_KEYS = {
  QUIZ_SESSION: 'quiz_session_',
  LANGUAGE_PREFERENCE: 'quiz_language_preference',
  TIMER_PREFERENCE: 'quiz_timer_enabled'
};

export const QuizInterface = ({ subject, questions, userSession }: QuizInterfaceProps) => {
  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  
  // Timer State
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes default
  const [timerPaused, setTimerPaused] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  
  // UI State
  const [language, setLanguage] = useState('en');
  const [isOnline, setIsOnline] = useState(true);
  const [shuffledQuestions, setShuffledQuestions] = useState<typeof questions>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Shuffle questions on quiz start
  const shuffleArray = useCallback((array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Initialize quiz
  useEffect(() => {
    // Load preferences
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
    if (savedLanguage) setLanguage(savedLanguage);
    
    const savedTimerPref = localStorage.getItem(STORAGE_KEYS.TIMER_PREFERENCE);
    if (savedTimerPref) setTimerEnabled(JSON.parse(savedTimerPref));

    // Check for saved session
    const sessionKey = `${STORAGE_KEYS.QUIZ_SESSION}${subject.id}`;
    const savedSession = localStorage.getItem(sessionKey);
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setSelectedAnswers(session.selectedAnswers);
      setCurrentQuestionIndex(session.currentQuestionIndex);
      setShuffledQuestions(session.shuffledQuestions);
      setTimeRemaining(session.timeRemaining);
      setQuestionTimes(session.questionTimes);
      setQuizStarted(true);
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [subject.id]);

  // Save session to localStorage
  const saveSession = useCallback(() => {
    if (!quizStarted || quizCompleted) return;
    
    const sessionKey = `${STORAGE_KEYS.QUIZ_SESSION}${subject.id}`;
    const sessionData = {
      selectedAnswers,
      currentQuestionIndex,
      shuffledQuestions,
      timeRemaining,
      questionTimes,
      lastSaved: Date.now()
    };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
  }, [selectedAnswers, currentQuestionIndex, shuffledQuestions, timeRemaining, questionTimes, quizStarted, quizCompleted, subject.id]);

  // Auto-save session
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const interval = setInterval(saveSession, 5000);
      return () => clearInterval(interval);
    }
  }, [quizStarted, quizCompleted, saveSession]);

  // Timer logic
  useEffect(() => {
    if (!timerEnabled || !quizStarted || quizCompleted || timerPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleQuizSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnabled, quizStarted, quizCompleted, timerPaused]);

  // Question timer
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, quizStarted, quizCompleted]);

  // Current question data with translations
  const currentQuestion = useMemo(() => {
    if (!shuffledQuestions.length) return null;
    
    const question = shuffledQuestions[currentQuestionIndex];
    if (!question) return null;

    let questionText = question.questionText;
    let explanation = question.explanation;
    
    if (language !== 'en' && question.translations) {
      const translation = question.translations.find(t => t.languageCode === language);
      if (translation) {
        questionText = translation.questionText;
        explanation = translation.explanation;
      }
    }

    const optionsWithTranslations = question.options.map(option => {
      let optionText = option.optionText;
      
      if (language !== 'en' && option.translations) {
        const translation = option.translations.find(t => t.languageCode === language);
        if (translation) {
          optionText = translation.optionText;
        }
      }
      
      return { ...option, optionText };
    });

    return {
      ...question,
      questionText,
      explanation,
      options: optionsWithTranslations
    };
  }, [shuffledQuestions, currentQuestionIndex, language]);

  // Quiz statistics
  const quizStats = useMemo(() => {
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = shuffledQuestions.length;
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    
    let correctAnswers = 0;
    let totalXP = 0;
    let totalCoins = 0;
    
    Object.entries(selectedAnswers).forEach(([questionId, selectedOptionId]) => {
      const question = shuffledQuestions.find(q => q.id === parseInt(questionId));
      if (question) {
        const isCorrect = question.options.some(opt => opt.id === selectedOptionId && opt.isCorrect);
        if (isCorrect) {
          correctAnswers++;
          totalXP += question.xpReward;
          totalCoins += question.coinReward;
        }
      }
    });
    
    const scorePercentage = answeredCount > 0 ? Math.round((correctAnswers / answeredCount) * 100) : 0;
    
    return {
      answeredCount,
      totalQuestions,
      progressPercentage,
      correctAnswers,
      scorePercentage,
      totalXP,
      totalCoins
    };
  }, [selectedAnswers, shuffledQuestions]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Start quiz
  const handleQuizStart = () => {
    const shuffled = shuffleArray(questions);
    setShuffledQuestions(shuffled);
    setQuizStarted(true);
    setQuestionStartTime(Date.now());
    
    // Clear any existing session
    const sessionKey = `${STORAGE_KEYS.QUIZ_SESSION}${subject.id}`;
    localStorage.removeItem(sessionKey);
    
    toast.success(`Quiz started! ${shuffled.length} questions to go.`);
  };

  // Handle answer selection
  const handleAnswerSelect = (optionId: number) => {
    if (showFeedback) return;
    
    const questionId = currentQuestion?.id;
    if (!questionId) return;

    // Record time spent on question
    if (questionStartTime) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: timeSpent
      }));
    }

    setCurrentAnswer(optionId);
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    setShowFeedback(true);
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
      setCurrentAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      handleQuizSubmit();
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowFeedback(false);
      setCurrentAnswer(null);
      setQuestionStartTime(Date.now());
    }
  };

  // Skip question
  const handleSkipQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
      setCurrentAnswer(null);
      setQuestionStartTime(Date.now());
    }
  };

  // Submit quiz
  const handleQuizSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare quiz data for API
      const quizQuestions = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
        questionId: parseInt(questionId),
        selectedOptionId,
        timeTakenSeconds: questionTimes[parseInt(questionId)] || 0
      }));

      // Submit to API if online
      if (isOnline) {
        const token = localStorage.getItem('bearer_token');
        const response = await fetch('/api/quiz-attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            subjectId: subject.id,
            questions: quizQuestions
          })
        });

        if (response.ok) {
          toast.success('Quiz submitted successfully!');
        } else {
          throw new Error('Failed to submit quiz');
        }
      } else {
        // Store offline for later sync
        const offlineData = {
          subjectId: subject.id,
          questions: quizQuestions,
          completedAt: new Date().toISOString()
        };
        const offlineKey = `offline_quiz_${Date.now()}`;
        localStorage.setItem(offlineKey, JSON.stringify(offlineData));
        toast.success('Quiz saved offline. Will sync when online.');
      }
      
      // Clear session
      const sessionKey = `${STORAGE_KEYS.QUIZ_SESSION}${subject.id}`;
      localStorage.removeItem(sessionKey);
      
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
      setQuizCompleted(true);
    }
  };

  // Exit quiz
  const handleExitQuiz = () => {
    const sessionKey = `${STORAGE_KEYS.QUIZ_SESSION}${subject.id}`;
    localStorage.removeItem(sessionKey);
    setQuizStarted(false);
    setQuizCompleted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    setCurrentAnswer(null);
    setShuffledQuestions([]);
    setShowExitDialog(false);
    toast.success('Quiz session ended.');
  };

  // Retry quiz
  const handleRetryQuiz = () => {
    setQuizCompleted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    setCurrentAnswer(null);
    setTimeRemaining(3600);
    setQuestionTimes({});
    handleQuizStart();
  };

  // Update language preference
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, newLanguage);
  };

  // Toggle timer
  const handleTimerToggle = () => {
    const newTimerState = !timerEnabled;
    setTimerEnabled(newTimerState);
    localStorage.setItem(STORAGE_KEYS.TIMER_PREFERENCE, JSON.stringify(newTimerState));
  };

  // Quiz not started state
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{subject.icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
                <p className="text-gray-600">{subject.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff size={12} />
                  Offline
                </Badge>
              )}
              {isOnline && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Wifi size={12} />
                  Online
                </Badge>
              )}
            </div>
          </div>

          {/* Quiz setup card */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Quiz Setup</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timer settings */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Timer</label>
                  <p className="text-xs text-gray-600">Enable 60-minute timer for the quiz</p>
                </div>
                <Button
                  variant={timerEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleTimerToggle}
                  className="flex items-center gap-2"
                >
                  {timerEnabled ? <Timer size={16} /> : <TimerOff size={16} />}
                  {timerEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {/* Quiz info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                  <div className="text-xs text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{timerEnabled ? '60' : '∞'}</div>
                  <div className="text-xs text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {questions.reduce((sum, q) => sum + q.xpReward, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Max XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {questions.reduce((sum, q) => sum + q.coinReward, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Max Coins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start quiz button */}
          <div className="text-center">
            <Button 
              onClick={handleQuizStart}
              size="lg" 
              className="px-8 py-4 text-lg font-semibold"
            >
              <BookOpen className="mr-2" size={20} />
              Start Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz completed state
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
            <p className="text-gray-600">Great job on completing the {subject.name} quiz</p>
          </motion.div>

          {/* Results cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="mx-auto mb-3 text-yellow-500" size={32} />
                <div className="text-2xl font-bold text-gray-900 mb-1">{quizStats.scorePercentage}%</div>
                <div className="text-sm text-gray-600">Final Score</div>
                <div className="text-xs text-gray-500 mt-1">
                  {quizStats.correctAnswers} of {quizStats.answeredCount} correct
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="mx-auto mb-3 text-purple-500" size={32} />
                <div className="text-2xl font-bold text-gray-900 mb-1">{quizStats.totalXP}</div>
                <div className="text-sm text-gray-600">XP Earned</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Coins className="mx-auto mb-3 text-yellow-600" size={32} />
                <div className="text-2xl font-bold text-gray-900 mb-1">{quizStats.totalCoins}</div>
                <div className="text-sm text-gray-600">Coins Earned</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance breakdown */}
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">Performance Breakdown</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Questions Answered</span>
                  <span className="font-medium">{quizStats.answeredCount} / {quizStats.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Correct Answers</span>
                  <span className="font-medium text-green-600">{quizStats.correctAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Incorrect Answers</span>
                  <span className="font-medium text-red-600">{quizStats.answeredCount - quizStats.correctAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accuracy</span>
                  <span className="font-medium">{quizStats.scorePercentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleRetryQuiz} variant="outline" size="lg">
              <RotateCcw className="mr-2" size={16} />
              Retry Quiz
            </Button>
            <Button onClick={() => window.location.href = '/'} size="lg">
              <Home className="mr-2" size={16} />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz state
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  const isCurrentAnswered = selectedAnswers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const selectedOption = showFeedback && currentAnswer ? 
    currentQuestion.options.find(opt => opt.id === currentAnswer) : null;
  const correctOption = currentQuestion.options.find(opt => opt.isCorrect);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Exit confirmation dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="text-orange-500" size={20} />
                Exit Quiz?
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Are you sure you want to exit? Your progress will be lost.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowExitDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleExitQuiz} className="flex-1">
                  Exit Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExitDialog(true)}
              className="text-gray-500 hover:text-red-600"
            >
              <X size={16} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{subject.icon}</div>
              <div>
                <h1 className="font-semibold text-gray-900">{subject.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</span>
                  {timerEnabled && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span className={timeRemaining < 300 ? 'text-red-600 font-medium' : ''}>
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isOnline && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff size={12} />
                Offline
              </Badge>
            )}
            
            {/* Language selector */}
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <Languages size={14} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span className="text-xs">{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Timer controls */}
            {timerEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimerPaused(!timerPaused)}
                className="flex items-center gap-1"
              >
                {timerPaused ? <Play size={14} /> : <Pause size={14} />}
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-3">
          <Progress 
            value={quizStats.progressPercentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{quizStats.answeredCount} answered</span>
            <span>{quizStats.progressPercentage.toFixed(0)}% complete</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className={DIFFICULTY_COLORS[currentQuestion.difficultyLevel as keyof typeof DIFFICULTY_COLORS]}>
                    {currentQuestion.difficultyLevel.charAt(0).toUpperCase() + currentQuestion.difficultyLevel.slice(1)}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Zap size={14} />
                      {currentQuestion.xpReward} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins size={14} />
                      {currentQuestion.coinReward} Coins
                    </span>
                  </div>
                </div>
                <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
                  {currentQuestion.questionText}
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AnimatePresence mode="wait">
                    {currentQuestion.options
                      .sort((a, b) => a.optionOrder - b.optionOrder)
                      .map((option) => {
                        const isSelected = currentAnswer === option.id;
                        const isCorrect = option.isCorrect;
                        const wasSelected = selectedAnswers[currentQuestion.id] === option.id;
                        
                        let buttonVariant = "outline";
                        let buttonClass = "justify-start text-left h-auto p-4 transition-all duration-200";
                        
                        if (showFeedback) {
                          if (isCorrect) {
                            buttonClass += " bg-green-50 border-green-300 text-green-800";
                          } else if (isSelected && !isCorrect) {
                            buttonClass += " bg-red-50 border-red-300 text-red-800";
                          } else {
                            buttonClass += " opacity-60";
                          }
                        } else {
                          if (wasSelected) {
                            buttonClass += " bg-blue-50 border-blue-300";
                          } else {
                            buttonClass += " hover:bg-gray-50";
                          }
                        }

                        return (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: option.optionOrder * 0.1 }}
                          >
                            <Button
                              variant={buttonVariant as any}
                              onClick={() => handleAnswerSelect(option.id)}
                              disabled={showFeedback}
                              className={`w-full ${buttonClass}`}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm font-medium">
                                  {String.fromCharCode(65 + option.optionOrder - 1)}
                                </div>
                                <span className="flex-1 text-sm">{option.optionText}</span>
                                {showFeedback && (
                                  <div className="flex-shrink-0">
                                    {isCorrect ? (
                                      <CheckCircle className="text-green-600" size={20} />
                                    ) : isSelected ? (
                                      <XCircle className="text-red-600" size={20} />
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </div>

                {/* Feedback section */}
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-4 rounded-lg bg-gray-50 border"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {selectedOption?.isCorrect ? (
                          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                        ) : (
                          <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        )}
                        <div className="flex-1">
                          <p className={`font-medium ${selectedOption?.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            {selectedOption?.isCorrect ? 'Correct!' : 'Incorrect'}
                          </p>
                          {!selectedOption?.isCorrect && (
                            <p className="text-sm text-gray-600 mt-1">
                              The correct answer is: <strong>{correctOption?.optionText}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {currentQuestion.explanation && (
                        <>
                          <Separator className="my-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Explanation</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {currentQuestion.explanation}
                            </p>
                          </div>
                        </>
                      )}

                      {selectedOption?.isCorrect && (
                        <>
                          <Separator className="my-3" />
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                              <Zap size={14} />
                              +{currentQuestion.xpReward} XP
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Coins size={14} />
                              +{currentQuestion.coinReward} Coins
                            </span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation controls */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {!showFeedback && !isCurrentAnswered && (
                  <Button
                    variant="ghost"
                    onClick={handleSkipQuestion}
                    disabled={isLastQuestion}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <SkipForward size={16} />
                    Skip
                  </Button>
                )}

                {showFeedback && (
                  <Button
                    onClick={isLastQuestion ? handleQuizSubmit : handleNextQuestion}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {isLastQuestion ? (
                          <>
                            <Flag size={16} />
                            Finish Quiz
                          </>
                        ) : (
                          <>
                            Next
                            <ChevronRight size={16} />
                          </>
                        )}
                      </>
                    )}
                  </Button>
                )}

                {!showFeedback && isCurrentAnswered && (
                  <Button
                    onClick={isLastQuestion ? handleQuizSubmit : handleNextQuestion}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {isLastQuestion ? (
                          <>
                            <Flag size={16} />
                            Finish Quiz
                          </>
                        ) : (
                          <>
                            Next
                            <ChevronRight size={16} />
                          </>
                        )}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-4">
              {/* Current stats */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-medium text-sm">Progress</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Answered</span>
                    <span className="font-medium">{quizStats.answeredCount}/{quizStats.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Correct</span>
                    <span className="font-medium text-green-600">{quizStats.correctAnswers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Score</span>
                    <span className="font-medium">{quizStats.scorePercentage}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Zap size={12} />
                      XP Earned
                    </span>
                    <span className="font-medium text-purple-600">{quizStats.totalXP}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Coins size={12} />
                      Coins Earned
                    </span>
                    <span className="font-medium text-yellow-600">{quizStats.totalCoins}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Question navigator */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-medium text-sm">Questions</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {shuffledQuestions.map((question, index) => {
                      const isAnswered = selectedAnswers[question.id] !== undefined;
                      const isCurrent = index === currentQuestionIndex;
                      
                      return (
                        <Button
                          key={question.id}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCurrentQuestionIndex(index);
                            setShowFeedback(false);
                            setCurrentAnswer(null);
                            setQuestionStartTime(Date.now());
                          }}
                          className={`h-8 w-8 p-0 text-xs ${
                            isAnswered && !isCurrent 
                              ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' 
                              : ''
                          }`}
                        >
                          {index + 1}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  {timerEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTimerPaused(!timerPaused)}
                      className="w-full justify-start text-sm"
                    >
                      {timerPaused ? <Play size={14} /> : <Pause size={14} />}
                      <span className="ml-2">{timerPaused ? 'Resume' : 'Pause'} Timer</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExitDialog(true)}
                    className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X size={14} />
                    <span className="ml-2">Exit Quiz</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};