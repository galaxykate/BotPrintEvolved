/**
 * @author Kate Compton
 */

define(["common", "evo", "./ai/dtree"], function(common, EvoSim, DTree) {'use strict';
    var mutLog = "";
    //createGenome, createIndividual, mutateGenome, crossoverGenomes, evaluatePopulation
    function mutationLog(s) {
        if (app.getOption("logMutations"))
            console.log(s);
        mutLog += (s + " <br>");
    };

    // Offsets a value up or down randomly, scaled by the intensity.
    var getWeightedOffset = function(val, intensity) {
        var scaledRandom = (Math.random() * intensity) - (0.5 * intensity);
        val += scaledRandom;
        // Normalize
        val = utilties.constrain(val, 0, 1);
        return val;
    };

    /**
     * @class BrainEvo
     * @extends EvoSim
     */
    var BrainEvo = EvoSim.extend({
        /**
         * @method init
         * @param bot
         * @param task
         * @param arena
         */
        init : function(bot, task, arena) {
            this._super();
            this.genomeLength = 30;
            this.cohortSize = 1;

            this.mutagen = 1;
            this.bot = bot;
            this.task = task;
            this.arena = arena;

            this.treeViz = new DTree.DTreeViz();
            this.scoredPopulation = [];
            this.sensors = this.bot.sensors;
            this.actuators = this.bot.actuators;

        },

        /**
         * @method createGenome
         * @return {DTree} dtree
         */
        createGenome : function() {
            var brainEvo = this;

            var dtree = new DTree.DTree();

            dtree.generateTree(function(node) {

                // Generating the node
                var isAction = Math.random() > .5 && node.depth > 1;
                if (node.depth >= 2)
                    isAction = true;

                if (isAction) {
                    node.setAction(brainEvo.generateAction());
                } else {
                    node.setFalseBranch(new DTree.DTree());
                    node.setTrueBranch(new DTree.DTree());

                    node.setCondition(brainEvo.generateCondition());

                }

            });
            return dtree;
        },

        /**
         * @method generateAction
         * @return {Action}
         */
        generateAction : function() {
            return new DTree.Action(utilities.getRandom(this.actuators), Math.random());
        },

        /**
         * @method generateCondition
         * @return {Condition}
         */
        generateCondition : function() {
            return new DTree.Condition(utilities.getRandom(this.sensors), utilities.getRandom(DTree.comparators), Math.random());

        },

        /**
         * @method createIndividual
         * @param genome
         */
        createIndividual : function(genome) {
            console.log("genome", genome);
            //    var g2 = genome.cloneBranch();

            genome.debugPrint();
            //    g2.debugPrint();
            return genome;

        },

        /**
         * Mutate a condition with either major or minor changes
         * @method mutateCondition
         * @param node
         * @param {Boolean} majorChange
         * @param mutationStrength
         */
        mutateCondition : function(node, majorChange, mutationStrength) {

            var seed = Math.random();
            if (majorChange) {
                if (seed < .33) {
                    mutationLog("  replace condition with action");
                    node.setAction(this.generateAction());
                } else if (seed < .66) {
                    mutationLog("  swap true/false branches");
                    node.swapBranches();
                } else {
                    mutationLog("  switch sensor");
                    node.condition.sensor = utilities.getRandom(this.sensors);
                }
            } else {
                // minor change
                if (seed < .5) {
                    mutationLog("  adjust targetValue");
                    /* vary based on mutation strength */
                    node.condition.changeValue(Math.random() * mutationStrength);
                } else {
                    mutationLog("  switch comparator");
                    node.condition.changeComparator();
                }
            }

        },

        /**
         * @method mutateAction
         * @param node
         * @param {Boolean} majorChange
         * @param mutationStrength
         */
        mutateAction : function(node, majorChange, mutationStrength) {
            var seed = Math.random();

            if (majorChange) {
                mutationLog("  replace action with condition");
                node.setCondition(this.generateCondition());

                var trueBranch = new DTree.DTree();
                trueBranch.setAction(this.generateAction());
                var falseBranch = new DTree.DTree();
                falseBranch.setAction(this.generateAction());

                node.setTrueBranch(trueBranch);
                node.setFalseBranch(falseBranch);

                node.debugPrint();

            } else {
                // minor change
                if (seed < .5) {
                    mutationLog("  change actuator value");
                    node.action.changeValue(Math.random() * mutationStrength);
                } else {
                    mutationLog("  randomize actuator");
                    node.action.actuator = utilities.getRandom(this.actuators);
                }

            }
        },

        /**
         * @method mutateNode
         * @param node
         * @param mutationIntensity
         */
        mutateNode : function(node, mutationIntensity) {

            mutationLog("MUTATE NODE " + node.idNumber);
            // We classify some mutations as major. Major changes are less likely the lower the mutationIntensity.
            var majorChange = (Math.random() < mutationIntensity * 0.5 );
            if (node.action !== undefined) {
                this.mutateAction(node, majorChange, mutationIntensity);
            } else {
                this.mutateCondition(node, majorChange, mutationIntensity);
            }
        },

        /**
         * @method mutateGenome
         * @param genome
         */
        mutateGenome : function(genome) {
            mutLog = "";
            var tree = genome;
            var mutationIntensity = this.mutagen;
            var nodes = []
            tree.compileNodes(nodes, function(node) {
                return true;
            });

            var selectedNode = utilities.getRandom(nodes);
            this.mutateNode(selectedNode, mutationIntensity);

            tree.mutLog = mutLog;
            return tree;
/*
            //Get lookup tables for nodes in the tree
            var decisions = [];
            var actions = [];
            tree.compileNodes(decisions, function(node) {
                return node.decision !== undefined;
            });
            tree.compileNodes(actions, function(node) {
                return node.action !== undefined;
            });
            //Randomly select node to mutate
            var table = Math.random() > .5 ? decisions : actions;
*/
        },

        /**
         * @method crossoverGenomes
         * @param g0
         * @param g1
         */
        crossoverGenomes : function(g0, g1) {

        },


        /**
         * Test individuals one at a time
         * @method evaluatePopulation
         * @async
         * @param population
         * @param {Function} callback
         * @return Array of Objects, with properties individual:Object and avgScore:Number
         */

        evaluatePopulation : function(population, callback) {
            var evoSim = this;
            var scoredPopulation = [];
            this.scoredPopulation = scoredPopulation;

            // Run each individual in the arena for N seconds
            var index = 0;
            var individual;
            //console.log(population);
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

        /**
         * @method renderScores
         * @param g
         */
        renderScores : function(g) {
            //Keep track of top, min, avg
            g.colorMode(g.HSB, 1);
            var w = 30;
            var totalH = 200;

            var scores = this.scoredPopulation;
            scores = this.arena.scores;

            if (scores !== undefined) {
                for (var i = 0; i < scores.length; i++) {
                    //  console.log("draw " + i);
                    var ind = scores[i];
                    var score = ind.total;

                    g.fill(i * .1, 1, 1);
                    g.rect(w * i, totalH, w, -score * .1);
                }
            }

        },
    });

    var BotEvo = {
        BrainEvo : BrainEvo
    };

    return BotEvo;

});
