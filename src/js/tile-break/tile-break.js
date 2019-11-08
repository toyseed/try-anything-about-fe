"use strict";

import $ from "jquery";
import { fromEvent, Observable, of, range, zip, merge } from 'rxjs';
import {
  defaultIfEmpty,
  filter,
  first,
  last,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  tap
} from "rxjs/operators";
import { all as ALL_BLOCKS } from './blocks';
import { fromArray } from 'rxjs/internal/observable/fromArray';

/*
  1. block 에 색상 추가
  2. ? board 에 block 이 over 됐을 때 fill 될 tile 에 음영추가
    -> block 에 shadow 줬음.
  3. ? block 이 board 에 입력되는 방식 변경
    - block 에서 fill 영역만 board 에 포함되어도 board 가 fill 될 수 있게
  4. / block design
  5. / support touch event
  6. / 종료 조건 - 들어갈 수 있는 공간이 있는지 찾기
  7. block 회전 기능 추가
 */
$(window).ready(() => {
  const boardRow = 9;
  const boardCol = 9;
  const blockRow = 3;
  const blockCol = 3;

  const blocks = ALL_BLOCKS;
  console.log(blocks);
  const blockTypesTotal = blocks.length;
  const showingBlockEls = $(".block");
  let showingBlockTypes = [];
  let board;
  let score = (() => {
    const $score = $(".score-current");
    let score = 0;

    function update(num) {
      score += num;
      $score.text(score);
    }

    function reset() {
      score = 0;
      $score.text(score);
    }

    function get() {
      return score;
    }

    return {
      update,
      reset,
      get
    };
  })();

  let gameoverLayer = (score => {
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

  initGame();
  // replay 2 번 누르면 stackoverflow 일어남.
  fromEvent($('.replay-button'), 'click').subscribe(() => initGame());

  function initGame() {
    board = Array.apply(null, Array(boardRow * boardCol)).map(() => 0);
    score.reset();
    initBoard();
    initBlocks();
    initEvents();
  }

  function initBoard() {
    $('.board-tile.fill').each(function() {
      $(this).removeClass('fill');
    });
  }

  function initBlocks() {
    showingBlockTypes = [];
    showingBlockEls.each(function() {
      const block = selectRandomBlock(-1, ...showingBlockTypes);
      showingBlockTypes.push(block.blockType);

      const $el = $(this);
      fillBlockTo($el, block.blockType, block.block);
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
        event.offsetX = $target.width() / 3 * 2;
        event.offsetY = $target.height() / 3 * 2;
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

    const $blocks = $(".blocks");
    let blockY;
    let blockX;
    let $current;
    let pointAdjustment;

    // mousemove event 가 없으면 오류 발생.
    // https://codepen.io/joshblack/pen/zGZZjX
    //  no selectMany;
    //  error 에서 initEvents 를 다시 호출하도록 변경.
    const game$ = start$
      .pipe(
        tap(event => {
          event.preventDefault();
          $current = $(event.target);
          $current.addClass("current");

          let blockOffset = $current.offset();
          blockY = blockOffset.top - window.scrollY;
          blockX = blockOffset.left - window.scrollX;

          pointAdjustment = $current.width() / (blockCol * 2);
        }),
        mergeMap(startEvent => {
          return move$.pipe(
            takeUntil(end$),
            tap(moveEvent => {
              $current.css({
                top: moveEvent.clientY - blockY - startEvent.offsetY + 1,
                left: moveEvent.clientX - blockX - startEvent.offsetX + 1
              });
            }),
            last(),
            map(moveEvent => {
              return {
                blockType: $current.data("blockType"),
                x: moveEvent.clientX - startEvent.offsetX + pointAdjustment,
                y: moveEvent.clientY - startEvent.offsetY + pointAdjustment
              };
            })
          );
        })
      )
      .subscribe(
        ({ x, y, blockType }) => {
          console.log("x: ", x, "y: ", y);
          resetBlock($current);

          const $checkBase = $(document.elementFromPoint(x, y));
          if (!$checkBase.hasClass("js_board-tile")) {
            return;
          }

          const baseRow = $checkBase.data("row");
          const baseCol = $checkBase.data("col");
          const fillIndex = detectCollision(baseRow, baseCol, blockType);
          if (fillIndex.length === 0) {
            return;
          }

          fillBoard(fillIndex);
          score.update(fillIndex.length);

          // change current block
          const selected = selectRandomBlock(blockType, ...showingBlockTypes);
          fillBlockTo($current, selected.blockType, selected.block);

          const blockIndex = $current.data("block-index");
          showingBlockTypes[blockIndex] = selected.blockType;

          const rowComplete = checkRowComplete(fillIndex);
          const colComplete = checkColComplete(fillIndex);
          const areaComplete = checkAreaComplete(fillIndex);

          setTimeout(function() {
            // remove
            clearRow(rowComplete);
            clearCol(colComplete);
            clearArea(areaComplete);

            // 게임 종료 조건 확인
            if (checkGameOver()) {
              game$.unsubscribe();
              gameoverLayer.show();
            }
          }, 100);
        },
        error => {
          console.log(error);
          resetBlock($current);
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
          return fromArray(showingBlockTypes).pipe(
            map(blockType => {
              const row = Math.floor(index / boardCol);
              const col = Math.floor(index % boardCol);

              if (row > boardRow - blockRow || col > boardCol - blockCol) {
                return false;
              }

              const fillables = detectCollision(row, col, blockType);
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

  function checkRowComplete(fillIndex) {
    const result = [];
    const processed = [];
    for (let index of fillIndex) {
      let row = Math.floor(index / boardCol);
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

  function checkColComplete(fillIndex) {
    const result = [];
    const processed = [];

    for (let index of fillIndex) {
      let col = Math.floor(index % boardCol);
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

  function checkAreaComplete(fillIndex) {
    const result = [];
    const processed = [];

    const findBase = num => {
      return of(3, 6, 9).pipe(
        filter(bound => bound - num > 0),
        first(),
        map(bound => bound - 2)
      );
    };

    fromArray(fillIndex)
      .pipe(
        map(index => {
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

  function fillBoard(fillIndex) {
    for (let index of fillIndex) {
      board[index] = 1;
      $(`.board-tile[data-index="${index}"]`).addClass("fill");
    }
  }

  function resetBlock($block) {
    $block.removeClass("current");
    $block.get(0).style.top = null;
    $block.get(0).style.left = null;
  }

  // TODO: block 이 board 안에 완전히 들어오지 않더라도 tile 이 board 에 반영될 수 있는 스펙을 고려해보자.
  function detectCollision(baseRow, baseCol, blockType) {
    const block = blocks[blockType];
    const fillIndexes = [];
    let boardIndex = baseRow * boardRow + baseCol;
    for (let i = 0; i < block.length; i++) {
      if (i !== 0 && i % 3 === 0) {
        boardIndex += boardCol - 3;
      }

      if (boardIndex >= board.length) {
        return [];
      }

      let blockTile = block[i];
      let boardTile = board[boardIndex];

      if (blockTile === 1 && boardTile === 1) {
        return [];
      } else if (blockTile === 1) {
        fillIndexes.push(boardIndex);
      }

      boardIndex++;
    }

    return fillIndexes;
  }

  function selectRandomBlock(current = -1, ...except) {
    except = except || [];

    let selected = Math.floor(Math.random() * blockTypesTotal);
    if (current === selected || except.indexOf(selected) > -1) {
      return selectRandomBlock(current, ...except);
    }

    return {
      blockType: selected,
      block: blocks[selected]
    };
  }

  function fillBlockTo($el, blockType, block) {
    const tiles = $el.children(".block-tile");
    for (let i = 0; i < block.length; i++) {
      let $tile = $(tiles.get(i));
      let tileValue = block[i];

      if (tileValue === 1) {
        $tile.addClass("fill");
      } else {
        $tile.removeClass("fill");
      }
    }
    $el.data("blockType", blockType);
  }
});
