import { Scene } from 'phaser';
import { Player } from './Player';
import { Crystal, CrystalColor } from './Crystal';

export class CrystalCounter {
    private scene: Scene;
    private player: Player;
    private crystals: Phaser.GameObjects.Group;
    private counters: { [key in CrystalColor]: number };
    private blueText: Phaser.GameObjects.Text;
    private greenText: Phaser.GameObjects.Text;
    private orangeText: Phaser.GameObjects.Text;

    constructor(scene: Scene, player: Player, crystals: Phaser.GameObjects.Group) {
        this.scene = scene;
        this.player = player;
        this.crystals = crystals;
        this.counters = {
            blue: 0,
            green: 0,
            orange: 0
        };

        // Set up overlap detection for collecting crystals
        this.scene.physics.add.overlap(this.player, this.crystals, this.collectCrystal, undefined, this);

        // Create text objects for the counters
        this.blueText = this.scene.add.text(this.scene.scale.width - 150, 20, 'Blue: 0', { fontSize: '20px', fill: '#0000ff' });
        this.greenText = this.scene.add.text(this.scene.scale.width - 150, 50, 'Green: 0', { fontSize: '20px', fill: '#00ff00' });
        this.orangeText = this.scene.add.text(this.scene.scale.width - 150, 80, 'Orange: 0', { fontSize: '20px', fill: '#ffa500' });
    }

    private collectCrystal(player: Player, crystal: Crystal) {
        // Check if the crystal has already been collected
        if (crystal.collected) {
            return;
        }

        // Mark the crystal as collected
        crystal.collected = true;

        // Animate the crystal being drawn to the player's position
        this.scene.tweens.add({
            targets: crystal,
            x: player.x,
            y: player.y,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                crystal.destroy();
                this.incrementCounter(crystal.color);
                this.checkGameOver();
            }
        });
    }

    private incrementCounter(color: CrystalColor) {
        this.counters[color]++;
        this.updateText(color);
    }

    private updateText(color: CrystalColor) {
        switch (color) {
            case 'blue':
                this.blueText.setText(`Blue: ${this.counters.blue}`);
                break;
            case 'green':
                this.greenText.setText(`Green: ${this.counters.green}`);
                break;
            case 'orange':
                this.orangeText.setText(`Orange: ${this.counters.orange}`);
                break;
        }
    }

    private checkGameOver() {
        if (this.crystals.countActive(true) === 0) {
            this.scene.time.delayedCall(200, () => {
                this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2, 'Game Over', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
                this.scene.physics.pause();
                this.player.setTint(0xff0000);
                this.player.anims.play('turn');
            });
        }
    }
}