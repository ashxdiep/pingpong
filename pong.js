//the basic idea here is to define the template or class,
//define a constructor (how it is initialized)
// then add functionality and then the world is your OYSTER

let bubble;

function setup() {
  createCanvas(600, 400);
  bubble = new Bubble();
  print(bubble.x, bubble.y);
}

 class Bubble {
   constructor () {
     this.x = 200;
     this.y = 150;
   }

   move(){
     this.x = this.x + random(-5, 5);
     this.y = this.y + random(-5, 5);
   }

   show(){
     stroke(225);
     strokeWeight(4);
     noFill();
     ellipse(this.x, this.y, 24, 24);
   }
 }
