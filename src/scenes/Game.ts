import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Crystal, CrystalColor, CrystalState } from '../objects/Crystal';
import { CrystalCounter } from '../objects/CrystalCounter';
import { Bug } from '../objects/Bug';

export class Game extends Scene {
    private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
    private player!: Player;
    private crystals!: Phaser.GameObjects.Group;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private collidingCrystal: Crystal | null = null;
    private lastSpaceKeyPressTime: number = 0;
    public crystalCounter!: CrystalCounter;
    public bugs!: Phaser.Physics.Arcade.Group;

    constructor() {
        super({ key: 'Game' });
    }

    preload() {
        Player.preloadAssets(this);
        Crystal.preloadAssets(this);
        Bug.preloadAssets(this);
    }

    create() {
        // Set the background color to dark grey
        this.cameras.main.setBackgroundColor('#888888');

        this.player = new Player(this, 100, 100, 'dwarf');
        this.cursorKeys = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

            // Add the new crystal's position to the occupied positions list
            occupiedPositions.push(new Phaser.Geom.Rectangle(x - crystalWidth / 2, y - crystalHeight / 2, crystalWidth, crystalHeight));

            // Only apply collider to initially created crystals
            const collider = this.physics.add.collider(this.player, crystal, this.handlePlayerCrystalCollision, undefined, this);
            crystal.setCollider(collider);
        }

        // Initialize the CrystalCounter
        this.crystalCounter = new CrystalCounter(this, this.player, this.crystals);
        // Create a physics group for bugs
        this.bugs = this.physics.add.group({
            classType: Bug,
            runChildUpdate: true
        });

        // Add bugs to the group
        this.bugs.add(new Bug(this, 200, 200, 'bug', this.player));
        this.bugs.add(new Bug(this, 300, 300, 'bug', this.player));

        // Set up collisions
        this.physics.add.collider(this.player, this.bugs, this.handlePlayerBugCollision, undefined, this);
        this.physics.add.collider(this.bugs, this.bugs); // Add collision between bugs
        this.physics.add.collider(this.bugs, this.crystals, this.handleBugCrystalCollision, undefined, this);
    }

    update() {
        this.player.update(this.cursorKeys);

        const currentTime = this.time.now;
        if (this.collidingCrystal && this.spaceKey.isDown && currentTime - this.lastSpaceKeyPressTime > 500) {
            this.player.mineOre(this.collidingCrystal);
            this.lastSpaceKeyPressTime = currentTime;
        }
    
        // Update each bug
        this.bugs.children.iterate((bug: Bug) => {
            bug.update();
        });
    }

    private handlePlayerCrystalCollision(_player: Player, crystal: Crystal) {
        if(crystal.crystalState === CrystalState.OreRock) {
            this.collidingCrystal = crystal;
        }
    }

    private spawnBugs() {
        const bugCount = Phaser.Math.Between(3, 6);
        const edge = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
    
        for (let i = 0; i < bugCount; i++) {
            let x: number, y: number;
    
            switch (edge) {
                case 0: // Top edge
                    x = Phaser.Math.Between(0, this.scale.width);
                    y = 0;
                    break;
                case 1: // Right edge
                    x = this.scale.width;
                    y = Phaser.Math.Between(0, this.scale.height);
                    break;
                case 2: // Bottom edge
                    x = Phaser.Math.Between(0, this.scale.width);
                    y = this.scale.height;
                    break;
                case 3: // Left edge
                    x = 0;
                    y = Phaser.Math.Between(0, this.scale.height);
                    break;
            }
    
            const bug = new Bug(this, x, y, 'bug', this.player);
            bug.setImmovable(true); // Make the bug immovable
            this.bugs.add(bug);
        }
    }
}