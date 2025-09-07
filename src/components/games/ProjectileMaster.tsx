"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

const GRAVITY = 9.8;
const SCALE = 3; // pixels per meter - reduced for better screen fit
const GROUND_HEIGHT = 60; // pixels

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
  trail: Array<{ x: number; y: number }>;
}

export const ProjectileMaster = () => {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(50);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [prediction, setPrediction] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [gameMessage, setGameMessage] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const calculateRange = () => {
    const rad = (angle * Math.PI) / 180;
    return (velocity * velocity * Math.sin(2 * rad)) / GRAVITY;
  };

  const launchProjectile = () => {
    if (!canvasRef.current || isLaunching) return;
    
    setIsLaunching(true);
    setGameMessage("");

    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);

    setProjectile({
      x: 80, // Start from cannon position
      y: GROUND_HEIGHT + 20,
      vx,
      vy,
      time: 0,
      trail: [],
    });
  };

  // Physics simulation loop
  useEffect(() => {
    if (!projectile) return;

    const update = () => {
      setProjectile((prev) => {
        if (!prev) return null;

        const dt = 0.02; // Smoother animation
        const newTime = prev.time + dt;
        const newX = 80 + prev.vx * newTime * SCALE; // Start from cannon
        const newY = (GROUND_HEIGHT + 20) + (prev.vy * newTime - 0.5 * GRAVITY * newTime * newTime) * SCALE;

        const updatedTrail = [
          ...prev.trail,
          { x: newX, y: newY },
        ].slice(-30); // Shorter trail for better performance

        // Check if projectile hits ground
        if (newY <= GROUND_HEIGHT + 10) {
          const landingDistance = (newX - 80) / SCALE;
          checkPrediction(landingDistance);
          setIsLaunching(false);
          return null;
        }

        // Check if projectile goes off screen
        if (newX > window.innerWidth || newY > window.innerHeight) {
          setIsLaunching(false);
          setGameMessage("Shot went off screen! Try adjusting your angle and velocity.");
          return null;
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          time: newTime,
          trail: updatedTrail,
        };
      });

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [projectile]);

  const checkPrediction = (landingDistance: number) => {
    const guess = parseFloat(prediction);
    if (isNaN(guess)) {
      setGameMessage("Make a prediction first!");
      return;
    }

    const accuracy = Math.abs(landingDistance - guess);
    if (accuracy < 3) {
      setScore((s) => s + 20);
      setShowConfetti(true);
      setGameMessage(`🎯 Perfect! Landed at ${landingDistance.toFixed(1)}m (predicted ${guess}m)`);
      setTimeout(() => setShowConfetti(false), 3000);
    } else if (accuracy < 8) {
      setScore((s) => s + 10);
      setGameMessage(`✨ Close! Landed at ${landingDistance.toFixed(1)}m (predicted ${guess}m)`);
    } else {
      setLives((l) => Math.max(0, l - 1));
      setGameMessage(`❌ Missed! Landed at ${landingDistance.toFixed(1)}m (predicted ${guess}m)`);
    }
    
    setPrediction("");
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setProjectile(null);
    setPrediction("");
    setGameMessage("");
    setIsLaunching(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
        />
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div 
        className="relative z-10 p-4 sm:p-6 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl mb-2">
          🚀 Projectile Master
        </h1>
        <p className="text-white/90 text-lg sm:text-xl font-medium">
          Master the art of trajectory prediction!
        </p>
        
        {/* Score and Lives */}
        <div className="flex justify-center items-center gap-6 sm:gap-8 mt-4">
          <motion.div 
            className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/30"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-white font-bold text-lg">⭐ {score}</span>
          </motion.div>
          <motion.div 
            className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/30"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-white font-bold text-lg">
              ❤️ {Array(lives).fill('❤️').join('')}
            </span>
          </motion.div>
          {lives === 0 && (
            <motion.button
              onClick={resetGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Reset
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Game Message */}
      <AnimatePresence>
        {gameMessage && (
          <motion.div
            className="relative z-10 mx-4 mb-4 p-3 bg-white/90 backdrop-blur-md rounded-xl text-center font-semibold text-gray-800 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {gameMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Canvas */}
      <div className="flex-1 relative px-4 pb-4">
        <motion.div
          ref={canvasRef}
          className="relative w-full h-full min-h-[400px] bg-gradient-to-b from-sky-200 via-sky-100 to-green-200 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/30"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Sky gradient and clouds */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 via-blue-200 to-green-300"></div>
          
          {/* Animated clouds */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/60 rounded-full"
              style={{
                width: `${60 + Math.random() * 40}px`,
                height: `${30 + Math.random() * 20}px`,
                top: `${10 + Math.random() * 40}%`,
                left: `${Math.random() * 80}%`,
              }}
              animate={{
                x: [-20, 20, -20],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Ground */}
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 via-green-500 to-green-400 shadow-inner"
               style={{ height: `${GROUND_HEIGHT}px` }}>
            {/* Grass texture */}
            <div className="absolute top-0 w-full h-2 bg-green-700 opacity-30"></div>
          </div>

          {/* Distance markers */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 w-0.5 h-4 bg-white/50"
              style={{ left: `${80 + (i + 1) * 50}px` }}
            >
              <span className="absolute -top-6 -left-2 text-xs text-white/70 font-medium">
                {(i + 1) * 10}m
              </span>
            </div>
          ))}

          {/* Cannon */}
          <motion.div
            className="absolute"
            style={{ 
              left: "60px", 
              bottom: `${GROUND_HEIGHT + 10}px`,
              transformOrigin: "20px 20px"
            }}
            animate={{ rotate: isLaunching ? [0, -5, 0] : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Cannon base */}
            <div className="absolute -bottom-2 -left-4 w-12 h-8 bg-gray-600 rounded-lg shadow-lg"></div>
            {/* Cannon barrel */}
            <motion.div
              className="w-12 h-4 bg-gradient-to-r from-gray-700 to-gray-500 rounded-r-full shadow-lg"
              style={{ 
                transformOrigin: "0 50%",
                rotate: `${-angle}deg`
              }}
            />
            {/* Cannon wheel */}
            <div className="absolute -bottom-6 left-2 w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-600"></div>
          </motion.div>

          {/* Projectile trail */}
          <AnimatePresence>
            {projectile?.trail.map((point, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 shadow-lg"
                style={{
                  left: point.x - 6,
                  bottom: point.y - 6,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1 - (i / projectile.trail.length) * 0.8, 
                  opacity: 1 - (i / projectile.trail.length) * 0.7 
                }}
                exit={{ scale: 0, opacity: 0 }}
              />
            ))}
          </AnimatePresence>

          {/* Projectile */}
          <AnimatePresence>
            {projectile && (
              <motion.div
                className="absolute w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border-2 border-white shadow-2xl"
                style={{
                  left: projectile.x - 12,
                  bottom: projectile.y - 12,
                }}
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 0.5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 0.3, repeat: Infinity }
                }}
                exit={{ scale: 0, opacity: 0 }}
              >
                {/* Projectile glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-sm scale-150 opacity-60"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Target zones */}
          {prediction && !isNaN(parseFloat(prediction)) && (
            <motion.div
              className="absolute bottom-0 bg-green-500/30 border-2 border-green-500 rounded-t-lg"
              style={{
                left: `${80 + parseFloat(prediction) * SCALE - 15}px`,
                width: "30px",
                height: `${GROUND_HEIGHT}px`,
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm bg-green-500 px-2 py-1 rounded">
                🎯
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Controls Panel */}
      <motion.div 
        className="relative z-10 mx-4 mb-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-4 sm:p-6"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Angle Control */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-800">
              🎯 Angle: {angle}°
            </label>
            <input
              type="range"
              min="10"
              max="80"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg appearance-none cursor-pointer slider"
              disabled={isLaunching}
            />
            <div className="text-sm text-gray-600 font-medium">
              Theoretical Range: {calculateRange().toFixed(1)}m
            </div>
          </div>

          {/* Velocity Control */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-800">
              ⚡ Velocity: {velocity} m/s
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={velocity}
              onChange={(e) => setVelocity(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg appearance-none cursor-pointer slider"
              disabled={isLaunching}
            />
            <div className="text-sm text-gray-600 font-medium">
              Energy: {((velocity * velocity) / 2).toFixed(0)}J
            </div>
          </div>

          {/* Prediction Input */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-800">
              🔮 Predict Distance (m)
            </label>
            <input
              type="number"
              placeholder="Your guess..."
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              disabled={isLaunching}
              min="0"
              max="200"
              step="0.1"
            />
          </div>

          {/* Launch Button */}
          <div className="space-y-3">
            <div className="block text-lg font-bold text-gray-800 opacity-0">
              Launch
            </div>
            <motion.button
              onClick={launchProjectile}
              disabled={isLaunching || lives === 0}
              className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-xl rounded-xl shadow-lg border-2 border-white/30 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLaunching ? "🚀 Launching..." : "🚀 FIRE!"}
            </motion.button>
          </div>
        </div>

        {/* Physics Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded-xl text-center">
          <span className="text-sm text-gray-600 font-medium">
            Physics: Range = (v² × sin(2θ)) / g | Current: {calculateRange().toFixed(1)}m
          </span>
        </div>
      </motion.div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ffffff, #f0f0f0);
          border: 3px solid #333;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ffffff, #f0f0f0);
          border: 3px solid #333;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};