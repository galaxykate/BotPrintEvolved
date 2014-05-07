/**
 * @author Kate Compton
 */
define(["common", "../physics/arena", "./test"], function(common, Arena, Test) {'use strict';

    // One simulation may have multiple tests
    var Simulation = Class.extend({

        init : function(population, arena, heuristics) {
            var sim = this;
            sim.tests = [];

            sim.arena = arena;
            sim.population = population;

            sim.heuristics = heuristics;
            sim.time = new common.Time("simTime");
            sim.step = 0;
            sim.testRate = 5;
            // Calculate scores every N steps
			this.className = "Simulation";
            heuristics.forEach(function(heuristic) {
                sim.tests.push(new Test(population, heuristic));
            });

        },

        getTest : function(name) {
            console.log("Get test " + name);
            var found;
            this.tests.forEach(function(test) {
                console.log(test.heuristic.name + " " + name);
                if (test.heuristic.name === name) {
                    found = test;
                }
            });

            console.log("found: " + found.heuristic.name);
            return found;
        },

        start : function() {
        	console.log("Start is getting called on switch!");
            // clear the arena, put the bots in it
            this.arena.reset();
            this.arena.addPopulation(this.population);
            app.setCurrentBot(this.population[0]);
        },
        
        refreshBots : function() {
        	console.log("Refreshing bots");
        	this.arena.reset();
        	this.arena.addPopulation(this.population);
        },

        run : function(totalTime, timestep) {
            var sim = this;
            var count = Math.ceil(totalTime / timestep);
            var timestep = totalTime / count;
            for (var i = 0; i < count; i++) {
                sim.time.addEllapsed(timestep);
                sim.simStep(sim.time);
            }
            this.tests.forEach(function(test) {
                test.calculateFinalScores();
            });
        },

        // Actually simulate and run tests
        simStep : function(time) {
            app.log(time + ": simulate " + this.step);
            this.step++;

            // Update all the bots
            this.population.forEach(function(bot) {
                bot.update(time);
            });

            // Do physics update
            this.arena.boxWorld.simulate(time.ellapsed);

            if (this.step % this.testRate === 0) {

                this.tests.forEach(function(test) {
                    test.evaluate(time);
                });

            }

        },

        updateScores : function() {
            var arena = this;
            $.each(this.bots, function(index, bot) {
                arena.scores[index].total = arena.getLightMapAt(bot.transform);
                app.log(index + ": score " + arena.scores[index].total);
            });
        },

        //====================================================================

        getAt : function(query) {
            var closestDist = query.range ? query.range : 100;
            var closest;
            this.population.forEach(function(bot) {
                var d = bot.getDistanceTo(query.screenPos);
                if (d < closestDist) {
                    closestDist = d;
                    closest = bot;
                }
            });

            return closest;
        },

        //====================================================================

        draw : function(context) {
            this.arena.render(context);

            this.population.forEach(function(bot) {
                bot.render(context);
            });
        },

        //====================================================================

        testsToString : function() {
            var s = "";
            this.tests.forEach(function(test) {
                s += test.scoresToString();
            });
            return s;
        }
    });

    return Simulation;

});
