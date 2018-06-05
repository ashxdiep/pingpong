//class to hold x and y properties
class Vec {
  constructor( x = 0, y = 0){
    this.x = x;
    this.y = y;
  }
}

//data structures for rectangle
class Rect {
  constructor (w, h){
    //position
    this.pos = new Vec;
    //size
    this.size = new Vec(w, h);
  }
}



class Ball extends Rect {
  constructor(){
    //making the size under rect
    super(10, 10);

    //velocity
    this.vel = new Vec;
  }
}

//accessing the canvas
const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

const ball = new Ball;
ball.pos.x= 100;
ball.pos.y = 50;

ball.vel.x = 100;
ball.vel.y = 100;

//how much time has elapsed from the last animation frame
let lastTime;
function callback(millis){
  //if we have last time
  if (lastTime){
    //update and convert to whole seconds
    update((millis - lastTime) / 1000);
    lastTime = millis;
    requestAnimationFrame(callback);
  }
}

//updating Ball position
function update(dt){
  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;

  context.fillStyle = '#000';
  context.fillRect(0 , 0, canvas.width, canvas.height);

  context.fillStyle = '#fff';
  context.fillRect(ball.pos.x, ball.pos.y, ball.size.x, ball.size.y);
}

callback();
