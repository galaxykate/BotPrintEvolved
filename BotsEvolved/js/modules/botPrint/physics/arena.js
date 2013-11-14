/**
 * @author Kate Compton
 */

define(["common", "./boxWorld"], function(common, boxWorld) {'use strict';

    var Arena = Class.extend({
        init : function() {
            this.border = new common.Region(new common.Vector(0, 0));

            var sides = 8;
            for (var i = 0; i < sides; i++) {
                var r = 100 + Math.random() * 30;
                var theta = i * Math.PI * 2 / sides;
                var p = common.Vector.polar(r, theta);
                this.border.addPoint(p);
            }
        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame
        render : function(context) {
           var g =context.g;
            g.pushMatrix();
            g.translate(g.width / 2, g.height / 2);
            g.ellipse(0, 0, 400, 400);

            // Draw the edges
            g.fill(.68, 1, 1);
            this.border.render(context);
            g.popMatrix();
        },

        hover : function(pos) {

        }
    });

    return Arena;
});
