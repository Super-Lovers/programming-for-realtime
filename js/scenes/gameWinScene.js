var GameWinScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function GameWinScene() {
        Phaser.Scene.call(this, {
            key: 'GameWinScene'
        });
    },

    preload() {
        // Redundant but it works for now as prototyping
        this.load.image('background', 'assets/ui/gameOverBackground.png');
        this.load.image('coins', 'assets/ui/coins-collected.png');

        // End-game audio
        this.load.audio('gameover', 'assets/audio/smb_gameover.wav');
        this.load.audio('stageclear', 'assets/audio/smb_stage_clear.wav');
    },

    create() {
        var _this = this;
        setTimeout(function() {
            _this.sound.add('stageclear').play();
        }, 500);

        this.add.sprite(0, 0, 'background').setOrigin(0, 0);

        // GAME OVER
        this.add.text(640, 384, 'You win')
            .setFontFamily('emulogic')
            .setFontSize(24)
            .setColor('#ffffff')
            .setOrigin(0.5, 0.5);

        this.add.text(640, 424, 'You scored ' + `${score}` + ' points!')
            .setFontFamily('emulogic')
            .setFontSize(24)
            .setColor('#ffffff')
            .setOrigin(0.5, 0.5);

        // SCORE
        scoreText = this.add.text(130, 32, 'MARIO\n' + `${score}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // COINS COLLECTED
        this.add.sprite(460, 62, 'coins');
        coinsText = this.add.text(480, 56, 'x' + ` ${coins}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // WORLD
        this.add.text(730, 32, 'WORLD\n 1-1')
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');

        // TIMER
        timerText = this.add.text(1030, 32, 'TIME\n' + ` ${timer}`)
            .setFontFamily('emulogic')
            .setFontSize(24).setColor('#ffffff');
    }
});