// Constants
const SCREEN_WIDTH = 300;
const SCREEN_HEIGHT = 530;
const GRID_SIZE = 30;
const GRID_WIDTH = SCREEN_WIDTH / GRID_SIZE;
const GRID_HEIGHT = SCREEN_HEIGHT / GRID_SIZE;
const BLOCK_SIZE = 30;
const COLORS = {
    'I': 'cyan',
    'J': 'blue',
    'L': 'orange',
    'O': 'yellow',
    'S': 'green',
    'T': 'purple',
    'Z': 'red'
};
const BLACK = 'black';
const GRAY = 'gray';

// Tetrominoes
const TETROMINOES = {
    'I': [
        [[1], [1], [1], [1]]
    ],
    'J': [
        [[0, 1], [0, 1], [1, 1]]
    ],
    'L': [
        [[1, 0], [1, 0], [1, 1]]
    ],
    'O': [
        [[1, 1], [1, 1]]
    ],
    'S': [
        [[0, 1, 1], [1, 1, 0]]
    ],
    'T': [
        [[0, 1, 0], [1, 1, 1]]
    ],
    'Z': [
        [[1, 1, 0], [0, 1, 1]]
    ]
};

// Create canvas and context
const canvas = document.createElement('canvas');
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Create initial block
let currentBlock = createBlock();
let grid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));

// Game variables
let fallTime = 0;
let fallSpeed = 500; // in milliseconds
let score = 0;
let gameOver = false;

// Main game loop
function mainLoop(timestamp) {
    if (gameOver) {
        gameOverScreen();
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Handle input
    handleInput();

    // Update
    update(timestamp);

    // Draw
    draw();

    // Request next frame
    requestAnimationFrame(mainLoop);
}

// Start the game loop
requestAnimationFrame(mainLoop);

// Handle keyboard input
function handleInput() {
    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            moveLeft();
        } else if (event.key === 'ArrowRight') {
            moveRight();
        } else if (event.key === 'ArrowDown') {
            moveDown();
        }
    });
}

// Update game state
function update(timestamp) {
    // Move block down
    fallTime += timestamp - lastTime;
    if (fallTime > fallSpeed) {
        moveDown();
        fallTime = 0;
    }
}

// Draw everything
function draw() {
    // Draw grid
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            ctx.fillStyle = grid[j][i] ? COLORS[grid[j][i]] : GRAY;
            ctx.fillRect(i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = BLACK;
            ctx.strokeRect(i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Draw current block
    drawBlock(currentBlock);
}

// Create a new block
function createBlock() {
    const blockTypes = Object.keys(TETROMINOES);
    const randomType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    const rotations = TETROMINOES[randomType];
    const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
    const x = Math.floor(GRID_WIDTH / 2) - Math.floor(randomRotation[0].length / 2);
    return {
        type: randomType,
        rotation: randomRotation,
        x: x,
        y: 0
    };
}

// Draw a block
function drawBlock(block) {
    const { type, rotation, x, y } = block;
    for (let i = 0; i < rotation.length; i++) {
        for (let j = 0; j < rotation[i].length; j++) {
            if (rotation[i][j]) {
                ctx.fillStyle = COLORS[type];
                ctx.fillRect((x + j) * BLOCK_SIZE, (y + i) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = BLACK;
                ctx.strokeRect((x + j) * BLOCK_SIZE, (y + i) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// Move the block left
function moveLeft() {
    currentBlock.x--;
    if (isCollision()) {
        currentBlock.x++;
    }
}

// Move the block right
function moveRight() {
    currentBlock.x++;
    if (isCollision()) {
        currentBlock.x--;
    }
}

// Move the block down
function moveDown() {
    currentBlock.y++;
    if (isCollision()) {
        currentBlock.y--;
        mergeBlock();
        currentBlock = createBlock();
        removeFullRows();
    }
}

// Check for collision
function isCollision() {
    const { type, rotation, x, y } = currentBlock;
    for (let i = 0; i < rotation.length; i++) {
        for (let j = 0; j < rotation[i].length; j++) {
            if (rotation[i][j]) {
                const blockX = x + j;
                const blockY = y + i;
                if (
                    blockX < 0 ||
                    blockX >= GRID_WIDTH ||
                    blockY >= GRID_HEIGHT ||
                    (blockY >= 0 && grid[blockY][blockX])
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Merge current block into grid
function mergeBlock() {
    const { type, rotation, x, y } = currentBlock;
    for (let i = 0; i < rotation.length; i++) {
        for (let j = 0; j < rotation[i].length; j++) {
            if (rotation[i][j]) {
                const blockX = x + j;
                const blockY = y + i;
                if (blockY >= 0) {
                    grid[blockY][blockX] = type;
                }
            }
        }
    }
}

// Remove full rows from grid
function removeFullRows() {
    for (let i = GRID_HEIGHT - 1; i >= 0; i--) {
        if (grid[i].every(cell => cell !== 0)) {
            grid.splice(i, 1);
            grid.unshift(Array(GRID_WIDTH).fill(0));
            score++;
        }
    }
}

// Display game over screen
function gameOverScreen() {
    ctx.fillStyle = WHITE;
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    ctx.fillText(`Score: ${score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 40);
}
