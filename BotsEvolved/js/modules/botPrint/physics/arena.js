/**
 * @author Kate Compton
 */

define(["common", "./boxWorld", "graph"], function(common, BoxWorld, Graph) {'use strict';

    var Arena = Class.extend({

        init : function(shape) {

            this.border = new Graph.Path();
            this.bots = [];

            this.boxWorld = new BoxWorld(0);

            var sides = 8;

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
                    var sides = 5;
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

                //this gets called when nothing is passed in the init() parameter
                default:
                    for (var i = 0; i < sides; i++) {
                        var r = 200 + Math.random() * 130;
                        var theta = i * Math.PI * 2 / sides;
                        var p = common.Vector.polar(r, theta);
                        this.border.addPoint(p);
                    }
            }

            var ground = this.boxWorld.makeEdgeRing(this.border.nodes);

            ground.isTerrain = true;
        },
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
                }
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
            }
            app.log("Arena update: " + timestep + " time" + time.total);
            this.time += timestep

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
