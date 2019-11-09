"use strict";

import $ from "jquery";
import { fromEvent, Observable, of, range, zip, merge } from "rxjs";
import {
  defaultIfEmpty,
  filter,
  first,
  last,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  tap,
  throttleTime
} from "rxjs/operators";
import { fromArray } from "rxjs/internal/observable/fromArray";
import { shapes as ALL_SHAPES } from "./blocks";
import Score from "./score";
import Block from "./transformable-block";
import util from "./block-transform-util";

/*
  1. block 에 색상 추가
  2. ? board 에 block 이 over 됐을 때 fill 될 tile 에 음영추가
    -> block 에 shadow 줬음.
  3. ? block 이 board 에 입력되는 방식 변경
    - block 에서 fill 영역만 board 에 포함되어도 board 가 fill 될 수 있게
  4. / block design
  5. / support touch event
  6. / 종료 조건 - 들어갈 수 있는 공간이 있는지 찾기
  7. / block 회전 기능 추가
    - 회전을 위한 버튼
 */
$(window).ready(() => {
  const boardRow = 9;
  const boardCol = 9;
  const blockRow = 3;
  const blockCol = 3;

  const blockEls = $(".block");
  const shapes = ALL_SHAPES;
  const colors = [1, 2, 3, 4];
  const colors$ = fromArray(colors).pipe(map(color => "c" + color));
  let blocks = [];
  let board;

  let score = new Score(".score-current");
  let gameOverLayer = (score => {
    let $layer = $(".gameover");
    let $score = $($layer.find(".last-score"));

    $layer.on("click", hide);
    function show() {
      $score.text(score.get());
      $layer.addClass("show");
    }

    function hide() {
      $layer.removeClass("show");
    }

    return {
      show,
      hide
    };
  })(score);

  fromEvent($(".replay-button"), "click").subscribe(() => initGame());
  fromEvent($(".rotate-btn"), "click")
    .pipe(
      map(event => {
        const $button = $(event.target);
        const blockIndex = $button.data("index");

        return blockIndex;
      })
    )
    .subscribe(blockIndex => {
      const block = blocks[blockIndex];
      fillBlockTo($(`.block[data-block-index=${blockIndex}]`), block.rotate());
    });
  initGame();

  function initGame() {
    board = Array.apply(null, Array(boardRow * boardCol)).map(() => 0);
    score.reset();
    initBoard();
    initBlocks();
    initEvents();
  }

  function initBoard() {
    $(".board-tile.fill").each(function() {
      $(this).removeClass("fill");
    });
  }

  function initBlocks() {
    blocks = [];
    blockEls.each(function() {
      const block = selectRandomBlock(-1, ...blocks);
      blocks.push(block);

      const $el = $(this);
      fillBlockTo($el, block);
    });
  }

  function initEvents() {
    const $block = $(".block");
    const mouseStart$ = fromEvent($block, "mousedown");
    const mouseEnd$ = fromEvent(document, "mouseup");
    const mouseMove$ = fromEvent(document, "mousemove");
    const touchStart$ = fromEvent($block, "touchstart").pipe(
      map(event => {
        const $target = $(event.target);
        event.offsetX = ($target.width() / 3) * 2;
        event.offsetY = ($target.height() / 4) * 6;
        return event;
      })
    );
    const touchEnd$ = fromEvent(document, "touchend");
    const touchMove$ = fromEvent(document, "touchmove").pipe(
      map(event => event.touches[0])
    );

    const start$ = merge(mouseStart$, touchStart$);
    const end$ = merge(mouseEnd$, touchEnd$);
    const move$ = merge(mouseMove$, touchMove$);

    // const start$ = mouseStart$;
    // const end$ = mouseEnd$;
    // const move$ = mouseMove$;

    const $blocks = $(".blocks");
    let blockY;
    let blockX;
    let $movingBlock;
    let pointAdjustment;

    // mousemove event 가 없으면 오류 발생.
    // https://codepen.io/joshblack/pen/zGZZjX
    //  no selectMany;
    //  error 에서 initEvents 를 다시 호출하도록 변경.
    const game$ = start$
      .pipe(
        tap(event => {
          event.preventDefault();
          $movingBlock = $(event.target);
          $movingBlock.addClass("current");

          let blockOffset = $movingBlock.offset();
          blockY = blockOffset.top - window.scrollY;
          blockX = blockOffset.left - window.scrollX;

          pointAdjustment = $movingBlock.width() / (blockCol * 2);
        }),
        mergeMap(startEvent => {
          return move$.pipe(
            // throttleTime(10),
            takeUntil(end$),
            tap(moveEvent => {
              // https://stackoverflow.com/questions/11334452/event-offsetx-in-firefox
              let startOffsetX = startEvent.offsetX;
              let startOffsetY = startEvent.offsetY;

              $movingBlock.css({
                top: moveEvent.clientY - blockY - startOffsetY + 1,
                left: moveEvent.clientX - blockX - startOffsetX + 1
              });
            }),
            last(),
            map(moveEvent => {
              return {
                blockIndex: $movingBlock.data("block-index"),
                x: moveEvent.clientX - startEvent.offsetX + pointAdjustment,
                y: moveEvent.clientY - startEvent.offsetY + pointAdjustment
              };
            })
          );
        })
      )
      .subscribe(
        ({ x, y, blockIndex }) => {
          resetBlock($movingBlock);

          const $checkBase = $(document.elementFromPoint(x, y));
          if (!$checkBase.hasClass("js_board-tile")) {
            return;
          }

          const block = blocks[blockIndex];
          const baseRow = $checkBase.data("row");
          const baseCol = $checkBase.data("col");
          const tiles = findFillableTiles(baseRow, baseCol, block.getShape());
          if (tiles.length === 0) {
            return;
          }

          fillBoard(tiles);
          score.update(tiles.length);

          // change current block
          const selectedBlock = selectRandomBlock(block.getType(), ...blocks);
          fillBlockTo($movingBlock, selectedBlock);
          blocks[blockIndex] = selectedBlock;

          const rowComplete = checkRowComplete(tiles);
          const colComplete = checkColComplete(tiles);
          const areaComplete = checkAreaComplete(tiles);

          setTimeout(function() {
            // remove
            clearRow(rowComplete);
            clearCol(colComplete);
            clearArea(areaComplete);

            // 게임 종료 조건 확인
            if (checkGameOver()) {
              game$.unsubscribe();
              gameOverLayer.show();
            }
          }, 100);
        },
        error => {
          console.log(error);
          resetBlock($movingBlock);
          initEvents();
        },
        complete => {
          console.log("complete");
        }
      );
  }

  function clearRow(rows) {
    fromArray(rows)
      .pipe(
        mergeMap(row => {
          return range(0, boardCol).pipe(map(i => row + i));
        }),
        tap(tileIndex => {
          console.log("clearrow: ", tileIndex);
          board[tileIndex] = 0;
          $(`.board-tile[data-index=${tileIndex}]`).removeClass("fill");
        })
      )
      .subscribe();
  }

  function clearCol(cols) {
    fromArray(cols)
      .pipe(
        mergeMap(col => {
          return range(0, boardRow).pipe(map(i => col + i * boardCol));
        }),
        tap(tileIndex => {
          console.log("clearcol: ", tileIndex);
          board[tileIndex] = 0;
          $(`.board-tile[data-index=${tileIndex}]`).removeClass("fill");
        })
      )
      .subscribe();
  }

  function clearArea(areas) {
    fromArray(areas)
      .pipe(
        mergeMap(area => {
          return new Observable(observer => {
            let startIndex = area - boardCol - 1;
            for (let r = 0; r < blockRow; r++) {
              for (let c = 0; c < blockCol; c++) {
                let i = startIndex + (r * boardCol + c);
                observer.next(i);
              }
            }
          });
        }),
        tap(tileIndex => {
          console.log("clear area: ", tileIndex);
          board[tileIndex] = 0;
          $(`.board-tile[data-index=${tileIndex}]`).removeClass("fill");
        })
      )
      .subscribe();
  }

  function checkGameOver() {
    let result = true;
    let i = 0;
    const check$ = fromArray(board)
      .pipe(
        map(value => [i++, value]),
        // filter(([index, value]) => value === 0),
        mergeMap(([index, value]) => {
          return fromArray(blocks).pipe(
            map(block => {
              const row = Math.floor(index / boardCol);
              const col = Math.floor(index % boardCol);

              if (row > boardRow - blockRow || col > boardCol - blockCol) {
                return false;
              }

              const fillables = [];

              fillables.push(...findFillableTiles(row, col, block.getShape()));
              let shape = block.getShape();

              for (let i = 0; i < 3; i++) {
                shape = util.rotate(shape);
                fillables.push(...findFillableTiles(row, col, shape));
              }

              return fillables.length !== 0;
            })
          );
        }),
        filter(value => value),
        defaultIfEmpty(false),
        first()
      )
      .subscribe(
        function(hasSpace) {
          if (hasSpace) {
            result = false;
          }
        },
        error => console.log("checkGameOver error: ", error),
        () => console.log("checkGameover: complete")
      );
    console.log("is gameover? ", result);
    return result;
  }

  function checkRowComplete(tiles) {
    const result = [];
    const processed = [];
    for (let tile of tiles) {
      let row = Math.floor(tile.index / boardCol);
      if (processed.indexOf(row) > -1) {
        continue;
      } else {
        processed.push(row);
      }

      let complete = true;
      const rowBase = row * boardCol;

      for (let i = 0; i < boardCol; i++) {
        if (board[rowBase + i] === 0) {
          complete = false;
          break;
        }
      }

      console.log("rowBase: ", rowBase, "result: ", complete);
      if (complete) {
        result.push(rowBase);
      }
    }
    return result;
  }

  function checkColComplete(tiles) {
    const result = [];
    const processed = [];

    for (let tile of tiles) {
      let col = Math.floor(tile.index % boardCol);
      if (processed.indexOf(col) > -1) {
        continue;
      } else {
        processed.push(col);
      }

      let complete = true;
      const colBase = col;

      for (let i = 0; i < boardRow; i++) {
        if (board[colBase + i * boardCol] === 0) {
          complete = false;
          break;
        }
      }

      console.log("colBase: ", colBase, "result: ", complete);
      if (complete) {
        result.push(colBase);
      }
    }
    return result;
  }

  function checkAreaComplete(tiles) {
    const result = [];
    const processed = [];

    const findBase = num => {
      return of(3, 6, 9).pipe(
        filter(bound => bound - num > 0),
        first(),
        map(bound => bound - 2)
      );
    };

    fromArray(tiles)
      .pipe(
        map(tile => {
          const index = tile.index;
          const row = Math.floor(index / boardCol);
          const col = Math.floor(index % boardCol);
          return [row, col];
        }),
        switchMap(([row, col]) => {
          return zip(findBase(row), findBase(col));
        }),
        map(([baseRow, baseCol]) => baseRow * boardCol + baseCol),
        filter(baseIndex => processed.indexOf(baseIndex) < 0)
      )
      .subscribe(baseIndex => {
        processed.push(baseIndex);

        let startIndex = baseIndex - boardCol - 1;
        let complete = true;
        for (let r = 0; r < blockRow; r++) {
          for (let c = 0; c < blockCol; c++) {
            let index = startIndex + (r * blockRow + c);
            if (board[index] === 0) {
              complete = false;
            }
          }
          startIndex += boardCol - blockCol;
        }

        console.log("areaBase: ", baseIndex, "result: ", complete);
        if (complete) {
          result.push(baseIndex);
        }
      });

    return result;
  }

  console.log(colors$);
  function fillBoard(tiles) {
    for (let tile of tiles) {
      let index = tile.index;
      board[index] = tile.color;
      let $tile = $(`.board-tile[data-index="${index}"]`);
      colors$.subscribe(colorClass => $tile.removeClass(colorClass));
      $tile.addClass("fill");
      $tile.addClass(`c${tile.color}`);
    }
  }

  function resetBlock($block) {
    $block.removeClass("current");
    $block.get(0).style.top = null;
    $block.get(0).style.left = null;
  }

  function findFillableTiles(baseRow, baseCol, shape) {
    const fillIndexes = [];
    let boardIndex = baseRow * boardRow + baseCol;
    for (let i = 0; i < shape.length; i++) {
      if (i !== 0 && i % 3 === 0) {
        boardIndex += boardCol - 3;
      }

      if (boardIndex >= board.length) {
        return [];
      }

      let blockTile = shape[i];
      let boardTile = board[boardIndex];

      if (blockTile > 0 && boardTile > 0) {
        return [];
      } else if (blockTile > 0) {
        fillIndexes.push({ index: boardIndex, color: blockTile });
      }

      boardIndex++;
    }

    return fillIndexes;
  }

  function hasBlock(blocks, blockType) {
    for (let block of blocks) {
      if (block.getType() === blockType) {
        return true;
      }
    }

    return false;
  }

  function selectRandomBlock(current = -1, ...except) {
    except = except || [];

    let selected = Math.floor(Math.random() * shapes.length);
    if (current === selected || hasBlock(except, selected)) {
      return selectRandomBlock(current, ...except);
    }

    const color = colors[Math.floor(Math.random() * colors.length)];
    return new Block(selected, shapes[selected], color);
  }

  function fillBlockTo($el, block) {
    const tiles = $el.children(".block-tile");
    const shape = block.getShape();

    for (let i = 0; i < shape.length; i++) {
      let $tile = $(tiles.get(i));
      let tileValue = shape[i];
      if (tileValue > 0) {
        colors$.subscribe(colorClass => $tile.removeClass(colorClass));
        $tile.addClass("fill");
        $tile.addClass(`c${tileValue}`);
      } else {
        $tile.removeClass("fill");
      }
    }
  }
});
