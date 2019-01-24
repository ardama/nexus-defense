import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js';
import Waypoint from '../classes/Waypoint.js';
import Enemy, { Wave } from '../classes/Enemy.js';
import { Tower, Inhibitor, Nexus } from '../classes/Structures.js';
import Constants from '../helpers/constants.js';
import makeAnimations from '../helpers/animations';


export default class TowerDefenseScene extends Phaser.Scene {
  constructor(test) {
    super({ key: 'TowerDefenseScene' });
  }

  preload() {
    this.load.atlas('mario-sprites', 'assets/mario-sprites.png', 'assets/mario-sprites.json');
    this.load.spritesheet('tiles', 'assets/images/super-mario.png', {
        frameWidth: 16,
        frameHeight: 16,
        spacing: 2
    });

    this.load.on('complete', () => {
        makeAnimations(this);
    });

    this.physics.world.enable(this);
  }

  create(time, delta) {
    this.graphics = this.add.graphics({
      lineStyle: {
        width: 5,
        color: 0xdddddd,
      },
      fillStyle: {
        color: 0x888888,
      },
    });

    this.towers = {}
    this.inhibitors = {};
    this.nexus = {};
    this.waypoints = [];
    this.waves = [];
    this.enemies = [];
    this.projectiles = [];

    this.createGroups();
    this.createStructures();
    this.createWaypoints();
    this.createEnemies();
  }

  update(time, delta) {
    this.graphics.clear();


    this.updateTowers(time, delta);
    this.updateWaypoints(time, delta);
    this.updateEnemies(time, delta);
    this.updateProjectiles(time, delta);

    this.physics.overlap(this.structureRanges, this.enemyHitboxes, (range, target) => {
      const structure = range.owner;
      structure.attack(target);
    });

    this.physics.overlap(this.enemyRanges, this.structureHitboxes, (range, target) => {
      const enemy = range.owner;
      enemy.attack(target);
    });
  }

  createGroups = () => {
    this.structureHitboxes = this.add.group()
    this.structureRanges = this.add.group();
    this.enemyHitboxes = this.add.group()
    this.enemyRanges = this.add.group();
  }

  createStructures = () => {
      this.towers = {
        top: [
          new Tower(this, 80, 240),
          new Tower(this, 120, 500),
          new Tower(this, 100, 720),
          new Tower(this, 120, 840),
        ],
        mid: [
          new Tower(this, 420, 540),
          new Tower(this, 360, 680),
          new Tower(this, 240, 760),
        ],
        bot: [
          new Tower(this, 760, 920),
          new Tower(this, 500, 880),
          new Tower(this, 280, 900),
          new Tower(this, 160, 880),
        ],
      };

      this.inhibitors = {
        top: new Inhibitor(this, 100, 760),
        mid: new Inhibitor(this, 210, 790),
        bot: new Inhibitor(this, 240, 900),
      };

      this.nexus = new Nexus(this, 110, 890);

  }


  createWaypoints = () => {
    const lane_start = new Waypoint(this, 900, 100);

    const toplane_1 = new Waypoint(this, 500, 100);
    const toplane_2 = new Waypoint(this, 100, 100);

    const midlane_1 = new Waypoint(this, 500, 500);

    const botlane_1 = new Waypoint(this, 900, 500);
    const botlane_2 = new Waypoint(this, 900, 900);

    const lane_end = new Waypoint(this, 100, 900, true);

    this.waypoints = [lane_start, toplane_1, toplane_2, midlane_1, botlane_1, botlane_2, lane_end];
    this.startWaypoints = [lane_start];

    lane_start.nextWaypoints = [toplane_1, midlane_1, botlane_1];
    toplane_1.nextWaypoints = [toplane_2, midlane_1];
    toplane_2.nextWaypoints = [lane_end];
    midlane_1.nextWaypoints = [lane_end]
    botlane_1.nextWaypoints = [botlane_2, midlane_1];
    botlane_2.nextWaypoints = [lane_end];
  }

  createEnemies = () => {
    this.nextWaveTime = Constants.Game.FirstWaveTime;
  }

  updateTowers = (time, delta) => {
    for (const tower of this.towers.top) {
      tower.update(time, delta);
    }
    for (const tower of this.towers.mid) {
      tower.update(time, delta);
    }
    for (const tower of this.towers.bot) {
      tower.update(time, delta);
    }

    // const inhibitors = [this.inhibitors.top, this.inhibitors.mid, this.inhibitors.bot]
    // for (const inhibitor of inhibitors) {
    //   inhibitor.update(time, delta);
    // }
  }

  updateWaypoints = (time, delta) => {
    for (const waypoint of this.waypoints) {
      waypoint.update(time, delta);
    }
  }

  updateEnemies = (time, delta) => {
    this.nextWaveTime -= delta;

    if (this.nextWaveTime <= 0) {
      this.createNextWave();
      this.nextWaveTime = Constants.Game.WaveTime;
    }

    for (const wave of this.waves) {
      wave.update(time, delta);
    }
  }

  updateProjectiles = (time, delta) => {
    for (const projectile of this.projectiles) {
      projectile.update(time, delta);
    }
  }

  createNextWave = () => {
    const wave = new Wave(this);
    this.waves.push(wave);
  }
}
