/** --------- INIT ------------- */

var adventure_audio = new Audio('static/music/adventure_awaits.mp3');
var boss_audio = new Audio('static/music/fantasy_boss.mp3');
var background_audio = new Audio('static/music/fantasy_town.mp3');
var attack_audio = new Audio('static/music/attack.mp3');
var damage_audio = new Audio('static/music/damaged.mp3');
var win_audio = new Audio('static/music/cheer.mp3');
var lose_audio = new Audio('static/music/respectfully_resigned.wav');
var nextLevel = false;

// keeps track if user has won the game
var game_won = false;

// keeps track of state of game
var tutorial_step = 0;

var canvas = document.getElementById('canvas_donny');
var context = canvas.getContext("2d");

background_audio.play();

canvas.width = window.innerWidth-100;
canvas.height = window.innerHeight-100;



/** --------- OBJECTS ------------- */

// Point (i.e donny)
function PointPlayer(px, py) {
	this.x = px;
	this.y = py;
	this.height = 10;
	this.width = 10
}

/** draws initial point; move functions are explanatory */
PointPlayer.prototype.draw = function() {
	context.fillRect(this.x, this.y, this.height, this.width)
}

PointPlayer.prototype.moveLeft = function() {
	context.clearRect(this.x, this.y, this.width, this.height);
	this.x -= 10;
	context.fillRect(this.x, this.y, this.height, this.width);
};

PointPlayer.prototype.moveRight = function() {
	context.clearRect(this.x, this.y, this.width, this.height);
	this.x += 10;
	context.fillRect(this.x, this.y, this.height, this.width);
};

PointPlayer.prototype.moveUp = function() {
	context.clearRect(this.x, this.y, this.width, this.height);
	this.y -= 10;
	context.fillRect(this.x, this.y, this.height, this.width);
};

PointPlayer.prototype.moveDown = function() {
	context.clearRect(this.x, this.y, this.width, this.height);
	this.y += 10;
	context.fillRect(this.x, this.y, this.height, this.width);
};

/** resets donny to the start (left part) of the canvas */
PointPlayer.prototype.reset = function() {
	context.clearRect(this.x, this.y, this.width, this.height);
	this.x = 400;
	this.y = 350;
	this.width = 10;
	this.height = 10;
	this.health = 3;
	context.fillRect(this.x, this.y, this.width, this.height);
};

/** decreases donny's health, checking for game over */
PointPlayer.prototype.healthDown = function() {
	this.health -= 1;
	if (this.health < 1) {
		background_audio.pause();
		background_audio.currentTime = 0;
		lose_audio.play();
		resetDonny();
		$("#dimmer").fadeIn(500);
	}
	$("#health_num").text(this.health);
	damage_audio.play();
};



/** Donut object (red square) */
function Donut(px, py) {
	this.x = px;
	this.y = py;
	this.height = 20;
	this.width = 20;
	this.health = 3;
}

/** Draws the donut */
Donut.prototype.draw = function() {
	context.fillStyle = "red";
	context.fillRect(this.x, this.y, this.width, this.height);
	context.fillStyle = "black";
}

/** Clears the donut from the canvas (i.e for starting a new level) */
Donut.prototype.clear = function() {
	context.clearRect(this.x, this.y, this.weight, this.height);
}


/** Rectangle obstacle object */
function rectangleObstacle(start_x, start_y, direction) {
	this.x = start_x;
	this.y = start_y;
	this.height = 30;
	this.width = 10;
	this.direction = direction;
}

/** Draws the initial obstacle */
rectangleObstacle.prototype.init = function() {
	context.fillRect(this.x, this.y, this.width, this.height);
}

/** Redraws the obstacle at new location (used for movement) */
rectangleObstacle.prototype.draw = function() {
	context.clearRect(this.x, this.y, this.width, this.height);

	this.y += 10*this.direction;

	if(this.y > canvas.height - 100 || this.y < 100) {
		this.direction *= -1;
		this.y = this.y*this.direction;
	}

	context.fillRect(this.x, this.y, this.width, this.height);
}

/** Clears this obstacle from the canvas */
rectangleObstacle.prototype.clear = function() {
	context.clearRect(this.x, this.y, this.width, this.height);
}

/**  Boss object (arc) */
function Boss() {
	this.x = 30;
	this.y = 30;
	this.velocity = 2.5;
	this.radius = 13;
}

/** draw initial picture of boss */
Boss.prototype.init = function() {
	context.beginPath();
	context.arc(this.x, this.y, this.radius, Math.PI / 7, -Math.PI / 7, false);
	context.lineTo(31, 37);
	context.fill();
}

/** follows donny (the user) */
Boss.prototype.draw = function () {

	context.clearRect(this.x, this.y, this.radius, this.radius);

	dx = donny.x - this.x;
	dy = donny.y - this.y;
	angle = Math.atan2(dy, dx);
	xVel = this.velocity * Math.cos(angle);
	yVel = this.velocity * Math.sin(angle);

	this.x += xVel;
	this.y += yVel;

	context.beginPath();
	context.arc(this.x, this.y, 13, Math.PI / 7, -Math.PI / 7, false);
	context.lineTo(this.x, this.x);
	context.fill();

}

