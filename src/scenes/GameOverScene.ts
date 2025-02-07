import { Scene } from 'phaser';

export class GameOverScene extends Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Add a semi-transparent dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.4); // 40% opacity
        overlay.fillRect(0, 0, width, height);

        this.add.text(width / 2, height / 2, 'Game Over', {
            fontFamily: 'Zilla Slab', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainGame'); // Replace 'MainGame' with your main game scene key
        });
    }
}