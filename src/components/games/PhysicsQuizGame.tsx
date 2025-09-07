import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Trash2, RotateCcw, Zap, Lightbulb, ToggleRight, Settings, Battery, Cable, SquareGanttChart, Fan, Spline } from "lucide-react";

/**
 * Circuit Crafter — Single-file React app
 * - Premium UI with pastel glassmorphism
 * - True drag & drop from inventory → canvas
 * - Drag on-canvas parts any time
 * - Click a port → draw wire → click second port to connect (snap highlight)
 * - Run Simulation animates current flow, bulb glow, motor spin, switch toggle
 * - Grid snap + keyboard shortcuts
 *   - Cmd/Ctrl+Z undo, Cmd/Ctrl+Y redo, Delete removes selection
 * - Simple DC solver (series path detection); graceful fallback for complex nets
 *
 * Notes:
 * - All in one file for easy drop-in. Uses Tailwind (recommended) + Lucide icons (available in this environment).
 * - No external DnD lib; pure pointer events for reliability.
 */

// ---------- Types ----------
const GRID = 24; // px per grid cell
const CANVAS_W = 1100;
const CANVAS_H = 720;

const COMPONENTS = {
  Battery: {
    type: "Battery",
    width: 4, // grid units
    height: 2,
    ports: [
      { id: "pos", x: 4, y: 1 },
      { id: "neg", x: 0, y: 1 },
    ],
    voltage: 9,
  },
  Bulb: {
    type: "Bulb",
    width: 3,
    height: 3,
    ports: [
      { id: "a", x: 0, y: 1.5 },
      { id: "b", x: 3, y: 1.5 },
    ],
    resistance: 30,
  },
  Resistor: {
    type: "Resistor",
    width: 4,
    height: 2,
    ports: [
      { id: "a", x: 0, y: 1 },
      { id: "b", x: 4, y: 1 },
    ],
    resistance: 20,
  },
  Switch: {
    type: "Switch",
    width: 3,
    height: 2,
    ports: [
      { id: "a", x: 0, y: 1 },
      { id: "b", x: 3, y: 1 },
    ],
  },
  Motor: {
    type: "Motor",
    width: 3,
    height: 3,
    ports: [
      { id: "a", x: 0, y: 1.5 },
      { id: "b", x: 3, y: 1.5 },
    ],
    resistance: 10,
  },
  Node: {
    type: "Node",
    width: 1,
    height: 1,
    ports: [ { id: "n", x: 0.5, y: 0.5 } ],
  },
};

