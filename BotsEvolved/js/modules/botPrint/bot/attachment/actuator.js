/**
 * @author Kate Compton
 */

define(["common", "./attachment"], function(common, Attachment) {'use strict';

    var Actuator = Attachment.extend({
        init : function() {
            this._super();
            this.actuation = 1;
            this.decay = .5;
            this.id = "Jet" + this.idNumber;
        },

        actuate : function(value) {
            this.actuation = value;
        },

        update : function(time) {
            this.actuation *= Math.pow(this.decay, time.ellapsed) - .1 * this.decay * time.ellapsed;
            this.actuation = utilities.constrain(this.actuation, 0, 1);
            app.log(this.actuation);
        },

        getForce : function() {
            var globalPos = new Vector(0, 0);
            globalPos.rotation = 0;
            var p = this.getWorldTransform();
            // Get the global force
            return {
                position : p,
                //power : 1000 * Math.max(0, Math.sin(app.arena.time + this.idNumber)) + 100,
                power : 1000 * this.actuation,
                direction : p.rotation,
            }
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
            var rlength = r * this.actuation + r * .1;
            g.fill(.12, 1, 1);
            g.ellipse(-r * 1.5 - rlength, 0, rlength, r2 * .5);

        },

        toString : function() {
            return this.id + "(" + this.actuation.toFixed(2) + ")";
        }
    });

    return Actuator;
});
