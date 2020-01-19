

export default class Unit extends Phaser.GameObjects.Sprite {
  constructor(scene, name, x, y, unitData, typeData) {
    super(scene, x, y, unitData.appearance.key);

    this.unitData = unitData || {};
    this.typeData = typeData || {};

    this.state = {};
    this.setInitialState();
    this.updateStats();

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

  setInitialState = () => {
      this.state.rendered = false;
      this.state.destroyed = false;

      this.state.level = 1;

      this.state.cooldowns = {
        attack: 0;
      };
      this.state.buffs = [];
  }

  updateStats = () => {
    const { level } = this.state;
    const { base = {}, scaling = {} } = this.unitData;

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

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);
    this.play('goomba');

    // Add to physics
    this.scene.physics.add.existing(this);
    this.body.isCircle = true;
    this.body.width = this.config.appearance.hitbox.width;

    // Add healthbar
    this.scene.add.existing(this.healthbar);
    this.scene.add.existing(this.healthbarFill);

    // Add attack range to scene/physics
    this.scene.add.existing(this.attackRange);
    this.scene.physics.add.existing(this.attackRange);
    this.attackRange.body.setCircle(this.stats.attackrange);

    // Add to scene groups
    this.scene.enemyHitboxes.add(this);
    this.scene.enemyRanges.add(this.attackRange);

    // Update rendered state
    this.state.rendered = true;
  }

  update = (time, delta) => {
    // Update attack timer
    this.state.attacktimer -= delta;

    // Attempt to fire basic attack if available
    if (this.state.attacktimer <= 0) {
      const target = this.getBasicAttackTarget();
      if (target) {
        this.basicAttack(target);
      }
    }
  }
}
