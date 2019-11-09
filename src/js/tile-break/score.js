import $ from "jquery";

export default class Score {
  constructor(selector) {
    this.$score = $(selector);
    this.score = 0;
  }

  update(num) {
    this.score += num;
    this.$score.text(this.score);
  }

  reset() {
    this.score = 0;
    this.$score.text(this.score);
  }

  get() {
    return this.score;
  }
}
