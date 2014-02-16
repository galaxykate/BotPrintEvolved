/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var BarGraph = Class.extend({

        init : function(parent) {
            var graph = this;
            this.createWindow(parent);
            this.slots = 5;
            this.timesteps = 20;
            this.currentTimestep = 0;
            this.height = 90;
            this.width = 430;
            this.range = new common.Range({
                min : 0,
                max : 100,
            });

            this.values = [];
            for (var i = 0; i < this.slots; i++) {
                this.values[i] = [];
                for (var j = 0; j < this.timesteps; j++) {
                    this.values[i][j] = undefined;
                }
            }

            setInterval(function() {
                for (var i = 0; i < graph.slots; i++) {
                    graph.updateValue(i, graph.currentTimestep, 50 * (1 + utilities.noise(i * 20 + .02 * graph.currentTimestep)));
                }
                graph.currentTimestep++;

            }, 100);
        },

        createWindow : function(parent) {
            var canvas = $("<canvas/>", {
                width : this.width + "px",
                height : this.height + "px",
            });
            parent.append(canvas);

            var graph = this;

            var drawFunc = function(g) {
                g.background(.8, 1, .3);

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
                }
            });
        },

        updateValue : function(index, time, value) {
            this.values[index][time] = value;
        },

        getX : function(t) {
            var steps = Math.max(30, this.currentTimestep);
            var start = this.currentTimestep - steps;
            var pct = (t - start) / steps;
            return pct * this.width;
        },

        getY : function(value) {
            var yPct = this.range.getPct(value);
            return yPct * this.height;
        },

        draw : function(g) {
            var spacing = 5;
            var t = this.currentTimestep - 1;

            for (var i = 0; i < this.slots; i++) {
                var h = (.156 * i) % 1;
                g.noFill();
                g.stroke(h, 1, 1);
                g.beginShape();

                var pastSteps = 30;
                for (var j = 0; j < pastSteps; j++) {
                    var t = this.currentTimestep - pastSteps + j;
                    g.vertex(this.getX(t), this.getY(this.values[i][t]));
                }
                g.endShape();

                g.fill(h, 1, 1);
                var v = this.values[i][t];
                g.ellipse(t * spacing, v, 20, 20);

                //           console.log(i + ": " + t + " " + v);
            }
        },
    });

    return {
        BarGraph : BarGraph,
    };
});
