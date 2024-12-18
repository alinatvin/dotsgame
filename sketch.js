let walls = [];
let circles = [];
let rectangleCount = 10; // Number of rectangles per row and column
let targetCircleCount = 10; // Set your target number of red circles here
let spacing = 20; // Space between rectangles
let particle;
let rayDensity = 0.5; // Angle step (increase for more rays)
let redCircleCount = 0;
let message = "";
let circleCount

function preload() {
 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(32);
  textAlign(CENTER, CENTER);


  const gridSpacingX = (width - spacing * (rectangleCount + 1)) / rectangleCount; // Horizontal grid spacing
  const gridSpacingY = (height - spacing * (rectangleCount + 1)) / rectangleCount; // Vertical grid spacing

  // Create a grid of rectangles
  for (let row = 0; row < rectangleCount; row++) {
    for (let col = 0; col < rectangleCount; col++) {
      let attempts = 0;
      let newRect;
      let isValid = false;

      while (attempts < 100 && !isValid) {
        // Calculate the position of each rectangle with spacing
        const x = col * (gridSpacingX + spacing) + spacing;
        const y = row * (gridSpacingY + spacing) + spacing;
        const w = random(width * 0.05, width * 0.2); // Random width for each rectangle
        const h = random(height * 0.05, height * 0.2); // Random height for each rectangle

        newRect = new Rectangle(x, y, w, h);
        isValid = true;

        // Check if the new rectangle intersects with any other rectangle
        for (let existingRect of walls) {
          if (newRect.intersects(existingRect)) {
            isValid = false; // Set to false if overlap is detected
            break;
          }
        }

        attempts++;
      }

      // If a valid rectangle is found, add it to the walls
      if (isValid) {
        walls.push(newRect);
      }
    }
  }

  // Create a random number of red circles between 5 and 20
   circleCount = int(random(5, 21)); // Random count between 5 and 20

  // Create the red circles and ensure no intersection with rectangles or other circles
  while (circles.length < circleCount) {
    let attempts = 0;
    let newCircle;
    let isValid = false;

    while (attempts < 100 && !isValid) {
      let x = random(width);
      let y = random(height);
      let r = 10; // Small radius for the red circles

      newCircle = new Circle(x, y, r);
      isValid = true;

      // Check for intersection with any rectangle
      for (let wall of walls) {
        if (newCircle.intersects(wall)) {
          isValid = false; // If the circle intersects a rectangle, try again
          break;
        }
      }

      // Check for intersection with any other circle
      for (let otherCircle of circles) {
        let distance = dist(newCircle.x, newCircle.y, otherCircle.x, otherCircle.y);
        if (distance < newCircle.r + otherCircle.r + 50) { // Ensure minimum space between circles (50px)
          isValid = false; // If there's an intersection, try again
          break;
        }
      }

      attempts++;
    }

    if (isValid) {
      circles.push(newCircle); // Add the valid circle to the array
    }
  }

  // Create particle for ray-casting
  particle = new Particle();

  noCursor();
   checkButton = createButton('Check');
   checkButton.position(width/2, 20);
  checkButton.mousePressed(checkCircles); 
  
  // Attach the checkCircles function to the button
}

function draw() {
  background(0); // Background color
  text(message, width / 2, height / 2); 

  let insideRectangle = false;
  // Display the count of red circles in the upper-left corner
   fill(255); // White color for the text
  textSize(32);
  textAlign(CENTER, CENTER);
  text(message, width / 2, height / 2); // Display the message

  //text(`Red Circles: ${redCircleCount}`, 20, 20);
  // Draw all rectangles with their boundaries
  for (let wall of walls) {
    wall.show(); // Draw each rectangle

    // Check if the mouse is inside this rectangle
    if (mouseX > wall.x && mouseX < wall.x + wall.w &&
        mouseY > wall.y && mouseY < wall.y + wall.h) {
      insideRectangle = true; // Mouse is inside the rectangle
    }
  }

  // Draw the red circles
  for (let circle of circles) {
    circle.show(); // Draw each circle
  }

  // If the mouse is inside a rectangle, hide rays
  if (!insideRectangle) {
    particle.update(mouseX, mouseY);
    particle.show();
    particle.look(walls); // Cast rays to interact with walls and canvas edges
     // Count how many red circles are there
  redCircleCount = circles.filter(circle => circle.color && circle.color.levels[0] === 255 && circle.color.levels[1] === 0 && circle.color.levels[2] === 0).length;

  }
}

/////////////////////////////////////////////// Rectangle Class
class Rectangle {
  constructor(x, y, w, h) {
    this.x = x; // Top-left x-coordinate
    this.y = y; // Top-left y-coordinate
    this.w = w; // Width
    this.h = h; // Height

    // Create boundaries for the rectangle
    this.edges = [
      new Boundary(this.x, this.y, this.x + this.w, this.y), // Top edge
      new Boundary(this.x + this.w, this.y, this.x + this.w, this.y + this.h), // Right edge
      new Boundary(this.x + this.w, this.y + this.h, this.x, this.y + this.h), // Bottom edge
      new Boundary(this.x, this.y + this.h, this.x, this.y) // Left edge
    ];
  }

  show() {
    // Draw the rectangle's boundaries (edges)
    stroke(255);
    noFill();
    rect(this.x, this.y, this.w, this.h);
    
    // Optionally, show the edges as lines for clarity
    for (let edge of this.edges) {
      edge.show(); // Draw each boundary line
    }
  }

