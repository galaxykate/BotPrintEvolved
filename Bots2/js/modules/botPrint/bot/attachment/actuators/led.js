/**
 * @author Kate Compton
 */

define(["common", "./actuator"], function(common, Actuator) {'use strict';

    var LED = Actuator.extend({
        init : function() {
            this._super();
            this.actuation = 1;
            this.decay = .8;
            this.id = "LED" + this.idNumber;
            this.spinAngle = 0;
            this.className = "LED";
        },

        actuate : function(value) {
            this.actuation = value;
        },

        update : function(time) {
            this._super(time);
			this.actuation = this.actuation * this.decay;
            if (this.actuation < .05)
            {
            	this.decay = 1.0 / this.decay;
            }
            else if (this.actuation >= 1)
            {
                this.actuation = 1;
            	this.decay = 1.0 / this.decay;
            }
            // Set the force's position
            var p = this.getWorldTransform();

            //this.force.setToPolar(2200 * this.actuation, p.rotation);

            //this.spinAngle += time.ellapsed * this.actuation;
        },

        renderDetails : function(context) {
            var g = context.g;

            var r = 6
            g.fill(.9, 1, this.actuation);
            g.noStroke();
            g.ellipse(r / 2, 0, r * 1.2, r * 1.2);
        },
    });

    Actuator.LED = LED;
    return LED;
});
