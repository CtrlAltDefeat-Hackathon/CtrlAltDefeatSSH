"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  Heart, 
  Flame, 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw,
  Star,
  Coins,
  Target,
  Zap
} from 'lucide-react';

interface Problem {
  question: string;
  answer: number;
  operation: '+' | '-' | '×' | '÷';
  num1: number;
  num2: number;
}

interface GameStats {
  score: number;
  streak: number;
  lives: number;
  level: number;
  correctAnswers: number;
  totalAnswers: number;
  timeRemaining: number;
}

interface SpeedMathGameProps {
  onGameComplete?: (xp: number, coins: number, stats: GameStats) => void;
}

export const SpeedMathGame: React.FC<SpeedMathGameProps> = ({ onGameComplete }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'ended'>('start');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<number[]>([]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    lives: 3,
    level: 1,
    correctAnswers: 0,
    totalAnswers: 0,
    timeRemaining: 60
  });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showMultipleChoice, setShowMultipleChoice] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateProblem = useCallback((level: number): Problem => {
    let num1: number, num2: number, operation: Problem['operation'], answer: number;

    switch (level) {
      case 1:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operation = Math.random() < 0.5 ? '+' : '-';
        if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
        answer = operation === '+' ? num1 + num2 : num1 - num2;
        break;
      
      case 2:
        num1 = Math.floor(Math.random() * 40) + 10;
        num2 = Math.floor(Math.random() * 40) + 10;
        operation = Math.random() < 0.5 ? '+' : '-';
        if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
        answer = operation === '+' ? num1 + num2 : num1 - num2;
        break;
      
      case 3:
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        operation = '×';
        answer = num1 * num2;
        break;
      
      case 4:
        const operations: Problem['operation'][] = ['+', '-', '×'];
        operation = operations[Math.floor(Math.random() * operations.length)];
        
        if (operation === '×') {
          num1 = Math.floor(Math.random() * 15) + 1;
          num2 = Math.floor(Math.random() * 15) + 1;
          answer = num1 * num2;
        } else {
          num1 = Math.floor(Math.random() * 50) + 10;
          num2 = Math.floor(Math.random() * 50) + 10;
          if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
          answer = operation === '+' ? num1 + num2 : num1 - num2;
        }
        break;
      
      default: // Level 5+
        const allOperations: Problem['operation'][] = ['+', '-', '×', '÷'];
        operation = allOperations[Math.floor(Math.random() * allOperations.length)];
        
        if (operation === '÷') {
          answer = Math.floor(Math.random() * 20) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          num1 = answer * num2;
        } else if (operation === '×') {
          num1 = Math.floor(Math.random() * 20) + 1;
          num2 = Math.floor(Math.random() * 20) + 1;
          answer = num1 * num2;
        } else {
          num1 = Math.floor(Math.random() * 100) + 10;
          num2 = Math.floor(Math.random() * 100) + 10;
          if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
          answer = operation === '+' ? num1 + num2 : num1 - num2;
        }
        break;
    }

    return {
      question: `${num1} ${operation} ${num2}`,
      answer,
      operation,
      num1,
      num2
    };
  }, []);

  const generateMultipleChoiceOptions = useCallback((correctAnswer: number): number[] => {
    const options = [correctAnswer];
    const range = Math.max(10, Math.floor(correctAnswer * 0.3));
    
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * range * 2) - range;
      const option = correctAnswer + offset;
      if (option !== correctAnswer && option > 0 && !options.includes(option)) {
        options.push(option);
      }
    }
    
    return options.sort(() => Math.random() - 0.5);
  }, []);

  const startNewProblem = useCallback(() => {
    const problem = generateProblem(stats.level);
    setCurrentProblem(problem);
    setMultipleChoiceOptions(generateMultipleChoiceOptions(problem.answer));
    setUserAnswer('');
    setFeedback(null);
    
    // Auto-focus input after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [generateProblem, generateMultipleChoiceOptions, stats.level]);

  const checkAnswer = useCallback((answer: number) => {
    if (!currentProblem) return;

    const isCorrect = answer === currentProblem.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setStats(prev => {
      const newStats = {
        ...prev,
        totalAnswers: prev.totalAnswers + 1
      };

      if (isCorrect) {
        const streakBonus = Math.floor(prev.streak / 5) * 10;
        const levelBonus = prev.level * 5;
        const baseScore = 10;
        const scoreIncrease = baseScore + streakBonus + levelBonus;

        newStats.score = prev.score + scoreIncrease;
        newStats.streak = prev.streak + 1;
        newStats.correctAnswers = prev.correctAnswers + 1;

        // Level up every 10 correct answers
        if (newStats.correctAnswers > 0 && newStats.correctAnswers % 10 === 0) {
          newStats.level = Math.min(5, prev.level + 1);
        }
      } else {
        newStats.lives = prev.lives - 1;
        newStats.streak = 0;

        if (newStats.lives <= 0) {
          setGameState('ended');
        }
      }

      return newStats;
    });

    // Show feedback for 800ms then generate new problem
    setTimeout(() => {
      if (stats.lives > 1 || isCorrect) {
        startNewProblem();
      }
    }, 800);
  }, [currentProblem, stats.lives, startNewProblem]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const answer = parseInt(userAnswer);
    if (!isNaN(answer)) {
      checkAnswer(answer);
    }
  }, [userAnswer, checkAnswer]);

  const handleMultipleChoiceAnswer = useCallback((answer: number) => {
    checkAnswer(answer);
  }, [checkAnswer]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setStats({
      score: 0,
      streak: 0,
      lives: 3,
      level: 1,
      correctAnswers: 0,
      totalAnswers: 0,
      timeRemaining: 60
    });
    startNewProblem();

    // Start timer
    timerRef.current = setInterval(() => {
      setStats(prev => {
        if (prev.timeRemaining <= 1) {
          setGameState('ended');
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [startNewProblem]);

  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (gameState === 'paused') {
      setGameState('playing');
      timerRef.current = setInterval(() => {
        setStats(prev => {
          if (prev.timeRemaining <= 1) {
            setGameState('ended');
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
  }, [gameState]);

  const restartGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState('start');
    setCurrentProblem(null);
    setUserAnswer('');
    setFeedback(null);
  }, []);

  // Calculate rewards
  const calculateRewards = useCallback((finalStats: GameStats) => {
    const xp = finalStats.score * 2 + finalStats.correctAnswers * 5;
    const coins = Math.floor(finalStats.score / 10) + finalStats.level * 5;
    return { xp, coins };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle game end
  useEffect(() => {
    if (gameState === 'ended') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const { xp, coins } = calculateRewards(stats);
      if (onGameComplete) {
        onGameComplete(xp, coins, stats);
      }
    }
  }, [gameState, stats, calculateRewards, onGameComplete]);

  if (gameState === 'start') {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Speed Math Challenge
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Solve as many math problems as you can in 60 seconds!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <Timer className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">60 Seconds</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-sm font-medium">3 Lives</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm">Difficulty increases as you progress</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm">Build streaks for bonus points</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="text-sm">Earn XP and coins for rewards</span>
            </div>
          </div>

          <Button 
            onClick={startGame}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'ended') {
    const { xp, coins } = calculateRewards(stats);
    const accuracy = stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;

    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Challenge Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-blue-600">{stats.score}</div>
            <p className="text-muted-foreground">Final Score</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-xl font-bold text-green-600">{stats.correctAnswers}</div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{accuracy}%</div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
              <span className="text-sm font-medium">Level Reached</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Level {stats.level}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
              <span className="text-sm font-medium">Best Streak</span>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">{Math.max(...[stats.streak, 0])}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-center mb-3">Rewards Earned</h4>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-600">{xp}</span>
                </div>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-600">{coins}</span>
                </div>
                <p className="text-xs text-muted-foreground">Coins</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={restartGame}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-lg">{stats.timeRemaining}s</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={pauseGame}
            className="bg-white/60"
          >
            {gameState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        </div>
        
        <Progress 
          value={(stats.timeRemaining / 60) * 100} 
          className="h-2 bg-white/60"
        />
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold">{stats.score}</span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Level {stats.level}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {stats.streak > 0 && (
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-orange-600">{stats.streak}</span>
              </div>
            )}
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < stats.lives ? 'text-red-500 fill-red-500' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {gameState === 'paused' ? (
          <div className="text-center py-8">
            <Pause className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Game Paused</h3>
            <p className="text-muted-foreground">Click the play button to continue</p>
          </div>
        ) : currentProblem && (
          <>
            <div className="text-center py-6">
              <div 
                className={`text-4xl font-bold mb-4 transition-all duration-300 ${
                  feedback === 'correct' 
                    ? 'text-green-600 scale-110' 
                    : feedback === 'wrong' 
                    ? 'text-red-600 scale-110' 
                    : 'text-gray-800'
                }`}
              >
                {currentProblem.question} = ?
              </div>
              
              {feedback && (
                <div className={`text-lg font-semibold ${
                  feedback === 'correct' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
                  {feedback === 'wrong' && (
                    <div className="text-sm mt-1">
                      Answer: {currentProblem.answer}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!feedback && (
              <>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={showMultipleChoice ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowMultipleChoice(false)}
                    className="flex-1"
                  >
                    Type Answer
                  </Button>
                  <Button
                    variant={showMultipleChoice ? "outline" : "default"}
                    size="sm"
                    onClick={() => setShowMultipleChoice(true)}
                    className="flex-1"
                  >
                    Multiple Choice
                  </Button>
                </div>

                {showMultipleChoice ? (
                  <div className="grid grid-cols-2 gap-3">
                    {multipleChoiceOptions.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-14 text-lg font-semibold bg-white/60 hover:bg-white hover:scale-105 transition-all duration-200"
                        onClick={() => handleMultipleChoiceAnswer(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      ref={inputRef}
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter your answer"
                      className="text-center text-xl font-semibold h-14 bg-white/80 border-2 border-blue-200 focus:border-blue-400"
                      autoComplete="off"
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                      disabled={!userAnswer.trim()}
                    >
                      Submit Answer
                    </Button>
                  </form>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};