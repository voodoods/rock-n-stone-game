import { Scene, GameObjects } from 'phaser';

export function bounceBack(scene: Scene, target: GameObjects.Sprite, source: GameObjects.Sprite, distance: number = 10, duration: number = 50): void {
    const direction = new Phaser.Math.Vector2(target.x - source.x, target.y - source.y).normalize();

    scene.tweens.add({
        targets: target,
        x: target.x + direction.x * distance,
        y: target.y + direction.y * distance,
        duration: duration,
        ease: 'Power2',
        yoyo: true
    });
}