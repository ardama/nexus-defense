

export class Tower extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = 30;
    // (30, 0, 0);
    this.play('brickTile');

    const towerRange = 100

    this.attackRange = new Phaser.GameObjects.Zone(scene, x, y, towerRange * 2, towerRange * 2);
    this.scene.add.existing(this.attackRange)
    this.scene.physics.add.existing(this.attackRange)
    this.attackRange.body.setCircle(towerRange);

    this.HP = 1000;
    this.prevHP = this.HP;
    this.destroyed = false;
  }

  update() {
    if (this.prevHP !== this.HP) {
      console.log("HP:", this.HP);
      this.prevHP = this.HP;
    }

    if (this.HP <= 0 && !this.destroyed) {
      this.destroyed = true;
      this.body.destroy();
      this.attackRange.body.destroy();
    }
  }
}

export class Inhibitor extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');
    this.play('broken');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

  }
}

export class Nexus extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');
    this.play('blockTile');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.scaleX = 2;
    this.scaleY = 2;

  }
}
