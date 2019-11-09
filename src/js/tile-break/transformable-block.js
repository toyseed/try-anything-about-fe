import blockUtil from "./block-transform-util";
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { fromArray } from "rxjs/internal/observable/fromArray";

export default class TransformableBlock {
  constructor(type, shape, color) {
    this.type = type;
    this.shape = [];

    fromArray(shape)
      .pipe(map(value => (value > 0 ? color : 0)))
      .subscribe(value => this.shape.push(value));
  }

  getType() {
    return this.type;
  }

  getShape() {
    return this.shape;
  }

  rotate() {
    this.shape = blockUtil.rotate(this.shape);
    return this;
  }
}
