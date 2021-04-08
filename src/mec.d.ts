
export const mec: mec2;

// drawing context for g2
type ctx = any;

interface constraint {
  id: string,
  p1: string,
  p2: string,
  ori: {
    type: string,
    inputCallbk(number): () => void,
  },
}

interface node {
  base: boolean,
  x: number,
  y: number,
}

export interface mec2 {
  init(): () => void,
  tick(): () => void,
  draw(ctx): () => void,
  nodes: node[],
  constraints: constraint[],
}
