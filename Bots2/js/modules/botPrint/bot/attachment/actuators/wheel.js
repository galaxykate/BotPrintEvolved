/**
 * @author Kate Compton
 */

define(["common", "./actuator"], function(common, Actuator) {'use strict';

    var Wheel = Actuator.extend({
        init : function() {
            this._super();
            this.actuation = 1;
            this.decay = .5;
            this.id = "Wheel" + this.idNumber;
            this.spinAngle = 0;
        },

        actuate : function(value) {
            this.actuation = value;
        },

        update : function(time) {
            this._super(time);

            // Set the force's position
            var p = this.getWorldTransform();

            this.force.setToPolar(2200 * this.actuation, p.rotation);

            this.spinAngle += time.ellapsed * this.actuation;
        },

        renderDetails : function(context) {
            var g = context.g;

            /*
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
            g.fill(.12, 1, 1);
            g.ellipse(-r * 1.5 - rlength, 0, rlength, r2 * .5);

            g.fill(1, 0, 1, .7);
            g.text(this.idNumber, -3, 5);
            */

            // draw as wheels
            g.fill(.3, 0, .5);
            var h = 30;
            var w = .3 * h;
            g.rect(-h / 2, -w / 2, h, w);

            // draw lines
            var lines = 10;
            for (var i = 0; i < lines; i++) {
                var pct = (i / lines + this.spinAngle) % 1;
                pct = .5 + .5 * Math.cos(pct * Math.PI);
                g.stroke(0);
                var y = h / 2 + -pct * h;
                g.line(y, -w / 2, y, w / 2);
            }
        },
    });

    Actuator.Wheel = Wheel;
    return Wheel;
});
