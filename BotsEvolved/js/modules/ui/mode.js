/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {'use strict';

    // Some modes can be active at different times, others must be switched between

    // Many modes are like finite state machines...maybe

    var Mode = Class.extend({

        init : function(context) {
            // Default values:
            this.title = "Undefined Mode";
            this.description = "Undefined Mode";
            this.active = false;
            this.panels = [];

            // Overlay with custom context
            $.extend(this, context);
        },

        toggle : function() {
            if (this.active)
                this.deactivate();
            else
                this.activate();

        },

        activate : function() {
            this.active = true;

            // Activate all of the panels
            $.each(this.panels, function(index, panel) {
                panel.open();
            });

            if (this.onActivate) {
                this.onActivate();
            }
        },

        deactivate : function() {
            this.active = false;

            // Activate all of the panels
            $.each(this.panels, function(index, panel) {
                panel.close();
            });

            if (this.onDeactivate) {
                this.onDeactivate();
            }
        },

        toString : function() {
            return this.title;
        }
    });

    // Mutually exclusive modes
    var ModeSet = Class.extend({
        init : function(context) {

            // Overlay with custom context
            $.extend(this, context);
            this.active = undefined;

            this.activeIndex = 0;
            this.activate(this.modes[this.activeIndex]);
        },


        cycle : function() {
            this.activeIndex = (this.activeIndex + 1) % this.modes.length;
            var mode = this.modes[this.activeIndex];

            this.activate(mode);
        },

        getActive : function() {
            return this.active;
        },

        activate : function(mode) {
            console.log("Activate " + mode.title);

            if (this.active !== undefined) {
                this.active.deactivate();
            }
            this.active = mode;

            if (this.active !== undefined) {
                this.active.activate();
            }
        }
    });

    Mode.ModeSet = ModeSet;
    return Mode;

});
