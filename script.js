const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const colors = ['red', 'blue', 'green', 'yellow', 'pink', 'purple'];
const types = ['circle', 'square', 'rectangle', 'triangle'];

const sounds = {
    'red': new Audio('red.mp3'),
    'blue': new Audio('blue.mp3'),
    'green': new Audio('green.mp3'),
    'yellow': new Audio('yellow.mp3'),
    'pink': new Audio('pink.mp3'),
    'purple': new Audio('purple.mp3'),
    'circle': new Audio('circle.mp3'),
    'square': new Audio('square.mp3'),
    'rectangle': new Audio('rectangle.mp3'),
    'triangle': new Audio('triangle.mp3')
};

class Shape {
    constructor(x, y, color, type, size, isHole = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.size = size;
        this.isHole = isHole;
        this.isDragged = false;
    }

    draw() {
        ctx.beginPath();
        switch (this.type) {
            case 'circle':
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                break;
            case 'square':
                ctx.rect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                break;
            case 'rectangle':
                ctx.rect(this.x - this.size, this.y - this.size / 2, this.size * 2, this.size);
                break;
            case 'triangle':
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x - this.size, this.y + this.size);
                ctx.lineTo(this.x + this.size, this.y + this.size);
                ctx.closePath();
                break;
        }
        this.isHole ? ctx.strokeStyle = this.color : ctx.fillStyle = this.color;
        this.isHole ? ctx.stroke() : ctx.fill();
    }

    update(mousePos) {
        if (this.isDragged) {
            this.x = mousePos.x;
            this.y = mousePos.y;
        }
        this.draw();
    }

    playShapeSound() {
        let colorSound = sounds[this.color];
        let shapeSound = sounds[this.type];

        colorSound.currentTime = 0;
        shapeSound.currentTime = 0;

        colorSound.addEventListener('timeupdate', function() {
            if (this.currentTime > this.duration * 0.9) {
                shapeSound.play();
                this.removeEventListener('timeupdate', arguments.callee);
            }
        });

        colorSound.play();
    }
}

let shapes = [];
let holes = [];
let mousePos = { x: 0, y: 0 };

function createShapesAndHoles() {
    let size = 50;
    let color = colors[Math.floor(Math.random() * colors.length)];
    let type = types[Math.floor(Math.random() * types.length)];
    let x = size + Math.random() * (canvas.width - 2 * size);
    let y = size + Math.random() * (canvas.height - 2 * size);

    shapes.push(new Shape(x, y, color, type, size));
    holes.push(new Shape(size + Math.random() * (canvas.width - 2 * size), size + Math.random() * (canvas.height - 2 * size), color, type, size, true));
}

function startDrag(e) {
    let clientX = e.clientX || e.touches[0].clientX;
    let clientY = e.clientY || e.touches[0].clientY;

    shapes.forEach((shape) => {
        let dx = clientX - shape.x;
        let dy = clientY - shape.y;
        if (Math.sqrt(dx * dx + dy * dy) < shape.size) {
            shape.isDragged = true;

            // Play sound
            shape.playShapeSound();
        }
    });
}

function endDrag() {
    shapes.forEach((shape, index) => {
        if (shape.isDragged) {
            let hole = holes[index];
            let dx = shape.x - hole.x;
            let dy = shape.y - hole.y;
            if (Math.sqrt(dx * dx + dy * dy) < shape.size) {
                shapes.splice(index, 1);
                holes.splice(index, 1);
                createShapesAndHoles();
            }
        }
        shape.isDragged = false;
    });
}

function updateMousePos(e) {
    mousePos = { x: e.clientX, y: e.clientY };
}

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mousemove', updateMousePos);
canvas.addEventListener('touchstart', startDrag, { passive: false });
canvas.addEventListener('touchend', endDrag);
canvas.addEventListener('touchmove', updateMousePos, { passive: false });

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach((shape, index) => {
        shape.update(mousePos);
        holes[index].draw();
    });
    requestAnimationFrame(loop);
}

createShapesAndHoles();
loop();