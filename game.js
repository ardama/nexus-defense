import Constants from './constants.js';
import { Wave } from './classes.js';
import Phaser from './lib/phaser.min.js';

export const init = () => {
  const game = new Game();
}

class Game {
  constructor() {
    const self = this;

    const config = {
        type: Phaser.AUTO,
        parent: 'game',
        width: 800,
        height: 800,
        scene: {
            key: 'main',
            preload: function() { self.preload(this); },
            create: function() { self.create(this); },
            update: function() { self.update(this); },
        }
    };

    this.game = new Phaser.Game(config);
  }

  preload = (phaser) => {
    this.phaser = phaser;
    this.graphics = phaser.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xff00ff } });
  }

  create = () => {
    this.startTime = Date.now();
    this.lastFrameTime = this.startTime;

    this.createAllies();
    this.createEnemies();
  }

  update = () => {
    this.graphics.clear();
    this.frameTime = Date.now();
    this.frameDuration = this.frameTime - this.lastFrameTime;

    this.updateAllies();
    this.updateEnemies();

    this.lastFrameTime = this.frameTime;
  }

  createAllies = () => {
  }

  createEnemies = () => {
    this.waves = [];
    this.nextWaveTime = Constants.Game.WaveTime;
  }

  updateAllies = () => {
  }

  updateEnemies = () => {
    this.nextWaveTime -= this.frameDuration;

    if (this.nextWaveTime <= 0) {
      this.createWave();
      this.nextWaveTime = Constants.Game.WaveTime;
    }

    for (const wave of this.waves) {
      wave.update();
    }
  }

  createWave = (phaser) => {
    const wave = new Wave(this);
    this.waves.push(wave);
  }
}
