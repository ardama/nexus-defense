import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js';
import Waypoint from '../classes/Waypoint.js';
import Enemy, { Wave } from '../classes/Enemy.js';
import { Tower, Inhibitor, Nexus } from '../classes/Structures.js';
import Constants from '../utils/constants.js';
import makeAnimations from '../utils/animations';


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

    this.createGroups();
    this.createStructures();
    this.createWaypoints();
    this.createEnemies();
  }

  update(time, delta) {
    this.graphics.clear();

    this.updateStructures(time, delta);
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
    // Structure Groups
    this.structures = this.add.group()
    this.structureHitboxes = this.add.group()
    this.structureRanges = this.add.group();

    // Enemy Groups
    this.enemies = this.add.group();
    this.enemyHitboxes = this.add.group()
    this.enemyRanges = this.add.group();

    // Champion Groups
    this.champions = this.add.group();
    this.championRanges = this.add.group();

    // Other Groups
    this.projectiles = this.add.group();

    // Non-GameObject Groups
    this.towers = { top: [], mid: [], bot: [] }
    this.inhibitors = {};
    this.waypoints = [];
    this.spawnpoints = [];
    this.waves = [];
  }

  createStructures = () => {
    // Top lane Towers
    const topOuter =  new Tower(this, 80, 240);
    const topInner =  new Tower(this, 120, 500);
    const topInhib =  new Tower(this, 100, 720);
    const topNexus =  new Tower(this, 120, 840);
    this.structures.add(topOuter);
    this.structures.add(topInner);
    this.structures.add(topInhib);
    this.structures.add(topNexus);
    this.towers.top.push(topOuter, topInner, topInhib, topNexus);

    // Mid lane Towers
    const midOuter = new Tower(this, 420, 540);
    const midInner = new Tower(this, 360, 680);
    const midInhib = new Tower(this, 240, 760);
    this.structures.add(midOuter);
    this.structures.add(midInner);
    this.structures.add(midInhib);
    this.towers.mid.push(midOuter, midInner, midInhib);

    // Bot lane Towers
    const botOuter = new Tower(this, 760, 920);
    const botInner = new Tower(this, 500, 880);
    const botInhib = new Tower(this, 280, 900);
    const botNexus = new Tower(this, 160, 880);
    this.structures.add(botOuter);
    this.structures.add(botInner);
    this.structures.add(botInhib);
    this.structures.add(botNexus);
    this.towers.bot.push(botOuter, botInner, botInhib, botNexus);

    // Inhibitors
    const topInhibitor = new Inhibitor(this, 100, 760);
    const midInhibitor = new Inhibitor(this, 210, 790);
    const botInhibitor = new Inhibitor(this, 240, 900);
    this.structures.add(topInhibitor);
    this.structures.add(midInhibitor);
    this.structures.add(botInhibitor);
    this.inhibitors = { top: topInhibitor, mid: midInhibitor, bot: botInhibitor };

    // Nexus
    const nexus = new Nexus(this, 110, 890);
    this.structures.add(nexus);
    this.nexus = nexus;
  }


  createWaypoints = () => {
    // Create Waypoints
    const lane_start = new Waypoint(this, 900, 100);

    const toplane_1 = new Waypoint(this, 500, 100);
    const toplane_2 = new Waypoint(this, 100, 100);
    const midlane_1 = new Waypoint(this, 500, 500);
    const botlane_1 = new Waypoint(this, 900, 500);
    const botlane_2 = new Waypoint(this, 900, 900);

    const lane_end = new Waypoint(this, 100, 900, true);

    // Add routing options
    lane_start.waypoints = [toplane_1, midlane_1, botlane_1];
    toplane_1.waypoints = [toplane_2, midlane_1];
    toplane_2.waypoints = [lane_end];
    midlane_1.waypoints = [lane_end]
    botlane_1.waypoints = [botlane_2, midlane_1];
    botlane_2.waypoints = [lane_end];

    // Add to scene data
    this.waypoints.push(lane_start, toplane_1, toplane_2, midlane_1, botlane_1, botlane_2, lane_end);
    this.spawnpoints.push(lane_start);
  }

  createEnemies = () => {
    this.nextWaveTime = Constants.Game.FirstWaveTime;
  }

  updateStructures = (time, delta) => {
    for (const structure of this.structures.getChildren()) {
      structure.update(time, delta);
    }
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

    for (const enemy of this.enemies.getChildren()) {
      enemy.update(time, delta);
    }
  }

  updateProjectiles = (time, delta) => {
    for (const projectile of this.projectiles.getChildren()) {
      projectile.update(time, delta);
    }
  }

  createNextWave = () => {
    const wave = new Wave(this);
    this.waves.push(wave);
  }
}
