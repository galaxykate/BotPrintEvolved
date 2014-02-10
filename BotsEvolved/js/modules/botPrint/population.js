/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';

    var Population = Class.extend({

        init : function(randomCount) {
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

        //============================================================
        //============================================================

        // Add all these bots to the current population ui
        updateUI : function() {
            var population = this;
            var popHolder = $("#population_current");

            // Clear it
            popHolder.html("");

            $.each(this.bots, function(index, bot) {
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

                div.mouseover(function() {
                    app.highlightBot(bot);
                });

                div.mouseenter(function() {
                    detaildiv.show();
                    bot.selected = true;
                });

                div.mouseleave(function() {
                    detaildiv.hide();
                    bot.selected = false;
                });

                div.click(function() {
                    app.editBot(bot);
                });

            });
        },

        addChild : function(bot) {
            var child = {
                parent : bot,
                mutationLevel : 0,
            };

            this.nextGeneration.push(child);
            this.addChildHTML(child);
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
                html : "0",
                "class" : "population_button"
            });

            var removeButton = $("<button/>", {
                html : "-",
                "class" : "population_button"
            });

            child.mutationLevel = 0;
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
            var population = new Population(0);
            $.each(this.nextGeneration, function(index, instructions) {
                // For each child in the list, create an offspring of that parent
                var child = instructions.parent.createChild(instructions);
                population.add(child);
            });

            population.nextGeneration = this.nextGeneration;
            return population;

        },

        appendHTML : function() {

        }
    });
    return Population;
});
