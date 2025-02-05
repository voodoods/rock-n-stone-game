import { Scene, Physics } from 'phaser';
import { Player } from './Player';

export class Bug extends Physics.Arcade.Sprite {
    public health: number;
    public attack: number;
    private player: Player;

    constructor(scene: Scene, x: number, y: number, texture: string, player: Player) {
        super(scene, x, y, texture);

        this.health = 30;
        this.attack = 5;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setImmovable(true); // Make the bug immovable

        this.initAnimations();
    }

    update() {
        // Calculate distance to the player
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);

        // If the bug is close enough to the player, stop moving
        if (distance < 50) { // Adjust the threshold as needed
            this.body.setVelocity(0);
            this.anims.stop();
            return;
        }

        // Move towards the player's position
        this.scene.physics.moveToObject(this, this.player, 100); // Adjust speed as needed

        // Determine direction and play corresponding animation
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                this.anims.play('walk-right', true);
            } else {
                this.anims.play('walk-left', true);
            }
        } else {
            if (dy > 0) {
                this.anims.play('walk-down', true);
            } else {
                this.anims.play('walk-up', true);
            }
        }
    }

    // Static method to load assets
    public static preloadAssets(scene: Scene): void {
        scene.load.spritesheet('bug', 'assets/bug.png', {
            frameWidth: 36,
            frameHeight: 36
        });
    }

    // Initialize animations
    private initAnimations(): void {
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('bug', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('bug', { start: 5, end: 9 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('bug', { start: 10, end: 14 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('bug', { start: 15, end: 19 }),
            frameRate: 10,
            repeat: -1
        });
    }
}