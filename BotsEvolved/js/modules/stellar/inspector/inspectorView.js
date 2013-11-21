/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {'use strict';

    // Some modes can be active at different times, others must be switched between

    // Many modes are like finite state machines...maybe

    var InspectorView = Class.extend({
        init : function() {

            // Create the various parts of an inspector view
            this.infoDiv = $("#inspector_info");

            // Create the bubbles for the bubble view

        },

        inspect : function(obj) {
            this.inspected = obj;
            console.log("Inspect " + obj);
            // Set the inspector view to this
            this.infoDiv.html(obj.toInspectorHTML());

        },

        render : function(context) {
            var g = context.g;
            g.pushMatrix();
            g.translate(g.width / 2, g.height / 2);
            g.fill(.4, 1, 1, context.opacity);
            g.ellipse(0, 0, 200, 200);

            g.popMatrix();
        }
    });
    return InspectorView;

});
