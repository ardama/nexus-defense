import C from '../utils/constants.js';
import D from '../utils/gamedata.js';
import Projectile from './Projectile.js';

export default class Champion extends Phaser.GameObjects.Sprite {
  constructor(scene, name, x, y, zone) {
    const config = D.Champion[name];
    super(scene, x, y, config.appearance.key);

    this.config = config;

    // Set initial state
    this.state = {
      rendered: false,
      destroyed: false,
      attacktimer: 0,
      level: 1,
      levelxp: 100,
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
    // Update attack timer
    this.state.attacktimer -= delta;

    // Attempt to fire basic attack if available
    if (this.state.attacktimer <= 0) {
      const target = this.getBasicAttackTarget();
      if (target) {
        this.basicAttack(target);
      }
    }
  }

  updateStats = () => {
    const { level } = this.state;
    const { base, scaling } = this.config;

    this.stats = {
      attackdamage: base.attackdamage + scaling.attackdamage * level,
      attackrange: base.attackrange,
      attackspeed: base.attackspeed * (1 + scaling.attackspeed * level),
      movespeed: base.movespeed,
      criticalchance: 0,
      // maxhealth: base.maxhealth,
      // healthregen: base.healthregen,
      // armor: base.armor,
      // magicresist: base.magicresist,
    };
  }

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);

    // Add to physics
    this.scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = 30;

    // Add attack range to scene/physics
    this.scene.add.existing(this.attackRange)
    this.scene.physics.add.existing(this.attackRange)
    this.attackRange.body.setCircle(this.stats.attackrange);

    // Add to scene groups
    this.scene.championHitboxes.add(this);
    this.scene.championRanges.add(this.attackRange);

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
}
