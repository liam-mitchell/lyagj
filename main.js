let smiley;

function setup() 
{
    new Canvas(1920, 1080, 'fullscreen');

    let background = new Sprite();

    background.width = 10000;
    background.height = 1080;
    background.image = 'assets/images/background.png';
    background.collider = 'none';

    smiley = new Sprite();

    smiley.width = 100;
    smiley.height = 100;
    smiley.image = 'assets/images/smiley.png';
    smiley.x = 100;
    smiley.y = 500;

    smiley.addAni('fly', [
        'assets/images/crow-flying-1.png', 
        'assets/images/crow-flying-2.png', 
        'assets/images/crow-flying-3.png',  
        'assets/images/crow-flying-2.png'
    ]);

    smiley.changeAni('fly');
}

function draw()
{
    clear();
    background('white');
    if (kb.pressing('right'))
    {
        smiley.vel.x = 10;
        smiley.mirror.x = false;
    }
    else if (kb.pressing('left'))
    {
        smiley.vel.x = -10;
        smiley.mirror.x = true;
    }
    else
    {
        smiley.vel.x = 0;
    }

    if (kb.pressing('up'))
    {
        smiley.vel.y = -10;
    }
    else if (kb.pressing('down'))
    {
        smiley.vel.y = 10;
    }
    else
    {
        smiley.vel.y = 0;
    }

    camera.x = smiley.x;
}