var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 768,
    backgroundColor: "#6b8cff",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 200
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    title: "Super Mario Bros - NES version by Nikolay Ivanov",
    version: "0.2"
};

var game = new Phaser.Game(config);
var mario;

// Key codes
var keyA, keyD;

function preload() {
    this.load.image('tiles', 'assets/tilemaps/tileset.png')
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');

    // Character mario spritesheet
    this.load.spritesheet('mario', 'assets/spritesheets/mario2.png', {
        frameWidth: 72,
        frameHeight: 72,
        startFrame: 0,
        endFrame: 3,
        spacing: 4
    });
}

function create() {
    // Creating the tileset of layers from Tiled
    var map = this.make.tilemap({
        key: 'map'
    });

    var tiles = map.addTilesetImage('tileset', 'tiles');

    var floor = map.createStaticLayer("floor", tiles, 0, 0);
    var water = map.createStaticLayer("water", tiles, 0, 0);
    var bricks = map.createStaticLayer("bricks", tiles, 0, 0);
    var pipes = map.createStaticLayer("pipe", tiles, 0, 0);
    var mushrooms = map.createStaticLayer("mushrooms", tiles, 0, 0);

    // Adding the character to the game
    mario = this.add.sprite(256, 604, 'mario', 0);

    // Creating the animation
    var walking = {
        key: 'marioWalkingAnimation',
        frames: this.anims.generateFrameNumbers('mario', {
            start: 0,
            end: 3
        }),
        frameRate: 6,
        repeat: -1
    }

    // Create an animation based on the walking configuration
    this.anims.create(walking);

    // Keys for character animations
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
}

function update() {
    if (keyD.isDown) {
        mario.flipX = false;
        mario.anims.play('marioWalkingAnimation');
    }
    else if (keyA.isDown) {
        mario.flipX = true;
        mario.anims.play('marioWalkingAnimation');
    }
}