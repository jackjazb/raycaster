var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var player;
var fov = Math.PI / 1.7;

var wall = new Image();
wall.src ='./textures/wall.png'; //'minig.jpg'; 

var map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,0,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1],
	[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,1,1,0,1,1,0,0,0,0,1,0,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1,0,1,1,0,0,1,1,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,0,0,0,1,0,1,1,1,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,1,0,0,0,1,1,1,0,0,1,0,1,0,0,0,1],
	[1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
	[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];


//debug toggle
var debug = false;

//displayed at the bottom of the screen after every update
var info = '';

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
	//corresponds roughly to rendering quality
	var rayIncrement = 0.01;
	//change decrease column count
	this.barFxVal = 1;

	//
	//CONTROL
	//
	//update the player's position and rotation
	this.update = function () {
		//this.barFxVal += 0.01;

		//rotate the player
		if (this.left) {
			this.angle -= turnSpeed;
		}
		if (this.right) {
			this.angle += turnSpeed;
		}
		//move forward and backwards
		if (this.sprint) {
			currentSpeed = sprintSpeed;
		}
		else {
			currentSpeed = speed;
		}
		//the next vector of the player
		var nextX = 0;
		var nextY = 0;
		if (this.forward) {
			nextX = this.x + currentSpeed * Math.sin(this.angle);
			nextY = this.y + currentSpeed * -Math.cos(this.angle);
		}
		if (this.back) {
			nextX = this.x - currentSpeed * Math.sin(this.angle);
			nextY = this.y - currentSpeed * -Math.cos(this.angle);
		}
		//check the new positions for collision
		if (map[Math.floor(this.y)][Math.floor(nextX)] == 0) {
			this.x = nextX;
		}
		if (map[Math.floor(nextY)][Math.floor(this.x)] == 0) {
			this.y = nextY;
		}
		//debugging info
		if (debug)
			info += '<p>player pos: (' + parseFloat(this.x).toFixed(3) + ', ' + parseFloat(this.y).toFixed(3) + ')</p>';
		if (debug)
			info += '<p>angle: ' + parseFloat(this.angle).toFixed(4) + '</p>';
		if (debug)
			info += '<p>fov: ' + parseFloat(this.fov).toFixed(4) + '</p>';
	};
	//
	//RENDERING
	//
	//draw the viewing plane relative to the player
	this.drawScreen = function () {
		//the player's distance from the viewing plane
		var distFromPlane = (canvas.width / 2) / Math.tan(this.fov / 2);

		//iterate over columns on the viewing plane
		for (x = 0; x < canvas.width; x += this.barFxVal) {
			//calculate the position of this ray relative to the center (ie the value of opp)
			var distFromCenter = x - (canvas.width / 2);

			//cast a ray relative to the player
			var rayAngle = this.angle + (Math.atan(distFromCenter / distFromPlane));
			var rayData = this.castRay(rayAngle);

			//the x position of the texture slice to take, based on the percentage through the wall this ray is
			var wallSlice = (wall.width - 1) * Math.abs(rayData.offset);

			//the dimensions of the column to be drawn
			var columnHeight = canvas.height / rayData.distance / 1.7;
			var columnY = (canvas.height - columnHeight) / 2;

			//draw the slice
			ctx.drawImage(wall, wallSlice, 0, 1, wall.height, x, columnY, 1, columnHeight);

			//draw a coloured column instead
			var lineWidth = 0.05;
			var side = rayData.side;

			//two colored mode, will be deleted later
			ctx.fillStyle = 'black';
			if (side == 'vertical') {
				ctx.fillStsyle = 'purple';
			}
			else if (side == 'horizontal') {
				ctx.fillStyle = 'orange'; //'rgb(' + parseFloat(240/distanceToWall) + ',0,0)';//'rgba(0,0,0' + parseFloat(1 - (0.5 / distanceToWall))+')';			
			}
			//ctx.fillRect(x, columnY, 1, columnHeight);

			//debugging thing - shows the distance returned by each ray
			ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
			if(debug )ctx.fillRect(x, (canvas.height - (rayData.distance * 20)) /2 , 1, rayData.distance * 20)
		}
		//cast a test ray in order to show certain data about what is being looked at
		var midRay = this.castRay(this.angle);
		if (debug)
			info += '<p>CENTRE RAY: dist: ' + parseFloat(midRay.distance).toFixed(3) + ', offset: ' + parseFloat(midRay.offset).toFixed(3) + ', side: ' + midRay.side + '</p>';
	};
	//cast a ray from the player and return certain data about its intersection
	this.castRay = function (angle) {
		//initialise data
		var distance = 0;

		//the current position of the ray's end
		var rayX = this.x;
		var rayY = this.y;
		var hitWall = false;
		while (!hitWall) {

			//increase the rays position
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
			
				//otherwise, it is a horizontal boundary
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
		return rayData;
	};

	//draw the hud
	this.drawHud = function () {
		ctx.fillStyle = 'black';
		ctx.fillRect(canvas.width / 2, canvas.height / 2, 5, 5);
	};
	//
	//DEBUGGING
	//
	this.drawMap = function (x, y, size) {
		var xPos = x;
		var yPos = y;
		var size = size;

		var squareOffset = -0.5;

		//size of each map grid square
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
		var dirArrLength = 10;

		//draw a dot for the player
		ctx.beginPath();
		ctx.arc(relPlayerX, relPlayerY, 1, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'purple';
		ctx.fill();
		ctx.lineWidth = 5;
		ctx.strokeStyle = 'purple';
		ctx.stroke();

		//draw a line for angle
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(relPlayerX, relPlayerY);
		ctx.lineTo(relPlayerX + dirArrLength * Math.sin(player.angle), relPlayerY + dirArrLength * -Math.cos(player.angle));
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

	this.checkDraw = function(){
		
	}
}


//
//RUN ONCE
//
function initialise(){
	//create a new player object
	player = new Player(10, 12.5, Math.PI / 2, fov);
	
	//set up key bindings
	initControls();
	
	player.drawScreen();
	
	//start the main game loop
	requestAnimationFrame(mainLoop);
}

//set up key listeners
function initControls(){
	//add key listeners
	window.onkeydown = function(e){
		var key = e.keyCode;
		if(key == 87){player.forward = true;}	
		if(key == 83){player.back = true;}	
		if(key == 65){player.left = true;}
		if(key == 68){player.right = true;}

		if(key == 16){player.sprint = true;}
	}
	
	window.onkeyup = function(e){
		var key = e.keyCode;
		if(key == 87){player.forward = false;}	
		if(key == 83){player.back = false;}	
		if(key == 65){player.left = false;}
		if(key == 68){player.right = false;}
		
		if(key == 16){player.sprint = false;}
	} 
}

//
//RUN EVERY FRAME
//
function update(){
	info = '';
	//update the player
	player.update();
	
	//redraw the screen
	player.drawScreen();
	player.drawHud();

	//redraw the map
	player.drawMap(10, 10, 250);		
}

function mainLoop(){
	//draw over the last frame
	ctx.fillStyle = 'skyblue';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//draw the floor
	ctx.fillStyle = 'lightgreen';
	ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height);
	
	//game update function
	update();
	
	//display debugging info
	$('#info').html(info);
	
	//recursively call this function
	requestAnimationFrame(mainLoop);
}

//debugging controls
$('#debug').click(function(){
	if(debug) debug = false;
	else if(!debug) debug = true;
});
initialise();