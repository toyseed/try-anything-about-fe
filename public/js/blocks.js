(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.all = void 0;

var _transformableBlock = _interopRequireDefault(require("./transformable-block"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var a1 = new _transformableBlock["default"]([1, 0, 1, 0, 0, 0, 1, 0, 1]);
var a2 = a1.reverse();
var b1 = new _transformableBlock["default"]([1, 0, 0, 1, 0, 0, 1, 1, 1]);
var b2 = b1.rotate();
var b3 = b2.rotate();
var b4 = b3.rotate();
var c1 = new _transformableBlock["default"]([0, 0, 0, 0, 1, 1, 1, 1, 0]);
var c2 = c1.rotate();
var c3 = c1.flip();
var c4 = c3.rotate();
var d1 = new _transformableBlock["default"]([1, 0, 0, 1, 1, 0, 1, 0, 0]);
var d2 = d1.rotate();
var d3 = d2.rotate();
var d4 = d3.rotate();
var e1 = d1.reverse();
var e2 = e1.rotate();
var e3 = e2.rotate();
var e4 = e3.rotate();
var f1 = new _transformableBlock["default"]([0, 1, 0, 0, 1, 0, 0, 1, 0]);
var f2 = f1.rotate();
var g1 = new _transformableBlock["default"]([1, 0, 0, 1, 0, 0, 1, 0, 0]);
var g2 = g1.rotate();
var g3 = g2.rotate();
var g4 = g3.rotate();
var h1 = new _transformableBlock["default"]([0, 0, 0, 0, 1, 0, 0, 0, 0]);
var i1 = new _transformableBlock["default"]([0, 0, 1, 0, 0, 0, 1, 0, 0]);
var i2 = i1.flip();
var j1 = new _transformableBlock["default"]([0, 0, 0, 1, 0, 1, 0, 0, 0]);
var j2 = j1.rotate();
var blocks = [a1, a2, b1, b2, b3, b4, c1, c2, c3, c4, d1, d2, d3, d4, e1, e2, e3, e4, f1, f2, g1, g2, g3, g4, h1, i1, i2, j1, j2];
var all = [];
exports.all = all;

for (var _i = 0, _blocks = blocks; _i < _blocks.length; _i++) {
  var block = _blocks[_i];
  console.log(block);
  all.push(block.get());
}

},{"./transformable-block":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TransformableBlock =
/*#__PURE__*/
function () {
  function TransformableBlock(block) {
    _classCallCheck(this, TransformableBlock);

    if (block.length != 9) {
      throw 'invalid param';
    }

    this.block = block;
  }

  _createClass(TransformableBlock, [{
    key: "get",
    value: function get() {
      return this.block;
    }
  }, {
    key: "reverse",
    value: function reverse() {
      var after = [];

      for (var i = 0; i < this.block.length; i++) {
        after[i] = this.block[i] === 0 ? 1 : 0;
      }

      return new TransformableBlock(after);
    }
  }, {
    key: "rotate",
    value: function rotate() {
      var after = [];
      var toBase = 6;

      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          var to = toBase - c * 3;
          after[to] = this.block[r * 3 + c];
        }

        toBase++;
      }

      return new TransformableBlock(after);
    }
  }, {
    key: "flip",
    value: function flip() {
      var after = [];

      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          after[r * 3 + c] = this.block[r * 3 + 2 - c];
        }
      }

      return new TransformableBlock(after);
    }
  }]);

  return TransformableBlock;
}();

exports["default"] = TransformableBlock;

},{}]},{},[1]);
