/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {
    var pickupCount = 0;

    var Pickup = Vector.extend({
        init : function() {
            this._super(0, 0);

            this.idNumber = pickupCount;
            pickupCount++;

            this.radius = 5;

        },

        remove : function() {

        },

        draw : function(g, t) {
            g.stroke(0);
            g.strokeWeight(2);
            g.fill(.45, 1, 1);
            g.ellipse(this.x, this.y, this.radius, this.radius);
        },
    });

    return Pickup;
});
