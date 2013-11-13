/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var PathPoint = common.Vector.extend({
        init : function() {
            this._super.call(this, this.arguments);
            this.excitement = 0;
        },

        excite : function() {
            this.excitement = 1;
        },

        update : function(time) {
            this.excitement = Math.max(0, this.excitement - .92 * time.ellapsed);
        },

        moveTo : function(pos) {
            this.setTo(pos);
        },

        render2D : function(g) {

            if (this.excitement > 0) {
                var r2 = 10 + 20 * this.excitement;
                g.fill(1, 0, 1, .9)
                g.ellipse(this.screenPos.x, this.screenPos.y, r2, r2);
            }

            g.fill(0);
            g.noStroke();
            if (this.active) {
                g.fill(.8, 1, 1);
            }

            var r = 10;
            g.ellipse(this.screenPos.x, this.screenPos.y, r, r);

        },
    });

    return PathPoint;
});
