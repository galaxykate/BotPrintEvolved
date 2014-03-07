/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';
    var MAX_BOTS = 6;
    var MIN_BOTS = 5;

    var generation = 0;

    var Population = Class.extend({

        init : function(randomCount) {

            console.log("NEW POPULATION");
            this.generation = generation;
            generation++;
            // Create some bots
            this.bots = [];

            for (var i = 0; i < randomCount; i++) {
                var b = app.createBot();
                this.bots.push(b);
            }

            this.nextGeneration = [];
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

        //============================================================
        //============================================================

        // Add all these bots to the current population ui
        updateUI : function() {
            var population = this;
            var popHolder = $("#population_current");

            // Clear it
            popHolder.html("");

            $.each(this.bots, function(index, bot) {

                // Make various holders
                var div = $("<div/>", {
                    "class" : "population_info"
                });

                var popControlDiv = $("<div/>", {
                    html : "",
                    "class" : "population_spawnbuttons"
                });

                var titleDiv = $("<div/>", {
                    html : bot.name,
                    "class" : "population_title"
                });

                var detaildiv = $("<div/>", {
                    html : "this bot is awesome",
                    "class" : "population_details"
                });

                popHolder.append(div);
                div.append(titleDiv);
                div.append(popControlDiv);
                div.append("<br>");
                div.append(detaildiv);

                var addButton = $("<button/>", {
                    html : "+",
                    "class" : "population_button"
                });

                addButton.click(function() {
                    console.log("click to populate " + bot);
                    population.addChild(bot);
                    return false;
                });

                popControlDiv.append(addButton);

                detaildiv.hide();

                // Mouse interactions for this population entry:
                //  select and deselect on entry/exit, click to edit

                div.mouseenter(function() {
                    detaildiv.show();
                    bot.select();
                });

                div.mouseleave(function() {
                    detaildiv.hide();
                    bot.deselect();
                });

                div.click(function() {
                    app.editBot(bot);
                });

            });
        },

        createNextGenerationFromWinners : function(winners) {
            this.clearNextGeneration();
            for (var i = 0; i < MAX_BOTS; i++) {
                // Pick the bot (weighted to winners, with some randomness)
                var which = Math.floor((.06 + .1 * Math.random()) * Math.pow(i + 1, 2));
                console.log("Create child of winner " + which + " " + winners[which].bot.name + " " + winners[which].score);
                this.addChild(winners[which].bot, i % 3);
            }
            app.spawnNextGeneration();
        },

        clearNextGeneration : function() {
            var popHolder = $("#population_next");
            popHolder.html("");
            this.nextGeneration = [];
        },

        addChild : function(bot, mutationLevel) {
            if (isNaN(mutationLevel))
                mutationLevel = 0;
            if (this.nextGeneration.length < MAX_BOTS) {
                var child = {
                    parent : bot,
                    mutationLevel : mutationLevel,
                };

                this.nextGeneration.push(child);
                this.addChildHTML(child);
            } else

                console.log("Can't add " + bot + " to next generation, already have " + MAX_BOTS + " bots");

        },

        // Add all these bots to the current population ui
        addChildHTML : function(child) {
            var population = this;
            var bot = child.parent;

            var popHolder = $("#population_next");
            var div = $("<div/>", {

                "class" : "population_info"
            });

            var popControlDiv = $("<div/>", {
                html : "",
                "class" : "population_spawnbuttons"
            });

            var titleDiv = $("<div/>", {
                html : bot.name,
                "class" : "population_title"
            });

            popHolder.append(div);
            div.append(titleDiv);
            div.append(popControlDiv);

            var addButton = $("<button/>", {
                html : child.mutationLevel,
                "class" : "population_button"
            });

            var removeButton = $("<button/>", {
                html : "-",
                "class" : "population_button"
            });

            addButton.click(function() {
                child.mutationLevel = (child.mutationLevel + 1) % 4;
                addButton.html(child.mutationLevel);

            });

            removeButton.click(function() {
                div.remove();

                var index = population.nextGeneration.indexOf(child);

                if (index > -1) {
                    population.nextGeneration.splice(index, 1);
                }
            });

            popControlDiv.append(addButton);
            popControlDiv.append(removeButton);

        },

        //============================================================
        //============================================================

        createNextGeneration : function() {

            console.log("Create generation " + this.generation);
            var population = new Population(0);
            $.each(this.nextGeneration, function(index, instructions) {
                // For each child in the list, create an offspring of that parent
                var child = instructions.parent.createChild(instructions);
                population.add(child);
            });

            population.fillToMin();

            population.nextGeneration = this.nextGeneration;
            return population;

        },

        appendHTML : function() {

        }
    });
    return Population;
});
