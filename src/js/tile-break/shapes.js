import util from './block-transform-util';

const a1 = [0, 0, 0,
            0, 1, 0,
            1, 1, 1];
const b1 = [1, 0, 0,
            1, 0, 0,
            1, 0, 0];
const c1 = [0, 0, 0,
            0, 1, 1,
            1, 1, 0];
const d1 = util.flip(c1);
const f1 = [0, 0, 1,
            0, 0, 1,
            0, 1, 1];
const g1 = util.flip(f1);
const h1 = [1, 1, 0,
            1, 1, 0,
            0, 0, 0];
const i1 = [0, 0, 0,
            1, 0, 0,
            1, 1, 0];
const j1 = [0, 1, 1,
            0, 1, 0,
            1, 1, 0];
const k1 = util.flip(j1);
const l1 = [1, 0, 0,
            0, 1, 0,
            1, 0, 0];
const m1 = [0, 1, 0,
            1, 1, 1,
            0, 1, 0];

const shapes = [
  a1,
  b1,
  c1,
  d1,
  f1,
  g1,
  h1,
  i1,
  j1,
  k1,
  l1,
  m1,
]

export {
  shapes
};



