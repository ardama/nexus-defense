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
    if (this.state.attacktimer > 0) {
      this.state.attacktimer -= delta;
    }
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

  basicAttack = (target) => {
    // Create Projectile onHit callback
    const damage = this.stats.attackdamage;
    const onHit = (projectile) => {
      projectile.target.receiveDamage(damage);
    }
    
    if (this.state.attacktimer <= 0) {
      const projectile = new Projectile(this, target, onHit);
      this.scene.projectiles.add(projectile);
      this.state.attacktimer = 1000 / this.stats.attackspeed;
    }
  }

  receiveDamage = (damage) => {
    this.state.missinghealth += damage;

    // Destroy if health reaches 0
    if (this.state.missinghealth >= this.stats.maxhealth) {
      this.state.destroyed = true;
      this.attackRange.destroy();
      this.destroy();
    }
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
    
    // Render to scene
    this.renderToScene();
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
    
    // Add to scene groups
    this.scene.structureHitboxes.add(this);
  }

  receiveDamage = (damage) => {
    this.state.missinghealth += damage;

    // Destroy if health reaches 0
    if (this.state.missinghealth >= this.stats.maxhealth) {
      this.state.destroyed = true;
      this.destroy();
    }
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
    
    // Render to scene
    this.renderToScene();
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
    
    // Add to scene groups
    this.scene.structureHitboxes.add(this);
  }

  receiveDamage = (damage) => {
    this.state.missinghealth += damage;

    // Destroy if health reaches 0
    if (this.state.missinghealth >= this.stats.maxhealth) {
      this.state.destroyed = true;
      this.destroy();
    }
  }
}
