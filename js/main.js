var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 768,
    backgroundColor: '#6b8cff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 880
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    title: 'Super Mario Bros - NES version by Nikolay Ivanov',
    version: '0.2'
};

var game = new Phaser.Game(config);
var mario;

// Static objects
var floor, bricks, pipes;

var isOnFloor = false;

// Key codes
var keyW, keyA, keyD;

function preload() {
    this.load.image('tiles', 'assets/tilemaps/tileset.png')
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');

    // Character mario spritesheet
    this.load.spritesheet('mario', 'assets/spritesheets/mario2.png', {
        frameWidth: 73,
        frameHeight: 72,
        startFrame: 0,
        endFrame: 5,
        spacing: 4
    });
}

function create() {
    // Creating the tileset of layers from Tiled
    var map = this.make.tilemap({
        key: 'map'
    });

    var tiles = map.addTilesetImage('tileset', 'tiles');

    floor = map.createStaticLayer('floor', tiles, 0, 0);
    var water = map.createStaticLayer('water', tiles, 0, 0);
    bricks = map.createStaticLayer('bricks', tiles, 0, 0);
    pipes = map.createStaticLayer('pipe', tiles, 0, 0);
    var mushrooms = map.createStaticLayer('mushrooms', tiles, 0, 0);

    // Setting which tiles on the map should be enabled for collision
    floor.setCollisionBetween(1, 1);
    bricks.setCollisionBetween(2, 2);
    pipes.setCollisionBetween(265, 299);

    // Adding the character to the game
    // mario = this.add.sprite(256, 604, 'mario', 0);
    mario = this.physics.add.sprite(256, 564, 'mario');

    // Prevent the player from leaving the camera
    mario.setCollideWorldBounds(true);

    // Enable physics collision with the layers
    // this.physics.add.collider(mario, [floor, bricks, pipes]);

    // Creating the animations
    var idle = {
        key: 'marioIdleAnimation',
        frames: this.anims.generateFrameNumbers('mario', {
            start: 0,
            end: 0
        }),
        frameRate: 6,
        repeat: 1
    }
    var walking = {
        key: 'marioWalkingAnimation',
        frames: this.anims.generateFrameNumbers('mario', {
            start: 0,
            end: 3
        }),
        frameRate: 6,
        repeat: -1
    }
    var jumping = {
        key: 'marioJumpingAnimation',
        frames: this.anims.generateFrameNumbers('mario', {
            start: 4,
            end: 4
        }),
        frameRate: 6,
        repeat: 1
    }

    // Create an animation based on the walking and jumping configurations
    this.anims.create(idle);
    this.anims.create(walking);
    this.anims.create(jumping);

    // Keys for character animations
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
}

function update() {
    this.physics.world.collide(mario, floor);
    this.physics.world.collide(mario, bricks);
    this.physics.world.collide(mario, pipes);

    if (mario.body.velocity.y == 0 || mario.body.velocity.y < 0) {
        keyW.enabled = true;
    } else {
        keyW.enabled = false;
    }

    if (keyW.isDown) {
        // Increase the player's velocity to move right
        mario.body.setVelocityY(-550);

        mario.anims.play('marioJumpingAnimation', 1);
    }

    if (keyD.isDown) {
        // Increase the player's velocity to move right
        if (mario.body.velocity.x < 270) {
            mario.body.velocity.x += 50;
        } else {
            mario.body.velocity.x = 270;
        }

        mario.flipX = false;
        mario.anims.play('marioWalkingAnimation', 1);
    } else if (keyA.isDown) {
        if (mario.body.velocity.x > -270) {
            mario.body.velocity.x -= 50;
        } else {
            mario.body.velocity.x = -270;
        }

        mario.flipX = true;
        mario.anims.play('marioWalkingAnimation', 1);
    } else {
        // Gradually slow down the player before stopping
        if (mario.body.velocity.x < 0) {
            mario.body.velocity.x += 20;

            mario.anims.play('marioIdleAnimation', 1);
        } else if (mario.body.velocity.x > 0) {
            mario.body.velocity.x -= 20;

            mario.anims.play('marioIdleAnimation', 1);
        }

        // Once the player has stopped moving, run the idle animation
    }
}