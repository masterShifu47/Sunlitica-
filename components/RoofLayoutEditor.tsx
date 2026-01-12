import React, { useState, useRef } from 'react';
import { Obstruction } from '../types';

interface RoofLayoutEditorProps {
  roofSize: number;
  obstructions: Obstruction[];
  onChange: (obstructions: Obstruction[]) => void;
}

const RoofLayoutEditor: React.FC<RoofLayoutEditorProps> = ({ roofSize, obstructions, onChange }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [selectedType, setSelectedType] = useState<'fixed' | 'shaded'>('fixed');
  const [shadeDir, setShadeDir] = useState<'N' | 'S' | 'E' | 'W'>('S');

  const VIEW_SIZE = 400;
  const GRID_SIZE = 20;

  const getMousePos = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const CTM = containerRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentRect) return;
    const pos = getMousePos(e);
    setCurrentRect({
      x: Math.min(pos.x, startPos.x),
      y: Math.min(pos.y, startPos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentRect && currentRect.w > 5 && currentRect.h > 5) {
      const newObs: Obstruction = {
        id: Math.random().toString(36).substr(2, 9),
        x: currentRect.x,
        y: currentRect.y,
        width: currentRect.w,
        height: currentRect.h,
        type: selectedType,
        shadeDirection: selectedType === 'shaded' ? shadeDir : undefined
      };
      onChange([...obstructions, newObs]);
    }
    setIsDrawing(false);
    setCurrentRect(null);
  };

  const removeObstruction = (id: string) => {
    onChange(obstructions.filter(o => o.id !== id));
  };

  const totalPixels = VIEW_SIZE * VIEW_SIZE;
  const obstructionPixels = obstructions.reduce((acc, o) => acc + (o.width * o.height), 0);
  const obstructionPercentage = (obstructionPixels / totalPixels) * 100;
  const usableArea = roofSize * (1 - obstructionPercentage / 100);

  const getGradientCoords = (dir: string) => {
    switch(dir) {
      case 'N': return { x1: "0%", y1: "100%", x2: "0%", y2: "0%" };
      case 'E': return { x1: "0%", y1: "0%", x2: "100%", y2: "0%" };
      case 'W': return { x1: "100%", y1: "0%", x2: "0%", y2: "0%" };
      case 'S':
      default: return { x1: "0%", y1: "0%", x2: "0%", y2: "100%" };
    }
  };

  const getDirArrow = (dir: string) => {
    switch(dir) {
      case 'N': return "M12 4v16m0-16l-4 4m4-4l4 4";
      case 'S': return "M12 20V4m0 16l-4-4m4 4l4-4";
      case 'E': return "M20 12H4m16 0l-4-4m4 4l-4 4";
      case 'W': return "M4 12h16m-16 0l4-4m-4 4l4 4";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h4 className="text-sm font-black text-[#0A2540] uppercase tracking-wider">Roof Space Architect</h4>
          <p className="text-[10px] text-gray-500 font-medium">Map obstacles and shading zones</p>
        </div>
        <div className="text-right">
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] px-5 py-2.5 rounded-2xl shadow-sm">
            <p className="text-[9px] font-black text-green-700 uppercase tracking-[0.2em] mb-0.5">Usable Area</p>
            <p className="text-2xl font-black text-[#16A34A] leading-none tracking-tighter">{usableArea.toFixed(1)} <span className="text-xs font-bold">m²</span></p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-1 space-y-2.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Markup Tool:</p>
            <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl gap-1.5 shadow-inner">
              <button 
                type="button" 
                onClick={() => setSelectedType('fixed')}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-2 ${selectedType === 'fixed' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                FIXED
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedType('shaded')}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-2 ${selectedType === 'shaded' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                SHADED
              </button>
            </div>
          </div>

          {selectedType === 'shaded' && (
            <div className="flex-1 space-y-2.5 animate-in fade-in slide-in-from-right-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Cast Shadow To:</p>
              <div className="grid grid-cols-4 gap-1.5">
                {['N', 'S', 'E', 'W'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setShadeDir(d as any)}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all border-2 ${shadeDir === d ? 'bg-red-900 border-red-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                  >
                    <svg className="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={getDirArrow(d)} />
                    </svg>
                    <span className="text-[9px] font-black">{d}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative border-4 border-slate-100 rounded-[2.5rem] bg-white overflow-hidden shadow-2xl group">
        <svg
          ref={containerRef}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          className="w-full aspect-square bg-[#f8fafc] cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <defs>
            <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
            <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="2" />
            </pattern>
            {['N', 'S', 'E', 'W'].map(dir => (
              <linearGradient id={`red-shade-grad-${dir}`} key={dir} {...getGradientCoords(dir)}>
                <stop offset="0%" stopColor="#991b1b" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {obstructions.map((obs) => (
            <g key={obs.id} className="group/obs cursor-pointer">
              <rect
                x={obs.x}
                y={obs.y}
                width={obs.width}
                height={obs.height}
                fill={obs.type === 'fixed' ? 'url(#hatch)' : `url(#red-shade-grad-${obs.shadeDirection || 'S'})`}
                stroke={obs.type === 'fixed' ? '#ef4444' : '#991b1b'}
                strokeWidth="2.5"
                className="transition-all"
              />
              
              <foreignObject x={obs.x + obs.width - 28} y={obs.y} width="28" height="28">
                <button
                  onClick={(e) => { e.stopPropagation(); removeObstruction(obs.id); }}
                  className="w-7 h-7 flex items-center justify-center bg-red-600 text-white rounded-bl-2xl opacity-0 group-hover/obs:opacity-100 transition-all hover:scale-110 active:scale-90 shadow-xl"
                >
                  <span className="text-sm font-black">×</span>
                </button>
              </foreignObject>
            </g>
          ))}

          {currentRect && (
            <rect
              x={currentRect.x}
              y={currentRect.y}
              width={currentRect.w}
              height={currentRect.h}
              fill={selectedType === 'fixed' ? 'rgba(239, 68, 68, 0.2)' : `url(#red-shade-grad-${shadeDir})`}
              stroke={selectedType === 'fixed' ? '#ef4444' : '#991b1b'}
              strokeDasharray="8"
              strokeWidth="3"
            />
          )}
        </svg>

        <div className="absolute top-6 left-6 pointer-events-none flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl border border-slate-100">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]"></div>
            <span className="text-[10px] text-slate-900 font-black uppercase tracking-widest">Structural Obstacle</span>
          </div>
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl border border-slate-100">
            <div className="w-3 h-3 bg-red-900 rounded-full shadow-[0_0_12px_rgba(153,27,27,0.5)]"></div>
            <span className="text-[10px] text-slate-900 font-black uppercase tracking-widest">Shading Zone</span>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex justify-center">
          <div className="bg-white/90 backdrop-blur-xl px-6 py-2.5 rounded-2xl shadow-xl border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
            Drag to define obstacles and shade profiles
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoofLayoutEditor;