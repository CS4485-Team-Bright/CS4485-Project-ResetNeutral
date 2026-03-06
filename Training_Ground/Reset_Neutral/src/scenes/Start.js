export class Start extends Phaser.Scene {

    gamepad;
    keyObjects;

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

/*
        this.input.gamepad.once('down', function (pad, button, index)
        {

            text.setText(`Playing with ${pad.id}`);

            this.gamepad = pad;

        }, this);
        */
    }

    update(time, delta) {
        // Gamepad Controls
        if (this.gamepad)
        {
            // Directional Input using D-Pad
            if (this.gamepad.left)
            {
                this.sprite.setTexture('LEFT_Arrow');
            }
            if (this.gamepad.right)
            {
                this.sprite.setTexture('RIGHT_Arrow');
            }
            if (this.gamepad.up)
            {
                this.sprite.setTexture('UP_Arrow');
            }
            if (this.gamepad.down)
            {
                this.sprite.setTexture('DOWN_Arrow');
            }

            // Button Inputs
            if (this.gamepad.A)
            {
                this.sprite.setTexture('A_Button');
                // 2XKO - Tag
                // SF6 - Light Kick
            }
            if (this.gamepad.Y)
            {
                this.sprite.setTexture('Y_Button');
                // 2XKO - Medium Attack
                // SF6 - Medium Punch
            }
            if (this.gamepad.X)
            {
                this.sprite.setTexture('X_Button');
                // 2XKO - Light Attack
                // SF6 - Light Punch
            }
            if (this.gamepad.B)
            {
                this.sprite.setTexture('B_Button');
                // 2XKO - Heavy Attack
                // SF6 - Medium Kick
            }

            // Shoulder Buttons
            if (this.gamepad.L1)
            {
                this.sprite.setTexture('LB_Button');
                // 2XKO - Special 2
            }
            if (this.gamepad.L2)
            {
                this.sprite.setTexture('LT_Button');
            }
            if (this.gamepad.R1)
            {
                this.sprite.setTexture('RB_Button');
                // 2XKO - Special 1
                // SF6 - Heavy Punch
            }
            if (this.gamepad.R2)
            {
                this.sprite.setTexture('RT_Button');
                // 2XKO - Parry
                // SF6 - Heavy Kick
            }
        }

        // Handle keyboard input
        if (this.keyObjects.left.isDown) {
            // Highlight Key
            this.sprite.setTexture('LEFT_Arrow');
        }

        if (this.keyObjects.right.isDown) {
            // Highlight Key
            this.sprite.setTexture('RIGHT_Arrow');
        }

        if (this.keyObjects.up.isDown) {
            // Highlight Key
            this.sprite.setTexture('UP_Arrow');
        }

        if (this.keyObjects.down.isDown) {
            // Highlight Key
            this.sprite.setTexture('DOWN_Arrow');
        }

        if (this.keyObjects.a.isDown)
        {
            this.sprite.setTexture('A_Button');
        }
        if (this.keyObjects.y.isDown)
        {
            this.sprite.setTexture('Y_Button');
        }
        if (this.keyObjects.x.isDown)
        {
            this.sprite.setTexture('X_Button');
        }
        if (this.keyObjects.b.isDown)
        {
            this.sprite.setTexture('B_Button');
        }

        if (this.keyObjects.rb.isDown)
        {
            this.sprite.setTexture('RB_Button');
        }
        if (this.keyObjects.rt.isDown)
        {
            this.sprite.setTexture('RT_Button');
        }
        if (this.keyObjects.lb.isDown)
        {
            this.sprite.setTexture('LB_Button');
        }
        if (this.keyObjects.lt.isDown)
        {
            this.sprite.setTexture('LT_Button');
        }
    }
    
}

