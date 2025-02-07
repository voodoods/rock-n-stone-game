import { Scene, GameObjects } from 'phaser';

export class HealthBar {
    private bar: GameObjects.Graphics;
    private x: number;
    private y: number;
    private value: number;
    private p: number;

    constructor(scene: Scene, x: number, y: number) {
        this.bar = new GameObjects.Graphics(scene);
        this.x = x;
        this.y = y;
        this.value = 100;
        this.p = 38 / 100; // Adjusted for half size

        this.draw();

        scene.add.existing(this.bar);
    }

    decrease(amount: number) {
        this.value -= amount;

        if (this.value < 0) {
            this.value = 0;
        }

        this.draw();
    }

    setHealth(value: number) {
        this.value = value;

        if (this.value < 0) {
            this.value = 0;
        } else if (this.value > 100) {
            this.value = 100;
        }

        this.draw();
    }

    private draw() {
        this.bar.clear();

        /*
        if (this.value === 100) {
            return; // Do not draw the health bar if the value is 100%
        }
            */

        // Background
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 40, 8); // Adjusted for half size

        // Health bar
        let color: number;
        if (this.value < 25) {
            color = 0xff0000; // Red
        } else if (this.value < 50) {
            color = 0xff8c00; // Dark Orange
        } else if (this.value < 75) {
            color = 0xffd700; // Light Orange
        } else {
            color = 0x00ff00; // Green
        }

        this.bar.fillStyle(color);
        this.bar.fillRect(this.x + 1, this.y + 1, this.value * this.p, 6); // Adjusted for half size
    }
}