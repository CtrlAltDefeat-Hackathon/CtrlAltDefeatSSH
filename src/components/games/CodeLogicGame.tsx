"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Code,
  Terminal,
  Trophy,
  RotateCcw,
  Coins } from
'lucide-react';

interface CodeLogicGameProps {
  onGameComplete: (score: number, xpEarned: number, coinsEarned: number) => void;
}

interface Question {
  type: 'predict_output' | 'complete_code';
  text: string;
  code: string;
  answer: string;
  output: string;
  explanation?: string;
}

type GameState = 'start' | 'playing' | 'ended';

const allQuestions: Question[] = [
// --- Predict Output Questions (C Language) ---
{
  type: 'predict_output',
  text: 'What will be printed to the console? Type your answer below.',
  code: '#include <stdio.h>\n\nint main() {\n  printf("Hello, C!");\n  return 0;\n}',
  answer: 'Hello, C!',
  output: 'Hello, C!'
},
{
  type: 'predict_output',
  text: 'What is the final value of \'x\' that gets printed?',
  code: '#include <stdio.h>\n\nint main() {\n  int x = 5;\n  x = x + 10;\n  printf("%d", x);\n  return 0;\n}',
  answer: '15',
  output: '15'
},
{
  type: 'predict_output',
  text: 'What will this loop print? (Mind the spacing)',
  code: '#include <stdio.h>\n\nint main() {\n  for(int i = 0; i < 3; i++) {\n    printf("C ");\n  }\n  return 0;\n}',
  answer: 'C C C ',
  output: 'C C C ',
  explanation: 'The loop runs three times, printing "C " each time, including a final space.'
},
{
  type: 'predict_output',
  text: 'What value is printed from the array?',
  code: '#include <stdio.h>\n\nint main() {\n  int numbers[] = {10, 20, 30};\n  printf("%d", numbers[2]);\n  return 0;\n}',
  answer: '30',
  output: '30',
  explanation: 'Array indices are zero-based, so index 2 refers to the third element.'
},
{
  type: 'predict_output',
  text: 'What will be the output of this conditional check?',
  code: '#include <stdio.h>\n\nint main() {\n  int a = 10;\n  if (a > 5) {\n    printf("Greater");\n  } else {\n    printf("Smaller");\n  }\n  return 0;\n}',
  answer: 'Greater',
  output: 'Greater'
},
// --- Complete the Code Questions (C Language) ---
{
  type: 'complete_code',
  text: 'Fill in the blank to print "Hello World".',
  code: '#include <stdio.h>\n\nint main() {\n  _____("Hello World");\n  return 0;\n}',
  answer: 'printf',
  output: 'Hello World'
},
{
  type: 'complete_code',
  text: "Fill in the blank to declare an integer variable named 'score'.",
  code: '#include <stdio.h>\n\nint main() {\n  ____ score = 100;\n  printf("%d", score);\n  return 0;\n}',
  answer: 'int',
  output: '100'
},
{
  type: 'complete_code',
  text: 'Fill in the blank to correctly include the standard I/O library.',
  code: '#include <____.h>\n\nint main() {\n  printf("Success!");\n  return 0;\n}',
  answer: 'stdio',
  output: 'Success!'
},
{
  type: 'complete_code',
  text: 'Fill in the blank to make the for loop run 5 times.',
  code: '#include <stdio.h>\n\nint main() {\n  for(int i = 0; i < ____; i++) {\n    printf("Loop\\n");\n  }\n  return 0;\n}',
  answer: '5',
  output: 'Loop\nLoop\nLoop\nLoop\nLoop'
},
{
  type: 'complete_code',
  text: 'Fill in the blank with the correct format specifier to print an integer.',
  code: '#include <stdio.h>\n\nint main() {\n  int age = 25;\n  printf("Age: ____", age);\n  return 0;\n}',
  answer: '%d',
  output: 'Age: 25'
}];

