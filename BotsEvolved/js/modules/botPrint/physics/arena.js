/**
 * @author Kate Compton
 */

define(["common", "./boxWorld", "graph"], function(common, BoxWorld, Graph) {'use strict';

	var Arena = Class.extend({

		init : function(shape, sides, density) {
			this.border = new Graph.Path();
			this.bots = [];
			this.boxWorld = new BoxWorld(0);
			this.obstacles = [];
			switch (shape) {
				case "rectangle":
					var width = 990;
					var height = 590;
					this.generateArenaRectangular(width, height);
					break;
				case "hexagon":
					var sides = 6;
					this.generateArenaPolygonal(sides, true);
					break;
				case "circle":
					var sides = 16;
					this.generateArenaPolygonal(sides, true);
					break;
				case "random":
					//Arenas are random now it generates from a triangle to an icosagon (circle?).
					var sides = this.randomRange(3, 20);
					this.generateArenaPolygonal(sides, false);
					break;
				//An obstacle course is a rectangle arena with random smaller squares on top of it as obstacles.
				case "obstacle":
					//The arena is a bit larger in this instance because we want to fit obstacles in it and have the bots move around them.
					var width = 990;
					var height = 590;
					this.generateArenaRectangular(width, height);
					//Now let's populate the world with obstacles.
					var nObstacles = this.randomRange(3, 10);
					//We have a number of random obstacles to generate now, let's build them
					this.generateObstaclesRandom(nObstacles, (-1) * (width / 2), (-1) * (height / 2), (width / 2), (height / 2), 32);
					this.addObstaclesToBoxWorld(this.obstacles);

					break;
				case "custom":
					if (sides == 4) {
						var width = 990;
						var height = 590;
						this.generateArenaRectangular(width, height);
					} else {
						this.generateArenaPolygonal(sides, false);
					}
					
					break;
				//this gets called when nothing is passed in the init() parameter
				default:
					this.generateArenaPolygonal(4);
			}

			//returns a Box2d body that is used for the arena collision
			var ground = this.boxWorld.makeEdgeRing(this.border.nodes);
			ground.isTerrain = false;
			//Super hacky way to add obstacles?
			//alert("shape="+shape);
		},

		//-----------------------------------------------
		// Quick Utility functions that I need for porting -> These will be moved to the Utility classes later.

		randomRange : function(max, min) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},

		//-----------------------------------------------
		// Arena Container Generation
		validateCanvasConstrains : function(p) {
			if (p.x <= -500) {
				p.x = this.randomRange(-430, -495);
			}
			if (p.x >= 500) {
				p.x = this.randomRange(430, 495);
			}
			if (p.y <= -300) {
				p.y = this.randomRange(-230, -295);
			}
			if (p.y >= 300) {
				p.y = this.randomRange(230, 295);
			}
			return p;
		},

		generateArenaPolygonal : function(sides, isRegular) {
			var r = 600;
			if (isRegular == true) {
				r = 370;
			}
			for (var i = 0; i < sides; i++) {
				if (sides % 2 == 1) {
					//the .95 fixes the default rotation for odd numbers of sides
					var theta = (i * Math.PI * 2 / sides) + .95;
				} else {
					var theta = (i * Math.PI * 2 / sides);
				}
				var p = common.Vector.polar(r, theta);
				if (isRegular == false) {
					p = this.validateCanvasConstrains(p);
				}
				this.border.addPoint(p);
			}
		},
		generateArenaRectangular : function(width, height) {
			var center = new Vector(0, 0);
			this.border.addPoint(new Vector(center.x - width / 2, center.y - height / 2));
			//topLeft point
			this.border.addPoint(new Vector(center.x - width / 2, center.y + height / 2));
			//bottom left
			this.border.addPoint(new Vector(center.x + width / 2, center.y + height / 2));
			//bottom right
			this.border.addPoint(new Vector(center.x + width / 2, center.y - height / 2));
			//top right
		},

		//-----------------------------------------------
		// Authored Arena Shape Generation

		//-------------------------------------------
		// Obstacle Generation
		//Generate n randomly positioned obstacles within a rectangular arena.
		generateObstaclesRandom : function(nObstacles, minX, minY, maxX, maxY, size) {
			for (var i = 0; i < nObstacles; i++) {
				//We want to select something inside the arena, thus we limit the ranges for random places to the corners of the arena. The obstacles are of 50*50px size, but you can change that. Maybe even randomize them for the moment.
				var obsWidth = size;
				var obsHeight = size;
				var x1 = minX + size;
				var x2 = maxX - size;
				var y1 = minY + size;
				var y2 = maxY - size;
				var centerX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
				var centerY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
				//We have the center coordinates, let's assign it to a vector and calculate the corner vertices.
				var obsCenter = new Vector(centerX, centerY);
				var obsminX = obsCenter.x - obsWidth / 2;
				var obsmaxX = obsCenter.x + obsWidth / 2;
				var obsminY = obsCenter.y - obsHeight / 2;
				var obsmaxY = obsCenter.y + obsHeight / 2;
				//Let's create a path!
				var obsPath = new Graph.Path();
				obsPath.addPoint(new Vector(obsminX, obsminY));
				obsPath.addPoint(new Vector(obsminX, obsmaxY));
				obsPath.addPoint(new Vector(obsmaxX, obsmaxY));
				obsPath.addPoint(new Vector(obsmaxX, obsminY));
				this.obstacles[i] = obsPath;
			}
		},
		//Generate a 4 sided obstacle at a point (x,y) of size (sizeX*sizeY)
		generateObstacleAt : function(obsX, obsY, sizeX, sizeY) {
			var obsWidth = sizeX;
			var obsHeight = sizey;
			var obsCenter = new Vector(obsX, obsY);
			var obsminX = obsCenter.x - obsWidth / 2;
			var obsmaxX = obsCenter.x + obsWidth / 2;
			var obsminY = obsCenter.y - obsHeight / 2;
			var obsmaxY = obsCenter.y + obsHeight / 2;
			//Let's create a path!
			var obsPath = new Graph.Path();
			obsPath.addPoint(new Vector(obsminX, obsminY));
			obsPath.addPoint(new Vector(obsminX, obsmaxY));
			obsPath.addPoint(new Vector(obsmaxX, obsmaxY));
			obsPath.addPoint(new Vector(obsmaxX, obsminY));
			this.obstacles.push(obsPath);
		},
		//Generate a regular polygonal obstacle of size (size) at (x,y)
		generateObstaclePolygonalAt : function(obsX, obsY, size, sides) {
			var obsPath = new Graph.Path(); 
			var r = size;
			for (var i = 0; i < sides; i++) {
				if (sides % 2 == 1) {
					//the .95 fixes the default rotation for odd numbers of sides
					var theta = (i * Math.PI * 2 / sides) + .95;
				} else {
					var theta = (i * Math.PI * 2 / sides);
				}
				var p = common.Vector.polar(r, theta);
				p.x = p.x + obsX;
				p.y = p.y + obsY;
				obsPath.addPoint(p);
			}
			this.obstacles.push(obsPath);
		},
		addObstaclesToBoxWorld : function(obstacles) {
			var obsShapes = new Array();
			for (var i = 0; i < this.obstacles.length; i++) {
				//alert("this.obstacles[i].nodes="+obstacles[i].nodes);
				obsShapes[i] = this.boxWorld.makeEdgeRing(this.obstacles[i].nodes);
				obsShapes[i].isTerrain = false;
			}
			return obsShapes;
		},
		//-----------------------------------------------
		// Reset Function
		reset : function() {
			this.time = 0;
			this.resetDrawing();
			this.boxWorld.removeBodies();
		},

		//-------------------------------------------
		// User interaction

		hover : function(p) {
			var bot = this.getAt({
				pos : p
			});
			if (this.selected !== undefined)
				this.deselect(this.selected);

			if (bot !== undefined) {

				this.select(bot);
			}
		},

		selectBotAt : function(p) {
			var bot = this.getAt({
				pos : p
			});

			if (this.selected !== undefined)
				this.deselect(this.selected);
			if (bot !== undefined) {
				this.select(bot);
			}

			if (bot !== undefined) {
				app.editBot(bot);
			}
		},

		// Select and deselect: simple for now,
		// but will eventually trigger more complicated UI
		select : function(bot) {
			this.selected = bot;
			bot.selected = true;
		},

		deselect : function(bot) {
			this.selected = undefined;
			bot.selected = false;
		},

		//-------------------------------------------
		// Hit testing
		getAt : function(query) {

			var p = new Vector(query.pos);
			var closest = undefined;
			var closestDist = 120;
			$.each(this.bots, function(index, bot) {
				// Transform

				var d = bot.transform.getDistanceTo(query.pos);
				app.moveLog(index + ": " + d);
				if (d < closestDist) {
					app.moveLog("  closest!");
					closest = bot;
					closestDist = d;
				}

			});

			return closest;
		},

		//========================================================
		//========================================================
		//========================================================

		//========================================================
		//========================================================
		//========================================================

		//-------------------------------------------
		// Run a test

		addPopulation : function(population) {
			var arena = this;
			arena.reset();
			arena.scores = [];
			arena.bots = [];

			// Give each bot an arena position
			$.each(population, function(index, bot) {
				arena.bots.push(bot);
				var t = new common.Transform();

				t.setToPolar(Math.random() * 400 - 200, Math.random() * 400 - 200);
				t.rotation = Math.random() * 200;
				bot.transform = t;
				arena.scores[index] = {
					total : 0,
					individual : bot,
				};
			});

			arena.boxWorld.addObjects(population);

		},

		runFor : function(seconds, timestep) {
			var total = 0;
			while (total < seconds) {
				total += timestep;
				this.update(timestep);
			}
		},

		update : function(timestep) {
			app.log("Arena update: " + timestep);
			var time = {
				total : this.time,
				ellapsed : timestep,
			};
			app.log("Arena update: " + timestep + " time" + time.total);
			this.time += timestep;

			$.each(this.bots, function(index, bot) {
				bot.update(time);
			});

			$.each(this.bots, function(index, bot) {
				bot.act(time);
			});
			this.boxWorld.simulate(time.ellapsed);

			this.postUpdate();

		},

		postUpdate : function() {
			this.updateScores();
		},

		updateScores : function() {
			var arena = this;
			$.each(this.bots, function(index, bot) {
				arena.scores[index].total = arena.getLightMapAt(bot.transform);
				app.log(index + ": score " + arena.scores[index].total);
			});
		},

		//-------------------------------------------
		//  Light maps and drawing maps

		resetDrawing : function() {
			var g = this.drawingMap;
			if (g !== undefined) {

				g.background(1);
				g.beginDraw();
				for (var i = 0; i < 20; i++) {
					var x = Math.random() * g.width;
					var y = Math.random() * g.height;
					g.noStroke();
					var r = 150 * (Math.random() + 1);
					g.fill(Math.random() * .2 + .5, .1 + .3 * Math.random(), 1, .5);
					g.ellipse(x, y, r, r);

				}
				g.endDraw();
			}

		},

		drawOnto : function(p, drawFxn) {

			var g = this.drawingMap;
			if (g !== undefined) {

				var x = Math.round(p.x + g.width / 2);
				var y = Math.round(p.y + g.height / 2);

				g.pushMatrix();
				g.translate(x, y);
				g.rotate(p.rotation);
				drawFxn(g);
				g.popMatrix();
			}
		},

		createDrawingMap : function() {

			var g = this.drawingMap;
			g.colorMode(g.HSB, 1);
			this.resetDrawing();
		},

		getLightMapAt : function(p) {
			if (this.lightMap === undefined)
				return 0;

			var x = Math.round(p.x + this.lightMap.width / 2);
			var y = Math.round(p.y + this.lightMap.height / 2);

			var b = this.lightMap.brightness(this.lightMap.get(x, y));
			return b;
		},

		createLightMap : function() {

			var g = this.lightMap;
			g.colorMode(g.HSB, 1);
			g.background(0);
			g.beginDraw();

			var layers = 18;
			for (var i = 0; i < 7; i++) {
				var x = Math.random() * g.width;
				var y = Math.random() * g.height;

				for (var j = 0; j < layers; j++) {

					var pct = (j / (layers - 1));
					var r = 300 * Math.pow(pct, 2.6);

					g.noStroke();
					g.fill(1, .0, 1, .04 + .2 * (1 - pct));
					g.ellipse(x, y, r, r);
				}
			}

			g.filter(g.BLUR, 2);
			g.loadPixels();

			g.updatePixels();
			g.endDraw();
		},

		//-------------------------------------------
		// View stuff - will probably end up in it's own file
		// render this bot in a 2D frame
		render : function(context) {
			var g = context.g;

			//   g.ellipse(0, 0, 400, 400);
			if (this.lightMap === undefined) {
				this.lightMap = g.createGraphics(g.width, g.height);
				this.createLightMap(g);
			}

			if (this.drawingMap === undefined) {
				this.drawingMap = g.createGraphics(g.width, g.height);
				this.createDrawingMap(g);
			}

			g.image(this.lightMap, -g.width / 2, -g.height / 2);
			//g.image(this.drawingMap, -g.width / 2, -g.height / 2);
			// Draw the edges
			var arenaColor = new common.KColor(.2, .6, .2);
			g.strokeWeight(3);
			arenaColor.stroke(g, .3, .5);
			arenaColor.fill(g, .5, .85);
			this.border.drawFilled(context);
			// Draw the obstacles
			var obstacleColor = new common.KColor(.3, .9, .3);
			g.strokeWeight(10);
			obstacleColor.stroke(g, .5, .7);
			obstacleColor.fill(g, .75, .85);
			for (var i = 0; i < this.obstacles.length; i++) {
				this.obstacles[i].drawFilled(context);
			}
			context.simplifiedBots = true;
			$.each(this.bots, function(index, bot) {
				bot.render(context);

				g.fill(0);
				//       g.text(bot.transform, bot.transform.x, bot.transform.y);
			});

			this.boxWorld.render(g);

			// Update the tree viz
			if (app.evoSim !== undefined)
				app.evoSim.treeViz.updateText();

		},
	});

	return Arena;
});
