import { Scene, GameObjects } from 'phaser';

export type CrystalColor = 'blue' | 'green' | 'orange';
export type CrystalState = 'rawOre' | 'oreRock' | 'castOreBar';

export class Crystal extends GameObjects.Sprite {
    public color: 'blue' | 'green' | 'orange';
    public crystalState: CrystalState;
    private spawnedCopies: number = 0;
    private static readonly MAX_COPIES = 2;
    private collider?: Phaser.Physics.Arcade.Collider;
    public collected: boolean = false;
    public static frameWidth: number = 80;
    public static frameHeight: number = 80;

    public static preloadAssets(scene: Scene): void {
        scene.load.spritesheet('crystals', 'assets/crystals.png', {
            frameWidth: this.frameWidth,
            frameHeight: this.frameHeight,
        });
    }

    constructor(scene: Scene, x: number, y: number, color: CrystalColor) {
        super(scene, x, y, 'crystals');
        this.color = color;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.immovable = true;

        const scaleFactor = 35 / 80;
        this.setScale(scaleFactor);

        this.setFrameForState('oreRock');
    }

    public mine(): void {
        this.setFrameForState('rawOre');

        // Remove collision if the state is not "oreRock"
        if (this.collider && this.scene) {
            this.scene.physics.world.removeCollider(this.collider);
        }
    }

    public cast(): void {
        this.setFrameForState('castOreBar');
    }

    public setFrameForState(state: CrystalState): void {
        const colorOffset = this.getColorOffset(); // 0 for blue, 1 for green, 2 for orange
        let columnIndex = 0; // Default to oreRock

        this.crystalState = state;

        switch (state) {
            case 'rawOre':
                columnIndex = 1;
                break;
            case 'castOreBar':
                columnIndex = 2;
                break;
            default:
                columnIndex = 0;
        }

        // Calculate the frame index based on the new layout
        const frameIndex = colorOffset * 3 + columnIndex;
        this.setFrame(frameIndex);
    }

    private getColorOffset(): number {
        switch (this.color) {
            case 'blue':
                return 0;
            case 'green':
                return 1;
            case 'orange':
                return 2;
            default:
                return 0; // Default to blue if for some reason the color is outside the expected values
        }
    }

    public canSpawnMoreCopies(): boolean {
        return this.spawnedCopies < Crystal.MAX_COPIES;
    }

    public incrementSpawnedCopies(): void {
        this.spawnedCopies++;
    }

    public setCollider(collider: Phaser.Physics.Arcade.Collider): void {
        this.collider = collider;
    }
}