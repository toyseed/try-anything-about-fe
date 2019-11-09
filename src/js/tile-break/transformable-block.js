import blockUtil from './block-transform-util'

export default class TransformableBlock {
  constructor(type, shape) {
    this.type = type;
    this.shape = shape;
  }

  getType() {
    return this.type;
  }

  getShape() {
    return this.shape;
  }

  rotate() {
    this.shape = blockUtil.rotate(this.shape);
  }
}

