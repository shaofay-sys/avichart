
import React, { useState, useEffect, useRef } from 'react';

interface CommandLineProps {
  onCommand: (command: string) => Promise<void>;
  logs: string[];
}

const CommandLine: React.FC<CommandLineProps> = ({ onCommand, logs }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input;
    setInput('');
    setIsProcessing(true);
    await onCommand(cmd);
    setIsProcessing(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-30">
      <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Log Area */}
        <div className="h-24 overflow-y-auto px-4 py-2 font-mono text-sm text-gray-400 select-none">
          {logs.map((log, i) => (
            <div key={i} className="mb-0.5 whitespace-pre-wrap">
              <span className="text-gray-600 mr-2">></span>
              {log}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
        
        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative flex items-center border-t border-gray-700 bg-gray-950 p-1">
          <div className="absolute left-4 text-blue-500 font-bold font-mono">COMMAND:</div>
          <input
            type="text"
            className="w-full bg-transparent text-white font-mono px-4 py-3 pl-24 focus:outline-none placeholder-gray-600"
            placeholder={isProcessing ? "Gemini thinking..." : "Type command or 'Draw a house'..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
          />
          {isProcessing && (
            <div className="absolute right-4">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CommandLine;
