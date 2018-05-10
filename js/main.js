var start = false;
var killedByHostile = false;
var startGameLabel;
var titleImage;
var titleCredits;
var leftArrow;
var rightArrow;
var visible = true;

var mario;
var timer = 400;
var gameTimer;
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
var bigMario = false;
var isMushroomLive = false;
var toggleDirection = false;
var mushroom;
var mushroomTiles = [
    [512 + (20 * 64), 512],
    [1024 + (20 * 64), 320],
    [1728 + (20 * 64), 320]
]
var mushroomChildren;
var mushroomTilesGroup;

var coin;
// We multiply by 64 because every tile takes 64 pixels of width
// and using this metric, its much easier to calculate where to place
// special objects such as coins and powerups for the player on the
// tileset from Tiled.
var coinsTiles = [
    [7 * 64, 7 * 64],
    [8 * 64, 7 * 64],
    [10 * 64, 7 * 64],
    [11 * 64, 7 * 64],
    [13 * 64, 7 * 64],
    [14 * 64, 7 * 64],
    [22 * 64, 320],
    [23 * 64, 320],
    [24 * 64, 320],
    [38 * 64, 256],
    [43 * 64, 448],
    [44 * 64, 448],
    [54 * 64, 448],
    [55 * 64, 448],
];
var coinsChildren;
var coinsTilesGroup;