export const CodeLogicGame: React.FC<CodeLogicGameProps> = ({ onGameComplete }) => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('Output will appear here...');

  const shuffleArray = (array: Question[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCurrentQuestionIndex(0);
    setCurrentQuestions(shuffleArray([...allQuestions]).slice(0, 3));
    setUserAnswer('');
    setShowResult(false);
    setTerminalOutput('Output will appear here...');
  }, []);

  const currentQuestion = currentQuestions[currentQuestionIndex];

  const checkAnswer = () => {
    if (!currentQuestion || userAnswer.trim() === '') return;

    const correct = userAnswer.trim() === currentQuestion.answer;
    setIsCorrect(correct);
    setShowResult(true);
    setTerminalOutput(currentQuestion.output);

    if (correct) {
      setScore((prev) => prev + 10);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setUserAnswer('');
    setShowResult(false);
    setTerminalOutput('Output will appear here...');

    if (currentQuestionIndex >= currentQuestions.length - 1) {
      endGame();
    }
  };

  const endGame = useCallback(() => {
    setGameState('ended');
    const xpEarned = score * 2;
    const coinsEarned = Math.floor(score / 10);
    onGameComplete(score, xpEarned, coinsEarned);
  }, [score, onGameComplete]);

  if (gameState === 'start') {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-blue-900 text-white border-2 border-blue-400">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center">
              <Code className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            CodeQuest: C Edition
          </CardTitle>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            Your journey to becoming a C programmer begins!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-600">
            <h3 className="text-xl font-semibold mb-4 text-center !whitespace-pre-line"></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span>C Programming Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span>Output Prediction</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Code Completion Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-orange-400" />
                <span>Score & XP Rewards</span>
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-gray-300">
              Answer 3 random C programming questions
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400">
                Predict Output
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-400">
                Complete Code
              </Badge>
            </div>
          </div>

          <Button
            onClick={startGame}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500 text-white font-semibold py-3 text-lg">
            <Play className="w-5 h-5 mr-2" />
            Start Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'ended') {
    const xpEarned = score * 2;
    const coinsEarned = Math.floor(score / 10);

    return (
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-blue-900 text-white border-2 border-blue-400">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Congratulations!</CardTitle>
          <p className="text-xl text-gray-300">You've completed the CodeQuest challenge.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-green-400">{score}</div>
            <p className="text-gray-300 text-lg">Final Score</p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="text-3xl font-bold text-yellow-400">{xpEarned}</div>
              <p className="text-sm text-gray-300">XP Earned</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-2">
                <Coins className="w-6 h-6" />
                {coinsEarned}
              </div>
              <p className="text-sm text-gray-300">Coins Earned</p>
            </div>
          </div>

          <Button
            onClick={startGame}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500 text-white font-semibold py-3 text-lg">
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-blue-400 to-green-400 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-semibold">
              Score: <span className="text-2xl font-bold">{score}</span>
            </div>
            <div className="text-xl font-semibold">
              Question: <span className="text-2xl font-bold text-blue-100">
                {currentQuestionIndex + 1} / {currentQuestions.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Challenge Area */}
      <Card className="bg-[#1f2335] border-2 border-slate-600">
        <CardContent className="p-6 space-y-4">
          {currentQuestion && (
            <>
              <p className="text-lg text-gray-300 min-h-[4rem] flex items-center">
                {currentQuestion.text}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code Editor */}
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400">
                    CODE EDITOR
                  </label>
                  <div className="bg-[#24283b] border border-[#3b4261] rounded-md p-4 h-64 overflow-y-auto">
                    <pre className="text-[#a9b1d6] font-mono text-sm whitespace-pre-wrap">
                      {currentQuestion.type === 'complete_code' && userAnswer ?
                        currentQuestion.code.replace('____', userAnswer) :
                        currentQuestion.code}
                    </pre>
                  </div>
                </div>

                {/* Terminal */}
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400">
                    TERMINAL
                  </label>
                  <div className="bg-[#10111a] border border-[#3b4261] rounded-md p-4 h-64 overflow-y-auto">
                    <div className="font-mono text-sm">
                      <span className="text-green-400">&gt;&nbsp;</span>
                      <span className="text-gray-300">{terminalOutput}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Input Area */}
              <div className="mt-4">
                <label className="block mb-2 text-sm font-bold text-gray-400">
                  {currentQuestion.type === 'predict_output' ?
                    'YOUR PREDICTED OUTPUT' :
                    'FILL IN THE BLANK (____)'
                  }
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full p-2 rounded bg-[#24283b] border border-[#3b4261] text-[#a9b1d6] font-mono"
                  placeholder={currentQuestion.type === 'predict_output' ?
                    'Type the exact output here...' :
                    'Type the missing code here...'
                  }
                  disabled={showResult}
                />
              </div>

              {/* Result Display */}
              {showResult && (
                <div className={`p-4 rounded-lg border ${
                  isCorrect ?
                    'bg-green-900/30 border-green-400 text-green-300' :
                    'bg-red-900/30 border-red-400 text-white'}`
                }>
                  <h3 className="text-white font-bold mb-2">
                    {isCorrect ? 'Correct! 🎉' : 'Not Quite... 🤔'}
                  </h3>
                  <p className="mb-2">
                    {isCorrect ?
                      currentQuestion.explanation || 'Great job! You nailed it.' :
                      `The correct answer was: "${currentQuestion.answer}"`
                    }
                  </p>
                  {!isCorrect && currentQuestion.explanation && (
                    <p className="text-sm">
                      <strong>Why?</strong> {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6 flex justify-end">
                {!showResult ? (
                  <Button
                    onClick={checkAnswer}
                    className="bg-[#7aa2f7] hover:bg-[#9ece6a] text-[#1a1b26] font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all">
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    className="bg-[#7aa2f7] hover:bg-[#9ece6a] text-[#1a1b26] font-bold py-3 px-6 rounded-lg">
                    {currentQuestionIndex >= currentQuestions.length - 1 ?
                      'Finish Game' :
                      'Next Question'
                    }
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};