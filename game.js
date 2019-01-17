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
}

function update() {

}