// Hostile goomba spawn
var goombaHostiles = [
    [30 * 64, 540],
    [45 * 64, 540]
];
var goombaHostilesGroup;
var goombaChildren;

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
        this.load.image('titleImage', 'assets/main-menu/title.png');

        // UI
        this.load.image('coins', 'assets/ui/coins-collected.png');
        this.load.image('powerupsDisabled', 'assets/bricks/powerupsDisabled.png');
        this.load.image('mushroom', 'assets/collectables/mushroom.png');

        // Tileset map
        this.load.image('tiles', 'assets/tilemaps/tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');

        // Character mario spritesheet
        this.load.spritesheet('mario', 'assets/spritesheets/mario.png', {
            frameWidth: 45,
            frameHeight: 48,
            startFrame: 0,
            endFrame: 5,
            spacing: 6
        });
        this.load.spritesheet('marioBig', 'assets/spritesheets/marioBig.png', {
            frameWidth: 56,
            frameHeight: 109,
            startFrame: 0,
            endFrame: 5,
            spacing: 2
        });

        // Consumables animation spritesheets
        this.load.spritesheet('powerupsAnimation', 'assets/spritesheets/powerupsAnimation.png', {
            frameWidth: 64,
            frameHeight: 64,
            startFrame: 0,
            endFrame: 2,
            spacing: 0
        });
        this.load.spritesheet('coinsAnimation', 'assets/spritesheets/coinsAnimation.png', {
            frameWidth: 64,
            frameHeight: 56,
            startFrame: 0,
            endFrame: 2,
            spacing: 0
        });

        this.load.image('squashedGoomba', 'assets/spritesheets/hostiles/squashedGoomba.png');
        // Hostiles spritesheet
        this.load.spritesheet('goomba', 'assets/spritesheets/hostiles/goomba.png', {
            frameWidth: 48,
            frameHeight: 48,
            startFrame: 0,
            endFrame: 1,
            spacing: 0
        });
    },

    create() {
        titleCredits = this.add.text(640, 474, 'Made by Nikolay Ivanov - CMV1G - 376469')
            .setFontFamily('emulogic')
            .setFontSize(17)
            .setOrigin(0.5, 0.5)
            .setColor('#FCBBAE');

        startGameLabel = this.add.text(640, 550, 'Press space to start')
            .setFontFamily('emulogic')
            .setFontSize(26)
            .setOrigin(0.5, 0.5);

        leftArrow = this.add.text(startGameLabel.x - startGameLabel.width / 2 - 30, 550, '>')
            .setFontFamily('emulogic')
            .setFontSize(26)
            .setOrigin(0.5, 0.5);

        rightArrow = this.add.text(startGameLabel.x + startGameLabel.width / 2 + 30, 550, '<')
            .setFontFamily('emulogic')
            .setFontSize(26)
            .setOrigin(0.5, 0.5);

        // Notify the player to click space to start the game
        this.time.addEvent({
            delay: 500,
            callback: function () {
                if (visible) {
                    leftArrow.visible = false;
                    rightArrow.visible = false;
                    visible = false;
                } else {
                    leftArrow.visible = true;
                    rightArrow.visible = true;
                    visible = true;
                }
            },
            loop: true
        });

        // Creating the tileset of layers from Tiled
        var map = this.make.tilemap({
            key: 'map'
        });

        var tiles = map.addTilesetImage('tileset', 'tiles');

        floor = map.createStaticLayer('floor', tiles, 0, 0);
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
        mario = this.physics.add.sprite(640, 620, 'mario').setOrigin(0.5, 0.5);

        // Initiate the hostile goomba
        var goombaWalking = {
            key: 'goombaWalkingAnimation',
            frames: this.anims.generateFrameNumbers('goomba', {
                start: 0,
                end: 1
            }),
            frameRate: 6,
            repeat: -1
        };

        this.anims.create(goombaWalking);

        goombaHostilesGroup = this.physics.add.group({
            key: 'goombaWalkingAnimation',
            frameQuantity: 2
        });

        goombaChildren = goombaHostilesGroup.getChildren();
        for (var i = 0; i < goombaChildren.length; i++) {
            var x = goombaHostiles[i][0];
            var y = goombaHostiles[i][1];

            goombaChildren[i].setPosition(x, y).setOrigin(0.5, 0.5);
            goombaChildren[i].anims.play('goombaWalkingAnimation', 0);
            goombaChildren[i].setVelocityX(Math.floor(-150));
        }

        // Prevent the player from leaving the camera
        // mario.setCollideWorldBounds(true);
        var powerupsFlash = {
            key: 'powerupsFlashAnimation',
            frames: this.anims.generateFrameNumbers('powerupsAnimation', {
                start: 0,
                end: 2
            }),
            frameRate: 6,
            repeat: -1
        };

        this.anims.create(powerupsFlash);

        var coinsFlash = {
            key: 'coinsFlashAnimation',
            frames: this.anims.generateFrameNumbers('coinsAnimation', {
                start: 0,
                end: 2
            }),
            frameRate: 6,
            repeat: -1
        };

        this.anims.create(coinsFlash);

        coinsTilesGroup = this.physics.add.staticGroup({
            key: 'coinsAnimation',
            frameQuantity: 14,
            immovable: true
        });

        coinsChildren = coinsTilesGroup.getChildren();
        for (var i = 0; i < coinsChildren.length; i++) {
            var x = coinsTiles[i][0];
            var y = coinsTiles[i][1];

            // Creating a sprite that is animated and has a static
            // body to collide with the player
            coinsChildren[i].setPosition(x, y - 6).setOrigin(1, 1);
            coinsChildren[i].anims.play('coinsFlashAnimation', 0);
        }

        coinsTilesGroup.refresh();

        mushroomTilesGroup = this.physics.add.staticGroup({
            key: 'powerupsAnimation',
            frameQuantity: 3,
            immovable: true
        });

        mushroomChildren = mushroomTilesGroup.getChildren();
        for (var i = 0; i < mushroomChildren.length; i++) {
            var x = mushroomTiles[i][0];
            var y = mushroomTiles[i][1];

            mushroomChildren[i].setPosition(x, y).setOrigin(1, 1);
            mushroomChildren[i].anims.play('powerupsFlashAnimation', 0);
        }

        mushroomTilesGroup.refresh();

        // Creating the animations for the smaller mario
        var marioIdle = {
            key: 'marioIdleAnimation',
            frames: this.anims.generateFrameNumbers('mario', {
                start: 0,
                end: 0
            }),
            frameRate: 6,
            repeat: 1
        };
        var marioWalking = {
            key: 'marioWalkingAnimation',
            frames: this.anims.generateFrameNumbers('mario', {
                start: 0,
                end: 3
            }),
            frameRate: 6,
            repeat: -1
        };
        var marioJumping = {
            key: 'marioJumpingAnimation',
            frames: this.anims.generateFrameNumbers('mario', {
                start: 4,
                end: 4
            }),
            frameRate: 6,
            repeat: 1
        };

        // Create an animation based on the walking and jumping configurations
        this.anims.create(marioIdle);
        this.anims.create(marioWalking);
        this.anims.create(marioJumping);

        // Creating the animations for the bigger mario
        var marioBigIdle = {
            key: 'marioBigIdleAnimation',
            frames: this.anims.generateFrameNumbers('marioBig', {
                start: 0,
                end: 0
            }),
            frameRate: 6,
            repeat: 1
        };
        var marioBigWalking = {
            key: 'marioBigWalkingAnimation',
            frames: this.anims.generateFrameNumbers('marioBig', {
                start: 1,
                end: 3
            }),
            frameRate: 6,
            repeat: -1
        };
        var marioBigJumping = {
            key: 'marioBigJumpingAnimation',
            frames: this.anims.generateFrameNumbers('marioBig', {
                start: 5,
                end: 5
            }),
            frameRate: 6,
            repeat: 1
        };

        // Creating the animations for the bigger mario sprite
        this.anims.create([marioBigIdle]);
        this.anims.create(marioBigWalking);
        this.anims.create(marioBigJumping);

        // Keys for character animations
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        // Setup of the user interface
        // SCORE
        scoreText = this.add.text(130, 32, 'mario\n' + `${score}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // COINS COLLECTED
        coinsImage = this.add.sprite(440, 62, 'coins');
        coinsText = this.add.text(460, 56, 'x' + ` ${coins}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // WORLD
        worldText = this.add.text(730, 32, 'world\n 1-1')
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // TIMER
        timerText = this.add.text(1030, 32, 'time\n' + ` ${timer}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // Begin the timer and update it every second until it reaches zero
        gameTimer = this.time.addEvent({
            delay: 1000,
            callback: function () {
                timer--;
                timerText.setText('time\n' + ` ${timer}`);
            },
            callbackScope: this,
            repeat: 400
        });

        titleImage = this.add.image(640, 280, 'titleImage').setOrigin(0.5, 0.5);
    },

    update() {
        this.physics.world.collide([mario, mushroom, goombaHostilesGroup], floor);
        this.physics.world.collide(goombaHostilesGroup, pipes, function (g, p) {
            if (g.body.blocked.left) {
                g.setVelocityX(Math.floor(150));
            } else if (g.body.blocked.right) {
                g.setVelocityX(Math.floor(-150));
            }
        });

        this.input.keyboard.on('keydown_SPACE', function () {
            // Enabling the camera to follow the player
            playerCamera = this.cameras.main.setSize(1280, 768);

            // Hiding introduction objects
            titleImage.destroy();
            titleCredits.destroy();
            startGameLabel.destroy();
            leftArrow.destroy();
            rightArrow.destroy();

            start = true;
        }, this);

        if (start) {
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
            this.physics.world.collide(mario, goombaHostilesGroup, function (m, g) {
                if (mario.body.touching.down) {
                    score += 100;
                    updateScore();

                    // The player gets a pop-up of his earned points
                    var popup = _this.add.text(g.x - 45, g.y - 45, '100')
                        .setFontFamily('emulogic')
                        .setFontSize(24)
                        .setColor('#ffffff');

                    setTimeout(function () {
                        popup.destroy();
                    }, 600);

                    // Destroy the goomba and show a squashed one instead
                    var squashedRemains = _this.add.sprite(g.x, g.y, 'squashedGoomba').setOrigin();
                    g.destroy();

                    setTimeout(function () {
                        squashedRemains.destroy();
                    }, 600);
                } else if (mario.body.touching.left || mario.body.touching.right || mario.body.touching.up) {
                    if (bigMario) {
                        bigMario = false;

                        mario.setSize(48, 48).setOrigin(0.35, -0.1);
                    } else {
                        killedByHostile = true;
                    }
                }
            });

            // We are using overlap because collide stops the movement
            // while the former doesnt stop the player prematurely.
            this.physics.world.overlap(mario, coinsTilesGroup, function (mario, coin) {
                // The player gets a pop-up of his earned points
                var popup = _this.add.text(coin.x - 70, coin.y - 80, '200')
                    .setFontFamily('emulogic')
                    .setFontSize(24).setColor('#ffffff');

                setTimeout(function () {
                    popup.destroy();
                }, 600);

                score += 200;
                updateScore();

                coins++;
                coinsText.setText('x' + ` ${coins}`);
                coin.destroy();
            });

            this.physics.world.collide(mario, mushroomTilesGroup, function (mario, powerups) {
                if (mario.body.touching.up) {
                    // The player gets a pop-up of his earned points
                    var popup = _this.add.text(powerups.x - 70, powerups.y - 94, '100')
                        .setFontFamily('emulogic')
                        .setFontSize(24).setColor('#ffffff');

                    setTimeout(function () {
                        popup.destroy();
                    }, 600);

                    isMushroomLive = true;
                    // Updating mario's power level
                    score += 100;
                    updateScore();

                    // Generating the mushroom on top of the powerups when its hit
                    mushroom = _this.physics.add.sprite(powerups.x, powerups.y - 128, 'mushroom');

                    // Making it so that the powerups is deactivated
                    powerups.setTexture('powerupsDisabled');
                    mushroomTilesGroup.remove(powerups);
                    powerups.anims.stop();

                    // After the shroom spawns, make it go right
                    mushroom.body.velocity.x += Math.floor(125);

                    // and if the shroom is touched by the player then the shroom
                    // dissapears and the player is rewarded
                    _this.physics.add.overlap(mario, mushroom, function (mario, mushroom) {
                        bigMario = true;

                        // The player gets a pop-up of his earned points
                        var popup = _this.add.text(mushroom.x - 50, mushroom.y - 50, '1000')
                            .setFontFamily('emulogic')
                            .setFontSize(24).setColor('#ffffff');

                        setTimeout(function () {
                            popup.destroy();
                        }, 600);

                        // Updating mario's power level
                        score += 1000;
                        updateScore();

                        mario.setTexture('marioBig').setOrigin(0.21, 0.21);

                        // Bugfix for falling to your death after
                        // you change the size and fall through the tiles
                        mario.y -= Math.floor(109 / 2);
                        mario.setSize(56, 109);

                        mushroom.destroy();
                        isMushroomLive = false;
                    });

                    if (score >= 100 && score < 1000) {
                        scoreText.setText('MARIO\n' + '000' + `${score}`);
                    } else if (score >= 1000 && score < 10000) {
                        scoreText.setText('MARIO\n' + '00' + `${score}`);
                    } else if (score >= 10000 && score < 100000) {
                        scoreText.setText('MARIO\n' + '0' + `${score}`);
                    } else {
                        scoreText.setText('MARIO\n' + `${score}`);
                    }
                }
            });

            this.physics.world.collide([mario, mushroom], bricks);
            this.physics.world.collide(mario, pipes);
            if (isMushroomLive) {
                this.physics.world.collide(mushroom, pipes, function (m, p) {
                    if (m.body.blocked.left) {
                        mushroom.setVelocityX(Math.floor(150));
                    } else if (m.body.blocked.right) {
                        mushroom.setVelocityX(Math.floor(-150));
                    }
                });
            }
            this.physics.world.collide([mario, mushroom], mushrooms);

            var playerPosition = Math.floor(mario.x - 640);
            playerCamera.scrollX = playerPosition;
            if (keyW.isDown && mario.body.blocked.down) {
                // Increase the player's velocity to move right
                mario.body.setVelocityY(Math.floor(-650));

                if (bigMario == true) {
                    mario.anims.play('marioBigJumpingAnimation', 0);
                } else {
                    mario.anims.play('marioJumpingAnimation', 0);
                }
            } else if (keyD.isDown) {
                // Increase the player's velocity to move right
                if (mario.body.velocity.x < 270) {
                    mario.body.velocity.x += 50;
                } else {
                    mario.body.velocity.x = 270;
                }

                mario.flipX = false;
                if (bigMario == true) {
                    mario.anims.play('marioBigWalkingAnimation', 1);
                } else {
                    mario.anims.play('marioWalkingAnimation', 1);
                }
            } else if (keyA.isDown) {
                if (mario.body.velocity.x > -270) {
                    mario.body.velocity.x -= 50;
                } else {
                    mario.body.velocity.x = -270;
                }

                mario.flipX = true;
                if (bigMario == true) {
                    mario.anims.play('marioBigWalkingAnimation', 1);
                } else {
                    mario.anims.play('marioWalkingAnimation', 1);
                }
            } else {
                // Gradually slow down the player before stopping
                if (mario.body.velocity.x < 0) {
                    mario.body.velocity.x += 20;

                    if (bigMario == true) {
                        mario.anims.play('marioBigIdleAnimation', 1);
                    } else {
                        mario.anims.play('marioIdleAnimation', 1);
                    }
                } else if (mario.body.velocity.x > 0) {
                    mario.body.velocity.x -= 20;

                    if (bigMario == true) {
                        mario.anims.play('marioBigIdleAnimation', 1);
                    } else {
                        mario.anims.play('marioIdleAnimation', 1);
                    }
                }
            }

            // Always change the scenes at the end of the update function
            if (mario.y > 1200) {
                this.scene.start('GameOverLoseScene');
            }
            if (timer < 0 || timer == 0) {
                this.scene.start('GameOverTimeScene');
            }
            if (killedByHostile) {
                this.scene.start('GameOverLoseScene');
            }
        } else {
            // Don't start the timer until the player is ready
            timer = 401;
        }
    },
});

var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 768,
    backgroundColor: '#5B93F5',
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            gravity: {
                y: 950
            }
        }
    },
    scene: [Main, GameOverLoseScene, GameOverTimerScene],
    title: 'Super Mario Bros - NES version by Nikolay Ivanov'
};

var game = new Phaser.Game(config);

function updateScore() {
    if (score >= 100 && score < 1000) {
        scoreText.setText('MARIO\n' + '000' + `${score}`);
    } else if (score >= 1000 && score < 10000) {
        scoreText.setText('MARIO\n' + '00' + `${score}`);
    } else if (score >= 10000 && score < 100000) {
        scoreText.setText('MARIO\n' + '0' + `${score}`);
    } else {
        scoreText.setText('MARIO\n' + `${score}`);
    }
}