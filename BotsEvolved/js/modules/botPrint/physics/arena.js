/**
 * @author Kate Compton
 */

define(["common", "./boxWorld"], function(common, boxWorld) {'use strict';

    var Arena = Class.extend({
        init : function() {
            this.border = new common.Region(new common.Vector(0, 0));
            this.bots = [];

            var sides = 8;
            for (var i = 0; i < sides; i++) {
                var r = 100 + Math.random() * 30;
                var theta = i * Math.PI * 2 / sides;
                var p = common.Vector.polar(r, theta);
                this.border.addPoint(p);
            }
        },

        //-------------------------------------------
        // User interaction

        hover : function(p) {
            var bot = this.getAt({
                pos : p
            });

            if (bot !== undefined) {
                if (this.selected !== undefined)
                    this.deselect(this.selected);
                this.select(bot);
            }
        },

        selectBotAt : function(p) {

        },

        // Select and deselect: simple for now,
        // but will eventually trigger more complicated UI
        select : function(bot) {
            app.moveLog("SELECT: " + bot);
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

            app.moveLog("SEARCH FOR " + query.pos);
            var p = new Vector(query.pos);
            var closest = undefined;
            var closestDist = 50;
            $.each(this.bots, function(index, bot) {
                // Transform
                var p2 = new Vector();
                bot.arenaTransform.toLocal(p, p2);
                app.moveLog(bot + ": " + p2);
                var d = p2.magnitude();
                if (d < closestDist) {
                    closest = bot;
                    closestDist = d;
                }

            });
            return closest;
        },

        //-------------------------------------------
        // Run a test

        runTest : function(population) {
            this.bots = population;

            // Give each bot an arena position
            $.each(this.bots, function(index, bot) {
                var t = new common.Transform();
                t.scale = .4;
                t.translation = Vector.polar(Math.random() * 200, Math.random() * 200);
                t.rotation = Math.random() * 200;
                bot.arenaTransform = t;
            });
        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame
        render : function(context) {
            var g = context.g;
            //   g.ellipse(0, 0, 400, 400);

            // Draw the edges
            g.fill(.68, 1, 1);
            g.noStroke();
            this.border.render(context);
            context.simplifiedBots = true;
            $.each(this.bots, function(index, bot) {
                g.pushMatrix();
                bot.arenaTransform.applyTransform(g);
                bot.render(context);
               
                g.popMatrix();
                 g.fill(0);
                g.text(bot.arenaTransform.translation, bot.arenaTransform.translation.x, bot.arenaTransform.translation.y);
            });

        },
    });

    return Arena;
});
