/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var botCard = {
        mainDiv : $("<div/>", {
            "class" : "bot_card"
        }),
        thumbnail : $("<div/>", {
            "class" : "bot_thumbnail"
        }),

        title : $("<div/>", {
            html : "unknown bot",
            "class" : "bot_title"
        }),
        botName : $("<span/>", {
            html : "unknown author",
            "class" : "bot_name"
        }),
        owner : $("<span/>", {
            html : "unknown author",
            "class" : "bot_owner"
        }),
        details : $("<div/>", {
            html : "bot info here...",
            "class" : "bot_details"
        }),

    };
    parentHolder.append(botCard.mainDiv);

    botCard.mainDiv.append(botCard.title);
    botCard.mainDiv.append(botCard.thumbnail);
    botCard.mainDiv.append(botCard.details);

});
