var Constants = require('./constants.js');
var { Wave } = require('./classes.js');

var phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 800,
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(phaserConfig);
var graphics;
var path;

function preload() {
  this.load.image('tower', '/assets/images/default/towerDefense_tile206.png');
}

function create() {
  tower = this.add.sprite(32, 32, 'tower', 100);

  this.startTime = Date.now();
  this.lastFrameTime = this.startTime;

  this.createAllies();
  this.createEnemies();
}

function update() {
  this.frameTime = Date.now();
  this.frameDuration = this.frameTime - this.lastFrameTime;

  this.updateAllies();
  this.updateEnemies();



  this.lastFrameTime = this.frameTime;
}


function createAllies() {
  return null;
}

function createEnemies() {
  this.waves = [];
  this.nextWaveTime = Constants.Game.WaveTime;
}

function updateAllies() {
  return null;
}

function updateEnemies() {
  this.nextWaveTime -= this.frameDuration;
  console.log(this.nextWaveTime);

  if (this.nextWaveTime <= 0) {
    this.createWave();
  }
}

function createWave() {
  var wave = new Wave();
}
