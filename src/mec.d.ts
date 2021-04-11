import { g2 } from 'g2-module';

export const mec: IMec2;

export interface IMecProperty {
  id: string,
  init: (model: IMec2) => void,
  remove: () => void,
}

// drawing context for g2
type ctx = any;

export interface IView extends IMecProperty {
  id: string,
  as: string,
}

export interface IConstraint extends IMecProperty {
  id: string,
  p1: string,
  p2: string,
  ori: {
    type: string,
    inputCallbk(number): () => void,
  },
}

export interface INode extends IMecProperty {
  base: boolean,
  x: number,
  y: number,
}

export interface IMecPlugIns {
  "nodes": INode[],
  "views": IView[],
  "constraints": IConstraint[]
}

export interface IMec2 extends IMecPlugIns {
  id: string,
  plugIns: any,
  draw: (g2: g2) => void,
  add: (list: keyof IMecPlugIns, o: any) => any,
  preview: () => void,
  pose: () => void,
}
