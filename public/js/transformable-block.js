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
exports["default"] = void 0;

var _blockTransformUtil = _interopRequireDefault(require("./block-transform-util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TransformableBlock =
/*#__PURE__*/
function () {
  function TransformableBlock(type, shape) {
    _classCallCheck(this, TransformableBlock);

    this.type = type;
    this.shape = shape;
  }

  _createClass(TransformableBlock, [{
    key: "getType",
    value: function getType() {
      return this.type;
    }
  }, {
    key: "getShape",
    value: function getShape() {
      return this.shape;
    }
  }, {
    key: "rotate",
    value: function rotate() {
      this.shape = _blockTransformUtil["default"].rotate(this.shape);
    }
  }]);

  return TransformableBlock;
}();

exports["default"] = TransformableBlock;

},{"./block-transform-util":1}]},{},[2]);
