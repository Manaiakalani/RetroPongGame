// Pong Game JavaScript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let playerScore = 0;
let computerScore = 0;
const winningScore = 5;

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 3,
    speed: 5
};

const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    speed: 8
};

const computerPaddle = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    speed: 6
};

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Sound effects (using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Game functions
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.velocityY = (Math.random() - 0.5) * 10;
}

function updatePlayerPaddle() {
    if ((keys['w'] || keys['arrowup']) && playerPaddle.y > 0) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if ((keys['s'] || keys['arrowdown']) && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += playerPaddle.speed;
    }
}

function updateComputerPaddle() {
    const paddleCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    
    if (paddleCenter < ballCenter - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (paddleCenter > ballCenter + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }
    
    // Keep computer paddle within bounds
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y > canvas.height - computerPaddle.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

function updateBall() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Top and bottom wall collision
    if (ball.y <= ball.radius || ball.y >= canvas.height - ball.radius) {
        ball.velocityY = -ball.velocityY;
        playSound(800, 0.1);
    }
    
    // Player paddle collision
    if (ball.x <= playerPaddle.x + playerPaddle.width && 
        ball.y >= playerPaddle.y && 
        ball.y <= playerPaddle.y + playerPaddle.height &&
        ball.velocityX < 0) {
        
        ball.velocityX = -ball.velocityX;
        const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
        ball.velocityY = hitPos * 5;
        playSound(600, 0.1);
    }
    
    // Computer paddle collision
    if (ball.x >= computerPaddle.x - ball.radius && 
        ball.y >= computerPaddle.y && 
        ball.y <= computerPaddle.y + computerPaddle.height &&
        ball.velocityX > 0) {
        
        ball.velocityX = -ball.velocityX;
        const hitPos = (ball.y - (computerPaddle.y + computerPaddle.height / 2)) / (computerPaddle.height / 2);
        ball.velocityY = hitPos * 5;
        playSound(600, 0.1);
    }
    
    // Ball goes off screen (scoring)
    if (ball.x < 0) {
        computerScore++;
        playSound(300, 0.3);
        updateScore();
        resetBall();
    } else if (ball.x > canvas.width) {
        playerScore++;
        playSound(1000, 0.3);
        updateScore();
        resetBall();
    }
    
    // Check for game over
    if (playerScore >= winningScore || computerScore >= winningScore) {
        gameOver();
    }
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function gameOver() {
    gameRunning = false;
    const gameOverDiv = document.getElementById('gameOver');
    const gameOverText = document.getElementById('gameOverText');
    
    if (playerScore >= winningScore) {
        gameOverText.textContent = 'You Win!';
        playSound(1200, 0.5);
    } else {
        gameOverText.textContent = 'Computer Wins!';
        playSound(200, 0.5);
    }
    
    gameOverDiv.style.display = 'block';
}

function restartGame() {
    gameRunning = true;
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
    document.getElementById('gameOver').style.display = 'none';
    gameLoop();
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawDashedLine() {
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    drawDashedLine();
    
    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00ff00');
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#00ff00');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#00ff00');
}

function update() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
}

function gameLoop() {
    if (gameRunning) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Initialize game
updateScore();
gameLoop();

// Handle audio context for mobile devices
document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
});
