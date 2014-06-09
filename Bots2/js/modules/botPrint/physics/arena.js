/**
 * @author Kate Compton
 */

define(["common", "./boxWorld", "graph"], function(common, BoxWorld, Graph) {'use strict';

    // The arena should just contain the arena shape, any stuff in it, and the lightmap/drawingmap

    var Arena = Class.extend({

        init : function(shape) {
            this.border = new Graph.Path();
            this.bots = [];

            this.boxWorld = new BoxWorld(0);
			this.className = "Arena";
            this.obstacles = [];
            this.shape = shape;
            switch (shape) {

                case "rectangle":
                    //still need to change this to consider the screen width and the camera
                    var width = 600;
                    var height = 400;

                    var center = new Vector(0, 0);

                    this.border.addPoint(new Vector(center.x - width / 2, center.y - height / 2));
                    //topLeft point
                    this.border.addPoint(new Vector(center.x - width / 2, center.y + height / 2));
                    //bottom left
                    this.border.addPoint(new Vector(center.x + width / 2, center.y + height / 2));
                    //bottom right
                    this.border.addPoint(new Vector(center.x + width / 2, center.y - height / 2));
                    //top right
                    break;
                case "hexagon":
                    var sides = 6;
                    var r = 250;
                    for (var i = 0; i < sides; i++) {
                        //the .95 fixes the default rotation

                        var theta = (i * Math.PI * 2 / sides) + .95;

                        var p = common.Vector.polar(r, theta);
                        this.border.addPoint(p);
                    }
                    break;
                case "circle":
                    var sides = 16;
                    var r = 250;
                    for (var i = 0; i < sides; i++) {
                        //the .95 fixes the default rotation

                        var theta = (i * Math.PI * 2 / sides) + .95;
                        var p = common.Vector.polar(r, theta);
                        this.border.addPoint(p);
                    }
                    break;
                case "random":
                    //Arenas are random now it generates from a triangle to an icosagon (circle?).

                    var min = 3;
                    var max = 20;
                    var random = Math.floor(Math.random() * (max - min + 1)) + min;
                    var sides = random;
                    var r = 250;
                    for (var i = 0; i < sides; i++) {
                        //the .95 fixes the default rotation

                        var theta = (i * Math.PI * 2 / sides) + .95;
                        var p = common.Vector.polar(r, theta);
                        this.border.addPoint(p);
                    }
                    break;
                //An obstacle course is a rectangle arena with random smaller squares on top of it as obstacles.
                //A good heuristic for tests would be measuring obstacle avoidance.
                case "obstacle":
                    //The arena is a bit larger in this instance because we want to fit obstacles in it and have the bots move around them.
                    var width = 670;
                    var height = 470;

                    var center = new Vector(0, 0);
                    //These will be the reference points in which we want to put the obstacles.
                    var minX = center.x - width / 2;
                    var maxX = center.x + width / 2;
                    var minY = center.y - height / 2;
                    var maxY = center.y + height / 2;
                    //But first we have to generate the container.
                    this.border.addPoint(new Vector(minX, minY));
                    //topLeft point
                    this.border.addPoint(new Vector(minX, maxY));
                    //bottom left
                    this.border.addPoint(new Vector(maxX, maxY));
                    //bottom right
                    this.border.addPoint(new Vector(maxX, minY));
                    //top right
                    //Now let's populate the world with obstacles.

                    var min = 3;
                    var max = 10;
                    var nObstacles = Math.floor(Math.random() * (max - min + 1)) + min;
                    //We have a number of random obstacles to generate now, let's build them
                    //	alert("nObstacles="+nObstacles);

                    for (var i = 0; i < nObstacles; i++) {

                        //We want to select something inside the arena, thus we limit the ranges for random places to the corners of the arena. The obstacles are of 50*50px size, but you can change that. Maybe even randomize them for the moment.

                        var obsWidth = 50;
                        var obsHeight = 50;
                        var x1 = minX;
                        var x2 = maxX;
                        var y1 = minY;
                        var y2 = maxY;

                        var centerX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
                        var centerY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
                        //alert("cX="+centerX+" cY="+centerY);
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
                    break;
                //this gets called when nothing is passed in the init() parameter

                default:
                    for (var i = 0; i < sides; i++) {
                        var r = 200 + Math.random() * 130;
                        var theta = i * Math.PI * 2 / sides;
                        var p = common.Vector.polar(r, theta);
                        this.border.addPoint(p);
                    }
            }
            this.addToBoxWorld();
        },

        addToBoxWorld : function() {
            //returns a Box2d body that is used for the arena collision
            var ground = this.boxWorld.makeEdgeRing(this.border.nodes);
            ground.isTerrain = false;
            //Super hacky way to add obstacles?
            //alert("shape="+shape);

            var obsShapes = new Array();
            for (var i = 0; i < this.obstacles.length; i++) {

                //alert("this.obstacles[i].nodes="+obstacles[i].nodes);
                obsShapes[i] = this.boxWorld.makeEdgeRing(this.obstacles[i].nodes);
                obsShapes[i].isTerrain = false;

            }

        },

        reset : function() {
            this.resetDrawing();
            this.boxWorld.removeBodies();
        },

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
                
                console.log("Checking to see if a post-hoc transform swap is what is driving me up a wall...");
                bot.updateSubTransforms();
            });
            
            arena.boxWorld.addObjects(population, 2.0, 0.0, 0.0);
            
            var wheels = [];
            
            //see if each bot needs wheels, add the wheels to the box2D setup
            $.each(arena.bots, function(index, bot) {
            	$.each(bot.mainChassis.parts, function(index, part) {
            		if (part.type === "wheel"){
            			wheels.push(part);
            		}
            	});
            });
            
            arena.boxWorld.addObjects(wheels, 4.0, 0.0, 0.0);
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

            //g.image(this.lightMap, -g.width / 2, -g.height / 2);
            //g.image(this.drawingMap, -g.width / 2, -g.height / 2);

            // Draw the edges
            var arenaColor = new common.KColor(.2, .01, .5);
            g.strokeWeight(3);
            arenaColor.stroke(g, -.3, .5);
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

        },
    });

    return Arena;
});
