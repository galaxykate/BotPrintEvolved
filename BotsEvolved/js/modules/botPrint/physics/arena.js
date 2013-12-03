/**
 * @author Kate Compton
 */

define(["common", "./boxWorld"], function(common, BoxWorld) {'use strict';

    var Arena = Class.extend({
        init : function() {
            this.border = new common.Region(new common.Vector(0, 0));
            this.bots = [];

            this.boxWorld = new BoxWorld(0);

            var sides = 8;
            for (var i = 0; i < sides; i++) {
                var r = 200 + Math.random() * 130;
                var theta = i * Math.PI * 2 / sides;
                var p = common.Vector.polar(r, theta);
                this.border.addPoint(p);
            }
            var ground = this.boxWorld.makeEdgeRing(this.border.points);
            ground.isTerrain = true;
        },

        reset : function() {
            this.time = 0;
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
            // Give each bot an arena position
            $.each(population, function(index, bot) {
                arena.bots.push(bot);
                var t = new common.Transform();

                t.setToPolar(Math.random() * 400 - 200, Math.random() * 400 - 200);
                t.rotation = Math.random() * 200;
                bot.transform = t;
            });

            arena.boxWorld.addObjects(population);

        },

        runFor : function(seconds, timestep, postUpdate) {

            while (this.time < seconds) {
                this.time += timestep;
                this.boxWorld.simulate(timestep);
                postUpdate();
            }

        },

        update : function(time) {
            this.time += time.ellapsed;
            $.each(this.bots, function(index, bot) {
                bot.update(time);
            });
            this.boxWorld.simulate(time.ellapsed);
        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame
        render : function(context) {
            var g = context.g;
            //   g.ellipse(0, 0, 400, 400);

            // Draw the edges
            var arenaColor = new common.KColor(.2, .6, .2);
            g.strokeWeight(3);
            arenaColor.stroke(g, -.3, 1);
            arenaColor.fill(g, -.3, -.5);
            this.border.render(context);

            context.simplifiedBots = true;
            $.each(this.bots, function(index, bot) {
                bot.render(context);

                g.fill(0);
                //       g.text(bot.transform, bot.transform.x, bot.transform.y);
            });

            this.boxWorld.render(g);
        },
    });

    return Arena;
});
