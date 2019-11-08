import TransformableBlock from './transformable-block';

const a1 = new TransformableBlock([1, 0, 1, 0, 0, 0, 1, 0 ,1]);
const a2 = a1.reverse();

const b1 = new TransformableBlock([1, 0, 0, 1, 0, 0, 1, 1, 1]);
const b2 = b1.rotate();
const b3 = b2.rotate();
const b4 = b3.rotate();

const c1 = new TransformableBlock([0, 0, 0, 0, 1, 1, 1, 1, 0]);
const c2 = c1.rotate();
const c3 = c1.flip();
const c4 = c3.rotate();

const d1 = new TransformableBlock([1, 0, 0, 1, 1, 0, 1, 0, 0]);
const d2 = d1.rotate();
const d3 = d2.rotate();
const d4 = d3.rotate();

const e1 = d1.reverse();
const e2 = e1.rotate();
const e3 = e2.rotate();
const e4 = e3.rotate();

const f1 = new TransformableBlock([0, 1, 0, 0, 1, 0, 0, 1, 0]);
const f2 = f1.rotate();

const g1 = new TransformableBlock([1, 0, 0, 1, 0, 0, 1, 0, 0]);
const g2 = g1.rotate();
const g3 = g2.rotate();
const g4 = g3.rotate();

const h1 = new TransformableBlock([0, 0, 0, 0, 1, 0, 0, 0, 0]);

const i1 = new TransformableBlock([0, 0, 1, 0, 0, 0, 1, 0, 0]);
const i2 = i1.flip();

const j1 = new TransformableBlock([0, 0, 0, 1, 0, 1, 0, 0, 0]);
const j2 = j1.rotate();

const blocks = [
  a1, a2,
  b1, b2, b3, b4,
  c1, c2, c3, c4,
  d1, d2, d3, d4,
  e1, e2, e3, e4,
  f1, f2,
  g1, g2, g3, g4,
  h1,
  i1, i2,
  j1, j2
]

const all = [];
for (let block of blocks) {
  console.log(block);
  all.push(block.get());
}

export {
  all
};



