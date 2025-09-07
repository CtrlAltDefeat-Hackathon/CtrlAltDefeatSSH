"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ChemistryElementMatchGameProps {
  onGameComplete: (result: GameCompletionResult) => void;
}

interface GameCompletionResult {
  score: number;
  timeElapsed: number;
  totalAttempts: number;
  level: string;
  completed: boolean;
}

interface MoleculeEntry {
  formula: string;
  name: string;
  atoms: string[];
  bonds: number[][];
  stable: boolean;
}

interface MoleculeLibrary {
  [key: string]: MoleculeEntry;
}

export const ChemistryElementMatchGame: React.FC<ChemistryElementMatchGameProps> = ({ onGameComplete }) => {
  // Game state
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([]);
  const [gameLevel, setGameLevel] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [gameTargets, setGameTargets] = useState<string[]>([]);
  const [gameCompleted, setGameCompleted] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [resultBg, setResultBg] = useState('transparent');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentFormula, setCurrentFormula] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Element order for normalization
  const ELEMENT_ORDER = ['C', 'H', 'O', 'Na', 'Cl'];

  // Molecule library with complete bond structures
  const MOL_LIBRARY: MoleculeLibrary = {
    "H2": {
      formula: "H2",
      name: "Hydrogen (H₂)",
      atoms: ['H', 'H'],
      bonds: [[0, 1, 1]],
      stable: true
    },
    "O2": {
      formula: "O2",
      name: "Oxygen (O₂)",
      atoms: ['O', 'O'],
      bonds: [[0, 1, 2]],
      stable: true
    },
    "Cl2": {
      formula: "Cl2",
      name: "Chlorine (Cl₂)",
      atoms: ['Cl', 'Cl'],
      bonds: [[0, 1, 1]],
      stable: true
    },
    "NaCl": {
      formula: "NaCl",
      name: "Sodium chloride (NaCl)",
      atoms: ['Na', 'Cl'],
      bonds: [[0, 1, 1]],
      stable: true
    },
    "CO": {
      formula: "CO",
      name: "Carbon monoxide (CO)",
      atoms: ['C', 'O'],
      bonds: [[0, 1, 3]],
      stable: true
    },
    "CO2": {
      formula: "CO2",
      name: "Carbon dioxide (CO₂)",
      atoms: ['C', 'O', 'O'],
      bonds: [[0, 1, 2], [0, 2, 2]],
      stable: true
    },
    "H2O": {
      formula: "H2O",
      name: "Water (H₂O)",
      atoms: ['O', 'H', 'H'],
      bonds: [[0, 1, 1], [0, 2, 1]],
      stable: true
    },
    "H2O2": {
      formula: "H2O2",
      name: "Hydrogen peroxide (H₂O₂)",
      atoms: ['O', 'O', 'H', 'H'],
      bonds: [[0, 1, 1], [0, 2, 1], [1, 3, 1]],
      stable: true
    },
    "HCl": {
      formula: "HCl",
      name: "Hydrogen chloride (HCl)",
      atoms: ['H', 'Cl'],
      bonds: [[0, 1, 1]],
      stable: true
    },
    "NaOH": {
      formula: "NaOH",
      name: "Sodium hydroxide (NaOH)",
      atoms: ['Na', 'O', 'H'],
      bonds: [[0, 1, 1], [1, 2, 1]],
      stable: true
    },
    "CH4": {
      formula: "CH4",
      name: "Methane (CH₄)",
      atoms: ['C', 'H', 'H', 'H', 'H'],
      bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
      stable: true
    },
    "C2H6": {
      formula: "C2H6",
      name: "Ethane (C₂H₆)",
      atoms: ['C', 'C', 'H', 'H', 'H', 'H', 'H', 'H'],
      bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]],
      stable: true
    },
    "C2H4": {
      formula: "C2H4",
      name: "Ethene (C₂H₄)",
      atoms: ['C', 'C', 'H', 'H', 'H', 'H'],
      bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
      stable: true
    },
    "C2H2": {
      formula: "C2H2",
      name: "Ethyne (C₂H₂)",
      atoms: ['C', 'C', 'H', 'H'],
      bonds: [[0, 1, 3], [0, 2, 1], [1, 3, 1]],
      stable: true
    },
    "CH2O": {
      formula: "CH2O",
      name: "Formaldehyde (CH₂O)",
      atoms: ['C', 'O', 'H', 'H'],
      bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1]],
      stable: true
    },
    "CH4O": {
      formula: "CH4O",
      name: "Methanol (CH₃OH)",
      atoms: ['C', 'O', 'H', 'H', 'H', 'H'],
      bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1]],
      stable: true
    },
    "C2H6O": {
      formula: "C2H6O",
      name: "Ethanol (C₂H₆O)",
      atoms: ['C', 'C', 'O', 'H', 'H', 'H', 'H', 'H', 'H'],
      bonds: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [2, 7, 1], [2, 8, 1]],
      stable: true
    },
    "NH3": {
      formula: "NH3",
      name: "Ammonia (NH₃)",
      atoms: ['N', 'H', 'H', 'H'],
      bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
      stable: true
    },
    "CH3Cl": {
      formula: "CH3Cl",
      name: "Chloromethane (CH₃Cl)",
      atoms: ['C', 'Cl', 'H', 'H', 'H'],
      bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
      stable: true
    }
  };

  // Level-based molecule pools
  const EASY_POOL = ['H2O', 'CH4', 'CO2', 'NaCl', 'HCl', 'O2', 'H2', 'CO'].filter(k => MOL_LIBRARY[k]);
  const MED_POOL = ['C2H6', 'C2H4', 'C2H2', 'CH3Cl', 'CH4O', 'C2H6O', 'NaOH', 'H2O2', 'CH2O', 'NH3'].filter(k => MOL_LIBRARY[k]);
  const HARD_POOL = ['C2H6O', 'CH3Cl', 'CH4O', 'H2O2', 'NaOH', 'CH2O', 'C2H4', 'C2H2', 'NH3'].filter(k => MOL_LIBRARY[k]);

  // Helper functions
  const countAtoms = (arr: string[]) => {
    const counts: { [key: string]: number } = {};
    arr.forEach(atom => counts[atom] = (counts[atom] || 0) + 1);
    return counts;
  };

  const normalizeFormulaFromArray = (arr: string[]) => {
    const counts = countAtoms(arr);
    return ELEMENT_ORDER.map(sym => {
      const n = counts[sym] || 0;
      return n ? (sym + (n > 1 ? String(n) : '')) : '';
    }).filter(Boolean).join('');
  };

  const pickRandomTargets = (n: number) => {
    let pool: string[] = [];
    if (gameLevel === 'Easy') pool = [...EASY_POOL];
    else if (gameLevel === 'Medium') pool = [...MED_POOL];
    else pool = [...HARD_POOL];
    
    // Shuffle array
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, n);
  };

  // Canvas drawing function
  const drawStructure = (entry: MoleculeEntry) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!entry.atoms || !entry.bonds || entry.bonds.length === 0 || entry.atoms.length === 0) {
      ctx.fillStyle = '#0f1420';
      ctx.font = '16px Inter';
      ctx.fillText(entry.name, 14, 32);
      ctx.fillText('Formula: ' + entry.formula, 14, 56);
      return;
    }

    const nodes = entry.atoms.map((sym, i) => ({ sym, i, x: 0, y: 0 }));
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 80;

    // Position nodes in a circle
    nodes.forEach((node, idx) => {
      const angle = (Math.PI * 2 * idx) / nodes.length;
      node.x = cx + r * Math.cos(angle);
      node.y = cy + r * Math.sin(angle);
    });

    // Draw bonds
    entry.bonds.forEach(bond => {
      const [i, j, order = 1] = bond;
      const node1 = nodes[i];
      const node2 = nodes[j];
      if (!node1 || !node2) return;

      const dx = node2.x - node1.x;
      const dy = node2.y - node1.y;
      const nx = -dy;
      const ny = dx;
      const len = Math.hypot(nx, ny) || 1;
      const ux = nx / len;
      const uy = ny / len;
      const gap = 6;

      for (let k = 0; k < order; k++) {
        const offset = (k - (order - 1) / 2) * gap;
        ctx.beginPath();
        ctx.moveTo(node1.x + ux * offset, node1.y + uy * offset);
        ctx.lineTo(node2.x + ux * offset, node2.y + uy * offset);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0f1420';
        ctx.stroke();
      }
    });

    // Draw atoms
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.fillStyle = '#0f1420';
      ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.sym, node.x, node.y);
    });
  };

  // Timer effect
  useEffect(() => {
    if (timerInterval) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerInterval]);

  // Auto-show structure when formula changes
  useEffect(() => {
    if (selectedAtoms.length > 0) {
      const formula = normalizeFormulaFromArray(selectedAtoms);
      setCurrentFormula(formula);
      
      if (formula && MOL_LIBRARY[formula]) {
        const entry = MOL_LIBRARY[formula];
        drawStructure(entry);
        
        // Show preview message for valid molecules
        if (entry.stable) {
          setResultMessage(`Preview: ${entry.name} (${formula})`);
          setResultBg('#e8f4ee');
        }
      } else {
        // Clear canvas if invalid formula
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        setResultMessage('');
        setResultBg('transparent');
      }
    } else {
      setCurrentFormula('');
      setResultMessage('');
      setResultBg('transparent');
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [selectedAtoms]);

  const startTimer = () => {
    setTimer(0);
    setTimerInterval(setInterval(() => {}, 1000)); // Actual timer in useEffect
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const startGame = () => {
    const targets = pickRandomTargets(5);
    setGameTargets(targets);
    setGameCompleted([]);
    setAttempts(0);
    setGameStarted(true);
    startTimer();
    setSelectedAtoms([]);
    setResultMessage('Game started! Build the 5 target molecules shown.');
    setResultBg('#fff9e6');
  };

  const checkMolecule = () => {
    setAttempts(prev => prev + 1);
    const formula = normalizeFormulaFromArray(selectedAtoms);
    const entry = MOL_LIBRARY[formula];
    
    if (entry) {
      if (entry.stable) {
        if (gameTargets.includes(formula) && !gameCompleted.includes(formula)) {
          setGameCompleted(prev => [...prev, formula]);
          setResultMessage(`✅ Correct — you built target: ${entry.name} (${formula})`);
          setResultBg('#dcfce7');
        } else if (gameTargets.includes(formula) && gameCompleted.includes(formula)) {
          setResultMessage(`⚠ You already built ${entry.name} (${formula})`);
          setResultBg('#fff4e5');
        } else {
          setResultMessage(`✔ Correct but not a target: ${entry.name} (${formula})`);
          setResultBg('#dcfce7');
        }
      } else {
        setResultMessage(`⚠ ${entry.name} (${formula}) — unstable molecule`);
        setResultBg('#fff4e5');
      }
      drawStructure(entry);
    } else {
      setResultMessage('❌ Incorrect or unknown molecule');
      setResultBg('#ffecec');
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    setSelectedAtoms([]);
  };

  // Win condition check
  useEffect(() => {
    if (gameTargets.length > 0 && gameCompleted.length === gameTargets.length) {
      stopTimer();
      setResultMessage('🎉 YOU WIN! You built all 5 target molecules.');
      setResultBg('#dcfce7');
      
      onGameComplete({
        score: Math.max(0, 1000 - attempts * 10),
        timeElapsed: timer,
        totalAttempts: attempts,
        level: gameLevel,
        completed: true
      });
    }
  }, [gameCompleted, gameTargets, timer, attempts, gameLevel, onGameComplete]);

  const formatTime = (seconds: number) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const addAtom = (atom: string) => {
    setSelectedAtoms(prev => [...prev, atom]);
  };

  const clearSelection = () => {
    setSelectedAtoms([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Chemical Bonding Game — Levels & Score
          </h1>
          <p className="text-sm text-gray-600">
            Choose a level, press <strong>Start Game</strong>, then build the 5 target molecules. 
            Build in any order. Each correct target turns green with a tick.
          </p>
        </div>

        {/* Level Selection */}
        <div className="text-center mb-6">
          <div className="inline-flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            {(['Easy', 'Medium', 'Hard'] as const).map(level => (
              <button
                key={level}
                onClick={() => setGameLevel(level)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  gameLevel === level
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Element Controls */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {['H', 'C', 'O', 'Na', 'Cl'].map(atom => (
            <motion.button
              key={atom}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addAtom(atom)}
              className="px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            >
              {atom}
            </motion.button>
          ))}
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canvas Board */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 border-2 border-dashed border-blue-300">
            <canvas
              ref={canvasRef}
              width={760}
              height={520}
              className="w-full h-auto max-w-full max-h-96 mx-auto bg-white/50 rounded-lg"
            />
            <div className="text-xs text-blue-600 mt-2">
              Drop elements here or click the tiles above
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            {/* Selected Atoms */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Selected</h3>
              <div className="min-h-10 p-3 bg-blue-50 rounded-lg border border-blue-200">
                {selectedAtoms.length > 0 ? selectedAtoms.join(' - ') : '(none)'}
              </div>
            </div>

            {/* Game Controls */}
            <div className="space-y-3 mb-4">
              {!gameStarted ? (
                <button
                  onClick={startGame}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Start Game
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={checkMolecule}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Check Molecule
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Result Display */}
            {resultMessage && (
              <div 
                className="p-3 rounded-lg mb-4 text-sm"
                style={{ backgroundColor: resultBg }}
              >
                {resultMessage}
              </div>
            )}

            {/* Targets */}
            {gameStarted && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Targets (5)</h3>
                <div className="space-y-2">
                  {gameTargets.map(formula => {
                    const entry = MOL_LIBRARY[formula];
                    const completed = gameCompleted.includes(formula);
                    return (
                      <div
                        key={formula}
                        className={`flex justify-between items-center p-2 rounded-md border ${
                          completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <span className="font-medium">
                          {entry?.name.split(' (')[0] || formula}
                        </span>
                        <span className={completed ? 'text-green-600' : 'text-red-500'}>
                          {completed ? '✅' : '❌'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-3 text-sm text-gray-600">
                  <div><strong>Attempts:</strong> {attempts}</div>
                  <div><strong>Time:</strong> {formatTime(timer)}</div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Library: ~100+ molecules built from C, H, O, Na, Cl. 
              Structures show automatically when you select valid combinations.
            </p>
          </div>
        </div>

        <footer className="text-center text-sm text-gray-500 mt-8">
          Made for 8th grade learning — you can request more levels, hints, or scoring rules.
        </footer>
      </motion.div>
    </div>
  );
};