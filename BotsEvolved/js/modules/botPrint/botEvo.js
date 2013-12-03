/**
 * @author Kate Compton
 */

define(["common", "modules/evo/evoSim", "./ai/dtree"], function(common, EvoSim, DTree) {'use strict';
    //createGenome, createIndividual, mutateGenome, crossoverGenomes, evaluatePopulation

    var BrainEvo = EvoSim.extend({
        init : function(bot, task, arena) {
            this._super();
            this.genomeLength = 30;
            this.cohortSize = 4;

            this.bot = bot;
            this.task = task;
            this.arena = arena;

            this.treeViz = new DTree.DTreeViz();
            this.scoredPopulation = [];

        },

        createGenome : function() {
            var genome = [];
            for (var i = 0; i < this.genomeLength; i++) {
                genome[i] = Math.random();
            }
            return genome;
        },

        createIndividual : function(genome) {
            var sensors = this.bot.sensors;
            var actuators = this.bot.actuators;
            console.log(sensors);
            console.log(actuators);

            var dtree = new DTree.DTree();

            dtree.generateTree(function(node) {

                var isAction = Math.random() > .5 && node.depth > 1;
                if (node.depth >= 4)
                    isAction = true;

                if (isAction) {
                    node.setAction(utilities.getRandom(actuators), Math.random());
                } else {
                    node.setFalseBranch(new DTree.DTree());
                    node.setTrueBranch(new DTree.DTree());

                    node.setCondition(utilities.getRandom(sensors), utilities.getRandom(DTree.comparators), Math.random());

                }

            });
            console.log(dtree);
            return dtree;

        },

        mutateGenome : function(genome, amt) {

        },

        crossoverGenomes : function(g0, g1) {

        },

        //----------------
        // Test individuals one at a time
        // evaluatePopulation returns an array of objects{individual:obj, avgScore:num}

        evaluatePopulation : function(population, callback) {
            var evoSim = this;
            var scoredPopulation = [];
            this.scoredPopulation = scoredPopulation;

            // Run each individual in the arena for N seconds
            var index = 0;
            var individual;
            console.log(population);
            var arena = this.arena;
            var testBot = this.bot;

            var evaluateIndividual = function() {
                if (index < population.length) {

                    individual = population[index];
                    var score = 0;
                    console.log(index + ": Testing " + individual);
                    setTimeout(finishedEvaluating, 150);

                    // Switch the bot's brain
                    testBot.decisionTree = individual;

                    // Clear the arena and reset the bot position
                    testBot.arena = arena;
                    arena.addPopulation([testBot]);
                    testBot.transform.reset();
                    var lastPos = new common.Transform();
                    var currentPos = new common.Transform();
                    lastPos.cloneFrom(testBot.transform);
                    scoredPopulation[index] = {
                        individual : individual,
                        avgScore : 0,

                    };

                    var updateScore = function() {
                        currentPos.cloneFrom(testBot.transform);
                        // Get the difference in position
                        var dTheta = currentPos.rotation - lastPos.rotation;
                        var d = lastPos.getDistanceTo(currentPos);
                        scoredPopulation[index].avgScore += d;
                        lastPos.cloneFrom(currentPos);
                    }

                    arena.runFor(1, .03, updateScore);
                    //   finishedEvaluating();

                } else {
                    // Update the score window

                    // finished testing!
                    callback(scoredPopulation);
                }
            };

            var finishedEvaluating = function() {
                // Distance
                var score = scoredPopulation[index].avgScore;
                console.log(index + ": Finished testing " + individual + " - " + score);
                index++;

                // Evaluate the next individual
                evaluateIndividual();
            };

            evaluateIndividual();

        },

        renderScores : function(g) {
            g.colorMode(g.HSB, 1);
            var w = 30;
            var totalH = 200;
            for (var i = 0; i < this.scoredPopulation.length; i++) {
                //  console.log("draw " + i);
                var ind = this.scoredPopulation[i];
                var score = ind.avgScore;

                g.fill(i * .1, 1, 1);
                g.rect(w * i, totalH, w, -score * .1);
            }

        },
    });

    var BotEvo = {
        BrainEvo : BrainEvo
    };

    return BotEvo;

});
