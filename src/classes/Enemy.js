import Constants from '../helpers/constants.js';
import Projectile from './Projectile.js';

export class Wave {
  constructor(scene) {
    this.scene = scene;

    this.waypoints = [];
    this.createWaypoints();

    this.units = [];
    this.createUnits();
  }

  createUnits = () => {
    for (let i = 0; i < Constants.Wave.Minion.Count; i++) {
      const unit = new Enemy(
        this.scene,
        this.waypoints,
        i * Constants.Wave.Minion.Delay,
        'tiles'
      );
      this.units.push(unit);
    }
  }

  createWaypoints = () => {
    const firstIndex = Math.floor(Math.random() * this.scene.startWaypoints.length)
    let waypoint = this.scene.startWaypoints[firstIndex];
    while (waypoint) {
      this.waypoints.push(waypoint);
      if (!waypoint.end) {
        const nextIndex = Math.floor(Math.random() * waypoint.nextWaypoints.length)
        const tempWaypoint = waypoint.nextWaypoints[nextIndex];
        if (this.waypoints.indexOf(tempWaypoint) === -1) {
          waypoint = waypoint.nextWaypoints[nextIndex];
        }
      } else {
        waypoint = null;
      }
    }
  }

  update = (time, delta) => {
    for (const unit of this.units) {
      unit.update(time, delta);
    }
  }
};

export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, waypoints, delay, key) {
    const xOffset = Math.floor(Math.random() * 20) - 10;
    const yOffset = Math.floor(Math.random() * 20) - 10;
    super(scene, waypoints[0].x + xOffset, waypoints[0].y + yOffset, key);
    this.play('broken');

    this.delay = delay;
    this.waiting = true;

    this.waypoints = waypoints;
    this.waypointIndex = 1;
    this.destination = this.waypoints[this.waypointIndex];
    this.setComputedDestination(this.destination);
    this.destinationType = Constants.Destination.Waypoint;
    this.destinationChanged = false;

    this.isAttacking = false;

    this.baseSpeed = 100;
    this.tempSpeed = this.baseSpeed;

    this.destroyed = false;

    this.attackspeed = 1;
    this.attacktimer = 0;
    this.damage = 5;
    this.HP = 100;

    // this.circle = new Phaser.Geom.Circle(900, 100, this.r);
    // this.body = new Phaser.Physics.Arcade.Body(this.scene.physics.world, this.circle);
    // this.circle = this.scene.add.sprite(this.waypoints[0].x, this.waypoints[0].y, 10);
  }

  update = (time, delta) => {
    if (this.destroyed) {
      return;
    } else if (this.delay > 0) {
      this.delay -= delta;
      return;
    } else if (this.waiting) {
      this.waiting = false;
      this.scene.add.existing(this);
      this.scene.physics.add.existing(this);

      this.body.isCircle = true;
      this.body.width = 20;

      const range = 50;
      this.attackRange = new Phaser.GameObjects.Zone(this.scene, this.x, this.y, range * 2, range * 2);
      this.attackRange.owner = this;
      this.scene.add.existing(this.attackRange)
      this.scene.physics.add.existing(this.attackRange)
      this.attackRange.body.setCircle(range);

      this.scene.enemyHitboxes.add(this);
      this.scene.enemyRanges.add(this.attackRange);

    }

    // stop moving if finished or attacking
    if (this.isAttacking) {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    } else {
      // check if we've reached current destination
      if (Math.abs(this.computedDestination.x - this.x) < 5 && Math.abs(this.computedDestination.y - this.y) < 5) {
        // if we reached a waypoint, target the next one
        if (this.destinationType === Constants.Destination.Waypoint) {
          this.waypointIndex += 1;

          if (this.waypointIndex < this.waypoints.length ) {
            this.setComputedDestination(this.waypoints[this.waypointIndex]);
            this.destinationType = Constants.Destination.Waypoint;
          } else {
            this.destroyed = true;
            this.attackRange.destroy();
            this.destroy();
            return;
          }
        }
      }

      this.scene.physics.moveTo(this, this.computedDestination.x, this.computedDestination.y, this.tempSpeed);
      this.attackRange.x = this.x;
      this.attackRange.y = this.y;
    }

    if (this.attacktimer > 0) {
      this.attacktimer -= delta;
    }
    this.isAttacking = false;
  }

  receiveDamage = (damage) => {
    this.HP -= damage;
    if (this.HP <= 0) {
      this.destroyed = true;
      this.attackRange.destroy();
      this.destroy();
    }
  }

  attack = (target) => {
    this.isAttacking = true;
    if (this.attacktimer <= 0) {
      const projectile = new Projectile(this, target);
      this.scene.projectiles.push(projectile);
      this.attacktimer = 1000 / this.attackspeed;
    }
  }

  setComputedDestination = (destination) => {
    const xOffset = Math.floor(Math.random() * 20) - 10;
    const yOffset = Math.floor(Math.random() * 20) - 10;

    this.computedDestination = {
      x: destination.x + xOffset,
      y: destination.y + xOffset,
    };
  }
}
