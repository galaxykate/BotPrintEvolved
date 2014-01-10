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
        },

        getForce : function() {
            var globalPos = new Vector(0, 0);
            globalPos.rotation = 0;
            var p = this.getWorldTransform();
            // Get the global force
            return {
                position : p,
                //power : 1000 * Math.max(0, Math.sin(app.arena.time + this.idNumber)) + 100,
                power : 2000 * this.actuation,
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
            var rlength = 2 * r * this.actuation + r * .1;
            g.fill(.12, 1, 1);
            g.ellipse(-r * 1.5 - rlength, 0, rlength, r2 * .5);

            g.fill(1, 0, 1, .7);
            g.text(this.idNumber, -3, 5);

        },

        toString : function() {
            return this.id;
        }
    });

    
    var Sharpie = Actuator.extend({

        init : function() {
            this._super();

            this.stamp = "";
            if (Math.random() > .999)
                this.stamp = "BotPrint!";
            this.id = "Sharpie" + this.idNumber;

            this.color = new common.KColor(Math.random(), 1, 1);
        },

        update : function(time) {
            var marker = this;
            this.actuation *= Math.pow(this.decay, time.ellapsed) - .1 * this.decay * time.ellapsed;
            this.actuation = utilities.constrain(this.actuation, 0, 1);
            var worldPos = this.getWorldTransform();

            var strength = this.actuation;
            app.arena.drawOnto(worldPos, function(g) {
                marker.color.fill(g, 0, -1 + 2 * strength);
                g.ellipse(0, 0, 5, 15);

                if (marker.stamp.length > 0)
                    g.text(marker.stamp, -5, 0);
            });

        },

        getForce : function() {
            return undefined;
        },

        renderDetails : function(context) {
            var g = context.g;
            var r = 10
            g.fill(0);
            g.noStroke();
            g.ellipse(r / 2, 0, r * 1.2, r * 1.2);

            g.fill(0);
            g.ellipse(-r * 1.5, 0, r * 1.4, r * .4);

            var length = -r * 2.7;
            var r2 = .2 * r;
            this.color.fill(g);
            g.ellipse(length, 0, r2, r2);

            g.fill(1, 0, 1, .7);
            g.text(this.idNumber, -3, 5);

        },
    });

//Superfun is an actuator that is similar to the sharpie but it paints randomly colored squares. It is also grey colored. 
	var SuperFun = Actuator.extend({

        init : function() {
            this._super();

            this.stamp = "";
            if (Math.random() > .999)
                this.stamp = "Superfun";
            this.id = "SuperFun" + this.idNumber;

            this.color = new common.KColor(0.7, Math.random(1), 1);
        },

        update : function(time) {
            var marker = this;
            this.actuation *= Math.pow(this.decay, time.ellapsed) - .1 * this.decay * time.ellapsed;
            this.actuation = utilities.constrain(this.actuation, 0, 1);
            var worldPos = this.getWorldTransform();
			this.color = new common.KColor(Math.random(1),Math.random(1),1);
            var strength = this.actuation;
            app.arena.drawOnto(worldPos, function(g) {
                marker.color.fill(g, 0, -1 + 2 * strength);
                g.rect(0, 0, 20, 20);

                if (marker.stamp.length > 0)
                    g.text(marker.stamp, -5, 0);
            });

        },

        getForce : function() {
            return undefined;
        },

        renderDetails : function(context) {
            var g = context.g;
            var r = 10
            g.fill(0.5);
            g.noStroke();
            g.ellipse(r / 2, 0, r * 1.5, r * 1.5);

            g.fill(0.5);
            g.ellipse(-r * 1.5, 0, r * 2.4, r * .8);

            var length = -r * 4;
            var r2 = .2 * r;
            this.color.fill(g);
            g.ellipse(length, 0, r2, r2);

            g.fill(1, 0, 1, .7);
            g.text(this.idNumber, -3, 5);

        },
    });

    Actuator.Sharpie = Sharpie;
	Actuator.SuperFun = SuperFun; 
    return Actuator;
});
