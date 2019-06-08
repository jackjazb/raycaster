var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//resolution relative to monitor res
var res = 1;

var player;
var fov = Math.PI / 1.7;

// var crosshair = new Image();
// crosshair.src = './textures/crosshair.png';

var wall = new Image();
wall.src ='./textures/wall.png';

var enemyTex = new Image();
enemyTex.src = './textures/enemy2.png';

var map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,0,0,1,1,1,1,1,0,0,0,1,0,1,0,1,0,0,0,0,1],
	[1,1,0,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
	[1,1,0,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,0,0,1,1,0,1,1,0,0,0,1,0,1,0,1,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1],
	[1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
	[1,1,1,1,0,0,1,1,1,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
	[1,0,0,1,0,1,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,0,0,1],
	[1,0,1,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
	[1,0,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

//debug toggle
var debug = false;

//displayed at the bottom of the screen after every update
var info = '';

var testEnemy = new Enemy(15, 10, enemyTex);

//convert to degrees
function deg(rad){
	return rad * (180/Math.PI);
}

//
//PLAYER OBJECT
//
function Player(x, y, angle, fov) {
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.fov = fov;
	var turnSpeed = 0.05;
	var speed = 0.03;
	var sprintSpeed = 0.05;
	var currentSpeed = speed;
	
	//movement flags
	this.forward = false;
	this.back = false;
	this.right = false;
	this.left = false;
	this.sprint = false;
	
	var rayIncrement = 0.01;
	
	//the width of each column
	this.colWidth = 1;
	
	this.zBuffer = [];
	
	//
	//CONTROL
	//
	this.update = function (delta) {
		//get a usable delta value
		var deltaNow = delta * 0.1;
		
		//move forward and backwards
		if (this.sprint) {
			currentSpeed = sprintSpeed * deltaNow;
		}
		else {
			currentSpeed = speed * deltaNow;
		}
		
		var dx = 0;
		var dy = 0;
		
		if (this.forward) {
			dx += currentSpeed * Math.sin(this.angle);
			dy += currentSpeed * -Math.cos(this.angle);
		}
		if (this.back) {
			dx -= currentSpeed * Math.sin(this.angle);
			dy -= currentSpeed * -Math.cos(this.angle);
		}
		//rotate the player
		if (this.left) {
			dx +=currentSpeed * Math.sin(this.angle - Math.PI/2);
			dy += currentSpeed * -Math.cos(this.angle - Math.PI/2);
		}
		if (this.right) {
			dx +=currentSpeed * Math.sin(this.angle + Math.PI/2);
			dy += currentSpeed * -Math.cos(this.angle + Math.PI/2);
		}
		//check the new positions for collision
		if (map[Math.floor(this.y)][Math.floor(this.x + dx)] == 0) {
			this.x += dx;
		}
		if (map[Math.floor(this.y + dy)][Math.floor(this.x)] == 0) {
			this.y += dy;
		}
		
		dx = 0;
		dy = 0;

		info += '<p>PLAYER POS:  (' + parseFloat(this.x).toFixed(3) + ', ' + parseFloat(this.y).toFixed(3) + ')</p>';
		info += '<p>ANGLE: ' + parseFloat(deg(this.angle)).toFixed(3) + '</p>';
		info += '<p>FOV: ' + parseFloat(deg(this.fov)).toFixed(3) + '</p>';
	};
	
	//
	//RENDERING
	//
	//draw the viewing plane relative to the player
	this.drawScreen = function () {
		//the player's distance from the viewing plane
		var distFromPlane = (canvas.width / 2) / Math.tan(this.fov / 2);
		
		this.zBuffer = [];
		
		//iterate over columns on the viewing plane
		for (x = 0; x < canvas.width; x += this.colWidth) {
			//calculate the position of this ray relative to the center (ie the value of opp)
			var distFromCenter = x - (canvas.width / 2);

			//cast a ray relative to the player
			var rayAngle = this.angle + (Math.atan(distFromCenter / distFromPlane));
			var ray = this.castRay(rayAngle);
			
			//add the returned distanc to the zbuffer
			this.zBuffer.push(ray.distance);
			
			//the x position of the texture slice to take, based on the percentage through the wall this ray is
			var wallSlice = (wall.width - 1) * Math.abs(ray.offset);

			//the dimensions of the column to be drawn
			var columnHeight = canvas.height / ray.distance;
			var columnY = (canvas.height - columnHeight) / 2;

			ctx.drawImage(wall, wallSlice, 0, 1, wall.height, x, columnY, this.colWidth, columnHeight);

			//debugging thing - shows the distance returned by each ray
			ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
			var gHeight = ray.distance * 17 * res;
			if(debug) ctx.fillRect(x, (canvas.height - gHeight) / 2, 1, gHeight)
		}		
	};
	
	//cast a ray from the player and return certain data about its intersection
	this.castRay = function (angle) {
		var distance = 0;

		var rayX = this.x;
		var rayY = this.y;
		
		var hitWall = false;
		while (!hitWall) {

			rayX = this.x + (distance * Math.sin(angle));
			rayY = this.y + (distance * -Math.cos(angle));

			//check the grid square the ray is currently in
			if (map[Math.floor(rayY)][Math.floor(rayX)] == 1) {
				hitWall = true;
				
				var offsetY = Math.floor(rayY) - rayY;
				var offsetX = Math.floor(rayX) - rayX;
				var offset = 0;
				var side = '';

				//if x is 1 or 0 (with a margin of error of one ray increment), it is a vertical boundary
				if (offsetX - rayIncrement <= -1 || offsetX + rayIncrement > 0) {
					side = 'vertical';
					offset = offsetY;
				}
				else {
					side = 'horizontal';
					offset = offsetX;
				}
			}
			
			//if no wall is hit, increase distance
			distance += rayIncrement;
		}

		//multiply by cos of this ray angle (relative to the player) to remove the fisheye effect
		distance = distance * Math.cos(this.angle - angle);

		//create a new rayData object to pass to the renderer
		var rayData = new Object();
		
		rayData.distance = distance;
		rayData.offset = offset;
		rayData.side = side;
		
		//return the new rayData object
		return rayData;
	};

	this.drawHud = function () {
		ctx.fillStyle = 'black';
		ctx.fillRect(canvas.width / 2, canvas.height / 2, canvas.height * 0.005, canvas.height * 0.005);
		
		// var w = canvas.height *  0.05;
		// var h = w;
		// ctx.drawImage(crosshair, (canvas.width / 2) - w / 2, (canvas.height / 2) - h / 2, w , h)
	};
	
	//draw a single enemy sprite
	this.drawEnemy = function(enemy){
		//the player's distance from the viewing plane
		var distFromPlane = (canvas.width / 2) / Math.tan(this.fov / 2);
		
		var relX = this.x - enemy.x;
		var relY = this.y -  enemy.y;
		
		var angle = -Math.atan2(relX, relY);

		
		var dist = Math.sqrt(relX*relX + relY*relY);
		
		//check if the enemy is in view
		//if(angle >= this.angle - (this.fov / 2) - 0.3 && angle <= this.angle + (this.fov / 2) + 0.3){
			info += '<br><p>ENEMY IN VIEW:</p>'
			var relAngle = angle - this.angle;
			
			//get the sprites distance on the plane from mid (based on similar triangles)
			var distFromCenter = distFromPlane * Math.tan(relAngle);
			
			//calculate relative position on canvas
			var xPos = (canvas.width / 2) + distFromCenter;
			
			//same as the raycasting principle
			var height = canvas.height / dist;
			//width * length scale factor
			var width = enemy.image.width * (height / enemy.image.height);
			
			//ie halfway down
			var yPos = canvas.height / 2 - (height / 2);
			
			
			//check each enemy column relative to starter x against the z buffer, and draw the columns in front of a wall
			for(var x = 0; x < Math.floor(width); x++){
				if(dist < this.zBuffer[Math.floor(xPos + x)]){
					//ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy,dWidth, dHeight);
					ctx.drawImage(enemy.image, x, 0, 1, enemy.image.height, xPos + x*(width/enemy.image.width), yPos, width/enemy.image.width, height);
				}
			}
			
			info += '<p>img dimensions: ' + parseInt(enemy.image.width) + 'x' + parseInt(enemy.image.height) + '</p>';
			info += '<p>WIDTH: ' + parseFloat(width).toFixed(3) + ', HEIGHT: ' + parseFloat(height).toFixed(3) + '</p>';
			
			//ctx.drawImage(enemy.image, xPos, yPos, width, height);
			//info += '<p>ZBUFFER ENEMY MID: ' + parseFloat(this.zBuffer[Math.floor(xPos + (width / 2))]).toFixed(3) + '</p>';
			//info += '<p>REL ANGLE: ' + parseFloat(deg(relAngle).toFixed(3)) + '</p>';
			info += '<p>DIST: ' + parseFloat(dist).toFixed(3) + '</p>';
			//info += '<p>ZBUFFER MID: ' + parseFloat(this.zBuffer[Math.floor(canvas.width / 2)]).toFixed(3) + '</p>';
		//}
	}
	//
	//DEBUGGING
	//
	this.drawMap = function (x, y, size) {
		var xPos = x;
		var yPos = y;
		var size = size;

		var squareOffset = -0.5;

		var gridWidth = size / map[0].length;

		//map background
		ctx.fillStyle = 'orange';
		ctx.fillRect(xPos, yPos, size - squareOffset, gridWidth * map.length - squareOffset);
		ctx.fillStyle = 'black';

		//construct a map of the walls
		for (var y = 0; y < map.length; y++) {
			for (var x = 0; x < map[0].length; x++) {
				if (map[y][x] == 1) {
					//draw a simple grid based map
					ctx.fillRect(xPos + (x * gridWidth), yPos + (y * gridWidth), gridWidth - squareOffset, gridWidth - squareOffset);
				}
			}
		}

		//relative player position on map
		var relPlayerX = xPos + (player.x * gridWidth);
		var relPlayerY = yPos + (player.y * gridWidth);

		//the length of the angle indicator
		var dirArrLength = gridWidth * 1.5;

		//draw a dot for the player
		ctx.beginPath();
		ctx.arc(relPlayerX, relPlayerY, gridWidth / 5, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'purple';
		ctx.fill();
		ctx.lineWidth = gridWidth/2;
		ctx.strokeStyle = 'purple';
		ctx.stroke();

		//draw the test enemy dot
		ctx.beginPath();
		ctx.arc(xPos + (testEnemy.x * gridWidth), yPos + (testEnemy.y * gridWidth), gridWidth / 5, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.lineWidth = gridWidth/2;
		ctx.strokeStyle = 'red';
		ctx.stroke();
		
		//draw a line for angle
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(relPlayerX, relPlayerY);
		ctx.lineTo(relPlayerX + dirArrLength * Math.sin(this.angle - this.fov /2), relPlayerY + dirArrLength * -Math.cos(this.angle -this.fov / 2));
		ctx.stroke();	
		
		ctx.beginPath();
		ctx.moveTo(relPlayerX, relPlayerY);
		ctx.lineTo(relPlayerX + dirArrLength * Math.sin(this.angle + this.fov /2), relPlayerY + dirArrLength * -Math.cos(this.angle + this.fov / 2));
		ctx.stroke();
		
		// ctx.beginPath();
		// ctx.moveTo(relPlayerX, relPlayerY);
		// ctx.lineTo(relPlayerX + dirArrLength * Math.sin(this.angle), relPlayerY + dirArrLength * -Math.cos(this.angle));
		// ctx.stroke();
		
		//draw a line to the enemy
		ctx.beginPath();
		ctx.moveTo(relPlayerX, relPlayerY);
		ctx.lineTo(xPos + (testEnemy.x * gridWidth), yPos + (testEnemy.y * gridWidth));
		ctx.stroke();
		
		//a line straight up
		ctx.beginPath();
		ctx.moveTo(relPlayerX, relPlayerY);
		ctx.lineTo(relPlayerX, relPlayerY - 100);
		ctx.stroke();
	}

}

//
//ENEMY OBJECT
//
function Enemy(x, y, image) {
	this.x = x;
	this.y = y;
	this.image = image;
	
	this.speed = 0.001;
	
	this.update = function(delta){
		var dx = 0;
		var dy = 0;
		
		dx += this.speed * delta;
		//dy += this.speed * delta;
		
		if(map[Math.floor(this.y + dy)][Math.floor(this.x + dx)] != 0){
			this.speed = -this.speed;
			dx = dy = 0;
		}
		
		this.x += dx;
		this.y += dy;

	}
}

//
//RUN ONCE
//
function initialise(){
	//create a new player object
	player = new Player(14.5,18.5 ,0, fov);
	
	initControls();
	
	//start the main game loop
	requestAnimationFrame(mainLoop);
}

//set up key listeners
function initControls(){
	window.onkeydown = function(e){
		var key = e.keyCode;
		if(key == 87){player.forward = true;}	
		if(key == 83){player.back = true;}	
		if(key == 65){player.left = true;}
		if(key == 68){player.right = true;}

		if(key == 16){player.sprint = true;}
		
		//toggle debug mode
		if(key == 113){
			if(debug){debug = false;}
			else{debug = true;}
		}
	}
	
	window.onkeyup = function(e){
		var key = e.keyCode;
		if(key == 87){player.forward = false;}	
		if(key == 83){player.back = false;}	
		if(key == 65){player.left = false;}
		if(key == 68){player.right = false;}
		
		if(key == 16){player.sprint = false;}
	} 
	
	document.addEventListener('mousemove', mouseUpdate, false);
}

//mouse look controls
var lastMouse = 0;
var mouse = 0;
var movement = 0;

function mouseUpdate(e){
	player.angle += e.movementX / 200;
	if(player.angle >= Math.PI){
		player.angle = -Math.PI;
	}
	if(player.angle < -Math.PI){
		player.angle = Math.PI;
	}
}
canvas.onclick = function() {
  canvas.requestPointerLock();
};

//set the resolution of the canvas
function setSize(){
	ctx.canvas.width = window.innerWidth * res;
	ctx.canvas.height = window.innerHeight * res;
}

//
//RUN EVERY FRAME
//
function update(delta){
	//update the player
	player.update(delta);
	testEnemy.update(delta);
	
}

var time = Date.now();
var lastTime = Date.now();

var loopTime = 0;

//constantly increasing time counter (up to 500 ms)
var totalTime = 0;
var fps = 0;

function mainLoop(){
	

	//update the current time
	var time = Date.now();

	//get the time elapsed since the last loop
	loopTime = time - lastTime;
	totalTime += loopTime;
	
	//reset the debugger
	info = '';
	
	//update fps every second
	if(totalTime >= 500){
		fps = 1000 / loopTime;
		totalTime = 0;
	}
	
	lastTime = Date.now();
	
	//update game objects (longer delta means greater speed etc)
	update(loopTime);
	
	//check resolution
	res = document.getElementById('resSlider').value;
	setSize();
	info += '<p>RESOLUTION: ' + parseInt(canvas.width) + 'x' + parseInt(canvas.height) + ' [x' + res +']</p>';
	
	//draw over the last frame
	ctx.fillStyle = 'skyblue';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//draw the floor
	ctx.fillStyle = 'lightgreen';
	ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height);

	//redraw the screen
	player.drawScreen();
	player.drawEnemy(testEnemy);
	player.drawHud();

	//redraw the map
	player.drawMap(canvas.height * 0.01, canvas.width * 0.01, ctx.canvas.height * 0.3);

	
	//display debugging info
	if(!debug) info = '';
	info += '<p>FPS: ' + parseInt(fps) + '</p>';

	$('#debug-info').html(info);
	
	//recursively call this function
	requestAnimationFrame(mainLoop);
}

initialise();
