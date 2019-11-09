function reverse(block) {
  const after = [];
  for (let i = 0; i < block.length; i++) {
    after[i] = block[i] === 0 ? 1 : 0;
  }

  return after;
}

function rotate(block) {
  let after = [];

  let toBase = 6;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let to = toBase - c * 3;
      after[to] = block[r * 3 + c];
    }
    toBase++;
  }

  return after;
}

function flip(block) {
  let after = [];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      after[r * 3 + c] = block[r * 3 + 2 - c];
    }
  }

  return after;
}

export default {
  reverse, rotate, flip
};
