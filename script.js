const backgroundCanvas = document.getElementById('backgroundCanvas');
const bgCtx = backgroundCanvas.getContext('2d');
backgroundCanvas.width = window.innerWidth;
backgroundCanvas.height = window.innerHeight;

const canvas = document.getElementById('bouncingBallsCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
class Star {
    constructor(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
    }

    draw() {
        bgCtx.save();
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        bgCtx.fillStyle = 'white';
        bgCtx.shadowBlur = 5;
        bgCtx.shadowColor = 'white';
        bgCtx.fill();
        bgCtx.closePath();
        bgCtx.restore();
    }

    update() {
        this.y += this.speed;
        if (this.y > backgroundCanvas.height) {
            this.y = 0 - this.radius;
            this.x = Math.random() * backgroundCanvas.width;
        }
        this.draw();
    }
}


const stars = [];
for (let i = 0; i < 100; i++) {
    const radius = Math.random() * 1.5;
    const x = Math.random() * backgroundCanvas.width;
    const y = Math.random() * backgroundCanvas.height;
    const speed = Math.random() * 0.5 + 0.2;
    stars.push(new Star(x, y, radius, speed));
}


const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

class Ball {
    constructor(x, y, dx, dy, radius, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.color = color;
        this.glowIntensity = 1;
    }

    draw() {
        ctx.save();
        const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.1, this.x, this.y, this.radius);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.2, this.color);
        gradient.addColorStop(0.4, 'black');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 60 * this.glowIntensity; // Adjust shadow blur for more glow
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    update(balls) {
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        
        const attractionStrength = 0.05;
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        this.dx += dx * attractionStrength;
        this.dy += dy * attractionStrength;

        this.x += this.dx;
        this.y += this.dy;

        
        this.glowIntensity = 1.5 + Math.sin(Date.now() * 0.005) * 0.5;

        for (let i = 0; i < balls.length; i++) {
            if (this === balls[i]) continue;
            if (distance(this.x, this.y, balls[i].x, balls[i].y) - this.radius * 2 < 0) {
                resolveCollision(this, balls[i]);
                this.color = randomColor();
                balls[i].color = randomColor();
                
            }
        }

        this.draw();
    }
}


function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor() {
    const r = randomIntFromRange(0, 255);
    const g = randomIntFromRange(0, 255);
    const b = randomIntFromRange(0, 255);
    return `rgb(${r}, ${g}, ${b})`;
}


function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}


function resolveCollision(ball1, ball2) {
    const xVelocityDiff = ball1.dx - ball2.dx;
    const yVelocityDiff = ball1.dy - ball2.dy;
    const xDist = ball2.x - ball1.x;
    const yDist = ball2.y - ball1.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);
        const m1 = ball1.radius;
        const m2 = ball2.radius;

        const u1 = rotate(ball1.dx, ball1.dy, angle);
        const u2 = rotate(ball2.dx, ball2.dy, angle);

        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2), y: u2.y };

        const vFinal1 = rotate(v1.x, v1.y, -angle);
        const vFinal2 = rotate(v2.x, v2.y, -angle);

        ball1.dx = vFinal1.x;
        ball1.dy = vFinal1.y;
        ball2.dx = vFinal2.x;
        ball2.dy = vFinal2.y;
    }
}


function rotate(dx, dy, angle) {
    return {
        x: dx * Math.cos(angle) - dy * Math.sin(angle),
        y: dx * Math.sin(angle) + dy * Math.cos(angle)
    };
}


const balls = [];
for (let i = 0; i < 50; i++) {
    const radius = randomIntFromRange(10, 30);
    let x = randomIntFromRange(radius, canvas.width - radius);
    let y = randomIntFromRange(radius, canvas.height - radius);
    const dx = randomIntFromRange(-1, 1);
    const dy = randomIntFromRange(-1, 1);
    const color = randomColor();

    if (i !== 0) {
        for (let j = 0; j < balls.length; j++) {
            if (distance(x, y, balls[j].x, balls[j].y) - radius * 2 < 0) {
                x = randomIntFromRange(radius, canvas.width - radius);
                y = randomIntFromRange(radius, canvas.height - radius);
                j = -1;
            }
        }
    }

    balls.push(new Ball(x, y, dx, dy, radius, color));
}


function animate() {
    bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    stars.forEach(star => {
        star.update();
    });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trail effect with slight transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => {
        ball.update(balls);
    });

    requestAnimationFrame(animate);
}


animate();
