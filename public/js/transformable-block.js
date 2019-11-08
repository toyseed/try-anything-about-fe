(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        for (var c = 0; c < 3; c++) {}
      }

      return this;
    }
  }]);

  return TransformableBlock;
}();

exports["default"] = TransformableBlock;

(function () {
  var block = new TransformableBlock([1, 0, 0, 1, 1, 0, 1, 0, 0]);
  console.log(block.get());
  console.log(block.rotate().get());
})();

},{}]},{},[1]);
