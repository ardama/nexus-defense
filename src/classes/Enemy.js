import Constants from '../utils/constants.js';
import Projectile from './Projectile.js';
import { fuzzyLocation } from '../utils/helpers.js';

export class Wave {
  constructor(scene) {
    this.scene = scene;

    this.waypoints = [];
    this.createWaypoints();

    this.enemies = [];
    this.createEnemies();
  }

  createEnemies = () => {
    for (let i = 0; i < Constants.Wave.Minion.Count; i++) {
      const enemy = new Enemy(
        this.scene,
        this.waypoints,
        i * Constants.Wave.Minion.Delay,
        'tiles',
      );

      this.enemies.push(enemy);
      this.scene.enemies.add(enemy);
    }
  }

  createWaypoints = () => {
    // Choose spawn location
    let index = Math.floor(Math.random() * this.scene.spawnpoints.length)
    let waypoint = this.scene.spawnpoints[index];

    while (waypoint) {
      this.waypoints.push(waypoint);

      if (waypoint.end) {
        break;
      }

      // Choose next Waypoint
      index = Math.floor(Math.random() * waypoint.waypoints.length)
      const temp = waypoint.waypoints[index];

      // Avoid duplicates (todo: handle multi step loops)
      if (this.waypoints.indexOf(temp) === -1) {
        waypoint = temp;
      }
    }
  }
};

export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, waypoints, delay, key) {
    const spawn = fuzzyLocation(waypoints[0], 10);
    super(scene, spawn.x, spawn.y, key);
    this.play('broken');

    this.waypoints = waypoints;
    this.waypointIndex = 1;
    this.destination = fuzzyLocation(this.waypoints[this.waypointIndex], 10);
    this.destinationType = Constants.Destination.Waypoint;
    this.destinationChanged = false;

    this.render = {
      delay: delay,
      rendered: false,
    };

    this.stats = {
      speed: 100,
      maxhealth: 100,
      attackspeed: 1,
      attackdamage: 5,
      attackrange: 50,
    }

    this.state = {
      speed: this.stats.speed,
      attacktimer: 0,
      attacking: false,
      health: this.stats.maxhealth,
      destroyed: false,
    }
  }

  update = (time, delta) => {
    // Don't update if destroyed
    if (this.state.destroyed) return;

    // Don't update if pending spawn
    if (this.render.delay > 0) {
      this.render.delay -= delta;
      return;
    }

    // Configure object if unrendered
    if (!this.rendered) {
      this.rendered = true;

      // Add to scene, physics
      this.scene.add.existing(this);
      this.scene.physics.add.existing(this);

      // Adjust hitbox
      this.body.isCircle = true;
      this.body.width = 20;

      // Create attack range hitbox
      this.attackRange = new Phaser.GameObjects.Zone(
        this.scene,
        this.x,
        this.y,
        this.stats.attackrange * 2,
        this.stats.attackrange * 2,
      );
      // todo: standard way to do this?
      this.attackRange.owner = this;
      this.scene.add.existing(this.attackRange)
      this.scene.physics.add.existing(this.attackRange)
      this.attackRange.body.setCircle(this.stats.attackrange);

      // Add to scene groups
      this.scene.enemyHitboxes.add(this);
      this.scene.enemyRanges.add(this.attackRange);
    }

    // Stop moving attacking
    if (this.state.attacking) {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    } else {
      // Check if we've reached current destination
      if (Math.abs(this.destination.x - this.x) < 5 && Math.abs(this.destination.y - this.y) < 5) {
        // If we reached a waypoint, target the next one
        if (this.destinationType === Constants.Destination.Waypoint) {
          this.waypointIndex += 1;

          if (this.waypointIndex < this.waypoints.length ) {
            this.destination = fuzzyLocation(this.waypoints[this.waypointIndex], 10);
            this.destinationType = Constants.Destination.Waypoint;
          } else {
            // Destroy if we've reached the end
            this.state.destroyed = true;
            this.attackRange.destroy();
            this.destroy();
            return;
          }
        }
      }

      this.scene.physics.moveTo(this, this.destination.x, this.destination.y, this.state.speed);
      this.attackRange.x = this.x;
      this.attackRange.y = this.y;
    }

    // Update attack timer
    if (this.state.attacktimer > 0) {
      this.state.attacktimer -= delta;
    }

    // Reset attacking state
    this.state.attacking = false;
  }

  receiveDamage = (damage) => {
    this.state.health -= damage;

    // Destroy if health reaches 0
    if (this.state.health <= 0) {
      this.state.destroyed = true;
      this.attackRange.destroy();
      this.destroy();
    }
  }

  attack = (target) => {
    this.state.attacking = true;
    if (this.state.attacktimer <= 0) {
      const projectile = new Projectile(this, target);
      this.scene.projectiles.add(projectile);
      this.state.attacktimer = 1000 / this.stats.attackspeed;
    }
  }
}
