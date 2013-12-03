/**
 * @author Kate Compton
 */

define(["common", "./attachment"], function(common, Attachment) {'use strict';

    var Sensor = Attachment.extend({
        init : function() {
            this._super();
            this.id = "Jet" + this.idNumber;
            this.decay = .7;
            this.senseValue = 1;
        },

        sense : function() {

        },

        update : function(time) {

            var p = this.getWorldTransform();
            p.mult(.1);
            this.senseValue = utilities.noise(p.x, p.y);
            // this.senseValue *= Math.pow(this.decay, time.ellapsed) - .1 * this.decay * time.ellapsed;
            // this.senseValue = utilities.constrain(this.senseValue, 0, 1);

        },
        getForce : function() {
            return undefined
        },

        renderDetails : function(context) {
            var g = context.g;
            var r = 10;
            g.strokeWeight(1);
            g.fill(.61, .1, 1);
            g.stroke(0);
            g.ellipse(0, 0, r * 1.2, r * 1.2);
            g.fill(0);
            g.rect(r * .7, -r, r, r * 2);

        },

        toString : function() {

            return this.id + "(" + this.senseValue.toFixed(2) + ")";

        }
    });

    return Sensor;
});
