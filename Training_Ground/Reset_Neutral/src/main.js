import { Start } from './scenes/Start.js';

const config = {
    type: Phaser.AUTO,
    title: 'Reset Neutral - Training Grounds',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#028af8',
    pixelArt: true,
    input: {
        gamepad: true
    },
    scene: [
        Start
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            