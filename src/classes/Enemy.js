import C from '../utils/constants.js';
import D from '../data/GameData.js';
import Projectile from './Projectile.js';
import { fuzzyLocation, randomInt } from '../utils/helpers.js';

export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, name, waypoints, delay) {
    const config = D.Enemy[name];
    const spawn = fuzzyLocation(waypoints[0], 10);
    super(scene, spawn.x, spawn.y, config.appearance.key);

    this.config = config;

    // Set initial state
    this.state = {
      rendered: false,
      renderdelay: delay,
      destroyed: false,

      attacktimer: 0,
      attacking: false,
      missinghealth: 0,
      level: 1,
    }

    this.updateStats();

    // Set up healthbar
    const healthbarCoordinates = this.getHealthbarCoordinates();
    this.healthbar = new Phaser.GameObjects.Rectangle(this.scene, healthbarCoordinates.x, healthbarCoordinates.y, 30, 2, 0x333333);
    this.healthbarFill = new Phaser.GameObjects.Rectangle(this.scene, healthbarCoordinates.x, healthbarCoordinates.y, 30, 2, 0xee4444);

    // Create attack range hitbox
    this.attackRange = new Phaser.GameObjects.Zone(
      this.scene,
      this.x,
      this.y,
      this.stats.attackrange * 2,
      this.stats.attackrange * 2,
    );
    // todo: standard way to define parent/child?
    this.attackRange.owner = this;

    this.waypoints = waypoints;
    this.waypointIndex = 1;
    this.destination = fuzzyLocation(this.waypoints[this.waypointIndex], 10);
    this.destinationType = C.Destination.Waypoint;
    this.destinationChanged = false;
  }

  update = (time, delta) => {
    // Don't update if destroyed
    if (this.state.destroyed) return;

    // Don't update if pending spawn
    if (this.state.renderdelay > 0) {
      this.state.renderdelay -= delta;
      return;
    }

    // Render object if unrendered
    if (!this.state.rendered) {
      this.renderToScene();
    }

    // Check for target in range
    const target = this.getBasicAttackTarget();

    // Stop moving to attack
    if (target) {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    } else {
      // Check if we've reached current destination
      if (Math.abs(this.destination.x - this.x) < 5 && Math.abs(this.destination.y - this.y) < 5) {
        // If we reached a waypoint, target the next one
        if (this.destinationType === C.Destination.Waypoint) {
          this.waypointIndex += 1;

          if (this.waypointIndex < this.waypoints.length ) {
            this.destination = fuzzyLocation(this.waypoints[this.waypointIndex], 10);
            this.destinationType = C.Destination.Waypoint;
          } else {
            // Destroy if we've reached the end
            this.state.destroyed = true;
            this.attackRange.destroy();
            this.healthbar.destroy();
            this.healthbarFill.destroy();
            this.destroy();
            return;
          }
        }
      }

      this.scene.physics.moveTo(this, this.destination.x, this.destination.y, this.stats.movespeed);
      this.attackRange.x = this.x;
      this.attackRange.y = this.y;
    }

    // Update attack timer
    this.state.attacktimer -= delta;

    // Attempt to fire basic attack if available
    if (target && this.state.attacktimer <= 0) {
      this.basicAttack(target);
    }

    // Update healthbar
    const healthbarCoordinates = this.getHealthbarCoordinates();
    this.healthbar.x = healthbarCoordinates.x;
    this.healthbar.y = healthbarCoordinates.y;
    this.healthbarFill.x = healthbarCoordinates.x;
    this.healthbarFill.y = healthbarCoordinates.y;
    this.healthbarFill.width = 30 * (1 - this.state.missinghealth / this.stats.maxhealth);

  }

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);
    this.play('goomba');

    // Add to physics
    this.scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = this.config.appearance.hitbox.width;

    // Add healthbar
    this.scene.add.existing(this.healthbar);
    this.scene.add.existing(this.healthbarFill);

    // Add attack range to scene/physics
    this.scene.add.existing(this.attackRange);
    this.scene.physics.add.existing(this.attackRange);
    this.attackRange.body.setCircle(this.stats.attackrange);

    // Add to scene groups
    this.scene.enemyHitboxes.add(this);
    this.scene.enemyRanges.add(this.attackRange);

    // Update rendered state
    this.state.rendered = true;
  }

  updateStats = () => {
    const { level } = this.state;
    const { base, scaling } = this.config;

    this.stats = {
      attackdamage: base.attackdamage + scaling.attackdamage * level,
      attackrange: base.attackrange + randomInt(15),
      attackspeed: base.attackspeed * (1 + scaling.attackspeed * level),
      movespeed: base.movespeed,
      criticalchance: 0,
      maxhealth: base.maxhealth + scaling.maxhealth * level,
      healthregen: base.healthregen + scaling.healthregen * level,
      armor: base.armor + scaling.armor * level,
      magicresist: base.magicresist + scaling.magicresist * level,
    };
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

  getBasicAttackTarget = () => {
    // Get list of Enemies in range
    const candidates = [];
    this.scene.physics.overlap(this.attackRange, this.scene.structureHitboxes, (range, target) => {
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

  getHealthbarCoordinates = () => {
    return {
      x: this.x,
      y: this.y - 15,
    };
  }
}
