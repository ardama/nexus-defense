import Projectile from './Projectile.js';

export class Tower extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');

    // Set initial state
    this.state = {
      rendered: false,
      destroyed: false,
      attacktimer: 0,
      missinghealth: 0,
    };

    this.updateStats();

    // Set up healthbar
    const healthbarCoordinates = this.getHealthbarCoordinates();
    this.healthbar = new Phaser.GameObjects.Rectangle(this.scene, healthbarCoordinates.x, healthbarCoordinates.y, 30, 2, 0x333333);
    this.healthbarFill = new Phaser.GameObjects.Rectangle(this.scene, healthbarCoordinates.x, healthbarCoordinates.y, 30, 2, 0x00bb44);

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
    // Update attack timer
    this.state.attacktimer -= delta;

    // Attempt to fire basic attack if available
    if (this.state.attacktimer <= 0) {
      const target = this.getBasicAttackTarget();
      if (target) {
        this.basicAttack(target);
      }
    }

    // Update healthbar
    const healthbarCoordinates = this.getHealthbarCoordinates();
    this.healthbar.x = healthbarCoordinates.x;
    this.healthbar.y = healthbarCoordinates.y;
    this.healthbarFill.x = healthbarCoordinates.x;
    this.healthbarFill.y = healthbarCoordinates.y;
    this.healthbarFill.width = 30 * (1 - this.state.missinghealth / this.stats.maxhealth);
  }

  updateStats = () => {
    this.stats = {
      attackrange: 100,
      attackdamage: 30,
      attackspeed: 3.5,
      maxhealth: 1000,
    };
  }

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);
    this.play('brickTile');

    // Add to physics
    this.scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = 30;

    // Add healthbar
    this.scene.add.existing(this.healthbar);
    this.scene.add.existing(this.healthbarFill);

    // Add attack range to scene/physics
    this.scene.add.existing(this.attackRange)
    this.scene.physics.add.existing(this.attackRange)
    this.attackRange.body.setCircle(this.stats.attackrange);

    // Add to scene groups
    this.scene.structureHitboxes.add(this);
    this.scene.structureRanges.add(this.attackRange);

    // Update rendered state
    this.state.rendered = true;
  }

  getBasicAttackTarget = () => {
    // Get list of Enemies in range
    const candidates = [];
    this.scene.physics.overlap(this.attackRange, this.scene.enemyHitboxes, (range, target) => {
      candidates.push(target);
    });

    // Select first one
    return candidates.length ? candidates[0] : null;
  }

  basicAttack = (target) => {
    // Create Projectile onHit callback
    const damage = this.stats.attackdamage;
    const onHit = (projectile) => {
      projectile.target.receiveDamage(damage);
    }

    const projectile = new Projectile(this, target, onHit);
    this.scene.projectiles.add(projectile);
    this.state.attacktimer = 1000 / this.stats.attackspeed;
  }

  receiveDamage = (damage) => {
    this.state.missinghealth += damage;

    // Destroy if health reaches 0
    if (this.state.missinghealth >= this.stats.maxhealth) {
      this.state.destroyed = true;
      this.attackRange.destroy();
      this.healthbar.destroy();
      this.healthbarFill.destroy();
      this.destroy();
    }
  }

  getHealthbarCoordinates = () => {
    return {
      x: this.x,
      y: this.y - 15,
    };
  }
}

export class Inhibitor extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');

    // Set initial state
    this.state = {
      rendered: false,
      destroyed: false,
      missinghealth: 0,
    };

    this.updateStats();

    // Set up healthbar
    const healthbarCoordinates = this.getHealthbarCoordinates();
    this.healthbar = new Phaser.GameObjects.Rectangle(this.scene, healthbarCoordinates.x, healthbarCoordinates.y, 30, 2, 0x333333);
    this.healthbarFill = new Phaser.GameObjects.Rectangle(this.scene, healthbarCoordinates.x, healthbarCoordinates.y, 30, 2, 0x00bb44);

    // Render to scene
    this.renderToScene();
  }

  update(time, delta) {
    // Update healthbar
    const healthbarCoordinates = this.getHealthbarCoordinates();
    this.healthbar.x = healthbarCoordinates.x;
    this.healthbar.y = healthbarCoordinates.y;
    this.healthbarFill.x = healthbarCoordinates.x;
    this.healthbarFill.y = healthbarCoordinates.y;
    this.healthbarFill.width = 30 * (1 - this.state.missinghealth / this.stats.maxhealth);
  }

  updateStats = () => {
    this.stats = {
      maxhealth: 3000,
    }
  }

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);
    this.play('broken');

    // Add to physics
    this.scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = 30;

    // Add healthbar
    this.scene.add.existing(this.healthbar);
    this.scene.add.existing(this.healthbarFill);

    // Add to scene groups
    this.scene.structureHitboxes.add(this);
  }

  receiveDamage = (damage) => {
    this.state.missinghealth += damage;

    // Destroy if health reaches 0
    if (this.state.missinghealth >= this.stats.maxhealth) {
      this.state.destroyed = true;
      this.healthbar.destroy();
      this.healthbarFill.destroy();
      this.destroy();
    }
  }

  getHealthbarCoordinates = () => {
    return {
      x: this.x,
      y: this.y - 15,
    };
  }
}

export class Nexus extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles');

    // Set initial state
    this.state = {
      rendered: false,
      destroyed: false,
      missinghealth: 0,
    };

    this.updateStats();

    // Set up healthbar
    const healthbarCoordinates = this.getHealthbarCoordinates();
    this.healthbar = new Phaser.GameObjects.Rectangle(this.scene, healthbarCoordinates.x, healthbarCoordinates.y, 30, 2, 0x333333);
    this.healthbarFill = new Phaser.GameObjects.Rectangle(this.scene, healthbarCoordinates.x, healthbarCoordinates.y, 30, 2, 0x00bb44);

    // Render to scene
    this.renderToScene();
  }

  update(time, delta) {
    // Update healthbar
    const healthbarCoordinates = this.getHealthbarCoordinates();
    this.healthbar.x = healthbarCoordinates.x;
    this.healthbar.y = healthbarCoordinates.y;
    this.healthbarFill.x = healthbarCoordinates.x;
    this.healthbarFill.y = healthbarCoordinates.y;
    this.healthbarFill.width = 30 * (1 - this.state.missinghealth / this.stats.maxhealth);
  }

  updateStats = () => {
    this.stats = {
      maxhealth: 3000,
    }
  }

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);
    this.play('blockTile');
    this.scaleX = 2;
    this.scaleY = 2;

    // Add to physics
    this.scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = 30;

    // Add healthbar
    this.scene.add.existing(this.healthbar);
    this.scene.add.existing(this.healthbarFill);

    // Add to scene groups
    this.scene.structureHitboxes.add(this);
  }

  receiveDamage = (damage) => {
    this.state.missinghealth += damage;

    // Destroy if health reaches 0
    if (this.state.missinghealth >= this.stats.maxhealth) {
      this.state.destroyed = true;
      this.healthbar.destroy();
      this.healthbarFill.destroy();
      this.destroy();
    }
  }

  getHealthbarCoordinates = () => {
    return {
      x: this.x,
      y: this.y - 15,
    };
  }
}
