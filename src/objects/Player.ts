import { Scene, Physics } from 'phaser';
import { HealthBar } from './HealthBar';
import { Crystal } from './Crystal';
import { Game } from '../scenes/Game';
import { CrystalCounter } from './CrystalCounter';
import { Bug } from './Bug';
import { bounceBack } from '../utils/AnimationUtils';

export class Player extends Physics.Arcade.Sprite {
    public health: number;
    public attack: number;
    private attackTimer: Phaser.Time.TimerEvent | null = null;
    private healthBar: HealthBar;
    private spaceKey: Phaser.Input.Keyboard.Key;

    constructor(scene: Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        this.health = 100;
        this.attack = 10;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.healthBar = new HealthBar(scene, x - 100, y - 100); // Adjust position to be atop the player frame

        // Now it's safe to use physics-related methods
        this.initAnimations();
    }

    // Static method to load assets
    public static preloadAssets(scene: Scene): void {
        scene.load.spritesheet('dwarf', 'assets/dwarf.png', {
            frameWidth: 38,
            frameHeight: 55
        });
    }

    // Initialize animations
    private initAnimations(): void {
        // Animations
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('dwarf', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('dwarf', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('dwarf', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('dwarf', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
    }

    public update(cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys): void {
        // Handle player movement
        if (cursorKeys.left.isDown) {
            this.setVelocityX(-160);
            this.anims.play('walk-left', true);
        } else if (cursorKeys.right.isDown) {
            this.setVelocityX(160);
            this.anims.play('walk-right', true);
        } else {
            this.setVelocityX(0);
        }

        if (cursorKeys.up.isDown) {
            this.setVelocityY(-160);
            this.anims.play('walk-up', true);
        } else if (cursorKeys.down.isDown) {
            this.setVelocityY(160);
            this.anims.play('walk-down', true);
        } else {
            this.setVelocityY(0);
        }

        // Stop animation if no movement
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.anims.stop();
        }

        // Update health bar position
        this.healthBar.setHealth(this.health);
        this.healthBar.bar.setPosition(this.x - 20, this.y - 40); // Adjust position to be atop the player frame

        // Handle player attack
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            const bug = this.scene.physics.closest(this, this.scene.bugs.getChildren()) as Bug;
            if (bug && this.isFacingBug(bug)) { // Check if the player is facing the bug
                this.attackBug(bug);
            }
        }
    }

    public mineOre(crystal: Crystal): void {
        if (crystal.crystalState === 'oreRock' && crystal.canSpawnMoreCopies()) {
            const scene = this.scene as Game;
            const radius = 100;
            const frameSize = 80; // Size of a single frame
            const occupiedPositions: Phaser.Geom.Rectangle[] = [];
    
            // Add existing crystal positions to occupiedPositions
            scene.crystals.getChildren().forEach((existingCrystal: Phaser.GameObjects.GameObject) => {
                const existing = existingCrystal as Crystal;
                occupiedPositions.push(new Phaser.Geom.Rectangle(existing.x - frameSize / 2, existing.y - frameSize / 2, frameSize, frameSize));
            });
    
            for (let i = 0; i < 2; i++) {
                let endX: number, endY: number, isOccupied: boolean;
                do {
                    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
                    endX = crystal.x + radius * Math.cos(angle);
                    endY = crystal.y + radius * Math.sin(angle);
    
                    isOccupied = occupiedPositions.some(pos => pos.contains(endX, endY));
                } while (
                    endX < frameSize / 2 || 
                    endX > scene.scale.width - frameSize / 2 || 
                    endY < frameSize / 2 || 
                    endY > scene.scale.height - frameSize / 2 ||
                    isOccupied
                );
    
                const newCrystal = scene.spawnCrystal(crystal.x, crystal.y, crystal.color, 'rawOre');
                occupiedPositions.push(new Phaser.Geom.Rectangle(endX - frameSize / 2, endY - frameSize / 2, frameSize, frameSize));
    
                // Animate the new crystal to its end position with a falling motion

                scene.tweens.add({
                    targets: newCrystal,
                    x: { value: endX, duration: 500, hold: 500, ease: 'Power2' },
                    y: { value: endY, duration: 500, ease: 'Bounce.easeOut' },
                    onComplete: () => {
                        // Enable collision detection after the animation is complete
                        scene.physics.add.overlap(
                            scene.player, 
                            newCrystal, 
                            scene.handlePlayerCrystalCollision, 
                            undefined, 
                            scene
                        );
    
                        // Enable overlap detection for collecting crystals
                        const crystalCounter = this.scene.crystalCounter as CrystalCounter;
                        crystalCounter.enableOverlapDetection();
                    }
                });
            }
            crystal.incrementSpawnedCopies();
        }
    
        crystal.mine();
        bounceBack(this.scene, this, crystal);
    
        console.log('Mined ore!');

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            const bug = this.scene.physics.closest(this, this.scene.bugs.getChildren()) as Bug;
            if (bug && Phaser.Math.Distance.Between(this.x, this.y, bug.x, bug.y) < 100) { // Adjust the threshold as needed
                this.attackBug(bug);
            }
        }
    }

    public takeDamage(amount: number): void {
        // Implement the logic to reduce player's health
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        this.healthBar.setHealth((this.health / 100) * 100); // Convert to percentage
    }

    private die(): void {
        // Implement the logic for player's death
        this.health = 0; // Ensure health is set to 0
        this.setFrame(12); // Set to the 13th column (index 12)
        this.anims.stop();
        this.scene.physics.pause(); // Pause the entire physics world

        // Check if the overlay already exists
        if (!this.scene.data.get('gameOverOverlay')) {
            // Add Game Over overlay
            const { width, height } = this.scene.scale;
            const overlay = this.scene.add.graphics();
            overlay.fillStyle(0x000000, 0.4); // 40% opacity
            overlay.fillRect(0, 0, width, height);

            this.scene.add.text(width / 2, height / 2, 'Game Over', {
                fontSize: '64px',
                color: '#ffffff'
            }).setOrigin(0.5);

            // Store a flag indicating the overlay has been added
            this.scene.data.set('gameOverOverlay', true);

            this.scene.input.keyboard.once('keydown-SPACE', () => {
                this.scene.scene.restart(); // Restart the Game scene
            });
        }
    }

    public attackBug(bug: Bug): void {
        if (bug.health > 0 && this.isFacingBug(bug)) { // Ensure the bug is alive and the player is facing the bug
            bug.takeDamage(this.attack);
            this.playAttackAnimation();
            bounceBack(this.scene, bug, this);
        }
    }

    private isFacingBug(bug: Bug): boolean {
        const dx = bug.x - this.x;
        const dy = bug.y - this.y;

        if (!this.anims.currentAnim) {
            return false; // If no animation is playing, return false
        }

        switch (this.anims.currentAnim.key) {
            case 'walk-right':
                return dx > 0 && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) < 100;
            case 'walk-left':
                return dx < 0 && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) < 100;
            case 'walk-down':
                return dy > 0 && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) < 120;
            case 'walk-up':
                return dy < 0 && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) < 120;
            default:
                return false;
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
}