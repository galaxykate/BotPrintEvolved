/**
 * @author Kate Compton
 */

define(["common", "jQueryTransit"], function(COMMON, Transit) {'use strict';

    // Some modes can be active at different times, others must be switched between

    // Many modes are like finite state machines...maybe

    var InspectorView = Class.extend({
        init : function() {

            // Create the various parts of an inspector view
            this.infoDiv = $("#inspector_info");

            // Create the bubbles for the bubble view
            this.bubbleLayer = $("#inspector_bubbles");
            this.labelLayer = $("#inspector_labels");

            for (var i = 0; i < 20; i++) {
                this.addBubble();

            }
        },

        addBubble : function() {
            var bubble = $("<div/>", {
                "class" : "bubble",
            });
            console.log(bubble);

            this.bubbleLayer.append(bubble);

            bubble.transition({
                x : Math.floor(Math.random() * 400) + 'px',
                y : Math.floor(Math.random() * 400) + 'px'
            });

        },
        
        

        activate : function() {

        },

        deactivate : function() {

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

            g.fill(1);
            g.ellipse(0, 0, 300, 300);

            g.popMatrix();
        }
    });
    return InspectorView;

});
