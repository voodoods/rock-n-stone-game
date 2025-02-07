import { Scene, Physics } from 'phaser';
import { Player } from './Player';
import { HealthBar } from './HealthBar';
import { bounceBack } from '../utils/AnimationUtils';

export class Bug extends Physics.Arcade.Sprite {
    public health: number;
    public attack: number;
    private player: Player;
    private attackTimer: Phaser.Time.TimerEvent | null = null;
    private healthBar: HealthBar;

    constructor(scene: Scene, x: number, y: number, texture: string, player: Player) {
        super(scene, x, y, texture);

        this.health = 30;
        this.attack = 5;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setImmovable(false); // Allow the bug to move

        this.healthBar = new HealthBar(scene, x - 20, y - 40); // Adjust position as needed

        this.initAnimations();
    }

    update() {
        if (this.health <= 0 || this.scene.physics.world.isPaused) {
            return; // Do not update if the bug is dead or the game is paused
        }

        // Calculate distance to the player
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);

        // If the bug is close enough to the player, stop moving and attack
        if (distance < 50) { // Adjust the threshold as needed
            this.body.setVelocity(0);
            this.anims.stop();
            this.attackPlayer();
        } else {
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

            // Stop attacking if no longer overlapping with the player
            if (this.attackTimer) {
                const bugBounds = this.getBounds();
                const playerBounds = this.player.getBounds();
                const paddedBugBounds = new Phaser.Geom.Rectangle(
                    bugBounds.x - 40,
                    bugBounds.y - 40,
                    bugBounds.width + 80,
                    bugBounds.height + 80
                );

                if (!Phaser.Geom.Intersects.RectangleToRectangle(paddedBugBounds, playerBounds)) {
                    this.attackTimer.remove();
                    this.attackTimer = null;
                }
            }
        }

        // Update health bar position
        this.healthBar.setHealth((this.health / 30) * 100); // Convert to percentage
        this.healthBar.bar.setPosition(this.x - this.width / 2, this.y - this.height); // Adjust position to be atop the bug frame
    }

    public takeDamage(amount: number): void {
        // Implement the logic to reduce bug's health
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        this.healthBar.setHealth((this.health / 30) * 100); // Convert to percentage
    }

    private die(): void {
        // Implement the logic for bug's death
        this.health = 0; // Ensure health is set to 0
        this.body.setVelocity(0); // Stop the bug's movement
        this.setFrame(0); // Set to the first frame
        this.setFlipY(true); // Flip the sprite upside down
        this.anims.stop();
        this.scene.physics.world.remove(this.body);
        this.healthBar.bar.destroy(); // Remove the health bar

        // Fade out the bug after 5 seconds
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 2000,
            delay: 5000,
            onComplete: () => {
                this.destroy(); // Remove the bug from the scene
            }
        });
    }

    private attackPlayer() {
        if (!this.attackTimer) {
            this.attackTimer = this.scene.time.addEvent({
                delay: 1000, // Attack every second
                callback: () => {
                    if (this.health > 0 && !this.scene.physics.world.isPaused) { // Check if the bug is alive and the game is not paused
                        const bugBounds = this.getBounds();
                        const playerBounds = this.player.getBounds();
                        const paddedBugBounds = new Phaser.Geom.Rectangle(
                            bugBounds.x - 40,
                            bugBounds.y - 40,
                            bugBounds.width + 80,
                            bugBounds.height + 80
                        );

                        if (Phaser.Geom.Intersects.RectangleToRectangle(paddedBugBounds, playerBounds)) {
                            this.player.takeDamage(this.attack);
                            this.playAttackAnimation();
                            bounceBack(this.scene, this.player, this);
                            bounceBack(this.scene, this, this.player);
                        } else {
                            this.attackTimer?.remove();
                            this.attackTimer = null;
                        }
                    } else {
                        this.attackTimer?.remove();
                        this.attackTimer = null;
                    }
                },
                callbackScope: this,
                loop: true
            });
        }
    }

    private playAttackAnimation() {
        // Play attack animation here
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
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