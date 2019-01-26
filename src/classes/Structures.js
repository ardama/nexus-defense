import Projectile from './Projectile.js';

export class Tower extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');

    // Set base stats
    this.stats = {
      attackrange: 100,
      attackdamage: 30,
      attackspeed: 3.5,
      maxhealth: 1000,

    };

    // Set initial state
    this.state = {
      rendered: false,
      destroyed: false,
      attacktimer: 0,
    };

    // Create attack range zone
    this.attackRange = new Phaser.GameObjects.Zone(
      scene, x, y,
      this.stats.attackrange * 2,
      this.stats.attackrange * 2,
    );
    this.attackRange.owner = this;

    // Render to scene
    this.renderToScene();
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

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);
    this.play('brickTile');

    // Add to physics
    this.scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = 30;

    // Add attack range to scene/physics
    this.scene.add.existing(this.attackRange)
    this.scene.physics.add.existing(this.attackRange)
    this.attackRange.body.setCircle(towerRange);

    // Add to scene groups
    scene.structureHitboxes.add(this);
    scene.structureRanges.add(this.attackRange);

    // Update rendered state
    this.state.rendered = true;
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
