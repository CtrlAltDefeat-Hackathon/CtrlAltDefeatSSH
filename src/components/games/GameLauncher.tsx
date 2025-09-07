"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calculator, Code, Beaker, Target, Timer, Star, Coins } from 'lucide-react';
import { SpeedMathGame } from './SpeedMathGame';
import { CodeLogicGame } from './CodeLogicGame';
import { ChemistryElementMatchGame } from './ElementMatchGame';
import { ProjectileMaster } from './ProjectileMaster';

interface GameCompletionResult {
  score: number;
  xp: number;
  coins: number;
  gameType: string;
}

interface GameLauncherProps {
  onGameComplete?: (result: GameCompletionResult) => void;
}

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  component: React.ComponentType<any>;
}

const games: Game[] = [
  {
    id: 'speed-math',
    title: 'Speed Math Challenge',
    description: 'Test your arithmetic skills with rapid-fire calculations',
    icon: <Calculator className="h-6 w-6" />,
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-cyan-500',
    duration: '60s',
    difficulty: 'Easy',
    component: SpeedMathGame
  },
  {
    id: 'code-logic',
    title: 'Code Logic Puzzles',
    description: 'Solve programming challenges and logical problems',
    icon: <Code className="h-6 w-6" />,
    color: 'text-green-600',
    bgGradient: 'from-green-500 to-emerald-500',
    duration: '60s',
    difficulty: 'Medium',
    component: CodeLogicGame
  },
  {
    id: 'element-match',
    title: 'Chemistry Lab',
    description: 'Match elements with their properties and symbols',
    icon: <Beaker className="h-6 w-6" />,
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-pink-500',
    duration: '60s',
    difficulty: 'Medium',
    component: ChemistryElementMatchGame
  },
  {
    id: 'projectile-master',
    title: 'Projectile Master',
    description: 'Master physics with projectile motion and gravity simulation',
    icon: <Target className="h-6 w-6" />,
    color: 'text-red-600',
    bgGradient: 'from-red-500 to-orange-500',
    duration: 'Multi-level',
    difficulty: 'Hard',
    component: ProjectileMaster
  }
];

export const GameLauncher = ({ onGameComplete }: GameLauncherProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<GameCompletionResult | null>(null);

  const handleGameSelect = useCallback((gameId: string) => {
    setSelectedGame(gameId);
    setGameResults(null);
  }, []);

  const handleBackToGames = useCallback(() => {
    setSelectedGame(null);
    setGameResults(null);
  }, []);

  const handleGameComplete = useCallback((result: any) => {
    // Normalize the result format for consistency
    const normalizedResult: GameCompletionResult = {
      score: result.score || 0,
      xp: result.xp || Math.floor((result.score || 0) / 10),
      coins: result.coins || Math.floor((result.score || 0) / 20),
      gameType: selectedGame || 'unknown'
    };

    setGameResults(normalizedResult);
    onGameComplete?.(normalizedResult);
  }, [selectedGame, onGameComplete]);

  // If a game is selected, render that game
  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div className="h-full">
          <GameComponent 
            onGameComplete={handleGameComplete}
            onBackToMenu={handleBackToGames}
          />
        </div>
      );
    }
  }

  // Game selection screen
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-display font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎮 Mini Games Arena
        </h2>
        <p className="text-muted-foreground text-lg">
          Challenge yourself with fun educational games!
        </p>
      </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.bgGradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {game.icon}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${
                        game.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' :
                        game.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {game.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      {game.duration}
                    </div>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                    {game.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground">
                    {game.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => handleGameSelect(game.id)}
                  className={`w-full bg-gradient-to-r ${game.bgGradient} hover:shadow-lg hover:scale-105 transition-all group-hover:shadow-xl`}
                  size="lg"
                >
                  Play Game
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Game Results */}
      <AnimatePresence>
        {gameResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <Card className="max-w-md mx-4 bg-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Game Complete!</CardTitle>
                <CardDescription>Amazing performance!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {gameResults.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-600">+{gameResults.xp}</div>
                    <div className="text-xs text-muted-foreground">XP Earned</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="font-bold text-yellow-600 flex items-center justify-center gap-1">
                      <Coins className="h-4 w-4" />
                      {gameResults.coins}
                    </div>
                    <div className="text-xs text-muted-foreground">Coins Earned</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleGameSelect(gameResults.gameType)}
                    variant="outline" 
                    className="flex-1"
                  >
                    Play Again
                  </Button>
                  <Button 
                    onClick={() => setGameResults(null)}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};