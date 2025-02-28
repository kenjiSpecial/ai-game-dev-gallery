// テトリスゲームのインポート
import { TetrisGame } from './tetris.js';
// ゲームの設定
const CELL_SIZE = 30; // セルのサイズ（ピクセル）
const BOARD_ROWS = 20; // ボードの行数
const BOARD_COLS = 10; // ボードの列数
const BOARD_WIDTH = CELL_SIZE * BOARD_COLS; // ボードの幅
const BOARD_HEIGHT = CELL_SIZE * BOARD_ROWS; // ボードの高さ
const SIDEBAR_WIDTH = 200; // サイドバーの幅
const CANVAS_WIDTH = BOARD_WIDTH + SIDEBAR_WIDTH; // キャンバスの幅
const CANVAS_HEIGHT = BOARD_HEIGHT; // キャンバスの高さ
// ゲームインスタンス
let tetrisGame;
// ゲームの更新間隔（ミリ秒）
let dropInterval = 1000;
let lastDropTime = 0;
// キー入力の遅延（連続入力防止）
let lastKeyPressTime = 0;
const KEY_DELAY = 100;
// p5.jsのスケッチ
new p5((p) => {
    // 初期化
    p.setup = () => {
        p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        tetrisGame = new TetrisGame();
        p.frameRate(60);
    };
    // 毎フレーム実行
    p.draw = () => {
        p.background(240);
        // ゲームオーバー判定
        if (tetrisGame.isGameOver()) {
            drawGameOver();
            return;
        }
        // 一定時間ごとにテトリミノを落下
        const currentTime = p.millis();
        if (currentTime - lastDropTime > dropInterval) {
            tetrisGame.update();
            lastDropTime = currentTime;
        }
        // ゲームボードの描画
        drawBoard();
        // 現在のテトリミノの描画
        drawCurrentTetrimino();
        // サイドバーの描画
        drawSidebar();
    };
    // キー入力の処理
    p.keyPressed = () => {
        // ゲームオーバー時はリセットのみ受け付ける
        if (tetrisGame.isGameOver()) {
            if (p.keyCode === p.ENTER) {
                tetrisGame.reset();
            }
            return;
        }
        // キー入力の遅延チェック
        const currentTime = p.millis();
        if (currentTime - lastKeyPressTime < KEY_DELAY) {
            return;
        }
        lastKeyPressTime = currentTime;
        // キー入力に応じた処理
        switch (p.keyCode) {
            case p.LEFT_ARROW:
                tetrisGame.moveLeft();
                break;
            case p.RIGHT_ARROW:
                tetrisGame.moveRight();
                break;
            case p.DOWN_ARROW:
                tetrisGame.moveDown();
                break;
            case p.UP_ARROW:
                tetrisGame.rotateTetrimino();
                break;
            case 32: // スペースキー
                tetrisGame.hardDrop();
                break;
        }
    };
    // ゲームボードの描画
    function drawBoard() {
        p.push();
        // ボードの背景
        p.fill(200);
        p.rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
        // ボードのグリッド線
        p.stroke(150);
        p.strokeWeight(0.5);
        for (let i = 0; i <= BOARD_ROWS; i++) {
            p.line(0, i * CELL_SIZE, BOARD_WIDTH, i * CELL_SIZE);
        }
        for (let i = 0; i <= BOARD_COLS; i++) {
            p.line(i * CELL_SIZE, 0, i * CELL_SIZE, BOARD_HEIGHT);
        }
        // ボード上のブロックの描画
        const board = tetrisGame.getBoard();
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                const cellValue = board[row][col];
                if (cellValue !== 0) {
                    drawCell(col, row, tetrisGame.getColorFromIndex(cellValue));
                }
            }
        }
        p.pop();
    }
    // 現在のテトリミノの描画
    function drawCurrentTetrimino() {
        const current = tetrisGame.getCurrentTetrimino();
        if (!current)
            return;
        const { tetrimino, row, col } = current;
        const shape = tetrimino.shape;
        p.push();
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 0)
                    continue;
                const boardRow = row + r;
                const boardCol = col + c;
                // 画面内のみ描画
                if (boardRow >= 0) {
                    drawCell(boardCol, boardRow, tetrimino.color);
                }
            }
        }
        p.pop();
    }
    // サイドバーの描画
    function drawSidebar() {
        p.push();
        p.translate(BOARD_WIDTH, 0);
        // サイドバーの背景
        p.fill(220);
        p.rect(0, 0, SIDEBAR_WIDTH, CANVAS_HEIGHT);
        // スコアの表示
        p.fill(0);
        p.textSize(20);
        p.textAlign(p.CENTER);
        p.text("SCORE", SIDEBAR_WIDTH / 2, 40);
        p.textSize(24);
        p.text(tetrisGame.getScore(), SIDEBAR_WIDTH / 2, 70);
        // 次のテトリミノの表示
        p.textSize(20);
        p.text("NEXT", SIDEBAR_WIDTH / 2, 120);
        // 次のテトリミノの描画
        const nextTetrimino = tetrisGame.getNextTetrimino();
        const shape = nextTetrimino.shape;
        const blockSize = CELL_SIZE * 0.8;
        p.push();
        p.translate(SIDEBAR_WIDTH / 2 - (shape[0].length * blockSize) / 2, 140);
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 0)
                    continue;
                p.fill(nextTetrimino.color);
                p.stroke(0);
                p.strokeWeight(1);
                p.rect(c * blockSize, r * blockSize, blockSize, blockSize);
            }
        }
        p.pop();
        // 操作方法の表示
        p.textSize(16);
        p.textAlign(p.LEFT);
        p.text("操作方法:", 10, 250);
        p.textSize(14);
        p.text("← → : 移動", 10, 280);
        p.text("↑ : 回転", 10, 300);
        p.text("↓ : 下に移動", 10, 320);
        p.text("スペース : 落下", 10, 340);
        if (tetrisGame.isGameOver()) {
            p.textSize(16);
            p.text("ENTERキーで", 10, 380);
            p.text("リスタート", 10, 400);
        }
        p.pop();
    }
    // ゲームオーバー画面の描画
    function drawGameOver() {
        drawBoard();
        drawSidebar();
        p.push();
        p.fill(0, 0, 0, 150);
        p.rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
        p.fill(255);
        p.textSize(40);
        p.textAlign(p.CENTER, p.CENTER);
        p.text("GAME OVER", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 20);
        p.textSize(20);
        p.text("ENTERキーでリスタート", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 30);
        p.pop();
    }
    // セルの描画
    function drawCell(col, row, color) {
        p.push();
        p.fill(color);
        p.stroke(0);
        p.strokeWeight(1);
        p.rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        // ハイライト（3D効果）
        p.noStroke();
        p.fill(255, 255, 255, 100);
        p.beginShape();
        p.vertex(col * CELL_SIZE, row * CELL_SIZE);
        p.vertex((col + 1) * CELL_SIZE, row * CELL_SIZE);
        p.vertex((col + 0.8) * CELL_SIZE, (row + 0.2) * CELL_SIZE);
        p.vertex((col + 0.2) * CELL_SIZE, (row + 0.2) * CELL_SIZE);
        p.endShape(p.CLOSE);
        p.fill(0, 0, 0, 50);
        p.beginShape();
        p.vertex((col + 1) * CELL_SIZE, row * CELL_SIZE);
        p.vertex((col + 1) * CELL_SIZE, (row + 1) * CELL_SIZE);
        p.vertex((col + 0.8) * CELL_SIZE, (row + 0.8) * CELL_SIZE);
        p.vertex((col + 0.8) * CELL_SIZE, (row + 0.2) * CELL_SIZE);
        p.endShape(p.CLOSE);
        p.fill(0, 0, 0, 100);
        p.beginShape();
        p.vertex((col + 1) * CELL_SIZE, (row + 1) * CELL_SIZE);
        p.vertex(col * CELL_SIZE, (row + 1) * CELL_SIZE);
        p.vertex((col + 0.2) * CELL_SIZE, (row + 0.8) * CELL_SIZE);
        p.vertex((col + 0.8) * CELL_SIZE, (row + 0.8) * CELL_SIZE);
        p.endShape(p.CLOSE);
        p.fill(0, 0, 0, 50);
        p.beginShape();
        p.vertex(col * CELL_SIZE, (row + 1) * CELL_SIZE);
        p.vertex(col * CELL_SIZE, row * CELL_SIZE);
        p.vertex((col + 0.2) * CELL_SIZE, (row + 0.2) * CELL_SIZE);
        p.vertex((col + 0.2) * CELL_SIZE, (row + 0.8) * CELL_SIZE);
        p.endShape(p.CLOSE);
        p.pop();
    }
});
