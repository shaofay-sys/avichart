
import { Point, Entity, SnapPoint } from '../types';

export const getDistance = (p1: Point, p2: Point) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

export const getProjectedPoint = (p: Point, a: Point, b: Point): Point => {
  const atob = { x: b.x - a.x, y: b.y - a.y };
  const atop = { x: p.x - a.x, y: p.y - a.y };
  const len = atob.x * atob.x + atob.y * atob.y;
  let dot = atop.x * atob.x + atop.y * atob.y;
  const t = Math.min(1, Math.max(0, dot / len));
  return {
    x: a.x + atob.x * t,
    y: a.y + atob.y * t
  };
};

export const getPerpendicularPoint = (p: Point, a: Point, b: Point): Point => {
  const atob = { x: b.x - a.x, y: b.y - a.y };
  const atop = { x: p.x - a.x, y: p.y - a.y };
  const len = atob.x * atob.x + atob.y * atob.y;
  if (len === 0) return a;
  const dot = atop.x * atob.x + atop.y * atob.y;
  const t = dot / len; // Projection without clamping to [0,1] to check if it's on segment later
  return {
    x: a.x + atob.x * t,
    y: a.y + atob.y * t
  };
};

export const findSnapPoint = (
  mouseWorld: Point, 
  entities: Entity[], 
  threshold: number,
  referencePoint: Point | null = null
): SnapPoint | null => {
  let bestSnap: SnapPoint | null = null;
  let minDistance = threshold;

  const check = (p: Point, type: SnapPoint['type']) => {
    const d = getDistance(mouseWorld, p);
    if (d < minDistance) {
      minDistance = d;
      bestSnap = { ...p, type };
    }
  };

  entities.forEach(ent => {
    if (ent.type === 'line') {
      check(ent.start, 'end');
      check(ent.end, 'end');
      check({ x: (ent.start.x + ent.end.x) / 2, y: (ent.start.y + ent.end.y) / 2 }, 'mid');
      
      if (referencePoint) {
        const perp = getPerpendicularPoint(referencePoint, ent.start, ent.end);
        // Check if perp foot is roughly on the segment
        const dStart = getDistance(perp, ent.start);
        const dEnd = getDistance(perp, ent.end);
        const lineLen = getDistance(ent.start, ent.end);
        if (dStart <= lineLen + 1 && dEnd <= lineLen + 1) {
          check(perp, 'perpendicular');
        }
      }
    } else if (ent.type === 'circle') {
      check(ent.center, 'center');
    } else if (ent.type === 'rect') {
      const p1 = ent.start;
      const p2 = { x: ent.end.x, y: ent.start.y };
      const p3 = ent.end;
      const p4 = { x: ent.start.x, y: ent.end.y };
      [p1, p2, p3, p4].forEach(p => check(p, 'end'));
      
      const segments = [[p1, p2], [p2, p3], [p3, p4], [p4, p1]];
      segments.forEach(([a, b]) => {
        check({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, 'mid');
        if (referencePoint) {
           const perp = getPerpendicularPoint(referencePoint, a, b);
           const dSeg = getDistance(a, b);
           if (getDistance(perp, a) <= dSeg + 1 && getDistance(perp, b) <= dSeg + 1) {
             check(perp, 'perpendicular');
           }
        }
      });
    }
  });

  return bestSnap;
};