// ---------- Helpers ----------
const uid = () => Math.random().toString(36).slice(2, 10);
const snap = (v) => Math.round(v / GRID) * GRID;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- Main Component ----------
export default function CircuitCrafter() {
  const [parts, setParts] = useState([]); // {id,type,x,y,rotation,meta}
  const [wires, setWires] = useState([]); // {id, a:{partId,portId}, b:{partId,portId}}
  const [selectId, setSelectId] = useState(null);
  const [simRunning, setSimRunning] = useState(false);
  const [hoverPort, setHoverPort] = useState(null); // {partId,portId}
  const [pendingWire, setPendingWire] = useState(null); // {partId,portId}
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // ----- History (Undo/Redo) -----
  const pushHistory = useCallback((state) => {
    setHistory((h) => [...h, state]);
    setFuture([]);
  }, []);
  const snapshot = () => ({ parts: structuredClone(parts), wires: structuredClone(wires) });
  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [snapshot(), ...f]);
      setParts(prev.parts);
      setWires(prev.wires);
      return h.slice(0, -1);
    });
  };
  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      pushHistory(snapshot());
      setParts(next.parts);
      setWires(next.wires);
      return f.slice(1);
    });
  };

  // ----- Keyboard shortcuts -----
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectId) {
          pushHistory(snapshot());
          setParts((p) => p.filter((x) => x.id !== selectId));
          setWires((ws) => ws.filter((w) => w.a.partId !== selectId && w.b.partId !== selectId));
          setSelectId(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectId, undo, redo]);

  // ----- Inventory Drag & Drop -----
  const dragDataRef = useRef(null);
  const onInventoryDragStart = (e, type) => {
    dragDataRef.current = { type };
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "copy";
  };
  const onCanvasDrop = (e) => {
    const type = e.dataTransfer.getData("text/plain") || dragDataRef.current?.type;
    if (!type) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = snap(e.clientX - rect.left);
    const y = snap(e.clientY - rect.top);
    pushHistory(snapshot());
    setParts((p) => [
      ...p,
      { id: uid(), type, x: clamp(x, 0, CANVAS_W - GRID * COMPONENTS[type].width), y: clamp(y, 0, CANVAS_H - GRID * COMPONENTS[type].height), rotation: 0, meta: { on: true } },
    ]);
  };

  // ----- Drag parts on canvas -----
  const dragPartRef = useRef(null);
  const onPartPointerDown = (e, id) => {
    e.stopPropagation();
    setSelectId(id);
    const start = { x: e.clientX, y: e.clientY };
    const el = e.currentTarget;
    const part = parts.find((p) => p.id === id);
    const base = { x: part.x, y: part.y };
    dragPartRef.current = (ev) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      const nx = snap(base.x + dx);
      const ny = snap(base.y + dy);
      setParts((ps) => ps.map((pp) => (pp.id === id ? { ...pp, x: clamp(nx, 0, CANVAS_W - GRID * COMPONENTS[pp.type].width), y: clamp(ny, 0, CANVAS_H - GRID * COMPONENTS[pp.type].height) } : pp)));
    };
    document.addEventListener("pointermove", dragPartRef.current);
    document.addEventListener("pointerup", onPartPointerUp, { once: true });
  };
  const onPartPointerUp = () => {
    document.removeEventListener("pointermove", dragPartRef.current);
    dragPartRef.current = null;
    pushHistory(snapshot());
  };

  // ----- Ports, wiring -----
  const getAbsPortPos = (part, port) => ({
    x: part.x + port.x * GRID,
    y: part.y + port.y * GRID,
  });

  const startWireFrom = (ref) => {
    setPendingWire(ref);
  };
  const finishWireAt = (ref) => {
    if (!pendingWire) return;
    if (pendingWire.partId === ref.partId && pendingWire.portId === ref.portId) return;
    pushHistory(snapshot());
    setWires((ws) => [...ws, { id: uid(), a: pendingWire, b: ref }]);
    setPendingWire(null);
  };

  // ----- Simulation (simple series path) -----
  const solution = useMemo(() => {
    // Build adjacency by ports
    const portKey = (pid, poid) => `${pid}:${poid}`;
    const nodes = new Map(); // key -> { partId, portId, links: Set<key> }

    const add = (k) => { if (!nodes.has(k)) nodes.set(k, { key: k, links: new Set() }); };
    const link = (a, b) => { nodes.get(a).links.add(b); nodes.get(b).links.add(a); };

    parts.forEach((p) => {
      const comp = COMPONENTS[p.type];
      comp.ports?.forEach((po) => add(portKey(p.id, po.id)));
      if (p.type === "Switch" && p.meta?.on) {
        const a = portKey(p.id, "a");
        const b = portKey(p.id, "b");
        add(a); add(b); link(a, b); // closed switch = short link
      }
    });
    wires.forEach((w) => {
      const a = portKey(w.a.partId, w.a.portId);
      const b = portKey(w.b.partId, w.b.portId);
      add(a); add(b); link(a, b);
    });

    // find a Battery
    const bat = parts.find((p) => p.type === "Battery");
    if (!bat) return { ok: false, reason: "No battery" };
    const v = COMPONENTS.Battery.voltage;

    const pa = portKey(bat.id, "pos");
    const pb = portKey(bat.id, "neg");

    // BFS to check connection and collect a path
    const bfs = (start, goal) => {
      const q = [start];
      const came = new Map([[start, null]]);
      while (q.length) {
        const k = q.shift();
        if (k === goal) break;
        for (const n of nodes.get(k)?.links || []) {
          if (!came.has(n)) { came.set(n, k); q.push(n); }
        }
      }
      if (!came.has(goal)) return null;
      const path = [];
      for (let cur = goal; cur; cur = came.get(cur)) path.push(cur);
      return path.reverse();
    };

    const path = bfs(pa, pb);
    if (!path) return { ok: false, reason: "Open circuit" };

    // Estimate series resistance along parts touched by path
    const touchedParts = new Set();
    const keysToPart = new Map();
    parts.forEach((p) => {
      COMPONENTS[p.type].ports?.forEach((po) => keysToPart.set(portKey(p.id, po.id), p));
    });
    path.forEach((k) => { const pt = keysToPart.get(k); if (pt) touchedParts.add(pt); });

    let R = 0;
    touchedParts.forEach((p) => {
      if (p.type === "Resistor") R += COMPONENTS.Resistor.resistance;
      if (p.type === "Bulb") R += COMPONENTS.Bulb.resistance;
      if (p.type === "Motor") R += COMPONENTS.Motor.resistance;
      if (p.type === "Switch") { /* closed already accounted */ }
      if (p.type === "Battery") { /* source */ }
    });
    if (R <= 0) R = 0.001; // avoid div by zero if straight short (we'll cap current)

    let I = v / R; // very naive series current
    I = Math.min(I, 2); // cap for visuals

    return { ok: true, voltage: v, resistance: R, current: I, path };
  }, [parts, wires]);

  // ----- UI Actions -----
  const clearAll = () => {
    pushHistory(snapshot());
    setParts([]); setWires([]); setSelectId(null); setPendingWire(null);
  };

  const toggleRun = () => setSimRunning((s) => !s);

  // ----- Canvas interaction (drop zone) -----
  const canvasRef = useRef(null);
  const onCanvasPointerDown = () => { setSelectId(null); };

  // ----- Pretty helpers -----
  const PrettyStat = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/70 backdrop-blur border border-white/50 shadow-sm">
      <Icon className="h-4 w-4 text-indigo-500" />
      <div className="text-sm text-slate-500">{label}</div>
      <div className="ml-auto font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-sky-100 to-rose-100 p-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-[300px_1fr] gap-6">
        {/* LEFT: Inventory */}
        <div className="relative">
          <div className="sticky top-6">
            <motion.div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <SquareGanttChart className="h-5 w-5 text-indigo-600" />
                <h2 className="font-extrabold text-slate-800 text-lg">Circuit Crafter</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">Drag a component onto the canvas. Click a port to start a wire, then click another port to connect. Press <span className="font-semibold">Delete</span> to remove selection.</p>

              <div className="grid grid-cols-2 gap-3 select-none">
                {[
                  { t: "Battery", icon: Battery, desc: "+ / - 9V source" },
                  { t: "Bulb", icon: Lightbulb, desc: "Glows with current" },
                  { t: "Resistor", icon: Spline, desc: "Adds resistance" },
                  { t: "Switch", icon: ToggleRight, desc: "Open/close path" },
                  { t: "Motor", icon: Fan, desc: "Spins with current" },
                  { t: "Node", icon: Cable, desc: "Junction point" },
                ].map(({ t, icon: I, desc }) => (
                  <motion.div
                    key={t}
                    draggable
                    onDragStart={(e) => onInventoryDragStart(e, t)}
                    whileHover={{ y: -2 }}
                    className="group cursor-grab active:cursor-grabbing rounded-2xl border border-slate-200 bg-white/80 hover:bg-white p-3 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50">
                        <I className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{t}</div>
                        <div className="text-xs text-slate-500">{desc}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Drag to canvas →</div>
                  </motion.div>
                ))}
              </div>

              <div className="h-px my-5 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <div className="grid gap-2">
                <PrettyStat label="Voltage" value={`${COMPONENTS.Battery.voltage} V`} icon={Zap} />
                <PrettyStat label="Series R (est.)" value={solution.ok ? `${solution.resistance.toFixed(1)} Ω` : "—"} icon={Settings} />
                <PrettyStat label="Current (est.)" value={solution.ok ? `${solution.current.toFixed(2)} A` : "—"} icon={Cable} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT: Canvas + Toolbar */}
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <motion.button onClick={toggleRun} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-2xl text-white shadow-lg border border-white/40 ${simRunning ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"}`}>
              <div className="flex items-center gap-2">
                {simRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {simRunning ? "Pause Simulation" : "Run Simulation"}
              </div>
            </motion.button>
            <motion.button onClick={clearAll} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 shadow">
              <div className="flex items-center gap-2 text-slate-700">
                <Trash2 className="h-4 w-4" /> Clear
              </div>
            </motion.button>
            <motion.button onClick={() => { pushHistory(snapshot()); setParts([]); setWires([]); }} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 shadow">
              <div className="flex items-center gap-2 text-slate-700">
                <RotateCcw className="h-4 w-4" /> Reset
              </div>
            </motion.button>
            <div className="ml-auto text-sm text-slate-500">Tip: Click a port to wire • Ctrl/Cmd+Z/Y undo/redo</div>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            onDrop={onCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
            onPointerDown={onCanvasPointerDown}
            className="relative rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{ width: CANVAS_W, height: CANVAS_H }}
          >
            {/* SVG Grid Background */}
            <svg width={CANVAS_W} height={CANVAS_H} className="absolute inset-0">
              <defs>
                <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#dbe4ff" strokeWidth="0.8" />
                </pattern>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Wires */}
            <svg width={CANVAS_W} height={CANVAS_H} className="absolute inset-0 pointer-events-none">
              {wires.map((w) => {
                const aPart = parts.find((p) => p.id === w.a.partId);
                const bPart = parts.find((p) => p.id === w.b.partId);
                if (!aPart || !bPart) return null;
                const aPort = COMPONENTS[aPart.type].ports.find((po) => po.id === w.a.portId);
                const bPort = COMPONENTS[bPart.type].ports.find((po) => po.id === w.b.portId);
                const a = getAbsPortPos(aPart, aPort);
                const b = getAbsPortPos(bPart, bPort);
                const midX = (a.x + b.x) / 2;
                const path = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;

                const animate = simRunning && solution.ok; // show particles
                const dash = animate ? 4 : 0;
                return (
                  <g key={w.id}>
                    <path d={path} stroke="#64748b" strokeWidth={3} fill="none" strokeLinecap="round" />
                    {animate && (
                      <motion.circle r={4} fill="#22c55e" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                        <animateMotion dur="1.2s" repeatCount="indefinite" path={path} />
                      </motion.circle>
                    )}
                  </g>
                );
              })}

              {/* Pending wire preview */}
              {pendingWire && hoverPort && (
                (() => {
                  const aPart = parts.find((p) => p.id === pendingWire.partId);
                  const aPort = COMPONENTS[aPart.type].ports.find((po) => po.id === pendingWire.portId);
                  const a = getAbsPortPos(aPart, aPort);
                  const bPart = parts.find((p) => p.id === hoverPort.partId);
                  const bPort = COMPONENTS[bPart.type].ports.find((po) => po.id === hoverPort.portId);
                  const b = getAbsPortPos(bPart, bPort);
                  const midX = (a.x + b.x) / 2;
                  const path = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
                  return <path d={path} stroke="#22c55e" strokeDasharray="6 6" strokeWidth={3} fill="none" />;
                })()
              )}
            </svg>

            {/* Parts */}
            {parts.map((p) => (
              <Part
                key={p.id}
                part={p}
                selected={selectId === p.id}
                onPointerDown={(e) => onPartPointerDown(e, p.id)}
                onToggleSwitch={() => {
                  if (p.type !== "Switch") return;
                  pushHistory(snapshot());
                  setParts((ps) => ps.map((x) => (x.id === p.id ? { ...x, meta: { ...x.meta, on: !x.meta.on } } : x)));
                }}
                onPortEnter={(portId) => setHoverPort({ partId: p.id, portId })}
                onPortLeave={() => setHoverPort(null)}
                onPortClick={(portId) => (pendingWire ? finishWireAt({ partId: p.id, portId }) : startWireFrom({ partId: p.id, portId }))}
                sim={simRunning ? solution : null}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Part Renderer ----------
function Part({ part, selected, onPointerDown, onToggleSwitch, onPortEnter, onPortLeave, onPortClick, sim }) {
  const comp = COMPONENTS[part.type];
  const w = comp.width * GRID;
  const h = comp.height * GRID;

  // Visual intensity from current
  const I = sim?.ok ? sim.current : 0;
  const glow = Math.min(0.8, I / 2);

  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute select-none ${selected ? "ring-4 ring-sky-300" : ""}`}
      style={{ left: part.x, top: part.y, width: w, height: h }}
    >
      <div className="relative w-full h-full">
        {/* Body */}
        <motion.div className="absolute inset-0 rounded-2xl border border-slate-200 bg-white/90 shadow-md" layoutId={part.id} />

        {/* Type-specific visuals */}
        {part.type === "Battery" && (
          <div className="absolute inset-0 grid grid-cols-[1fr_auto_1fr] items-center px-3">
            <div className="h-8 rounded-lg bg-rose-400/20 border border-rose-300" />
            <div className="px-2 text-slate-500 text-xs">9V</div>
            <div className="h-8 rounded-lg bg-sky-400/20 border border-sky-300" />
          </div>
        )}

        {part.type === "Resistor" && (
          <div className="absolute inset-2 rounded-xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-[10px] text-amber-800">20 Ω</div>
        )}

        {part.type === "Bulb" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-yellow-300/40 border border-yellow-400" />
              <div className="absolute -inset-4 rounded-full" style={{ background: `radial-gradient(circle, rgba(250,204,21,${glow}) 0%, rgba(250,204,21,0) 60%)` }} />
            </div>
          </div>
        )}

        {part.type === "Motor" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FanVisual spinning={!!(sim?.ok && sim.current > 0.05)} />
          </div>
        )}

        {part.type === "Switch" && (
          <button onClick={(e) => { e.stopPropagation(); onToggleSwitch(); }} className="absolute inset-2 rounded-xl bg-slate-50 border border-slate-300 flex items-center justify-center text-xs text-slate-600 shadow-inner hover:bg-slate-100">
            {part.meta?.on ? "ON" : "OFF"}
          </button>
        )}

        {/* Ports */}
        {comp.ports?.map((po) => (
          <Port
            key={po.id}
            x={po.x * GRID - 6}
            y={po.y * GRID - 6}
            onEnter={() => onPortEnter(po.id)}
            onLeave={onPortLeave}
            onClick={(e) => { e.stopPropagation(); onPortClick(po.id); }}
          />
        ))}

        {/* Battery plus/minus labels */}
        {part.type === "Battery" && (
          <>
            <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 text-[10px] text-rose-500 font-bold">+</div>
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 text-[10px] text-sky-600 font-bold">-</div>
          </>
        )}
      </div>
    </div>
  );
}

function Port({ x, y, onEnter, onLeave, onClick }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="absolute w-3 h-3 rounded-full bg-white border border-slate-300 shadow cursor-crosshair hover:border-emerald-400"
      style={{ left: x, top: y }}
    >
      <div className="absolute -inset-2 rounded-full bg-emerald-300/0 hover:bg-emerald-300/20 transition-colors" />
    </div>
  );
}

function FanVisual({ spinning }) {
  return (
    <div className="relative w-14 h-14 rounded-full bg-slate-100 border border-slate-300 overflow-hidden">
      <div className={`absolute inset-2 rounded-full border-2 border-slate-300 ${spinning ? "animate-spin" : ""}`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-10 h-10 rounded-full border-2 border-slate-400 ${spinning ? "animate-spin" : ""}`}/>
      </div>
    </div>
  );
}
