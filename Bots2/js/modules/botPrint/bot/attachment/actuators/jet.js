/**
 * @author Kate Compton
 */

define(["common", "./actuator"], function(common, Actuator) {'use strict';

    var Jet = Actuator.extend({
        init : function() {
            this._super();
            this.actuation = 1;
            this.decay = .5;
            this.id = "Jet" + this.idNumber;
            this.className = "Jet";
        },

        actuate : function(value) {
            this.actuation = value;
        },

        update : function(time) {
            this._super(time);

            // Set the force's position
            var p = this.getWorldTransform();

            this.force.setToPolar(2200 * this.actuation, p.rotation);
        },

        renderDetails : function(context) {
            var g = context.g;

            var r = 10
            g.fill(0);
            g.noStroke();
            g.ellipse(r / 2, 0, r * 1.2, r * 1.2);

            g.fill(0);
            g.rect(r / 2, -r / 2, -r * 2, r);
            g.fill(0);
            g.ellipse(-r * 1.5, 0, r * .5, r * .9);

            var r2 = r + .3 * r * this.actuation;
            var rlength = 2 * r * this.actuation + r * .1;
            g.fill(.05, 1, 1, .3);
            g.ellipse(-r * 1.5 - rlength, 0, rlength, r2 * .5);

            var t = app.getTime();
            var count = Math.abs(this.actuation * 10);
            for (var i = 0; i < count; i++) {
                var pct = (i / count + t * 3) % 1;
                var scale = 2*Math.sin(pct * Math.PI) * this.actuation;
                var x = scale * Math.sin(i * 3);
                var y = pct * -rlength*3;
                
                g.fill(.2 - pct*.1, .3 + .6*pct, 1);
                g.ellipse(y - r, x * 3, 2 * scale * 2, 2 * scale);

            }

            g.text(this.idNumber, -3, 5);

        },
    });

    Actuator.Jet = Jet;
    return Jet;
});
