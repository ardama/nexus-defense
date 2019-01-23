import Constants from '../helpers/constants.js';

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
        'mario-sprites'
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
    const xOffset = Math.floor(Math.random() * 6) - 3;
    const yOffset = Math.floor(Math.random() * 6) - 3;
    super(scene, waypoints[0].x + xOffset, waypoints[0].y + yOffset, key);

    scene.physics.world.enable(this);

    this.delay = delay;
    this.waiting = true;

    this.health = 10;

    this.waypoints = waypoints;
    this.waypointIndex = 1;
    this.destination = this.waypoints[this.waypointIndex];
    this.setComputedDestination(this.destination);
    this.destinationType = Constants.Destination.Waypoint;
    this.destinationChanged = false;

    this.isAttacking = false;

    this.baseSpeed = 100;
    this.tempSpeed = this.baseSpeed;

    this.finished = false;

    // this.circle = new Phaser.Geom.Circle(900, 100, this.r);
    // this.body = new Phaser.Physics.Arcade.Body(this.scene.physics.world, this.circle);
    // this.circle = this.scene.add.sprite(this.waypoints[0].x, this.waypoints[0].y, 10);
  }

  update = (time, delta) => {
    if (this.delay > 0) {
      this.delay -= delta;
      return;
    } else if (this.waiting) {
      this.waiting = false;
      this.scene.add.existing(this);
    }

    // stop moving if finished
    if (this.finished) {
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
            this.finished = true;
          }
        }
      }

      this.scene.physics.moveTo(this, this.computedDestination.x, this.computedDestination.y, this.tempSpeed);
    }
  }

  setComputedDestination = (destination) => {
    const xOffset = Math.floor(Math.random() * 6) - 3;
    const yOffset = Math.floor(Math.random() * 6) - 3;

    this.computedDestination = {
      x: destination.x + xOffset,
      y: destination.y + xOffset,
    };
  }
}
