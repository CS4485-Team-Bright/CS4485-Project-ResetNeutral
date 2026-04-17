export const comboSet = new Map();

comboSet.set("down_up_", "super jump");
comboSet.set("right_right_", "side dash");
comboSet.set("x_y_", "chain dash");
comboSet.set("left_left_", "side dash");
comboSet.set("left_x_y_", "side dash");
comboSet.set("right_x_y_", "side dash");
comboSet.set("x", "normal");
comboSet.set("y", "normal");
comboSet.set("b", "normal");
comboSet.set("down_b_", "down air");
comboSet.set("lt_", "special 1");
comboSet.set("rt_", "special 2");
comboSet.set("y_b_", "throw");
comboSet.set("left_y_b_", "air ok");

export class Start extends Phaser.Scene {

    gamepad;
    keyObjects;
    comboDelta = 0;
    currentCombo = "_";

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

    keyboardListener(event){
        console.log('Key pressed: ', event.key);
        console.log("ComboDelta: ", this.comboDelta);
        this.comboDelta = 0;
        //this.currentCombo.push(event.key);

        switch(event.key){
            case "w":
                this.currentCombo += "up_";
                break;
            case "s":
                this.currentCombo += "down_";
                break;
            case "a":
                this.currentCombo += "left_";
                break;
            case "d":
                this.currentCombo += "right_";
                break;
            case "k":
                this.currentCombo += "a_";
                break;
            case "j":
                this.currentCombo += "x_";
                break;
            case "l":
                this.currentCombo += "b_";
                break;
            case "i":
                this.currentCombo += "y_";
                break;
            case " ":
                this.currentCombo += "rb_";
                break;
            case "o":
                this.currentCombo += "rt_";
                break;
            case "m":
                this.currentCombo += "lb_";
                break;
            case "u":
                this.currentCombo += "lt_";
                break;
            default:
                break;
        }

        console.log("Current Combo: ", this.currentCombo);
    }

    gamepadListener(gamepad, button, value){
        //console.log('Gamepad: ', gamepad);
        console.log('Button: ', button);
        console.log('Button Index: ', button.index);
        //console.log('Value: ', value);

        this.comboDelta = 0;

        switch(button.index){
            case 0:
                this.currentCombo += "a_";
                break;
            case 1:
                this.currentCombo += "b_";
                break;
            case 2:
                this.currentCombo += "x_";
                break;
            case 3:
                this.currentCombo += "y_";
                break;
            case 4:
                this.currentCombo += "lb_";
                break;
            case 5:
                this.currentCombo += "rb_";
                break;
            case 6:
                this.currentCombo += "lt_";
                break;
            case 7:
                this.currentCombo += "rt_";
                break;
            case 12:
                this.currentCombo += "up_";
                break;
            case 13:
                this.currentCombo += "down_";
                break;
            case 14:
                this.currentCombo += "left_";
                break;
            case 15:
                this.currentCombo += "right_";
                break;
            default:
                break;
        }

        console.log("Current Combo: ", this.currentCombo);
        console.log("ComboDelta: ", this.comboDelta);
    }

    create() {
        //this.background = this.add.image(640, 360, 'background');

        // Setup keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();

        this.comboDelta = 0;
        this.currentCombo = "";

        // Setup Gamepad controls
        const text = this.add.text(10, 10, 'Press a button on the Gamepad to use', { font: '16px Courier', fill: '#00ff00' });

        //this.sprite = this.add.image(640, 360, 'base');

        this.gamepad = this.input.gamepad.getAll();

        if(this.gamepad){
            this.input.gamepad.on('down', this.gamepadListener, this);
        }

        this.input.keyboard.on('keydown', this.keyboardListener, this);
    }

    update(time, delta) {
        // Timing settings
        // Delta time in ms
        if (this.comboDelta > 500) {
            this.comboDelta = 0;
            this.currentCombo = "";
        }

        if(comboSet.has(this.currentCombo)){
            console.log(comboSet.get(this.currentCombo))
        }

        this.comboDelta += delta;
    }
}
