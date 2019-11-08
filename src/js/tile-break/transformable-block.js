
export default class TransformableBlock {
  constructor(block) {
    if (block.length != 9) {
      throw 'invalid param';
    }

    this.block = block;
  }

  get() {
    return this.block;
  }

  reverse() {
    const after = [];
    for (let i = 0; i < this.block.length; i++) {
      after[i] = this.block[i] === 0 ? 1 : 0;
    }

    return new TransformableBlock(after);
  }

  rotate() {
    let after = [];

    let toBase = 6;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        let to = toBase - (c * 3);
        after[to] = this.block[(r * 3 + c)];
      }
      toBase++;
    }

    return new TransformableBlock(after);
  }

  flip() {
    let after = [];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        after[r * 3 + c] = this.block[r * 3 + 2 - c];
      }
    }

    return new TransformableBlock(after);
  }
}

