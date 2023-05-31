const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'black';
const ctx = canvas.getContext('2d');

const colors = ['red', 'blue', 'green', 'yellow', 'pink', 'purple'];

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
    constructor(x, y, color, type, isHole = false) {
        this.x = x;
        this.y = y; 
        this.color = color;
        this.type = type;
        this.isHole = isHole;
        this.isDragged = false;
        this.size = 100;
    }

    draw() {
        ctx.beginPath();
        switch (this.type) {
            case 'circle':
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2, false);
                break;
            case 'square':
            case 'rectangle':
                ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                break;
            case 'triangle':
                ctx.moveTo(this.x, this.y - this.size / 2);
                ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
                ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
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
}

let shapes = [];
let holes = [];
let mousePos = { x: 0, y: 0 };
let types = ['circle', 'square', 'rectangle', 'triangle'];

function createShapesAndHoles() {
    let objectCount = Math.floor(Math.random() * 3) + 1;
    for(let i=0; i<objectCount; i++) {
        let color = colors[Math.floor(Math.random() * colors.length)];
        let type = types[Math.floor(Math.random() * types.length)];
        let x, y;
        let overlap;
        do {
            overlap = false;
            x = Math.random() * (canvas.width - 100) + 50;
            y = Math.random() * (canvas.height - 100) + 50;

            shapes.forEach((shape) => {
                let dx = x - shape.x;
                let dy = y - shape.y;
                if (Math.sqrt(dx * dx + dy * dy) < shape.size * 2) {
                    overlap = true;
                }
            });
        } while (overlap);

        shapes.push(new Shape(x, y, color, type));
        holes.push(new Shape(Math.random() * (canvas.width - 100) + 50, Math.random() * (canvas.height - 100) + 50, color, type, true));
    }
}

function startDrag(e) {
    let clientX, clientY;
    if(e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    shapes.forEach((shape) => {
        let dx = clientX - shape.x;
        let dy = clientY - shape.y;
        if (Math.sqrt(dx * dx + dy * dy) < shape.size) {
            shape.isDragged = true;
            mousePos = { x: shape.x, y: shape.y }; // Initiate mousePos with shape's current position

            let colorSound = sounds[shape.color];
            let shapeSound = sounds[shape.type];

            colorSound.currentTime = 0; // Reset audio play time
            shapeSound.currentTime = 0; // Reset audio play time

            colorSound.addEventListener('ended', () => {
                shapeSound.play();
            });
            colorSound.play(); 
        }
    });
}

function endDrag(e) {
    shapes.forEach((shape, index) => {
        if (shape.isDragged) {
            let hole = holes[index];
            let dx = shape.x - hole.x;
            let dy = shape.y - hole.y;
            if (Math.sqrt(dx * dx + dy * dy) < shape.size) {
                shapes.splice(index, 1);
                holes.splice(index, 1);
                if (shapes.length === 0) {
                    createShapesAndHoles();
                }
            }
        }
        shape.isDragged = false;
    });
}

function moveDrag(e) {
    let clientX, clientY;
    if(e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    mousePos = { x: clientX, y: clientY };
    e.preventDefault();
}

canvas.addEventListener('mousedown', startDrag, false);
canvas.addEventListener('mouseup', endDrag, false);
canvas.addEventListener('mousemove', moveDrag, false);
canvas.addEventListener('touchstart', startDrag, false);
canvas.addEventListener('touchend', endDrag, false);
canvas.addEventListener('touchmove', moveDrag, false);

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
