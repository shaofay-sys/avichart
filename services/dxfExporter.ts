
import { Entity } from '../types';

/**
 * Basic DXF exporter for Line, Circle, and Rect (as 4 lines)
 */
export const exportToDXF = (entities: Entity[]): string => {
  let dxf = "0\nSECTION\n2\nENTITIES\n";

  entities.forEach((ent) => {
    switch (ent.type) {
      case 'line':
        dxf += "0\nLINE\n8\n0\n"; // Layer 0
        dxf += `10\n${ent.start.x}\n20\n${-ent.start.y}\n30\n0.0\n`;
        dxf += `11\n${ent.end.x}\n21\n${-ent.end.y}\n31\n0.0\n`;
        break;
      case 'circle':
        dxf += "0\nCIRCLE\n8\n0\n";
        dxf += `10\n${ent.center.x}\n20\n${-ent.center.y}\n30\n0.0\n`;
        dxf += `40\n${ent.radius}\n`;
        break;
      case 'rect':
        const x1 = ent.start.x;
        const y1 = ent.start.y;
        const x2 = ent.end.x;
        const y2 = ent.end.y;
        // DXF Rects are usually polyline or 4 lines
        const points = [
          [x1, y1, x2, y1],
          [x2, y1, x2, y2],
          [x2, y2, x1, y2],
          [x1, y2, x1, y1]
        ];
        points.forEach(([ax, ay, bx, by]) => {
          dxf += "0\nLINE\n8\n0\n";
          dxf += `10\n${ax}\n20\n${-ay}\n30\n0.0\n`;
          dxf += `11\n${bx}\n21\n${-by}\n31\n0.0\n`;
        });
        break;
    }
  });

  dxf += "0\nENDSEC\n0\nEOF\n";
  return dxf;
};

export const downloadDXF = (entities: Entity[]) => {
  const content = exportToDXF(entities);
  const blob = new Blob([content], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `drawing_${Date.now()}.dxf`;
  a.click();
  URL.revokeObjectURL(url);
};
