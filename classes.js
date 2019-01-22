import Phaser from './lib/phaser.min.js';

export class Path {
  static Jungle = 'jungle';
  static Lane = 'lane';
  static River = 'river';

  static Start = 'start';
  static End = 'end';

  constructor(game, location, path, type) {
    this.game = game;
    this.nextPaths = [];
    this.location = location;
    this.type = type;
    this.path = path;
  }

  update = () => {
    this.game.graphics.lineStyle(1, 0xffffff, 1);
    this.path.draw(this.game.graphics);
  }

}

export class Waypoint {
  constructor(game, point, end) {
    this.game = game;
    this.point = point;
    this.end = !!end;

    this.nextWaypoints = [];
  }

  update = () => {
    this.game.graphics.lineStyle(1, 0xffffff, 1);
    this.game.graphics.fillPointShape(this.point);
  }
}
export class Wave {
  constructor(game) {
    this.game = game;

    this.waypoints = [];
    this.createWaypoints();

    this.units = [];
    this.createUnits();
  }

  createUnits = () => {
    const unit = new Enemy(this.game, this.waypoints);
    this.units.push(unit);
  }

  createWaypoints = () => {
    const firstIndex = Math.floor(Math.random() * this.game.startWaypoints.length)
    let waypoint = this.game.startWaypoints[firstIndex];
    while (waypoint) {
      this.waypoints.push(waypoint);
      if (!waypoint.end) {
        const nextIndex = Math.floor(Math.random() * waypoint.nextWaypoints.length)
          waypoint = waypoint.nextWaypoints[nextIndex];
      } else {
        waypoint = null;
      }
    }
  }

  update = () => {
    for (const unit of this.units) {
      unit.update();
    }
  }
};

export class Enemy {
  constructor(game, waypoints) {
    this.game = game;
    this.waypoints = waypoints;
    this.checkpoint = 0;
    this.destination = this.waypoints[1];

    this.speed = 1;

    this.r = 5;
    // this.circle = new Phaser.Geom.Circle(900, 100, this.r);
    // this.body = new Phaser.Physics.Arcade.Body(this.game.physics.world, this.circle);
    this.circle = this.game.matter.add.circle(this.route[0].point.x, this.route[0].point.y, 10);
  }

  update = () => {
    // this.game.physics.moveToObject(this.circle, this.destination.point, 5);
    console.log(this.circle);
    // this.game.graphics.strokeCircleShape(this.circle);
  }
}
