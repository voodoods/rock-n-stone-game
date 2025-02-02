import { Scene, Physics } from 'phaser';
import { Crystal } from './Crystal';
import { Game } from '../scenes/Game';

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
            // Spawn two more copies of the crystal
            const scene = this.scene as Game;
            const radius = 100;
            const frameSize = 80; // Size of a single frame
    
            for (let i = 0; i < 2; i++) {
                let endX, endY;
                do {
                    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
                    endX = crystal.x + radius * Math.cos(angle);
                    endY = crystal.y + radius * Math.sin(angle);
                } while (
                    endX < frameSize / 2 || 
                    endX > scene.scale.width - frameSize / 2 || 
                    endY < frameSize / 2 || 
                    endY > scene.scale.height - frameSize / 2
                );
    
                const newCrystal = scene.spawnCrystal(crystal.x, crystal.y, crystal.color, 'rawOre');
    
                // Animate the new crystal to its end position with a falling motion
                scene.tweens.add({
                    targets: newCrystal,
                    x: endX,
                    y: endY,
                    duration: 200,
                    ease: 'Bounce.easeInOut'
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