/** --------- FUNCTIONS ------------- */

// handles movement and level switching
window.addEventListener('keydown', function(e) {
	if (e.keyCode == 37) {
		e.preventDefault();
		donny.moveLeft();
		if(tutorial_step > 0) {
			if(checkIntersecting(donny, donut)) {
				nextLevel = true;
				attack_audio.play();

			}
		} 
	} else if(e.keyCode == 39) {
		e.preventDefault();
		donny.moveRight();
		if(tutorial_step > 0) {
			if(checkIntersecting(donny, donut)) {
				nextLevel = true;
				attack_audio.play();

			}
		} 
	} else if (e.keyCode == 38) {
		donny.moveUp();
		if(tutorial_step > 0) {
			if(checkIntersecting(donny, donut)) {
				nextLevel = true;
				attack_audio.play();

			}
		} 
	} else if (e.keyCode == 40) {
		donny.moveDown();
		if(tutorial_step > 0) {
			if(checkIntersecting(donny, donut)) {
				nextLevel = true;
				attack_audio.play();

			}
		} 
	} else if(e.keyCode == 32) {
		if (nextLevel || tutorial_step == 0) {
			win_audio.play();
			tutorial_step++;
			console.log('switching to step: '+ tutorial_step)
			switchLevel(tutorial_step);
			nextLevel = false;
		}
	}
}
);


// switches the user level
function switchLevel(tutorial_step) {
	switch (tutorial_step) {
		case 1:
			$('#tut_step').text("Tutorial: go over the donut to eat it (press space to continue)");
			donut = new Donut(canvas.width/2, canvas.height/2);
			donut.draw();
			break;
		case 2: 
			$('#tut_step').text("Level 1: avoid the obstacles! (press space after eating the donut to continue)");
			background_audio.pause();
			background_audio.currentTime = 0;
			background_audio.play();
			resetDonny();
			drawObstacles();
			break;
		case 3:
			$('#tut_step').text("Level 2: Defeat the boss! (press space after eating the donut to continue");
			console.log('boss level!');
			background_audio.pause();
			background_audio.currentTime = 0;
			boss_audio.play();
			resetDonny();
			drawBoss();
			break;
		case 4:
			game_won = true;
			boss_audio.pause();
			adventure_audio.play();
			resetDonny();
			$("#gamewin").fadeIn(500);
			break;
	}	
}

// checks if a point is intersecting with a boss (arc)
function intersectingWithBoss(boss, donny) {
	return (donny.x >= boss.x || donny.x <=boss.x+boss.radius &&
		donny.y >= boss.y && donny.y <= boss.y + radius) 
}

// checks if one rectangle intersects with another on the canvas4
function checkIntersecting(rect_a, rect_b) {
	return (rect_a.x >= rect_b.x && rect_a.x <= rect_b.x + rect_b.width &&
		rect_a.y >= rect_b.y && rect_a.y <= rect_b.y + rect_b.height);
}

// draws the boss (attempted pacman but failed)
function drawBoss() {
	console.log('draw the boss');
	var boss = new Boss(50, 50);
	boss.init();
	setInterval(function() {
		if(checkIntersecting(boss, donny)) {
			if (!game_won) {
				console.log('donny hit the boss')
				boss_audio.pause();
				boss_audio.currentTime = 0;
				lose_audio.play();
				resetDonny();
				$("#dimmer").fadeIn(500);
			}
		}
		boss.draw();
	}, 20);
}

// draws all the obstacles + keep track
// of any collision 
function drawObstacles() {
	console.log('drawing obstacles');
	var rect1 = new rectangleObstacle(canvas.width/2, canvas.height/2, 1);
	var rect2 = new rectangleObstacle(canvas.width/2 - 100, canvas.height/2 + 10, -1);
	var rect3 = new rectangleObstacle(canvas.width/2 + 100, canvas.height/2 + 20, -1);
	var rect4 = new rectangleObstacle(canvas.width/2 - 200, canvas.height/2 + 20, 1);
	var rect5 = new rectangleObstacle(canvas.width/2 + 200, canvas.height/2 + 20, 1);
	rect1.init();
	rect2.init();
	rect3.init();
	rect4.init();
	rect5.init();
	var refreshID = setInterval(function() {
		if(checkIntersecting(rect1, donny) || checkIntersecting(rect2, donny) || checkIntersecting(rect3, donny) || checkIntersecting(rect4, donny) ||
			checkIntersecting(rect5, donny)) {
			console.log("donny hit a block");
			donny.healthDown();
			if (nextLevel) {
				//stop the obstacle loop if one of the obstacles hit donny
				clearInterval(refreshID);
			}
		}
		rect1.draw();
		rect2.draw();
		rect3.draw();
		rect4.draw();
		rect5.draw();
	}, 20);
}

// resets donny to the starting position in front of obstacles
function resetDonny() {
	console.log('reset donny');
	context.clearRect(0, 0, canvas.width, canvas.height);
	donny.reset();
	donut = new Donut(canvas.width-40, canvas.height/2);
	donut.draw();
}

/** --------- BEGIN GAME ------------- */

var donut;

// create donny (the user)
var donny = new PointPlayer(500,350); 
donny.draw();
