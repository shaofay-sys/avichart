
import React from 'react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onExport: () => void;
  onClear: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, onExport, onClear }) => {
  const tools: { id: ToolType; label: string; icon: string }[] = [
    { id: 'select', label: 'Select', icon: 'M15.1,10.1L9,16.2l-3-3L10.1,9L15.1,10.1z M3,21l4.5-1.5l-3-3L3,21z' },
    { id: 'line', label: 'Line', icon: 'M3,3L21,21' },
    { id: 'rect', label: 'Rectangle', icon: 'M3,3H21V21H3V3Z' },
    { id: 'circle', label: 'Circle', icon: 'M12,2A10,10,0,1,0,22,12A10,10,0,0,0,12,2Z' },
    { id: 'erase', label: 'Erase', icon: 'M20.7,7L17,3.3c-0.4-0.4-1-0.4-1.4,0l-12,12c-0.4,0.4-0.4,1,0,1.4l3.7,3.7c0.4,0.4,1,0.4,1.4,0l12-12C21.1,8,21.1,7.4,20.7,7z' },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-gray-900/80 backdrop-blur border border-gray-700 p-2 rounded-xl shadow-2xl z-20">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          title={tool.label}
          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
            activeTool === tool.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {tool.id === 'line' ? <path d="M3,3L21,21" /> : 
             tool.id === 'rect' ? <rect x="3" y="3" width="18" height="18" rx="2" /> :
             tool.id === 'circle' ? <circle cx="12" cy="12" r="9" /> :
             tool.id === 'erase' ? <path d="M7 21L21 7l-4-4L3 17v4h4z" /> :
             <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />}
          </svg>
        </button>
      ))}
      <hr className="border-gray-700 my-1" />
      <button
        onClick={onExport}
        title="Export DXF"
        className="w-12 h-12 flex items-center justify-center rounded-lg text-emerald-400 hover:bg-gray-800 hover:text-emerald-300 transition-all"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      <button
        onClick={onClear}
        title="Clear Canvas"
        className="w-12 h-12 flex items-center justify-center rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-all"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default Toolbar;
