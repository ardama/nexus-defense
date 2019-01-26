export default class Projectile extends Phaser.GameObjects.Sprite {
  constructor(owner, target) {
    super(owner.scene, owner.x, owner.y, 'mario-sprites');

    // Save owner, target
    this.owner = owner;
    this.target = target;

    // Set base stats
    this.stats = {
      damage: owner.stats.attackdamage,
      speed: 150,
    };

    // Set initial state
    this.state = {
      rendered: false,
      state.destroyed: false,
    };

    // Set target destination
    this.destination = {
      x: target.x,
      y: target.y,
    };

    // Render to scene
    this.renderToScene();
  }

  update(time, delta) {
    if (this.state.destroyed) {
      return;
    }
    if (this.target && this.target.body) {
      // Update destination
      this.destination = {
        x: this.target.x,
        y: this.target.y,
      };

      // Check if Projectile has hit its target, return early if so
      const overlap = this.scene.physics.overlap(this, this.target, this.handleTargetHit);
      if (overlap) return;
    } else if (
      Math.abs(this.destination.x - this.x) <= 3 &&
      Math.abs(this.destination.y - this.y) <= 3
    ) {
      // If no target, check if Projectile reached last set destination
      this.state.destroyed = true,
      this.destroy();
      return;
    }

    this.scene.physics.moveTo(this, this.destination.x, this.destination.y, this.speed);
  }

  renderToScene = () => {
    // Add to scene
    this.scene.add.existing(this);

    // Add to physics
    this.scene.physics.add.existing(this);

    // Add to scene groups
    this.scene.projectiles.add(this);

    // Update rendered state
    this.state.rendered = true;
  }

  handleTargetHit = () => {
    // Deal damage to target
    this.target.receiveDamage(this.damage);

    // Destroy object
    this.state.destroyed = true;
    this.destroy();
  }



}
