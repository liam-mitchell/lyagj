/**
 * @type {Sprite}
 */
let crow;
let hud;

const SIDEWALK_Y = 950;

let SWOOP_START_FRAME = 0; // To track the start frame of the swoop
let SWOOP_DEPTH = 180; // Amplitude of the swoop
let SWOOP_X_HEADING_OFFSET = 120; // Affects horizontal velocity during swoop
let SWOOP_LENGTH_FRAMES = 60; // Total frames to complete the swoop
/**
 * @type {Sprite}
 */
let coin;
let inventory;
let DROP_KEY = 'x';
let SWOOP_KEY = ' ';
let POOP_KEY = 'c';

let POOP_RATE = 20; // Minimum number of frames between poops
let POOP_START_FRAME = 0; // To track the start frame of the poop

let STATE_SWOOPING = false;
let STATE_POOPING = false;
let STATE_PICKING_UP = 'pickup';
let STATE_DEFAULT = 'default';
let girl;
let girlReaction;

let girlState = STATE_DEFAULT;

let nestTree;

/**
 * @type {Group}
 */
let pickupables;

/**
 * @type {Group}
 */
let twigs;

/**
 * @type {Group}
 */
let coins;

/**
 * @type {Group}
 */
let poops;

/**
 * @type {Sprite}
 */
let nestBox;

let nestMeter = 0;

function setup() {
    new Canvas(1920, 1080, 'fullscreen');

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
    floor.y = SIDEWALK_Y;
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

    nestTree = new Sprite();
    nestTree.collider = 'kinematic';
    nestTree.image = 'assets/images/nest-tree.png';
    nestTree.height = 313;
    nestTree.x = 0;
    nestTree.y = SIDEWALK_Y - nestTree.height / 2;

    nestBox = new Sprite();

    nestBox.overlaps(nestTree);
    nestBox.collider = 'kinematic';
    nestBox.x = nestTree.x;
    nestBox.y = nestTree.y - 70;
    nestBox.width = 64;
    nestBox.height = 54;

    nestBox.strokeColor = 'red';
    nestBox.fill = (255, 0, 0, 255);

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

    girl = new Sprite();
    girl.width = 200;
    girl.height = 200;
    girl.image = 'assets/images/girl.png';
    girl.x = 1000;
    girl.y = SIDEWALK_Y - girl.height / 2;
    girl.collider = 'kinematic';

    pickupables = new Group();

    twigs = new pickupables.Group();
    twigs.image = 'assets/images/twig2.png';
    twigs.width = 16;
    twigs.height = 40;
    twigs.rotation = () => (round(random(0, 1)) % 2 == true ? 0 : 180);
    console.log(twigs.rotation);
    twigs.x = () => random(0, canvas.w);
    twigs.y = SIDEWALK_Y - twigs.height / 2;
    twigs.amount = 10;

    coins = new pickupables.Group();

    coins.width = 12;
    coins.height = 12;
    coins.image = 'assets/images/coin.png';
    coins.x = () => random(0, canvas.w);
    coins.y = SIDEWALK_Y - coins.height / 2;
    coins.amount = 5;

    coin = new Sprite();
    coin.width = 12;
    coin.height = 12;
    coin.image = 'assets/images/coin.png';
    coin.x = 200;
    coin.y = SIDEWALK_Y - coin.height / 2;

    poops = new Group();

    poops.width = 12;
    poops.height = 12;
    poops.image = 'assets/images/poop1.png';

    poops.collide(floor, (poops, poop) => {
        poops.remove(poop);
    });
}

