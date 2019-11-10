(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function reverse(block) {
  var after = [];

  for (var i = 0; i < block.length; i++) {
    after[i] = block[i] === 0 ? 1 : 0;
  }

  return after;
}

function rotate(block) {
  var after = [];
  var toBase = 6;

  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      var to = toBase - c * 3;
      after[to] = block[r * 3 + c];
    }

    toBase++;
  }

  return after;
}

function flip(block) {
  var after = [];

  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      after[r * 3 + c] = block[r * 3 + 2 - c];
    }
  }

  return after;
}

var _default = {
  reverse: reverse,
  rotate: rotate,
  flip: flip
};
exports["default"] = _default;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shapes = void 0;

var _blockTransformUtil = _interopRequireDefault(require("./block-transform-util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var a1 = [0, 0, 0, 0, 1, 0, 1, 1, 1];
var b1 = [1, 0, 0, 1, 0, 0, 1, 0, 0];
var c1 = [0, 0, 0, 0, 1, 1, 1, 1, 0];

var d1 = _blockTransformUtil["default"].flip(c1);

var f1 = [0, 0, 1, 0, 0, 1, 0, 1, 1];

var g1 = _blockTransformUtil["default"].flip(f1);

var h1 = [1, 1, 0, 1, 1, 0, 0, 0, 0];
var i1 = [0, 0, 0, 1, 0, 0, 1, 1, 0];
var j1 = [0, 1, 1, 0, 1, 0, 1, 1, 0];

var k1 = _blockTransformUtil["default"].flip(j1);

var l1 = [1, 0, 0, 0, 1, 0, 1, 0, 0];
var m1 = [0, 1, 0, 1, 1, 1, 0, 1, 0];
var shapes = [a1, b1, c1, d1, f1, g1, h1, i1, j1, k1, l1, m1];
exports.shapes = shapes;

},{"./block-transform-util":1}]},{},[2]);
