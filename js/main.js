var mario;
var timer = 400;
var timerText;
var score = 0;
var scoreText;
var coins = 0;
var coinsText;
var coinsImage;
var worldText;

// Static objects
var floor, bricks, pipes, mushrooms;

var isOnFloor = false;
var playerCamera;

// UI coordinates for them to follow the camera
var scorePositionX;
var coinsPositionX;
var timerPositionX;
var worldPositionX;
var coinsImagePositionX;

// Consumables
var mushroom;
var mushroomTiles = [
    [512, 512],
    [1024, 320],
    [1728, 320]
]
var mushroomTilesGroup;

// Key codes
var keyW, keyA, keyD;
var Main = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function Main() {
        Phaser.Scene.call(this, {
            key: 'Main'
        });
    },

    preload() {
        // UI
        this.load.image('coins', 'assets/ui/coins-collected.png');
        this.load.image('powerup', 'assets/bricks/powerups.png');
        this.load.image('mushroom', 'assets/collectables/mushroom.png');

        // Tileset map
        this.load.image('tiles', 'assets/tilemaps/tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');

        // Character mario spritesheet
        this.load.spritesheet('mario', 'assets/spritesheets/mario2.png', {
            frameWidth: 45,
            frameHeight: 48,
            startFrame: 0,
            endFrame: 5,
            spacing: 6
        });
    },

    create() {
        // Setup of the user interface
        // SCORE
        scoreText = this.add.text(130, 32, 'MARIO\n' + `${score}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // COINS COLLECTED
        coinsImage = this.add.sprite(460, 62, 'coins');
        coinsText = this.add.text(480, 56, 'x' + ` ${coins}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // WORLD
        worldText = this.add.text(730, 32, 'WORLD\n 1-1')
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // TIMER
        timerText = this.add.text(1030, 32, 'TIME\n' + ` ${timer}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // Begin the timer and update it every second until it reaches zero
        this.time.addEvent({
            delay: 1000,
            callback: function () {
                timer--;
                timerText.setText('TIME\n' + ` ${timer}`);
            },
            callbackScope: this,
            repeat: 400
        });
        // Creating the tileset of layers from Tiled
        var map = this.make.tilemap({
            key: 'map'
        });

        var tiles = map.addTilesetImage('tileset', 'tiles');

        floor = map.createStaticLayer('floor', tiles, 0, 0);
        var water = map.createStaticLayer('water', tiles, 0, 0);
        bricks = map.createStaticLayer('bricks', tiles, 0, 0);
        pipes = map.createStaticLayer('pipe', tiles, 0, 0);
        mushrooms = map.createStaticLayer('mushrooms', tiles, 0, 0);

        // Setting which tiles on the map should be enabled for collision
        floor.setCollisionBetween(1, 1);
        bricks.setCollisionBetween(2, 2);
        pipes.setCollisionBetween(265, 299);
        mushrooms.setCollisionBetween(25, 25);

        // Adding the character to the game
        // mario = this.add.sprite(256, 604, 'mario', 0);
        mario = this.physics.add.sprite(256, 564, 'mario').setOrigin(0.5, 0.5);

        // Prevent the player from leaving the camera
        // mario.setCollideWorldBounds(true);


        mushroomTilesGroup = this.physics.add.staticGroup({
            key: 'powerup',
            frameQuantity: 3,
            immovable: true
        });

        var mushroomChildren = mushroomTilesGroup.getChildren();
        for (var i = 0; i < mushroomChildren.length; i++) {
            var x = mushroomTiles[i][0];
            var y = mushroomTiles[i][1];

            mushroomChildren[i].setPosition(x, y).setOrigin(1, 1);
        }

        mushroomTilesGroup.refresh();

        function overlap() {
            console.log('mhm');
        }

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
    
        playerCamera = this.cameras.main.setSize(1280, 768);
    },

    update() {
        // Update the UI's positioning when the camera moves
        // using new variables that calculate the position relative
        // to the player's position in the world
        scorePositionX = Math.floor(mario.x - 510);
        coinsPositionX = Math.floor(mario.x - 180);
        timerPositionX = Math.floor(mario.x + 390);
        worldPositionX = Math.floor(mario.x + 90);
        coinsImagePositionX = Math.floor(mario.x - 200);
        scoreText.setPosition(scorePositionX, 32);
        coinsText.setPosition(coinsPositionX, 56);
        timerText.setPosition(timerPositionX, 32);
        worldText.setPosition(worldPositionX, 32);
        coinsImage.x = coinsImagePositionX;

        var _this = this;
        this.physics.world.collide(mario, mushroomTilesGroup, function(mario, powerup) {
            // Generating the mushroom on top of the powerup when its hit
            mushroom = _this.physics.add.sprite(powerup.x, powerup.y - 128, 'mushroom');
            
            // Updating mario's power level
            score += 100;
            scoreText.setText('MARIO\n' + `${score}`);

            // Making it so that the powerup is deactivated
            powerup.setTint(0x878787);
            mushroomTilesGroup.remove(powerup);

            // After the shroom spawns, make it go right
            mushroom.setVelocityX(Math.floor(150));

            // and if the shroom is touched by the player then the shroom
            // dissapears and the player is rewarded
            _this.physics.add.overlap(mario, mushroom, function(mario, mushroom) {
                mushroom.destroy();
            });
        });
        
        this.physics.world.collide([mario, mushroom], floor);
        this.physics.world.collide([mario, mushroom], bricks);
        this.physics.world.collide([mario, mushroom], pipes);
        this.physics.world.collide([mario, mushroom], mushrooms);

        var playerPosition = Math.floor(mario.x - 640);
        playerCamera.scrollX = playerPosition;
        if (keyW.isDown && mario.body.blocked.down) {
            // Increase the player's velocity to move right
            mario.body.setVelocityY(-650);

            mario.anims.play('marioJumpingAnimation', 0);
        } else if (keyD.isDown) {
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
        }

        // Always change the scenes at the end of the update function
        if (mario.y > 1200) {
            this.scene.start('GameOverLoseScene');
        }
        if (timer < 0 || timer == 0) {
            this.scene.start('GameOverTimeScene');
        }
    }
});

var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 768,
    backgroundColor: '#6b8cff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 950
            }
        }
    },
    scene: [Main, GameOverLoseScene, GameOverTimerScene],
    title: 'Super Mario Bros - NES version by Nikolay Ivanov',
    version: '0.2'
};

var game = new Phaser.Game(config);