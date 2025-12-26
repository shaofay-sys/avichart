
export type ToolType = 'select' | 'line' | 'rect' | 'circle' | 'erase';
export type SnapType = 'end' | 'mid' | 'center' | 'perpendicular';

export interface Point {
  x: number;
  y: number;
}

export interface SnapPoint extends Point {
  type: SnapType;
}

export interface BaseEntity {
  id: string;
  type: 'line' | 'circle' | 'rect';
  layer: string;
  color: string;
}

export interface LineEntity extends BaseEntity {
  type: 'line';
  start: Point;
  end: Point;
}

export interface CircleEntity extends BaseEntity {
  type: 'circle';
  center: Point;
  radius: number;
}

export interface RectEntity extends BaseEntity {
  type: 'rect';
  start: Point;
  end: Point;
}

export type Entity = LineEntity | CircleEntity | RectEntity;

export interface ViewportState {
  scale: number;
  offset: Point;
}
