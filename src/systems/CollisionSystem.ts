import { AABB } from '../types';
import { Transform2D } from '../components/Transform2D';
import { Velocity } from '../components/Velocity';
import { AABBCollider } from '../components/AABBCollider';

export interface SolidBox extends AABB {
  oneWay?: boolean;
}

export class CollisionSystem {
  public static resolveEntityMovement(
    transform: Transform2D,
    velocity: Velocity,
    collider: AABBCollider,
    solids: SolidBox[],
    dt: number,
    dropThroughOneWay = false
  ): { grounded: boolean; hitCeiling: boolean; hitWall: boolean } {
    let grounded = false;
    let hitCeiling = false;
    let hitWall = false;

    // --- HORIZONTAL MOVEMENT & COLLISION ---
    transform.x += velocity.vx * dt;
    let bounds = collider.getBounds(transform.x, transform.y);

    for (const solid of solids) {
      if (solid.oneWay) continue; // Horizontal movement ignores one-way platforms

      if (AABBCollider.overlaps(bounds, solid)) {
        if (velocity.vx > 0) {
          // Moving right -> snap to left edge
          transform.x = solid.x - collider.offsetX - collider.width / 2;
          hitWall = true;
        } else if (velocity.vx < 0) {
          // Moving left -> snap to right edge
          transform.x = solid.x + solid.width - collider.offsetX + collider.width / 2;
          hitWall = true;
        }
        velocity.vx = 0;
        bounds = collider.getBounds(transform.x, transform.y);
      }
    }

    // --- VERTICAL MOVEMENT & COLLISION ---
    const prevBottom = transform.prevY + collider.offsetY;
    transform.y += velocity.vy * dt;
    bounds = collider.getBounds(transform.x, transform.y);

    for (const solid of solids) {
      if (solid.oneWay) {
        // One way platform handling
        if (dropThroughOneWay) continue;
        // Only solid when falling downward and was previously above the platform top
        const platformTop = solid.y + solid.height;
        if (velocity.vy <= 0 && prevBottom >= platformTop - 2 && bounds.y <= platformTop) {
          if (bounds.x + bounds.width > solid.x && bounds.x < solid.x + solid.width) {
            transform.y = platformTop - collider.offsetY;
            velocity.vy = 0;
            grounded = true;
            bounds = collider.getBounds(transform.x, transform.y);
          }
        }
        continue;
      }

      // Standard solid
      if (AABBCollider.overlaps(bounds, solid)) {
        if (velocity.vy > 0) {
          // Hit ceiling
          transform.y = solid.y - collider.height - collider.offsetY;
          velocity.vy = 0;
          hitCeiling = true;
        } else if (velocity.vy < 0) {
          // Landed on floor
          transform.y = solid.y + solid.height - collider.offsetY;
          velocity.vy = 0;
          grounded = true;
        }
        bounds = collider.getBounds(transform.x, transform.y);
      }
    }

    return { grounded, hitCeiling, hitWall };
  }
}
