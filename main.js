let smiley;
let hud;
let swooping = false;
let leveling = false;
let frameStart = 0; // To track the start frame of the swoop
let swoopDepth = 180; // Amplitude of the swoop
let speedX = 20; // Horizontal speed during swoop
let totalFrames = 60; // Total frames to complete the swoop

function setup() {
    new Canvas(1920, 1080, 'fullscreen');

    let background = new Sprite();

    background.width = 10000;
    background.height = 1080;
    background.image = 'assets/images/background.png';
    background.collider = 'none';
    background.layer = 1;

    hud = new Sprite();

    hud.collider = 'none';
    hud.color = 'blue';
    hud.textSize = 40;
    hud.text = 'not swooping';
    hud.textColor = 'green';
    hud.x = window.canvas.width - 250;
    hud.y = 25;
    hud.w = 500;
    hud.h = 150;
    hud.layer = 2;

    smiley = new Sprite();

    smiley.width = 100;
    smiley.height = 100;
    smiley.image = 'assets/images/smiley.png';
    smiley.x = 100;
    smiley.y = 500;
}

function updateBird() {
    if (kb.pressing('right')) {
        smiley.vel.x = 10;
    } else if (kb.pressing('left')) {
        smiley.vel.x = -10;
    } else {
        smiley.vel.x = 0;
    }

    if (kb.pressing('up')) {
        smiley.vel.y = -10;
    } else if (kb.pressing('down')) {
        smiley.vel.y = 10;
    } else {
        smiley.vel.y = 0;
    }

    if (kb.presses(' ') && !swooping) {
        frameStart = frameCount; // Mark the start of the swoop
        swooping = true;
    }

    if (swooping) {
        let framesElapsed = frameCount - frameStart;
        // smiley.vel.x = speedX;
        if (framesElapsed <= totalFrames) {
            // Calculate position in the cosine arc

            heading = {
                x: smiley.x + 60,
                y:
                    smiley.y +
                    swoopDepth * cos((180 * framesElapsed) / totalFrames),
            };
            smiley.rotateTowards(heading, 0.1);
            smiley.moveTowards(heading);
            console.log(
                `rotation: ${smiley.rotation}
dx: ${smiley.vel.x.toFixed(3)}
dy: ${smiley.vel.y.toFixed(3)}
x: ${smiley.x}
y: ${smiley.y}
`
            );

            hud.text = `x: ${smiley.x.toFixed(0)}, y: ${smiley.y.toFixed(
                0
            )}\ndx: ${smiley.vel.x.toFixed(3)}, dy: ${smiley.vel.y.toFixed(3)}`;
        } else {
            hud.text = 'leveling out';
            // Stop the swoop after the duration is over
            smiley.rotateTo(0, 4);
            swooping = false;
        }
    }

    camera.x = smiley.x;
}

function draw() {
    clear();
    camera.on();
    updateBird();
    camera.off();
    background('white');
    hud.draw();
}