function updateNest() {
    nestBox.overlaps(twigs, handleNewTwig);

    function handleNewTwig(crow, item) {
        inventory = null;
        item.remove();
        nestMeter += 1;
        console.log(nestMeter);
        // update nestBox Sprite
    }
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

    if (kb.presses(SWOOP_KEY) && !STATE_SWOOPING) {
        SWOOP_START_FRAME = frameCount; // Mark the start of the swoop
        STATE_SWOOPING = true;
    }

    if (STATE_SWOOPING) {
        let framesElapsed = frameCount - SWOOP_START_FRAME;

        if (
            framesElapsed <= SWOOP_LENGTH_FRAMES * 0.5 &&
            framesElapsed >= SWOOP_LENGTH_FRAMES * 0.1
        ) {
            crow.changeAni('dive');
        } else {
            crow.changeAni('fly');
        }
        if (framesElapsed <= SWOOP_LENGTH_FRAMES) {
            // Create heading using position in the cosine arc
            heading = createVector(
                crow.mirror.x
                    ? crow.x - SWOOP_X_HEADING_OFFSET
                    : crow.x + SWOOP_X_HEADING_OFFSET,
                crow.y +
                    SWOOP_DEPTH *
                        cos((180 * framesElapsed) / SWOOP_LENGTH_FRAMES)
            );

            // Rotate and head towards the heading depending on position in the arc
            crow.rotateTowards(
                framesElapsed <= SWOOP_LENGTH_FRAMES * 0.6
                    ? heading
                    : createVector(
                          crow.mirror.x ? heading.x - 600 : crow.x + 600,
                          heading.y
                      ),
                0.1,
                !crow.mirror.x ? 0 : 180
            );
            crow.moveTowards(heading);
            //             console.log(
            //                 `rotation: ${crow.rotation}
            // dx: ${crow.vel.x.toFixed(3)}
            // dy: ${crow.vel.y.toFixed(3)}
            // x: ${crow.x}
            // y: ${crow.y}
            // `
            //             );
        } else {
            hud.text = 'leveling out';
            // Stop the swoop after the duration is over
            crow.rotateMinTo(0, 4);
            STATE_SWOOPING = false;
        }
    }

    if (kb.presses(POOP_KEY) && !STATE_POOPING) {
        POOP_START_FRAME = frameCount; // Mark the start of the pooping
        STATE_POOPING = true;

        let poop = new Sprite();
        poop.x = crow.mirror.x
            ? crow.x + crow.width * 0.3
            : crow.x - crow.width * 0.3;
        poop.y = crow.y;
        poop.width = 24;
        poop.height = 24;
        poop.image = 'assets/images/poop1.png';
        poops.add(poop);
    }

    if (STATE_POOPING) {
        let framesElapsed = frameCount - POOP_START_FRAME;

        if (framesElapsed >= POOP_RATE) {
            STATE_POOPING = false;
        }
    }

    // TODO(lmitchell): make this dynamic based on background size
    let lbound = 300;
    let rbound = 1600;

    if (crow.x > lbound && crow.x < rbound) {
        camera.x = crow.x;
    }
}

function updateInventory() {
    crow.overlaps(pickupables, collect);

    if (inventory) {
        inventory.collider = 'kinematic';
        inventory.x = crow.x + (crow.mirror.x ? -70 : 70);
        inventory.y = crow.y;
        inventory.vel.y = 0;
        inventory.vel.x = 0;
    }

    if (kb.pressed(DROP_KEY) && inventory) {
        inventory.collider = 'dynamic';
        inventory = null;
    }
}

function collect(crow, item) {
    if (inventory) {
        return;
    }
    inventory = item;
}

function updateGirl() {
    if (girl.overlapping(coin) && girlState == STATE_PICKING_UP) {
        girlState = STATE_DEFAULT;
        girlReaction.remove();
        coin.remove();
    } else if (
        abs(girl.x - coin.x) < 200 &&
        coin.y > girl.y &&
        inventory != coin
    ) {
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
    updateNest();
    camera.off();
    hud.text = `rotation: ${crow.rotation.toFixed(0)}\nx: ${crow.x.toFixed(
        0
    )}, y: ${crow.y.toFixed(0)}\ndx: ${crow.vel.x.toFixed(
        3
    )}, dy: ${crow.vel.y.toFixed(3)}`;
    hud.draw();
}
