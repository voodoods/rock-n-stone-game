import { Scene, GameObjects } from 'phaser';

export type CrystalColor = 'blue' | 'green' | 'orange';
export enum CrystalState {
    OreRock = 'oreRock',
    OreRockHit = 'oreRockHit',
    RawOre = 'rawOre'
}

export class Crystal extends GameObjects.Sprite {
    public color: 'blue' | 'green' | 'orange';
    public crystalState: CrystalState;
    private spawnedCopies: number = 0;
    private static readonly MAX_COPIES = 2;
    private collider?: Phaser.Physics.Arcade.Collider;
    public collected: boolean = false;
    public collectable: boolean = false; // Add this line
    public static frameWidth: number = 30;
    public static frameHeight: number = 30;
    private hitCount: number = 0;

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

        this.setFrameForState(CrystalState.OreRock);
    }

    public mine(): void {
        this.hitCount++;

        if (this.hitCount === 1) {
            this.setFrameForState(CrystalState.OreRockHit);
        } else if (this.hitCount >= 2) {
            this.setFrameForState(CrystalState.RawOre);

            // Remove collision if the state is not "oreRock"
            if (this.collider && this.scene) {
                this.scene.physics.world.removeCollider(this.collider);
            }
        }
    }

    public setFrameForState(state: CrystalState): void {
        const colorOffset = this.getColorOffset(); // 0 for blue, 1 for green, 2 for orange
        let columnIndex = 0; // Default to oreRock

        this.crystalState = state;

        switch (state) {
            case CrystalState.OreRockHit:
                columnIndex = 1;
                break;
            case CrystalState.RawOre:
                columnIndex = 2;
                break;
            default:
                columnIndex = 0;
                break;
        }

        this.setFrame(colorOffset * 3 + columnIndex);
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