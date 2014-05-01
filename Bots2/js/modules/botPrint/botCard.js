/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var BotCard = Class.extend({

        init : function(parentHolder) {
            console.log("CREATE BOT CARD");
            var card = this;

            // Make all the divs
            this.mainDiv = $("<div/>", {
                "class" : "bot_card"
            });

            this.title = $("<div/>", {
                html : "unknown bot",
                "class" : "bot_title"
            });

            this.botName = $("<span/>", {
                html : "unknown author",
                "class" : "bot_name"
            });
            this.owner = $("<span/>", {
                html : "unknown author",
                "class" : "bot_owner"
            });

            this.details = $("<div/>", {
                html : "bot info here...",
                "class" : "bot_details"
            });
            this.thumbnail = $("<canvas/>", {
                "class" : "bot_thumbnail",

            });

            parentHolder.append(this.mainDiv);

            this.mainDiv.append(this.title);
            this.mainDiv.append(this.thumbnail);
            this.mainDiv.append(this.details);

            var spawnButton = $("<button/>", {
                html : "spawn"
            });
            var mutateButton = $("<button/>", {
                html : "mutate"
            });
            var mutateMoreButton = $("<button/>", {
                html : "mutateMore"
            });

            this.dnaDiv = $("<div/>", {
                html : "DNA",
                "class" : "panel"
            });
            this.mainDiv.append(this.dnaDiv);

            this.dnaDiv.append(spawnButton);
            this.dnaDiv.append(mutateButton);
            this.dnaDiv.append(mutateMoreButton);

            spawnButton.click(function() {
                card.bot.dna.createMutant();
            });

            mutateButton.click(function() {
                card.bot.dna.mutate(.3);
                card.bot.setFromDNA(card.bot.dna);
            });
            mutateMoreButton.click(function() {
                card.bot.dna.mutate(2);
                card.bot.setFromDNA(card.bot.dna);
            });

            // Add processing
            var div = this.thumbnail;
            var canvas = div.get(0);

            var processingInstance = new Processing(canvas, function sketchProc(processing) {
                // Setup
                processing.size(div.width(), div.height());
                var g = processing;
                g.colorMode(g.HSB, 1);

                // Override draw function, by default it will be called 60 times per second
                processing.draw = function() {
                    g.background(.5, 1, 1);
                    var context = {
                        g : g,
                        centerBot : true,
                        useChassisCurves : true,
                    };

                    g.pushMatrix();
                    g.translate(g.width / 2, g.height / 2);
                    g.popMatrix();

                    if (card.bot) {
                        g.pushMatrix();
                        g.translate(4, 10);
                        card.bot.dna.draw(g);
                        g.popMatrix();
                    }

                };
            });

            // Interactions
            this.mainDiv.dblclick(function() {
                if (card.bot) {
                    console.log("Click bot card for " + card.bot.name);

                    //   app.setCurrentBot(this.bot);
                    app.toggleMainMode();
                }

            });

        },

        open : function() {
            this.mainDiv.show();

        },

        close : function() {
            this.mainDiv.hide();
        },

        update : function() {
            this.bot = app.currentBot;
            this.title.html(this.bot.name);

            if (this.bot.parent) {
                this.details.html("Child " + this.bot.parent.childCount + " of " + this.bot.parent.name);

                this.details.append("<br>Generation " + this.bot.generation);
            } else
                this.details.html("First gen bot");

        },
    });

    return BotCard;
});

