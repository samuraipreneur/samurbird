const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

// Load images
const birdImages = {
    up: new Image(),
    down: new Image(),
    mid: new Image()
};

const bgImages = {
    day: new Image(),
    night: new Image()
};

const baseImg = new Image();
const pipeGreenImg = new Image();
const messageImg = new Image();
const gameOverImg = new Image();

const numberImages = [];

for (let i = 0; i < 10; i++) {
    const img = new Image();
    img.src = `images/${i}.png`;
    numberImages.push(img);
}

// birdImages.up.src = 'images/redbird-upflap.png';
// birdImages.down.src = 'images/redbird-downflap.png';
// birdImages.mid.src = 'images/redbird-midflap.png';

birdImages.up.src = 'images/samur_40x40.png';
birdImages.down.src = 'images/samur_40x40.png';
birdImages.mid.src = 'images/samur_40x40.png';

bgImages.day.src = 'images/background-day.png';
bgImages.night.src = 'images/background-night.png';

baseImg.src = 'images/base.png';
pipeGreenImg.src = 'images/pipe-green.png';
messageImg.src = 'images/message.png';
gameOverImg.src = 'images/gameover.png';

// Check if base image is loading
baseImg.onload = () => {
    console.log("Base image loaded successfully.");
};
baseImg.onerror = () => {
    console.error("Failed to load base image.");
};

const bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 24,
    gravity: 0.15, // Adjusted gravity
    lift: -5,    // Adjusted lift
    velocity: 0,
    flapState: 'mid', // 'up', 'mid', 'down'
    draw() {
        ctx.drawImage(birdImages[this.flapState], this.x, this.y);
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.velocity < 0) {
            this.flapState = 'up';
        } else if (this.velocity > 0) {
            this.flapState = 'down';
        } else {
            this.flapState = 'mid';
        }

        if (this.y + this.height > canvas.height - baseImg.height) {
            this.y = canvas.height - baseImg.height - this.height;
            this.velocity = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        this.velocity = this.lift;
    }
};

const pipes = [];
const pipeWidth = 52;
const pipeGap = 160; // Increased gap between pipes
let pipeTimer = 0;

// Variables for scrolling background and base
const bgWidth = canvas.width;
let bgX1 = 0;
let bgX2 = bgWidth;

const baseY = canvas.height - baseImg.height;
let baseX1 = 0;
let baseX2 = bgWidth;

function drawBackground() {
    ctx.drawImage(bgImages.day, bgX1, 0, bgWidth, canvas.height);
    ctx.drawImage(bgImages.day, bgX2, 0, bgWidth, canvas.height);

    bgX1 -= 1;
    bgX2 -= 1;

    if (bgX1 <= -bgWidth) {
        bgX1 = bgWidth;
    }
    if (bgX2 <= -bgWidth) {
        bgX2 = bgWidth;
    }
}

function drawBase() {
    // Adjust the baseY to canvas.height - baseImg.height
    const baseY = canvas.height - baseImg.height; // Ensure the base is drawn within canvas height
    console.log(`Drawing base at: baseX1=${baseX1}, baseX2=${baseX2}, baseY=${baseY}`); // Debugging positions

    ctx.drawImage(baseImg, baseX1, baseY, bgWidth, baseImg.height);
    ctx.drawImage(baseImg, baseX2, baseY, bgWidth, baseImg.height);

    baseX1 -= 2;
    baseX2 -= 2;

    if (baseX1 <= -bgWidth) {
        baseX1 = bgWidth;
    }
    if (baseX2 <= -bgWidth) {
        baseX2 = bgWidth;
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw top pipe rotated 180 degrees
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, pipe.top);
        ctx.rotate(Math.PI);
        ctx.drawImage(pipeGreenImg, -pipeWidth / 2, 0);
        ctx.restore();
        
        // Draw bottom pipe
        ctx.drawImage(pipeGreenImg, pipe.x, pipe.top + pipeGap);
        
        pipe.x -= 2;

        // Check if bird passed the pipe and update score
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
        }
    });

    if (pipeTimer++ > 100) {
        const pipeTop = Math.random() * (canvas.height - pipeGap - baseImg.height);
        pipes.push({ x: canvas.width, top: pipeTop, passed: false });
        pipeTimer = 0;
    }

    if (pipes.length && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
    }
}

function checkCollision() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > pipe.top + pipeGap)
        ) {
            return true;
        }
    }
    return false;
}

function drawScore(score) {
    const scoreStr = score.toString();
    const numberWidth = numberImages[0].width;
    const totalWidth = numberWidth * scoreStr.length;
    let x = canvas.width - totalWidth - 20;
    for (let i = 0; i < scoreStr.length; i++) {
        const num = parseInt(scoreStr[i]);
        ctx.drawImage(numberImages[num], x, 20);
        x += numberWidth;
    }
}

let gameStarted = false;
let gameOver = false;
let score = 0;

function gameLoop() {
    drawBackground();

    if (!gameStarted) {
        drawBase(); // Draw base before message
        ctx.drawImage(messageImg, canvas.width / 2 - messageImg.width / 2, canvas.height / 2 - messageImg.height / 2);
        requestAnimationFrame(gameLoop);
        return;
    }

    bird.update();
    drawPipes();
    drawBase(); // Draw base after pipes
    bird.draw();
    drawScore(score);

    if (checkCollision() || bird.y + bird.height >= canvas.height - baseImg.height) {
        gameOver = true;
        ctx.drawImage(gameOverImg, canvas.width / 2 - gameOverImg.width / 2, canvas.height / 2 - gameOverImg.height / 2);
        return;
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        score = 0;
    } else if (!gameOver) {
        bird.flap();
    } else {
        document.location.reload();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        if (!gameStarted) {
            gameStarted = true;
            score = 0;
        } else if (!gameOver) {
            bird.flap();
        } else {
            document.location.reload();
        }
    }
});

gameLoop();
