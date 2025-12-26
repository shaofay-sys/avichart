
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ToolType, Entity, Point, ViewportState, SnapPoint } from './types';
import Toolbar from './components/Toolbar';
import CommandLine from './components/CommandLine';
import PropertyPanel from './components/PropertyPanel';
import { downloadDXF } from './services/dxfExporter';
import { parseDrawingCommand } from './services/geminiService';
import { findSnapPoint } from './utils/geometry';

const GRID_SIZE = 50;
const BACKGROUND_COLOR = '#111827';
const GRID_COLOR = '#1f2937';
const SNAP_THRESHOLD = 20; // pixels on screen

const App: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('line');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, offset: { x: 0, y: 0 } });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [activeSnap, setActiveSnap] = useState<SnapPoint | null>(null);
  const [logs, setLogs] = useState<string[]>(['GeminiCAD v1.1 initialized.', 'OSNAP (End, Mid, Center, Perp) active.']);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg].slice(-20));
  };

  const screenToWorld = useCallback((x: number, y: number): Point => {
    return {
      x: (x - viewport.offset.x) / viewport.scale,
      y: (y - viewport.offset.y) / viewport.scale
    };
  }, [viewport]);

  const worldToScreen = useCallback((p: Point): Point => {
    return {
      x: p.x * viewport.scale + viewport.offset.x,
      y: p.y * viewport.scale + viewport.offset.y
    };
  }, [viewport]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Draw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    const startX = viewport.offset.x % (GRID_SIZE * viewport.scale);
    const startY = viewport.offset.y % (GRID_SIZE * viewport.scale);
    
    for (let x = startX; x < canvas.width; x += GRID_SIZE * viewport.scale) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = startY; y < canvas.height; y += GRID_SIZE * viewport.scale) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Origin Crosshair
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(viewport.offset.x - 20, viewport.offset.y);
    ctx.lineTo(viewport.offset.x + 20, viewport.offset.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(viewport.offset.x, viewport.offset.y - 20);
    ctx.lineTo(viewport.offset.x, viewport.offset.y + 20);
    ctx.stroke();

    // Draw Entities
    entities.forEach(ent => {
      ctx.strokeStyle = ent.id === selectedEntityId ? '#3b82f6' : ent.color;
      ctx.lineWidth = ent.id === selectedEntityId ? 3 : 2;
      
      const v = viewport;
      switch (ent.type) {
        case 'line':
          ctx.beginPath();
          ctx.moveTo(ent.start.x * v.scale + v.offset.x, ent.start.y * v.scale + v.offset.y);
          ctx.lineTo(ent.end.x * v.scale + v.offset.x, ent.end.y * v.scale + v.offset.y);
          ctx.stroke();
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(ent.center.x * v.scale + v.offset.x, ent.center.y * v.scale + v.offset.y, ent.radius * v.scale, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'rect':
          ctx.strokeRect(
            ent.start.x * v.scale + v.offset.x,
            ent.start.y * v.scale + v.offset.y,
            (ent.end.x - ent.start.x) * v.scale,
            (ent.end.y - ent.start.y) * v.scale
          );
          break;
      }
    });

    // Preview
    if (isDrawing && drawStart) {
      ctx.strokeStyle = '#60a5fa';
      ctx.setLineDash([5, 5]);
      const v = viewport;
      const ws = drawStart;
      const we = activeSnap || screenToWorld(mousePos.x, mousePos.y);

      switch (activeTool) {
        case 'line':
          ctx.beginPath();
          ctx.moveTo(ws.x * v.scale + v.offset.x, ws.y * v.scale + v.offset.y);
          ctx.lineTo(we.x * v.scale + v.offset.x, we.y * v.scale + v.offset.y);
          ctx.stroke();
          break;
        case 'rect':
          ctx.strokeRect(
            ws.x * v.scale + v.offset.x,
            ws.y * v.scale + v.offset.y,
            (we.x - ws.x) * v.scale,
            (we.y - ws.y) * v.scale
          );
          break;
        case 'circle':
          const r = Math.hypot(we.x - ws.x, we.y - ws.y);
          ctx.beginPath();
          ctx.arc(ws.x * v.scale + v.offset.x, ws.y * v.scale + v.offset.y, r * v.scale, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }
      ctx.setLineDash([]);
    }

    // Snap Marker
    if (activeSnap) {
      const sp = worldToScreen(activeSnap);
      ctx.strokeStyle = '#22c55e'; // Emerald 500
      ctx.lineWidth = 2;
      const size = 10;
      ctx.beginPath();
      
      switch (activeSnap.type) {
        case 'end':
          ctx.rect(sp.x - size/2, sp.y - size/2, size, size);
          break;
        case 'mid':
          ctx.moveTo(sp.x, sp.y - size/2);
          ctx.lineTo(sp.x - size/2, sp.y + size/2);
          ctx.lineTo(sp.x + size/2, sp.y + size/2);
          ctx.closePath();
          break;
        case 'center':
          ctx.arc(sp.x, sp.y, size/2, 0, Math.PI * 2);
          break;
        case 'perpendicular':
          ctx.moveTo(sp.x - size/2, sp.y);
          ctx.lineTo(sp.x + size/2, sp.y);
          ctx.moveTo(sp.x, sp.y - size/2);
          ctx.lineTo(sp.x, sp.y + size/2);
          // Small corner
          ctx.strokeRect(sp.x, sp.y - size/2, size/2, size/2);
          break;
      }
      ctx.stroke();
    }

    // Cursor coordinates overlay
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px monospace';
    const worldPos = activeSnap || screenToWorld(mousePos.x, mousePos.y);
    ctx.fillText(`X: ${worldPos.x.toFixed(2)}, Y: ${worldPos.y.toFixed(2)}`, mousePos.x + 15, mousePos.y - 15);

  }, [entities, viewport, isDrawing, drawStart, mousePos, activeTool, selectedEntityId, screenToWorld, worldToScreen, activeSnap]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.buttons === 4) return; // Ignore middle click for panning

    const worldPos = activeSnap || screenToWorld(e.clientX, e.clientY);

    if (activeTool === 'select' || activeTool === 'erase') {
      const found = entities.find(ent => {
        if (ent.type === 'line') {
          const d = Math.abs((ent.end.y - ent.start.y) * worldPos.x - (ent.end.x - ent.start.x) * worldPos.y + ent.end.x * ent.start.y - ent.end.y * ent.start.x) / Math.hypot(ent.end.y - ent.start.y, ent.end.x - ent.start.x);
          return d < 10;
        } else if (ent.type === 'circle') {
          const d = Math.hypot(ent.center.x - worldPos.x, ent.center.y - worldPos.y);
          return Math.abs(d - ent.radius) < 10;
        }
        return false;
      });

      if (found) {
        if (activeTool === 'erase') {
          setEntities(prev => prev.filter(e => e.id !== found.id));
          addLog(`Deleted ${found.type} entity.`);
        } else {
          setSelectedEntityId(found.id);
          addLog(`Selected ${found.type}.`);
        }
      } else {
        setSelectedEntityId(null);
      }
      return;
    }

    setIsDrawing(true);
    setDrawStart(worldPos);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    setMousePos({ x: mouseX, y: mouseY });

    // Handle panning with middle mouse button
    if (e.buttons === 4) {
      setViewport(v => ({
        ...v,
        offset: { x: v.offset.x + e.movementX, y: v.offset.y + e.movementY }
      }));
      return;
    }

    // Handle Snapping
    if (['line', 'rect', 'circle'].includes(activeTool)) {
      const worldMouse = screenToWorld(mouseX, mouseY);
      const snap = findSnapPoint(
        worldMouse, 
        entities, 
        SNAP_THRESHOLD / viewport.scale,
        drawStart
      );
      setActiveSnap(snap);
    } else {
      setActiveSnap(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return;
    const worldEnd = activeSnap || screenToWorld(e.clientX, e.clientY);
    
    const newId = Math.random().toString(36).substr(2, 9);
    const base = { id: newId, layer: '0', color: '#ffffff' };

    if (activeTool === 'line') {
      setEntities(prev => [...prev, { ...base, type: 'line', start: drawStart, end: worldEnd } as Entity]);
      addLog('Added LINE.');
    } else if (activeTool === 'rect') {
      setEntities(prev => [...prev, { ...base, type: 'rect', start: drawStart, end: worldEnd } as Entity]);
      addLog('Added RECT.');
    } else if (activeTool === 'circle') {
      const r = Math.hypot(worldEnd.x - drawStart.x, worldEnd.y - drawStart.y);
      setEntities(prev => [...prev, { ...base, type: 'circle', center: drawStart, radius: r } as Entity]);
      addLog('Added CIRCLE.');
    }

    setIsDrawing(false);
    setDrawStart(null);
    setActiveSnap(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = viewport.scale * scaleFactor;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    setViewport(v => ({
      scale: newScale,
      offset: {
        x: mouseX - (mouseX - v.offset.x) * scaleFactor,
        y: mouseY - (mouseY - v.offset.y) * scaleFactor
      }
    }));
  };

  const handleAICommand = async (command: string) => {
    addLog(`Thinking: ${command}`);
    const result = await parseDrawingCommand(command);
    
    if (result && Array.isArray(result)) {
      const newEntities: Entity[] = result.map((item: any) => {
        const base = {
          id: Math.random().toString(36).substr(2, 9),
          layer: '0',
          color: item.color || '#ffffff',
        };

        if (item.type === 'line') {
          return { ...base, type: 'line', start: { x: item.params.x1 || 0, y: item.params.y1 || 0 }, end: { x: item.params.x2 || 100, y: item.params.y2 || 100 } };
        } else if (item.type === 'circle') {
          return { ...base, type: 'circle', center: { x: item.params.cx || 0, y: item.params.cy || 0 }, radius: item.params.radius || 50 };
        } else if (item.type === 'rect') {
           return { ...base, type: 'rect', start: { x: item.params.x1 || 0, y: item.params.y1 || 0 }, end: { x: item.params.x2 || 100, y: item.params.y2 || 100 } };
        }
        return null;
      }).filter(Boolean) as Entity[];

      if (newEntities.length > 0) {
        setEntities(prev => [...prev, ...newEntities]);
        addLog(`Gemini added ${newEntities.length} entities.`);
      } else {
        addLog(`Gemini couldn't figure out that drawing.`);
      }
    } else {
      addLog(`AI could not interpret command.`);
    }
  };

  const handleUpdateEntity = (updated: Entity) => {
    setEntities(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const clearCanvas = () => {
    if (confirm("Clear all objects?")) {
      setEntities([]);
      addLog("Canvas cleared.");
    }
  };

  const exportDXF = () => {
    if (entities.length === 0) {
      alert("Nothing to export!");
      return;
    }
    downloadDXF(entities);
    addLog("DXF export completed.");
  };

  const selectedEntity = entities.find(e => e.id === selectedEntityId) || null;

  return (
    <div className="relative w-screen h-screen select-none overflow-hidden" onWheel={handleWheel}>
      <div className="fixed top-4 left-4 bg-gray-900/60 backdrop-blur px-4 py-2 rounded-lg border border-gray-700 z-20 pointer-events-none">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-500">Gemini</span>CAD
          <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">DXF Ready</span>
        </h1>
        <div className="flex gap-4 mt-1">
          <span className="text-xs text-gray-500 font-mono">OBJECTS: {entities.length}</span>
          <span className="text-xs text-gray-500 font-mono">ZOOM: {(viewport.scale * 100).toFixed(0)}%</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="block touch-none"
      />

      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        onExport={exportDXF}
        onClear={clearCanvas}
      />

      <PropertyPanel 
        selectedEntity={selectedEntity} 
        onUpdate={handleUpdateEntity} 
      />

      <CommandLine 
        onCommand={handleAICommand} 
        logs={logs} 
      />

      <div className="fixed bottom-6 right-6 text-[10px] text-gray-500 font-mono text-right bg-gray-950/50 p-2 rounded border border-gray-800 pointer-events-none z-10">
        MIDDLE MOUSE: PAN<br/>
        WHEEL: ZOOM<br/>
        SELECT + DELETE: (PROXIMITY)<br/>
        OSNAP: END, MID, CEN, PERP
      </div>
    </div>
  );
};

export default App;
