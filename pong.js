//the basic idea here is to define the template or class,
//define a constructor (how it is initialized)
// then add functionality and then the world is your OYSTER

//what if you want to make special bubbles
//you do this by adding stuff in the constructor

let bubble1, let bubble2;

function setup() {
  createCanvas(600, 400);
  bubble1 = new Bubble(200, 200, 40);
  bubble2 = new Bubble(400,200, 20);
  print(bubble.x, bubble.y);
}

function draw(){
  background(0);
  bubble1.move();
  bubble1.show();
  bubble2.move();
  bubble2.show();
}

 class Bubble {
   constructor (x, y, r ) {
     this.x = x;
     this.y = y;
     this.r = r;
   }

   move(){
     this.x = this.x + random(-5, 5);
     this.y = this.y + random(-5, 5);
   }

   show(){
     stroke(225);
     strokeWeight(4);
     noFill();
     ellipse(this.x, this.y, this.r * 2);
   }
 }
