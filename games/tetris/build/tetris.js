// テトリスのゲーム状態を管理するクラス
export class TetrisGame {
    constructor() {
        // ゲームボードのサイズ
        this.ROWS = 20;
        this.COLS = 10;
        // 現在のテトリミノ
        this.currentTetrimino = null;
        this.currentRow = 0;
        this.currentCol = 0;
        // テトリミノの定義
        this.tetriminos = {
            'I': {
                type: 'I',
                color: '#00FFFF',
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ]
            },
            'O': {
                type: 'O',
                color: '#FFFF00',
                shape: [
                    [1, 1],
                    [1, 1]
                ]
            },
            'T': {
                type: 'T',
                color: '#800080',
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            },
            'S': {
                type: 'S',
                color: '#00FF00',
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ]
            },
            'Z': {
                type: 'Z',
                color: '#FF0000',
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ]
            },
            'J': {
                type: 'J',
                color: '#0000FF',
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            },
            'L': {
                type: 'L',
                color: '#FFA500',
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            }
        };
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.gameOver = false;
        this.nextTetrimino = this.getRandomTetrimino();
        this.spawnTetrimino();
    }
    // 空のゲームボードを作成
    createEmptyBoard() {
        return Array(this.ROWS).fill(0).map(() => Array(this.COLS).fill(0));
    }
    // ランダムなテトリミノを取得
    getRandomTetrimino() {
        const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        return Object.assign({}, this.tetriminos[randomType]);
    }
    // 新しいテトリミノを生成
    spawnTetrimino() {
        this.currentTetrimino = this.nextTetrimino;
        this.nextTetrimino = this.getRandomTetrimino();
        // テトリミノの初期位置
        this.currentRow = 0;
        this.currentCol = Math.floor(this.COLS / 2) - Math.floor(this.currentTetrimino.shape[0].length / 2);
        // 衝突チェック（ゲームオーバー判定）
        if (this.checkCollision()) {
            this.gameOver = true;
        }
    }
    // 衝突チェック
    checkCollision() {
        if (!this.currentTetrimino)
            return false;
        const shape = this.currentTetrimino.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 0)
                    continue;
                const newRow = this.currentRow + r;
                const newCol = this.currentCol + c;
                // 境界チェック
                if (newRow < 0 || newRow >= this.ROWS || newCol < 0 || newCol >= this.COLS) {
                    return true;
                }
                // 他のブロックとの衝突チェック
                if (this.board[newRow][newCol] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    // テトリミノを回転
    rotateTetrimino() {
        if (!this.currentTetrimino || this.gameOver)
            return false;
        const originalShape = this.currentTetrimino.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        // 新しい形状を作成（90度回転）
        const newShape = [];
        for (let r = 0; r < cols; r++) {
            newShape[r] = [];
            for (let c = 0; c < rows; c++) {
                newShape[r][c] = originalShape[rows - 1 - c][r];
            }
        }
        // 一時的に形状を変更して衝突チェック
        const originalTetrimino = Object.assign({}, this.currentTetrimino);
        this.currentTetrimino.shape = newShape;
        if (this.checkCollision()) {
            // 衝突する場合は元に戻す
            this.currentTetrimino = originalTetrimino;
            return false;
        }
        return true;
    }
    // テトリミノを左に移動
    moveLeft() {
        if (!this.currentTetrimino || this.gameOver)
            return false;
        this.currentCol--;
        if (this.checkCollision()) {
            this.currentCol++;
            return false;
        }
        return true;
    }
    // テトリミノを右に移動
    moveRight() {
        if (!this.currentTetrimino || this.gameOver)
            return false;
        this.currentCol++;
        if (this.checkCollision()) {
            this.currentCol--;
            return false;
        }
        return true;
    }
    // テトリミノを下に移動
    moveDown() {
        if (!this.currentTetrimino || this.gameOver)
            return false;
        this.currentRow++;
        if (this.checkCollision()) {
            this.currentRow--;
            this.lockTetrimino();
            return false;
        }
        return true;
    }
    // テトリミノを一気に落とす
    hardDrop() {
        if (!this.currentTetrimino || this.gameOver)
            return;
        while (this.moveDown()) {
            // 底に着くまで下に移動
        }
    }
    // テトリミノをボードに固定
    lockTetrimino() {
        if (!this.currentTetrimino)
            return;
        const shape = this.currentTetrimino.shape;
        const colorIndex = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'].indexOf(this.currentTetrimino.type) + 1;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 0)
                    continue;
                const boardRow = this.currentRow + r;
                const boardCol = this.currentCol + c;
                if (boardRow >= 0 && boardRow < this.ROWS && boardCol >= 0 && boardCol < this.COLS) {
                    this.board[boardRow][boardCol] = colorIndex;
                }
            }
        }
        this.clearLines();
        this.spawnTetrimino();
    }
    // 完成した行を消去
    clearLines() {
        let linesCleared = 0;
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== 0)) {
                // 行を消去して上から新しい行を追加
                this.board.splice(r, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                r++; // 同じ行を再チェック
            }
        }
        // スコア計算
        if (linesCleared > 0) {
            // 1行：100点、2行：300点、3行：500点、4行：800点
            const points = [0, 100, 300, 500, 800];
            this.score += points[Math.min(linesCleared, 4)];
        }
    }
    // ゲームの更新
    update() {
        if (this.gameOver)
            return;
        this.moveDown();
    }
    // ゲームボードを取得
    getBoard() {
        return this.board.map(row => [...row]);
    }
    // 現在のテトリミノの情報を取得
    getCurrentTetrimino() {
        if (!this.currentTetrimino)
            return null;
        return {
            tetrimino: Object.assign({}, this.currentTetrimino),
            row: this.currentRow,
            col: this.currentCol
        };
    }
    // 次のテトリミノを取得
    getNextTetrimino() {
        return Object.assign({}, this.nextTetrimino);
    }
    // スコアを取得
    getScore() {
        return this.score;
    }
    // ゲームオーバー状態を取得
    isGameOver() {
        return this.gameOver;
    }
    // ゲームをリセット
    reset() {
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.gameOver = false;
        this.nextTetrimino = this.getRandomTetrimino();
        this.spawnTetrimino();
    }
    // テトリミノの色を取得
    getTetriminoColor(type) {
        return this.tetriminos[type].color;
    }
    // インデックスから色を取得
    getColorFromIndex(index) {
        if (index === 0)
            return '';
        const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        return this.tetriminos[types[index - 1]].color;
    }
}
