import Constants from '../utils/constants.js';
import GameData from '../utils/gamedata.js';
import Projectile from './Projectile.js';

export default class Champion extends Phaser.GameObjects.Sprite {
  constructor(scene, name, x, y, zone) {
    const config = GameData.Champion[name];
    super(scene, x, y, data.appearance.key);
    
    this.config = config;

    // Set initial state
    this.state = {
      rendered: false,
      destroyed: false,
      attacktimer: 0,
      level: 1,
      levelxp: 100,
    };
    
    this.stats = this.updateStats();

    // Create attack range zone
    this.attackRange = new Phaser.GameObjects.Zone(
      scene, x, y,
      this.stats.attackrange * 2,
      this.stats.attackrange * 2,
    );
    this.attackRange.owner = this;

    // Render to scene
    this.renderToScene();
    
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
      // maxhealth: base.maxhealth,
      // healthregen: base.healthregen,
      // armor: base.armor,
      // magicresist: base.magicresist,
    };
  }
}
