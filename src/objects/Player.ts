import { Scene, Physics } from 'phaser';
import { Crystal } from './Crystal';
import { Game } from '../scenes/Game';
import { CrystalCounter } from './CrystalCounter';

export class Player extends Physics.Arcade.Sprite {
    constructor(scene: Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

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
        if (!this.body) {
            // Guard clause to ensure physics body is available
            return;
        }

            this.setVelocity(0);
    
            if (cursorKeys.down.isDown) {
                this.setVelocityY(200);
                this.anims.play('walk-down', true);
            } else if (cursorKeys.left.isDown) {
                this.setVelocityX(-200);
                this.anims.play('walk-left', true);
            } else if (cursorKeys.right.isDown) {
                this.setVelocityX(200);
                this.anims.play('walk-right', true);
            } else if (cursorKeys.up.isDown) {
                this.setVelocityY(-200);
                this.anims.play('walk-up', true);
            } else {
                this.anims.stop();
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
        this.bounceBack(crystal);
    
        console.log('Mined ore!');
    }

    private bounceBack(crystal: Crystal): void {
        const direction = new Phaser.Math.Vector2(this.x - crystal.x, this.y - crystal.y).normalize();
        const bounceDistance = 10;
        const bounceDuration = 50;
    
        this.scene.tweens.add({
            targets: this,
            x: this.x + direction.x * bounceDistance,
            y: this.y + direction.y * bounceDistance,
            duration: bounceDuration,
            ease: 'Power2',
            yoyo: true
        });
    }
}