
import React from 'react';
import { Entity } from '../types';

interface PropertyPanelProps {
  selectedEntity: Entity | null;
  onUpdate: (updated: Entity) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedEntity, onUpdate }) => {
  if (!selectedEntity) {
    return (
      <div className="fixed right-4 top-24 w-64 bg-gray-900/80 backdrop-blur border border-gray-700 p-4 rounded-xl text-gray-400 text-sm z-20">
        <p className="text-center italic">No object selected</p>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdate({ ...selectedEntity, [key]: value } as Entity);
  };

  const renderGeometry = () => {
    switch (selectedEntity.type) {
      case 'line':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Start X</label>
              <input type="number" value={selectedEntity.start.x} onChange={(e) => onUpdate({...selectedEntity, start: {...selectedEntity.start, x: Number(e.target.value)}})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Start Y</label>
              <input type="number" value={selectedEntity.start.y} onChange={(e) => onUpdate({...selectedEntity, start: {...selectedEntity.start, y: Number(e.target.value)}})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">End X</label>
              <input type="number" value={selectedEntity.end.x} onChange={(e) => onUpdate({...selectedEntity, end: {...selectedEntity.end, x: Number(e.target.value)}})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">End Y</label>
              <input type="number" value={selectedEntity.end.y} onChange={(e) => onUpdate({...selectedEntity, end: {...selectedEntity.end, y: Number(e.target.value)}})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
          </div>
        );
      case 'circle':
        return (
          <div className="space-y-2">
             <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Center X</label>
              <input type="number" value={selectedEntity.center.x} onChange={(e) => onUpdate({...selectedEntity, center: {...selectedEntity.center, x: Number(e.target.value)}})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Center Y</label>
              <input type="number" value={selectedEntity.center.y} onChange={(e) => onUpdate({...selectedEntity, center: {...selectedEntity.center, y: Number(e.target.value)}})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Radius</label>
              <input type="number" value={selectedEntity.radius} onChange={(e) => onUpdate({...selectedEntity, radius: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
          </div>
        );
      case 'rect':
        return (
           <div className="space-y-2">
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">X</label>
              <input type="number" value={selectedEntity.start.x} onChange={(e) => onUpdate({...selectedEntity, start: {...selectedEntity.start, x: Number(e.target.value)}})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Y</label>
              <input type="number" value={selectedEntity.start.y} onChange={(e) => onUpdate({...selectedEntity, start: {...selectedEntity.start, y: Number(e.target.value)}})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed right-4 top-24 w-64 bg-gray-900/90 backdrop-blur border border-gray-700 p-4 rounded-xl shadow-xl z-20">
      <h3 className="font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center justify-between">
        PROPERTIES
        <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded uppercase">{selectedEntity.type}</span>
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Color</label>
          <input 
            type="color" 
            value={selectedEntity.color} 
            onChange={(e) => handleChange('color', e.target.value)} 
            className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer"
          />
        </div>
        
        {renderGeometry()}

        <div className="pt-4 mt-4 border-t border-gray-700">
           <label className="block text-xs uppercase text-gray-500 mb-1">Layer</label>
           <input 
            type="text" 
            value={selectedEntity.layer} 
            onChange={(e) => handleChange('layer', e.target.value)} 
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
