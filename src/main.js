import 'phaser';
import TowerDefenseScene from './scenes/TowerDefenseScene';
import GameScene from './scenes/GameScene';
import TitleScene from './scenes/TitleScene';

const config = {
  // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
  type: Phaser.AUTO,
  pixelArt: true,
  roundPixels: true,
  parent: 'content',
  width: 1000,
  height: 1000,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  scene: [
    TowerDefenseScene,
  ],
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
