/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var closedShowing = -30;
    var openHidden = 8;

    var Panel = Class.extend({

        // Create a panel
        // The options overlay the default options
        init : function(options) {

            // Default options

            this.id = "id";
            this.title = "Unlabeled Panel";
            this.description = "Does something of interest";

            this.side = "right";
            this.sidePos = Math.random() * 500;

            // Overlay all the custom options
            $.extend(this, options);

            if (this.div === undefined) {
                this.div = $("#" + this.id);
            }

            this.close();
        },

        close : function() {

            this.div.addClass("closed");
        },

        open : function() {
            this.div.removeClass("closed");
        },

        toString : function() {
            return "Panel " + this.id;
        }
    });

    return Panel;
});
