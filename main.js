let crow;
let hud;
let swooping = false;
let leveling = false;
let frameStart = 0; // To track the start frame of the swoop
let swoopDepth = 180; // Amplitude of the swoop
let speedX = 20; // Horizontal speed during swoop
let totalFrames = 60; // Total frames to complete the swoop

let coin;
let inventory;
let DROP_KEY = 'x';

function setup() {
    new Canvas(1920, 1080, 'fullscreen');

    let background = new Sprite();

    background.width = 10000;
    background.height = 1080;
    background.image = 'assets/images/background.png';
    background.collider = 'none';
    background.layer = 1;

    let floor = new Sprite();
    floor.width = 10000;
    floor.height = 10;
    floor.color = 'blue';
    floor.y = 1070;
    floor.collider = 'static';

    hud = new Sprite();

    world.gravity.y = 10;

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

    crow = new Sprite();

    crow.width = 100;
    crow.height = 100;
    crow.x = 100;
    crow.y = 500;
    crow.collider = 'kinematic';

    crow.addAni('fly', [
        'assets/images/crow-flying-1.png',
        'assets/images/crow-flying-2.png',
        'assets/images/crow-flying-3.png',
        'assets/images/crow-flying-2.png',
    ]);

    crow.addAni('dive', ['assets/images/crow-flying-3.png']);

    crow.changeAni('fly');

    coin = new Sprite();
    coin.width = 12;
    coin.height = 12;
    coin.image = 'assets/images/coin.png';
    coin.x = 200;
    coin.y = 1000;
}

function updateCrow() {
    if (kb.pressing('right')) {
        crow.vel.x = 10;
        crow.mirror.x = false;
    } else if (kb.pressing('left')) {
        crow.vel.x = -10;
        crow.mirror.x = true;
    } else {
        crow.vel.x = 0;
    }

    if (kb.pressing('up')) {
        crow.vel.y = -10;
    } else if (kb.pressing('down')) {
        crow.vel.y = 10;
    } else {
        crow.vel.y = 0;
    }

    if (kb.presses(' ') && !swooping) {
        frameStart = frameCount; // Mark the start of the swoop
        swooping = true;
    }

    if (swooping) {
        let framesElapsed = frameCount - frameStart;

        if (
            framesElapsed <= totalFrames * 0.5 &&
            framesElapsed >= totalFrames * 0.1
        ) {
            crow.changeAni('dive');
        } else {
            crow.changeAni('fly');
        }
        if (framesElapsed <= totalFrames) {
            // Create heading using position in the cosine arc
            heading = createVector(
                crow.mirror.x ? crow.x - 60 : crow.x + 60,
                crow.y + swoopDepth * cos((180 * framesElapsed) / totalFrames)
            );

            // Rotate and head towards the heading depending on position in the arc
            crow.rotateTowards(
                framesElapsed <= totalFrames * 0.6
                    ? heading
                    : createVector(
                          crow.mirror.x ? heading.x - 600 : crow.x + 600,
                          heading.y
                      ),
                0.1,
                !crow.mirror.x ? 0 : 180
            );
            crow.moveTowards(heading);
            console.log(
                `rotation: ${crow.rotation}
dx: ${crow.vel.x.toFixed(3)}
dy: ${crow.vel.y.toFixed(3)}
x: ${crow.x}
y: ${crow.y}
`
            );
        } else {
            hud.text = 'leveling out';
            // Stop the swoop after the duration is over
            crow.rotateMinTo(0, 4);
            swooping = false;
        }
    }

    camera.x = crow.x;
}

function updateInventory() {
    if (crow.overlaps(coin)) {
        inventory = coin;
    }

    if (inventory) {
        inventory.x = crow.x + (crow.mirror.x? -70 : 70);
        inventory.y = crow.y;
    }

    if (kb.pressed(DROP_KEY) && inventory) {
        inventory = null;
    }
}

function draw() {
    clear();
    camera.on();
    updateCrow();
    updateInventory();
    camera.off();
    background('white');
    hud.text = `rotation: ${crow.rotation.toFixed(0)}\nx: ${crow.x.toFixed(
        0
    )}, y: ${crow.y.toFixed(0)}\ndx: ${crow.vel.x.toFixed(
        3
    )}, dy: ${crow.vel.y.toFixed(3)}`;
    hud.draw();
}
