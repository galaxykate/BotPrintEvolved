/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var closedShowing = 15;
    var openHidden = 15;

    var Panel = Class.extend({

        // Create a panel
        // The options overlay the default options
        init : function(options) {

            // Default options
            this.id = id;
            this.title = "Unlabeled Panel";
            this.description = "Does something of interest";

            this.side = "right";
            this.sidePos = Math.random() * 500;

            this.dimensions = {
                x : 200,
                y : 200,
            };

            // Overlay all the custom options
            $.extend(this, options);
            this.openState = new common.Rect(0, 0, 300, 100);
            this.closedState = new common.Rect(0, 0, 200, 200);
            this.openState.setDimensions(this.dimensions);
            this.closedState.setDimensions(this.dimensions);

            this.div.prepend(this.title);

            // set the positions

            var offsetClosed = closedShowing;
            var offsetOpen = -openHidden;

            if (this.side === "left")
                offsetClosed -= this.closedState.w;
            if (this.side === "right")
                offsetOpen += this.openState.w;
            if (this.side === "top")
                offsetClosed -= this.closedState.h;
            if (this.side === "bottom")
                offsetOpen -= this.openState.h;

            var closedPos = app.rect.getSidePosition(this.side, this.sidePos, offsetClosed);
            var openPos = app.rect.getSidePosition(this.side, this.sidePos, offsetOpen);

            this.openState.setPosition(openPos);
            this.closedState.setPosition(closedPos);

            this.close();
        },

        close : function() {
            this.div.css(this.closedState.toCSS());
        },

        open : function() {
            this.div.css(this.openState.toCSS());
        }
    });

    return Panel;
}); 