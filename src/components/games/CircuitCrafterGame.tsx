"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Play, 
  RotateCcw, 
  Info, 
  Star, 
  Lightbulb, 
  ArrowLeft, 
  Trophy,
  Coins,
  Award
} from 'lucide-react';

interface GameResult {
  score: number;
  xp: number;
  coins: number;
  gameType: string;
}

interface CircuitCrafterProps {
  onGameComplete: (result: GameResult) => void;
  onBackToMenu: () => void;
}

type GameState = 'loading' | 'menu' | 'playing' | 'simulation' | 'complete' | 'gameOver';

interface Component {
  id: string;
  type: 'battery' | 'wire' | 'resistor' | 'lightbulb' | 'motor' | 'switch';
  x: number;
  y: number;
  active?: boolean;
  connected?: boolean;
}

interface Level {
  id: number;
  title: string;
  objective: string;
  requiredComponents: string[];
  targetScore: number;
}

const LEVELS: Level[] = [
  {
    id: 1,
    title: "Light the Bulb",
    objective: "Create a simple circuit to power the light bulb",
    requiredComponents: ['battery', 'wire', 'lightbulb'],
    targetScore: 100
  },
  {
    id: 2,
    title: "Control the Light",
    objective: "Add a switch to control the light bulb",
    requiredComponents: ['battery', 'wire', 'lightbulb', 'switch'],
    targetScore: 200
  },
  {
    id: 3,
    title: "Power the Motor",
    objective: "Create a circuit to run the motor",
    requiredComponents: ['battery', 'wire', 'motor'],
    targetScore: 300
  },
  {
    id: 4,
    title: "Series Circuit",
    objective: "Connect multiple components in series",
    requiredComponents: ['battery', 'wire', 'resistor', 'lightbulb'],
    targetScore: 400
  },
  {
    id: 5,
    title: "Master Circuit",
    objective: "Create a complex circuit with all components",
    requiredComponents: ['battery', 'wire', 'resistor', 'lightbulb', 'motor', 'switch'],
    targetScore: 500
  }
];

const COMPONENT_ICONS = {
  battery: '🔋',
  wire: '➖',
  resistor: '🟫',
  lightbulb: '💡',
  motor: '⚙️',
  switch: '🔘'
};

