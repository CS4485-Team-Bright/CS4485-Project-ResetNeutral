export class Start extends Phaser.Scene {

    gamepad;
    keyObjects;
    comboDelta;
    currentCombo;

    constructor() {
        super('Start');
    }

    preload() {
        // Preloading Button Images
        // Directional Arrows
        this.load.image('UP_Arrow', 'assets/Up.png');
        this.load.image('DOWN_Arrow', 'assets/Down.png');
        this.load.image('LEFT_Arrow', 'assets/Left.png');
        this.load.image('RIGHT_Arrow', 'assets/Right.png');

        // Buttons
        this.load.image('A_Button', 'assets/A.png');
        this.load.image('B_Button', 'assets/B.png');
        this.load.image('X_Button', 'assets/X.png');
        this.load.image('Y_Button', 'assets/Y.png');

        // Shoulder Buttons
        this.load.image('LB_Button', 'assets/LB.png');
        this.load.image('LT_Button', 'assets/LT.png');
        this.load.image('RB_Button', 'assets/RB.png');
        this.load.image('RT_Button', 'assets/RT.png');

        // Background image
        this.load.image('background', 'assets/bg.png');

        // Default Icon Image
        this.load.image('base', 'assets/Default.png');
    }

    create() {
        //this.background = this.add.image(640, 360, 'background');

        // Setup keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();

        this.comboDelta = 0;
        this.currentCombo = [];

        this.keyObjects = this.input.keyboard.addKeys({
            up: "W",
            down: "S",
            left: "A",
            right: "D",
            a: "K",
            x: "J",
            b: "L",
            y: "I",
            rb: "SPACE",
            rt: "O",
            lb: "M",
            lt: "U",

        });

        // Setup Gamepad controls
        const text = this.add.text(10, 10, 'Press a button on the Gamepad to use', { font: '16px Courier', fill: '#00ff00' });

        this.sprite = this.add.image(640, 360, 'base');

        this.gamepad = scene.input.gamepad.getAll();

/*
        this.input.gamepad.once('down', function (pad, button, index)
        {

            text.setText(`Playing with ${pad.id}`);

            this.gamepad = pad;

        }, this);
        */
    }

    update(time, delta) {
        // Timing settings
        // Delta time in ms
        if (this.comboDelta > 500) {
            this.comboDelta = 0;
            this.currentCombo = [];
        }
        // Gamepad Controls
        if (this.gamepad)
        {
            // this.gamepad.on ('down', function (gamepad, button, value) {});
            // Directional Input using D-Pad
            if (this.gamepad.left)
            {
                this.sprite.setTexture('LEFT_Arrow');
                this.comboDelta = 0;
                this.currentCombo.push('left');
            }
            if (this.gamepad.right)
            {
                this.sprite.setTexture('RIGHT_Arrow');
                this.comboDelta = 0;
                this.currentCombo.push('right');
            }
            if (this.gamepad.up)
            {
                this.sprite.setTexture('UP_Arrow');
                this.comboDelta = 0;
                this.currentCombo.push('up');
            }
            if (this.gamepad.down)
            {
                this.sprite.setTexture('DOWN_Arrow');
                this.comboDelta = 0;
                this.currentCombo.push('down');
            }

            // Button Inputs
            if (this.gamepad.A)
            {
                this.sprite.setTexture('A_Button');
                this.comboDelta = 0;
                this.currentCombo.push('a');
                // 2XKO - Tag
                // SF6 - Light Kick
            }
            if (this.gamepad.Y)
            {
                this.sprite.setTexture('Y_Button');
                this.comboDelta = 0;
                this.currentCombo.push('y');
                // 2XKO - Medium Attack
                // SF6 - Medium Punch
            }
            if (this.gamepad.X)
            {
                this.sprite.setTexture('X_Button');
                this.comboDelta = 0;
                this.currentCombo.push('x');
                // 2XKO - Light Attack
                // SF6 - Light Punch
            }
            if (this.gamepad.B)
            {
                this.sprite.setTexture('B_Button');
                this.comboDelta = 0;
                this.currentCombo.push('b');
                // 2XKO - Heavy Attack
                // SF6 - Medium Kick
            }

            // Shoulder Buttons
            if (this.gamepad.L1)
            {
                this.sprite.setTexture('LB_Button');
                this.comboDelta = 0;
                this.currentCombo.push('lb');
                // 2XKO - Special 2
            }
            if (this.gamepad.L2)
            {
                this.sprite.setTexture('LT_Button');
                this.comboDelta = 0;
                this.currentCombo.push('lt');
            }
            if (this.gamepad.R1)
            {
                this.sprite.setTexture('RB_Button');
                this.comboDelta = 0;
                this.currentCombo.push('rb');
                // 2XKO - Special 1
                // SF6 - Heavy Punch
            }
            if (this.gamepad.R2)
            {
                this.sprite.setTexture('RT_Button');
                this.comboDelta = 0;
                this.currentCombo.push('rt');
                // 2XKO - Parry
                // SF6 - Heavy Kick
            }
        }

        // Handle keyboard input
        // this.keyObjects.on('down', function (event) { });
        if (this.keyObjects.left.isDown) {
            // Highlight Key
            this.sprite.setTexture('LEFT_Arrow');
            this.comboDelta = 0;
            this.currentCombo.push('left');
        }

        if (this.keyObjects.right.isDown) {
            // Highlight Key
            this.sprite.setTexture('RIGHT_Arrow');
            this.comboDelta = 0;
            this.currentCombo.push('right');
        }

        if (this.keyObjects.up.isDown) {
            // Highlight Key
            this.sprite.setTexture('UP_Arrow');
            this.comboDelta = 0;
            this.currentCombo.push('up');
        }

        if (this.keyObjects.down.isDown) {
            // Highlight Key
            this.sprite.setTexture('DOWN_Arrow');
            this.comboDelta = 0;
            this.currentCombo.push('down');
        }

        if (this.keyObjects.a.isDown)
        {
            this.sprite.setTexture('A_Button');
            this.comboDelta = 0;
            this.currentCombo.push('a');
        }
        if (this.keyObjects.y.isDown)
        {
            this.sprite.setTexture('Y_Button');
            this.comboDelta = 0;
            this.currentCombo.push('y');
        }
        if (this.keyObjects.x.isDown)
        {
            this.sprite.setTexture('X_Button');
            this.comboDelta = 0;
            this.currentCombo.push('x');
        }
        if (this.keyObjects.b.isDown)
        {
            this.sprite.setTexture('B_Button');
            this.comboDelta = 0;
            this.currentCombo.push('b');
        }

        if (this.keyObjects.rb.isDown)
        {
            this.sprite.setTexture('RB_Button');
            this.comboDelta = 0;
            this.currentCombo.push('rb');
        }
        if (this.keyObjects.rt.isDown)
        {
            this.sprite.setTexture('RT_Button');
            this.comboDelta = 0;
            this.currentCombo.push('rt');
        }
        if (this.keyObjects.lb.isDown)
        {
            this.sprite.setTexture('LB_Button');
            this.comboDelta = 0;
            this.currentCombo.push('lb');
        }
        if (this.keyObjects.lt.isDown)
        {
            this.sprite.setTexture('LT_Button');
            this.comboDelta = 0;
            this.currentCombo.push('lt');
        }

        // This is where the combo detection would go

        this.comboDelta += delta;
    }

}
