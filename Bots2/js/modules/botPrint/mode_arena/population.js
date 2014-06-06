/**
 * @author Kate Compton
 */
define(["common", "../bot/bot"], function(common, Bot) {'use strict';
    var MAX_BOTS = 6;
    var MIN_BOTS = 5;

    var generation = 0;

    function initUI() {

        ["next", "current"].forEach(function(stage) {
            var obj = {
                name : name,
                addBot : function(bot) {
                    app.log("ADD BOT TO NEXT");

                    app.addChildToNextGeneration(bot);
                },

                toString : function() {
                    return stage;
                }
            };

            var world = {
                getTouchableAt : function() {
                    return obj;
                }
            };

            app.controls.createTouchableWindow($("#population_" + stage), stage, world);
        });

    };

    var Population = Class.extend({

        init : function(randomCount, previous) {

            this.generation = generation;
            generation++;
            console.log("NEW POPULATION " + randomCount + ", generation " + this.generation);
            // Create some bots
            this.bots = [];
            this.className = "Population";
            for (var i = 0; i < randomCount; i++) {
                var b = new Bot();
                this.bots.push(b);
            }

            this.parents = [];
            this.mutants = [];
        },

        add : function(bot) {
            this.bots.push(bot);
        },

        fillToMin : function() {
            var count = MIN_BOTS - this.bots.length;
            for (var i = 0; i < count; i++) {
                var b = app.createBot();
                this.add(b);
            }

        },

        //Returns a bot or undefined
        getByName : function(name) {
            if(name === undefined) { return undefined; }
            return this.bots.filter(function(bot) {
                return bot.name === name;
            })[0];
        },

        //============================================================
        //============================================================
        // Create population list

        // Create divs for choosing the next generation
        createPopulationDivs : function() {
            var botList = $("#bot_list");
            botList.html("");
            var mutationList = $("#mutation_list");
            mutationList.html("");
            var population = this;
            population.mutants = [];

            var createBotDiv = function(bot) {
                var name = "Random bot";
                if (bot)
                    name = bot.name;

                var div = $("<div/>", {
                    "class" : "population_bot",
                    text : name,
                });
                div.bot = bot;
                return div;
            };

            var addMutant = function(bot) {
                var div = createBotDiv(bot);
                mutationList.append(div);
                div.click(function() {
                    div.remove();

                    // Remove it from the mutants list;
                    var index = population.mutants.indexOf(bot);
                    if (index > -1) {
                        population.mutants.splice(index, 1);
                    }
                });

                population.mutants.push(bot);

                console.log(population.mutants);
            };

            $.each(this.bots, function(index, bot) {
                // Make various holders
                var div = createBotDiv(bot);
                botList.append(div);
                div.click(function() {
                    addMutant(bot);
                });

            });

            // Make the random bot
            var div = $("<div/>", {
                "class" : "population_bot",
                text : "Random",
            });
            botList.append(div);
            div.click(function() {
                addMutant();
            });
        },

        createNextGenerationFromParents : function() {
            this.nextGeneration = new Population(0, this);
            for (var i = 0; i < this.parents.length; i++) {
                var child;
                if (this.parents[i]) {
                    console.log(this.parents[i]);
                    //Selecting a random parent seems wrong?
                    this.parents[i].dna.breedWith(utilities.getRandom(this.parents).dna);
                    child = new Bot(this.parents[i]);
                } else {
                    child = new Bot();
                }
                this.nextGeneration.add(child);
            }
            return this.nextGeneration;
        },

        createNextGenerationFromMutants : function() {
            this.nextGeneration = new Population(0, this);
            for (var i = 0; i < this.mutants.length; i++) {
                var child;
                if (this.mutants[i]) {
                    child = this.mutants[i].createChild({
                        mutationLevel : 2
                    });
                } else {
                    child = new Bot();
                }

                this.nextGeneration.add(child);

            }

            console.log("" + this.nextGeneration);

            return this.nextGeneration;
        },

        toString : function() {
            var s = "Population " + this.generation + ", " + this.bots.length + " bots: ";
            for (var i = 0; i < this.bots.length; i++) {
                s += this.bots[i].toDebugString() + ", ";
            }
            return s;
        },

        debugOutput : function() {
            console.log("Population " + this.generation + ", " + this.bots.length + " bots: ");
            for (var i = 0; i < this.bots.length; i++) {
                console.log("   " + this.bots[i].toDebugString());
            }
        },
    });

    Population.initUI = initUI;
    return Population;
});