export const CircuitCrafter: React.FC<CircuitCrafterProps> = ({ 
  onGameComplete, 
  onBackToMenu 
}) => {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [components, setComponents] = useState<Component[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [circuitError, setCircuitError] = useState<string | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Initialize game
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState('menu');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  const handleStartGame = useCallback(() => {
    setGameState('playing');
    setCurrentLevel(1);
    setScore(0);
    setTime(0);
    setComponents([]);
    setCircuitError(null);
  }, []);

  const handleDragStart = useCallback((componentType: string) => {
    setDraggedComponent(componentType);
  }, []);

  const handleDrop = useCallback((x: number, y: number) => {
    if (!draggedComponent) return;
    
    const newComponent: Component = {
      id: `${draggedComponent}-${Date.now()}`,
      type: draggedComponent as Component['type'],
      x: Math.floor(x / 60) * 60,
      y: Math.floor(y / 60) * 60,
      active: false,
      connected: false
    };
    
    setComponents(prev => [...prev, newComponent]);
    setDraggedComponent(null);
  }, [draggedComponent]);

  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    setCircuitError(null);
    
    // Simple circuit validation
    const hasBattery = components.some(c => c.type === 'battery');
    const hasLoad = components.some(c => c.type === 'lightbulb' || c.type === 'motor');
    const hasWires = components.some(c => c.type === 'wire');
    
    if (!hasBattery || !hasLoad || !hasWires) {
      setCircuitError("⚠ Incomplete Circuit!");
      setTimeout(() => {
        setIsSimulating(false);
        setCircuitError(null);
      }, 2000);
      return;
    }
    
    // Activate components
    setComponents(prev => prev.map(c => ({
      ...c,
      active: true,
      connected: true
    })));
    
    // Check level completion
    const level = LEVELS[currentLevel - 1];
    const hasRequiredComponents = level.requiredComponents.every(reqType =>
      components.some(c => c.type === reqType)
    );
    
    if (hasRequiredComponents) {
      const levelScore = level.targetScore - (time * 2);
      const finalScore = Math.max(levelScore, 50);
      setScore(prev => prev + finalScore);
      
      setTimeout(() => {
        if (currentLevel === LEVELS.length) {
          // Game complete
          setGameState('complete');
          onGameComplete({
            score: score + finalScore,
            xp: (currentLevel * 50) + finalScore,
            coins: Math.floor(finalScore / 10),
            gameType: 'circuit-crafter'
          });
        } else {
          // Next level
          setCurrentLevel(prev => prev + 1);
          setComponents([]);
          setTime(0);
        }
        setIsSimulating(false);
      }, 3000);
    } else {
      setTimeout(() => {
        setIsSimulating(false);
      }, 2000);
    }
  }, [components, currentLevel, time, score, onGameComplete]);

  const resetCircuit = useCallback(() => {
    setComponents([]);
    setIsSimulating(false);
    setCircuitError(null);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Loading Screen
  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="text-6xl"
          >
            <Zap className="text-yellow-400 drop-shadow-lg" size={80} />
          </motion.div>
          
          {/* Animated circuit pattern */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 -z-10"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-16 bg-blue-400 rounded"
                style={{
                  left: `${i * 20 - 80}px`,
                  top: `${i % 2 ? 20 : -20}px`
                }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 font-display">
            <motion.span
              animate={{ 
                textShadow: [
                  "0 0 20px #3b82f6",
                  "0 0 40px #3b82f6",
                  "0 0 20px #3b82f6"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡ Circuit Crafter
            </motion.span>
          </h1>
          <p className="text-xl text-blue-200">Master the Art of Electronics</p>
        </motion.div>

        <div className="space-y-4 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px #3b82f6" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Play size={24} />
            Start Game
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #8b5cf6" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHowToPlay(true)}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Info size={24} />
            How to Play
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToMenu}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            <ArrowLeft size={24} />
            Back to Menu
          </motion.button>
        </div>

        {/* How to Play Modal */}
        <AnimatePresence>
          {showHowToPlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowHowToPlay(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4">How to Play</h3>
                <div className="space-y-3 text-sm">
                  <p>🔋 <strong>Battery:</strong> Powers your circuit</p>
                  <p>➖ <strong>Wire:</strong> Connects components</p>
                  <p>🟫 <strong>Resistor:</strong> Controls current flow</p>
                  <p>💡 <strong>Light Bulb:</strong> Shows if circuit works</p>
                  <p>⚙️ <strong>Motor:</strong> Spins when powered</p>
                  <p>🔘 <strong>Switch:</strong> Controls circuit on/off</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHowToPlay(false)}
                  className="w-full mt-6 bg-blue-600 text-white font-bold py-2 rounded-lg"
                >
                  Got it!
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Game Complete Screen
  if (gameState === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-center"
        >
          <Trophy className="text-yellow-400 mx-auto mb-4" size={80} />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Congratulations!
          </h1>
          <p className="text-xl text-green-200 mb-8">You've mastered all circuits!</p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Star className="text-yellow-400 mx-auto mb-2" size={32} />
                <p className="text-white font-bold text-xl">{score}</p>
                <p className="text-gray-300 text-sm">Final Score</p>
              </div>
              <div>
                <Award className="text-purple-400 mx-auto mb-2" size={32} />
                <p className="text-white font-bold text-xl">{currentLevel * 50 + score}</p>
                <p className="text-gray-300 text-sm">XP Earned</p>
              </div>
              <div>
                <Coins className="text-yellow-400 mx-auto mb-2" size={32} />
                <p className="text-white font-bold text-xl">{Math.floor(score / 10)}</p>
                <p className="text-gray-300 text-sm">Coins</p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToMenu}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl text-lg"
          >
            Back to Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Playing State
  return (
    <div 
      ref={gameRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToMenu}
            className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="text-white">
            <h2 className="text-xl font-bold">Level {currentLevel}</h2>
            <p className="text-sm text-gray-300">{LEVELS[currentLevel - 1]?.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-white">
          <div className="text-center">
            <p className="text-xs text-gray-300">Score</p>
            <p className="font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-300">Time</p>
            <p className="font-bold">{formatTime(time)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Left Panel - Component Inventory */}
        <div className="lg:col-span-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Zap size={20} />
            Components
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {Object.entries(COMPONENT_ICONS).map(([type, icon]) => (
              <motion.div
                key={type}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                draggable
                onDragStart={() => handleDragStart(type)}
                className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-400/30 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all"
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs text-white capitalize font-medium">{type}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Center Panel - Grid Canvas */}
        <div className="lg:col-span-6">
          <div 
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 h-full relative overflow-hidden"
            onDrop={(e) => {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left - 16;
              const y = e.clientY - rect.top - 16;
              handleDrop(x, y);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Grid Background */}
            <div 
              className="absolute inset-4 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />
            
            {/* Components */}
            {components.map((component) => (
              <motion.div
                key={component.id}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  boxShadow: component.active 
                    ? "0 0 20px rgba(251, 191, 36, 0.8)" 
                    : "0 0 10px rgba(59, 130, 246, 0.3)"
                }}
                style={{
                  position: 'absolute',
                  left: component.x,
                  top: component.y,
                  width: '48px',
                  height: '48px'
                }}
                className="bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-2xl border-2 border-blue-400/50"
              >
                {component.active && component.type === 'motor' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    {COMPONENT_ICONS[component.type]}
                  </motion.div>
                ) : (
                  <motion.div
                    animate={component.active && component.type === 'lightbulb' ? {
                      textShadow: [
                        "0 0 5px #fbbf24",
                        "0 0 20px #fbbf24",
                        "0 0 5px #fbbf24"
                      ]
                    } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {COMPONENT_ICONS[component.type]}
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Simulation Particles */}
            <AnimatePresence>
              {isSimulating && components.some(c => c.type === 'battery') && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: components.find(c => c.type === 'battery')?.x || 0,
                        y: components.find(c => c.type === 'battery')?.y || 0,
                        opacity: 1 
                      }}
                      animate={{ 
                        x: [
                          components.find(c => c.type === 'battery')?.x || 0,
                          Math.random() * 400,
                          components.find(c => c.type === 'lightbulb' || c.type === 'motor')?.x || 400
                        ],
                        y: [
                          components.find(c => c.type === 'battery')?.y || 0,
                          Math.random() * 300,
                          components.find(c => c.type === 'lightbulb' || c.type === 'motor')?.y || 300
                        ],
                        opacity: [1, 0.5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                      style={{ zIndex: 10 }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {circuitError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    x: [0, -5, 5, 0]
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg"
                >
                  {circuitError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="lg:col-span-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-white font-bold mb-4">Controls</h3>
          
          <div className="space-y-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <Play size={20} />
              {isSimulating ? 'Running...' : 'Run Simulation'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetCircuit}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Reset
            </motion.button>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <Lightbulb size={16} />
              Objective
            </h4>
            <p className="text-sm text-gray-300">
              {LEVELS[currentLevel - 1]?.objective}
            </p>
            
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Required Components:</p>
              <div className="flex flex-wrap gap-1">
                {LEVELS[currentLevel - 1]?.requiredComponents.map(comp => (
                  <span 
                    key={comp}
                    className="text-xs bg-blue-600/20 text-blue-200 px-2 py-1 rounded"
                  >
                    {COMPONENT_ICONS[comp as keyof typeof COMPONENT_ICONS]} {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};