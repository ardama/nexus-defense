import Constants from '../utils/constants.js';
import GameData from '../utils/gamedata.js';
import Projectile from './Projectile.js';
import { fuzzyLocation } from '../utils/helpers.js';

export class Wave {
  constructor(scene, origin) {
    this.scene = scene;

    this.waypoints = [];
    this.createWaypoints(origin);

    this.enemies = [];
    this.createEnemies();
  }

  createEnemies = () => {
    for (let i = 0; i < Constants.Wave.Minion.Count; i++) {
      const enemy = new Enemy(
        this.scene,
        'CasterMinion',
        this.waypoints,
        i * Constants.Wave.Minion.Delay,
      );

      this.enemies.push(enemy);
      this.scene.enemies.add(enemy);
    }
  }

  createWaypoints = (origin) => {
    const route = this.scene.routes[origin]
    if (route) this.waypoints = route;
    
    // Choose spawn location
    // let index = Math.floor(Math.random() * this.scene.spawnpoints.length)
    // let waypoint = this.scene.spawnpoints[index];
    // 
    // while (waypoint) {
    //   this.waypoints.push(waypoint);
    // 
    //   if (waypoint.end) {
    //     break;
    //   }
    // 
    //   // Choose next Waypoint
    //   index = Math.floor(Math.random() * waypoint.waypoints.length)
    //   const temp = waypoint.waypoints[index];
    // 
    //   // Avoid duplicates (todo: handle multi step loops)
    //   if (this.waypoints.indexOf(temp) === -1) {
    //     waypoint = temp;
    //   }
    // }
  }
};

export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, name, waypoints, delay) {
    const config = GameData.Enemy[name];
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
    this.destinationType = Constants.Destination.Waypoint;
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

      this.scene.physics.moveTo(this, this.destination.x, this.destination.y, this.stats.movespeed);
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

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);
    this.play('broken');

    // Add to physics
    this.scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = this.config.appearance.hitbox.width;

    // Add attack range to scene/physics
    this.scene.add.existing(this.attackRange)
    this.scene.physics.add.existing(this.attackRange)
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
      attackrange: base.attackrange,
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
      this.destroy();
    }
  }

  basicAttack = (target) => {
    // Create Projectile onHit callback
    const damage = this.stats.attackdamage;
    const onHit = (projectile) => {
      projectile.target.receiveDamage(damage);
    }
    
    this.state.attacking = true;
    if (this.state.attacktimer <= 0) {
      const projectile = new Projectile(this, target, onHit);
      this.state.attacktimer = 1000 / this.stats.attackspeed;
    }
  }
}