  // Check if this rectangle intersects with another rectangle
  intersects(other) {
    return !(this.x + this.w + spacing < other.x || // This rectangle is to the left of the other
             this.x > other.x + other.w + spacing || // This rectangle is to the right of the other
             this.y + this.h + spacing < other.y || // This rectangle is above the other
             this.y > other.y + other.h + spacing); // This rectangle is below the other
  }
}
function checkCircles() {

  if (redCircleCount === circleCount) {
    message = "You Win!";  // Set message to "You Win!"
  } else {
    message = "Game Over";  // Set message to "Game Over"
  }
}



/////////////////////////////////////////////// Boundary Class (for edges)
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(255); // Edge color
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}
class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = null; // No color by default (transparent)
    this.isIntersected = false; // Track if the circle is intersected
    this.intersectCount = 0; // Counter for how many rays intersected the circle
  }

  show() {
    if (this.color !== null) {
      fill(this.color); // Use the circle's current color if not null
    } else {
      noFill(); // No fill if the color is null (transparent)
    }
    noStroke();
    ellipse(this.x, this.y, this.r * 2); // Draw the circle
  }

  intersects(rect) {
    // Check if the circle intersects with a rectangle
    let closestX = constrain(this.x, rect.x, rect.x + rect.w);
    let closestY = constrain(this.y, rect.y, rect.y + rect.h);
    let d = dist(this.x, this.y, closestX, closestY);
    return d < this.r;
  }
}


//////////////////////////////////////////////////// Particle look method (Corrected)

//////////////////////////////////////////////////// Particle look method (Updated)
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += rayDensity) { // Decrease step for more rays
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    // Reset circle states at the start of each frame
    for (let circle of circles) {
      circle.isIntersected = false; // Assume no intersection by default
      circle.intersectCount = 0; // Reset intersect count
    }

    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;

      // Check intersections with rectangles (walls)
      for (let wall of walls) {
        for (let edge of wall.edges) {
          const pt = ray.cast(edge);
          if (pt) {
            const d = p5.Vector.dist(this.pos, pt);
            if (d < record) {
              record = d;
              closest = pt; // Closest point is the wall intersection for now
            }
          }
        }
      }

      // Check intersections with circles, but only if no rectangle blocks the way
      for (let circle of circles) {
        const pt = ray.intersectsCircle(circle);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);

          // Check if any wall is closer than the circle
          let isBlocked = false;
          for (let wall of walls) {
            for (let edge of wall.edges) {
              const wallPt = ray.cast(edge);
              if (wallPt) {
                const wallDist = p5.Vector.dist(this.pos, wallPt);
                if (wallDist < d) {
                  isBlocked = true; // Rectangle blocks the path to the circle
                  break;
                }
              }
            }
            if (isBlocked) break;
          }

          // If not blocked, check if this is the closest intersection
          if (!isBlocked && d < record) {
            circle.isIntersected = true; // Mark circle as intersected
            circle.intersectCount++; // Increment the intersection counter
            record = d;
            closest = pt; // Update closest point to be the circle intersection
          }
        }
      }

      // Check intersections with canvas edges
      const edgePt = ray.castCanvasEdge();
      if (edgePt) {
        const d = p5.Vector.dist(this.pos, edgePt);
        if (d < record) {
          record = d;
          closest = edgePt;
        }
      }

      if (closest) {
        stroke(255, 100); // Ray color
        line(this.pos.x, this.pos.y, closest.x, closest.y); // Draw the ray
      }
    }

    // Update circle colors after all rays are checked
    for (let circle of circles) {
      if (circle.intersectCount >= 50) { // If 50 rays have intersected the circle
        circle.color = color(255, 0, 0); // Change color to red
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4); // Light source
    for (let ray of this.rays) {
      ray.show();
    }
  }
}


/////////////////////////////////////////////// Ray Class
class Ray {
  intersectsCircle(circle) {
  const cx = circle.x;
  const cy = circle.y;
  const r = circle.r;

  // Vector from ray position to circle center
  const toCircle = createVector(cx - this.pos.x, cy - this.pos.y);

  // Project `toCircle` onto the ray direction
  const proj = p5.Vector.dot(toCircle, this.dir);

  // Find the closest point on the ray to the circle center
  const closest = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, proj));

  // Calculate distance from the closest point to the circle center
  const distToCenter = dist(closest.x, closest.y, cx, cy);

  // If this distance is less than the circle radius, there is an intersection
  if (distToCenter < r) {
    // Calculate the intersection point
    const offset = sqrt(r * r - distToCenter * distToCenter);
    const intersection = p5.Vector.add(closest, p5.Vector.mult(this.dir, -offset));
    return intersection;
  }

  return null; // No intersection
}

  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show() {
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10); // Length of ray
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;
    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }

  // Check for intersection with the canvas edges
  castCanvasEdge() {
    const x1 = this.pos.x;
    const y1 = this.pos.y;
    const x2 = this.pos.x + this.dir.x * 10000; // Extend ray far enough
    const y2 = this.pos.y + this.dir.y * 10000;

    // Check for intersection with canvas edges (top, right, bottom, left)
    const canvasEdges = [
      new Boundary(0, 0, width, 0), // Top
      new Boundary(width, 0, width, height), // Right
      new Boundary(width, height, 0, height), // Bottom
      new Boundary(0, height, 0, 0) // Left
    ];

    let closest = null;
    let record = Infinity;
    for (let edge of canvasEdges) {
      const pt = this.cast(edge);
      if (pt) {
        const d = p5.Vector.dist(this.pos, pt);
        if (d < record) {
          record = d;
          closest = pt;
        }
      }
    }
    return closest;
  }
}
