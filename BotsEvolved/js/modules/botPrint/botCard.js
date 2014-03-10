/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var BotCard = Class.extend({

        init : function(parentHolder) {
            var card = this;

            // Make all the divs
            this.mainDiv = $("<div/>", {
                "class" : "bot_card"
            });
            this.thumbnail = $("<div/>", {
                "class" : "bot_thumbnail"
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

            this.canvas = $("<canvas/>", {
                "class" : "bot_card_canvas",
                width : "200px",
                height : "200px",
            });

            parentHolder.append(this.mainDiv);

            this.mainDiv.append(this.title);
            this.mainDiv.append(this.thumbnail);
            this.mainDiv.append(this.details);
            this.thumbnail.append(this.canvas);

            // Add processing
            var div = this.canvas;
            var canvas = div.get(0);

            var processingInstance = new Processing(canvas, function sketchProc(processing) {
                // Setup
                processing.size(div.width(), div.height());
                var g = processing;
                g.colorMode(g.HSB, 1);
                g.background(.5, 1, 1);

                // Override draw function, by default it will be called 60 times per second
                processing.draw = function() {
                    var context = {
                        g : g,
                        useChassisCurves : true,

                    };

                    if (card.bot) {
                        card.bot.render(context);
                    }
                }
            });
        },

        setBot : function(bot) {
            this.bot = bot;
            this.title.html(this.bot.name);
        },
    });

    return BotCard;
});

