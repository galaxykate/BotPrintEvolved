/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var closedShowing = -30;
    var openHidden = 8;

    var Panel = Class.extend({

        // Create a panel
        // The options overlay the default options
        // Options: id, title, description, side [right, left, top, bottom], dimensions (vector)
        init : function(options) {

            // Default options

            this.id = "id";
            this.title = "Unlabeled Panel";
            this.description = "Does something of interest";

        },

        close : function() {
            this.div.css(this.closedState.toCSS());
        },

        open : function() {
            this.div.css(this.openState.toCSS());
        },

        toString : function() {
            return "Panel " + this.id;
        }
    });

    return Panel;
});
