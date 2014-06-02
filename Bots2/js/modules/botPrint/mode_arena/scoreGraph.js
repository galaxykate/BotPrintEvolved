/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var BarGraph = Class.extend({

        init : function(parent) {
            var graph = this;
            this.timesteps = 10;
            this.height = 90;
            this.width = 430;
            this.className = "BarGraph";
            this.createWindow(parent);

        },

        setTest : function(test) {
            this.test = test;
        },

        createWindow : function(parent) {
            var canvas = $("<canvas/>", {
                width : this.width + "px",
                height : this.height + "px",
            });
            parent.append(canvas);

            var graph = this;

            var drawFunc = function(g) {
                g.background(.8, .1, 1);

                graph.draw(g);
            };

            var setupFunc = function(g) {
                g.colorMode(g.HSB, 1);

            };

            var processingInstance = new Processing(canvas.get(0), function sketchProc(processing) {
                // Setup
                processing.size(canvas.width(), canvas.height());
                if (setupFunc)
                    setupFunc(processing);

                // Override draw function, by default it will be called 60 times per second
                processing.draw = function() {
                    drawFunc(processing);
                };
            });
        },

        getValue : function(i, t) {
            if (!this.test)
                return utilities.noise(i, t * .03);

            return this.test.getScore(i, t);
        },

        getX : function(t) {
            var steps = 30;
            var start = this.test.currentIndex - steps;
            var pct = (t - start) / steps;
            return pct * this.width;
        },

        getY : function(value) {
            var yPct = this.test.heuristic.range.getPct(value);
            return yPct * this.height;
        },

        draw : function(g) {
            g.background(.3, 1, 1);
            var spacing = 5;

            g.fill(0);
            var t = this.test.currentIndex - 1;
            g.text(this.test + " " + t, 20, 40);
            if (this.test) {
                var count = this.test.population.length;
                for (var i = 0; i < count; i++) {

                    var bot = this.test.population[i];

                    var idColor = bot.idColor;
                    g.noFill();
                    idColor.stroke(g);
                    g.beginShape();

                    var pastSteps = 30;
                    for (var j = 0; j < pastSteps; j++) {
                        var t = this.test.currentIndex - pastSteps + j;
                        var v = this.getValue(i, t);
                        g.vertex(this.getX(t), this.getY(v));
                    }
                    g.endShape();

                    idColor.fill(g);
                    var v = this.getValue(i, t);

                    g.ellipse(this.getX(t), this.getY(v), 20, 20);
                }
            }
        }
    });

    return {
        BarGraph : BarGraph,
    };
});
