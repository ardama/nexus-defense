import Projectile from './Projectile.js';

export class Tower extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = 30;
    this.play('brickTile');

    const towerRange = 100

    this.attackRange = new Phaser.GameObjects.Zone(scene, x, y, towerRange * 2, towerRange * 2);
    this.attackRange.owner = this;
    this.scene.add.existing(this.attackRange)
    this.scene.physics.add.existing(this.attackRange)
    this.attackRange.body.setCircle(towerRange);

    this.HP = 1000;
    this.destroyed = false;

    this.damage = 30;
    this.attackspeed = 3.5;
    this.attacktimer = 0;

    scene.structureHitboxes.add(this);
    scene.structureRanges.add(this.attackRange);
  }

  update(time, delta) {
    if (this.HP <= 0 && !this.destroyed) {
      this.destroyed = true;
      this.body.destroy();
      this.attackRange.body.destroy();
    }

    if (this.attacktimer > 0) {
      this.attacktimer -= delta;
    }
  }

  attack = (target) => {
    if (this.attacktimer <= 0) {
      const projectile = new Projectile(this, target);
      this.scene.projectiles.add(projectile);
      this.attacktimer = 1000 / this.attackspeed;
    }
  }

  receiveDamage = (damage) => {
    this.HP -= damage;
    if (this.HP <= 0) {
      this.destroyed = true;
      this.attackRange.destroy();
      this.destroy();
    }
  }
}

export class Inhibitor extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');
    this.play('broken');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = 30;
    scene.structureHitboxes.add(this);

    this.destroyed = false;
    this.HP = 800;
  }

  receiveDamage = (damage) => {
    this.HP -= damage;
    if (this.HP <= 0) {
      this.destroyed = true;
      this.destroy();
    }
  }
}

export class Nexus extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');
    this.play('blockTile');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scaleX = 2;
    this.scaleY = 2;
    this.body.isCircle = true;
    this.body.width = 60;
    scene.structureHitboxes.add(this);

    this.destroyed = false;
    this.HP = 3000;

  }

  receiveDamage = (damage) => {
    this.HP -= damage;
    if (this.HP <= 0) {
      this.destroyed = true;
      this.destroy();
    }
  }
}
