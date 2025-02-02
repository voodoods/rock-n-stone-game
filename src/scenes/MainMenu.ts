import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, -750, 'logo');

        this.title = this.add.text(512, 520, 'Press any key to start...', {
            fontFamily: 'Zilla Slab', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
          this.scene.start('Game');
        });

        this.tweens.add({
            targets: this.logo,
            y: 300, // Final position of the logo
            duration: 2000,
            ease: 'Bounce.easeOut'
        });

        this.tweens.add({
            targets: this.title,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            repeat: -1,
            hold: 2000,
            ease: 'Bounce.easeInOut'
        });
    }
}
