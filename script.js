const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const colors = ['red', 'blue', 'green', 'yellow', 'pink', 'purple'];

class Shape {
    constructor(x, y, color, type, isHole = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.isHole = isHole;
        this.isDragged = false;
    }

    draw() {
        ctx.beginPath();
        switch (this.type) {
            case 'circle':
                ctx.arc(this.x, this.y, 50, 0, Math.PI * 2, false);
                break;
            case 'square':
                ctx.rect(this.x - 50, this.y - 50, 100, 100);
                break;
            case 'rectangle':
                ctx.rect(this.x - 75, this.y - 50, 150, 100);
                break;
            case 'triangle':
                ctx.moveTo(this.x, this.y - 50);
                ctx.lineTo(this.x - 50, this.y + 50);
                ctx.lineTo(this.x + 50, this.y + 50);
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
    let color = colors[Math.floor(Math.random() * colors.length)];
    let type = types[Math.floor(Math.random() * types.length)];
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;

    shapes.push(new Shape(x, y, color, type));
    holes.push(new Shape(Math.random() * canvas.width, Math.random() * canvas.height, color, type, true));
}

function startDrag(e) {
    let clientX = e.clientX || e.touches[0].clientX;
    let clientY = e.clientY || e.touches[0].clientY;

    shapes.forEach((shape) => {
        let dx = clientX - shape.x;
        let dy = clientY - shape.y;
        if (Math.sqrt(dx * dx + dy * dy) < 100) shape.isDragged = true;
    });
}

function endDrag() {
    shapes.forEach((shape, index) => {
        if (shape.isDragged) {
            let hole = holes[index];
            let dx = shape.x - hole.x;
            let dy = shape.y - hole.y;
            if (Math.sqrt(dx * dx + dy * dy) < 100) {
                shapes.splice(index, 1);
                holes.splice(index, 1);
                createShapesAndHoles();
            }
        }
        shape.isDragged = false;
    });
}

function moveDrag(e) {
    let clientX = e.clientX || e.touches[0].clientX;
    let clientY = e.clientY || e.touches[0].clientY;

    mousePos = { x: clientX, y: clientY };
}

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mousemove', moveDrag);
canvas.addEventListener('touchstart', startDrag);
canvas.addEventListener('touchend', endDrag);
canvas.addEventListener('touchmove', moveDrag);

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
