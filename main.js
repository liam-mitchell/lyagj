/**
 * @type {Sprite}
 */
let crow;
let hud;
let swooping = false;
let leveling = false;
let frameStart = 0; // To track the start frame of the swoop
let swoopDepth = 180; // Amplitude of the swoop
let speedX = 20; // Horizontal speed during swoop
let totalFrames = 60; // Total frames to complete the swoop
/**
 * @type {Sprite}
 */
let coin;
let inventory;
let DROP_KEY = 'x';

let STATE_PICKING_UP = 'pickup';
let STATE_DEFAULT = 'default';
let girl;
let girlReaction;

let girlState = STATE_DEFAULT;

let nestTree;

let twig;

const sidewalkY = 950;

let background;
let canvas;

function setup() {
    canvas = new Canvas(1920, 1080, 'fullscreen');

    background = new Sprite();

    background.width = 3240;
    background.height = 1080;
    background.image = 'assets/images/background-stripped.png';
    background.collider = 'none';
    background.layer = 1;

    let floor = new Sprite();
    floor.width = background.width;
    floor.height = 10;
    floor.color = 'blue';
    floor.y = sidewalkY;
    floor.collider = 'static';

    hud = new Sprite();

    world.gravity.y = 100;

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
    crow.x = window.canvas.clientWidth / 2;
    crow.y = 500;
    crow.collider = 'kinematic';

    camera.x = crow.x;

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
    coin.y = sidewalkY - coin.height / 2;

    girl = new Sprite();
    girl.width = 200;
    girl.height = 200;
    girl.image = 'assets/images/girl.png';
    girl.x = 1000;
    girl.y = sidewalkY - girl.height / 2;
    girl.collider = 'kinematic';

    nestTree = new Sprite();
    nestTree.image = 'assets/images/nest-tree.png';
    nestTree.height = 313;
    nestTree.x = 0;
    nestTree.y = sidewalkY - nestTree.height / 2;

    twig = new Sprite();
    twig.image = 'assets/images/twig.png';
    twig.height = 40;
    twig.x = 100;
    twig.y = sidewalkY - twig.height / 2;
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

    // TODO(lmitchell): make this dynamic based on background size
    let lbound = 300;
    let rbound = 1600;

    if (crow.x > lbound && crow.x < rbound) {
        camera.x = crow.x;
    }
}

function updateInventory(pickupables) {
    if (crow.overlaps(coin)) {
        inventory = coin;
    }

    if (inventory) {
        inventory.x = crow.x + (crow.mirror.x ? -70 : 70);
        inventory.y = crow.y;
        inventory.vel.y = 0;
        inventory.vel.x = 0;
    }

    if (kb.pressed(DROP_KEY) && inventory) {
        inventory = null;
    }
}

function updateGirl() {
    if (girl.overlapping(coin) && girlState == STATE_PICKING_UP) {
        girlState = STATE_DEFAULT;
        girlReaction.remove();
        coin.remove();
    } else if (abs(girl.x - coin.x) < 200 && coin.y > girl.y && inventory != coin) {
        girl.moveTo(coin.x, girl.y, 5);

        if (girlState != STATE_PICKING_UP) {
            girlState = STATE_PICKING_UP;
            girlReaction = new Sprite();
            girlReaction.image = 'assets/images/reaction-exclamation.png';
            girlReaction.width = 50;
            girlReaction.height = 50;

            if (coin.x < girl.x) {
                girl.mirror.x = true;
            }
        }

        if (girlReaction) {
            girlReaction.x = girl.x + girlReaction.width;
            girlReaction.y = girl.y - girlReaction.height;
        }
    }
}

function draw() {
    clear();
    camera.on();
    updateCrow();
    updateInventory();
    updateGirl();
    camera.off();
    hud.text = `rotation: ${crow.rotation.toFixed(0)}\nx: ${crow.x.toFixed(
        0
    )}, y: ${crow.y.toFixed(0)}\ndx: ${crow.vel.x.toFixed(
        3
    )}, dy: ${crow.vel.y.toFixed(3)}`;
    hud.draw();
}
