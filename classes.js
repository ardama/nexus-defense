import Phaser from './lib/phaser.min.js';

export class Wave {
  constructor(game) {
    this.game = game;

    this.units = [];
    this.createUnits();
  }

  createUnits = () => {
    const unit = new Enemy(this.game);
    this.units.push(unit);
  }

  update = () => {
    for (const unit of this.units) {
      unit.update();
    }
  }
};

export class Enemy {
  constructor(game) {
    this.game = game;

    this.x = 100;
    this.y = 100;
    this.r = 10;
    this.circle = new Phaser.Geom.Circle(this.x, this.y, this.r);
  }

  update = (phaser) => {
    this.circle.x += 1;
    this.circle.y += 1;
    this.game.graphics.strokeCircleShape(this.circle);
  }
}
