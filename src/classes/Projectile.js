export default class Projectile extends Phaser.GameObjects.Sprite {
  constructor(owner, target) {
    super(owner.scene, owner.x, owner.y, 'mario-sprites');
    this.owner = owner;
    this.target = target;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.damage = owner.damage || owner.stats.attackdamage;
    this.speed = 150;
    this.destroyed = false;

    this.destination = {
      x: target.x,
      y: target.y,
    };
  }

  update(time, delta) {
    if (this.destroyed) {
      return;
    }
    if (this.target && this.target.body) {
      this.destination = {
        x: this.target.x,
        y: this.target.y,
      };
      const overlap = this.scene.physics.overlap(this, this.target, this.hitTarget);
      if (overlap) {
        return;
      }
    } else if (Math.abs(this.destination.x - this.x) <= 3 && Math.abs(this.destination.y - this.y) <= 3) {
      this.destroyed = true,
      this.destroy();
      return;
    }

    this.scene.physics.moveTo(this, this.destination.x, this.destination.y, this.speed);
  }

  hitTarget = () => {
    this.target.receiveDamage(this.damage);
    this.destroyed = true;
    this.destroy();
  }



}
