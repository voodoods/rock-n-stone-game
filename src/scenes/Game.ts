import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Crystal, CrystalColor, CrystalState } from '../objects/Crystal';
import { CrystalCounter } from '../objects/CrystalCounter';

export class Game extends Scene {
    private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
    private player!: Player;
    private crystals!: Phaser.GameObjects.Group;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private collidingCrystal: Crystal | null = null;
    private lastSpaceKeyPressTime: number = 0;
    public crystalCounter!: CrystalCounter;

    constructor() {
        super('Game');
    }

    preload() {
        Player.preloadAssets(this);
        Crystal.preloadAssets(this);
    }

    create() {
        // Set the background color to dark grey
        this.cameras.main.setBackgroundColor('#888888');

        this.player = new Player(this, 100, 100, 'dwarf');
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Define the player's spawn area as a rectangle
        const playerSpawnPadding = 50;
        const playerSpawnArea = new Phaser.Geom.Rectangle(
            this.player.x - playerSpawnPadding / 2,
            this.player.y - playerSpawnPadding / 2,
            50 + playerSpawnPadding,
            50 + playerSpawnPadding
        );

        this.crystals = this.add.group({
            classType: Phaser.Physics.Arcade.Sprite
        });

        const crystalColors: CrystalColor[] = ['blue', 'green', 'orange'];
        const numCrystals = Phaser.Math.Between(4, 10);
        const occupiedPositions: Phaser.Geom.Rectangle[] = [];
        // Define crystal dimensions

        const crystalWidth = Crystal.frameWidth;
        const crystalHeight = Crystal.frameHeight;

        for (let i = 0; i < numCrystals; i++) {
            let x: number, y: number, isInsidePlayerSpawnArea, isOccupied;
            do {
                x = Phaser.Math.Between(crystalWidth / 2, this.scale.width - crystalWidth / 2);
                y = Phaser.Math.Between(crystalHeight / 2, this.scale.height - crystalHeight / 2);        

                isInsidePlayerSpawnArea = playerSpawnArea.contains(x, y);
                isOccupied = occupiedPositions.some(pos => pos.contains(x, y));
            } while (isInsidePlayerSpawnArea || isOccupied);

            const color = Phaser.Math.RND.pick(crystalColors) as CrystalColor;
            const crystal = new Crystal(this, x, y, color);
            this.crystals.add(crystal);

            // Only apply collider to initially created crystals
            const collider = this.physics.add.collider(this.player, crystal, this.handlePlayerCrystalCollision, undefined, this);
            crystal.setCollider(collider);
        }

         // Initialize the CrystalCounter
         this.crystalCounter = new CrystalCounter(this, this.player, this.crystals);
    }

    update() {
        this.player.update(this.cursorKeys);

        const currentTime = this.time.now;
        if (this.collidingCrystal && this.spaceKey.isDown && currentTime - this.lastSpaceKeyPressTime > 500) {
            this.player.mineOre(this.collidingCrystal);
            this.lastSpaceKeyPressTime = currentTime;
        }
    }

    private handlePlayerCrystalCollision(_player: Player, crystal: Crystal) {
        if(crystal.crystalState === 'oreRock') {
            this.collidingCrystal = crystal;
        }
    }

    public collectCrystal(player: Player, crystal: Crystal) {
        // Animate the crystal being drawn to the player's position
        this.tweens.add({
            targets: crystal,
            x: player.x,
            y: player.y,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                crystal.destroy();
            }
        });
    }

    public spawnCrystal(x: number, y: number, color: CrystalColor, state: CrystalState): Crystal {
        const crystal = new Crystal(this, x, y, color);
        crystal.setFrameForState(state);
        this.crystals.add(crystal);
        return crystal;
    }
}