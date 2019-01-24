export function fuzzyLocation(destination, radius) {
  const xOffset = Math.floor(Math.random() * radius * 2) - radius;
  const yOffset = Math.floor(Math.random() * radius * 2) - radius;

  return {
    x: destination.x + xOffset,
    y: destination.y + yOffset,
  }; 
}
