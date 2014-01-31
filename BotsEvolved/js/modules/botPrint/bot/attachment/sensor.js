/**
 * @author Kate Compton
 */

define(["common", "./attachment"], function(common, Attachment) {'use strict';

    var Sensor = Attachment.extend({
        init : function() {
            this._super();
            this.id = "Sensor" + this.idNumber;
            this.decay = .7;
            this.senseValue = 1;
        },

        sense : function() {
            return this.senseValue;
        },

        update : function(time) {

            var p = this.getWorldTransform();
            p.mult(.1);
            //  this.senseValue = utilities.noise(p.x, p.y);
            var worldPos = this.getWorldTransform();
            var value = app.arena.getLightMapAt(worldPos);
            this.senseValue = value || 0;

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
            g.fill(.61, .1, this.senseValue);
            g.stroke(0);
            g.ellipse(0, 0, r * 1.2, r * 1.2);
            g.fill(0);
            g.rect(r * .7, -r, r, r * 2);

            g.fill(1, 0, 1, .7);
            g.text(this.idNumber, -3, 5);

        },

        toString : function() {

            return this.id;

        }
    });

    var Timer = Sensor.extend({
        init : function() {
            this._super();
            this.id = "Timer" + this.idNumber;
        },

        update : function(time) {

            this.senseValue = Math.sin(time.total) * .5 + .5;

        },
    });
<<<<<<< HEAD
    
    //Hyperfun is a sensor that is square shaped(20x20) and randomly changes colors, the sense value is updated all the time as a random number between 0 and 1.
    var HyperFun = Sensor.extend({
    	   init : function() {
            this._super();
            this.id = "HyperFun" + this.idNumber;
        },
		
		 
        update : function(time) {

            this.senseValue = Math.random(1);

        },
        
        renderDetails : function(context) {
            var g = context.g;
            var r = 10;
            g.strokeWeight(1);
            g.fill(this.senseValue,this.senseValue, this.senseValue);
            g.stroke(0);
            g.rect(0, 0, r * 2, r * 2);
            g.fill(this.senseValue,this.senseValue,this.senseValue);
            g.rect(r * .7, -r, r, r * 2);
            g.fill(1, 0, 1, .7);
            g.text(this.idNumber, -3, 5);

        },
    	
    });
    Sensor.HyperFun = HyperFun;
=======
	
	
    var ColorLerper = Sensor.extend({
        init : function() {
            this._super();
            this.id = "ColorLerper" + this.idNumber;
        },

        update : function(time) {
            this.senseValue = (time.total%50)/50;
			

        },
		
		renderDetails: function(context){
			var g = context.g;
            var r = 10;
            g.strokeWeight(1);
            g.fill(this.senseValue, 1, .85);
            g.stroke(0);
            g.ellipse(0, 0, r * 1.2, r * 1.2);

            g.fill(1, 0, 1, .7);
			//displays the hue at the current time on the sensor
			g.textSize(9);
            g.text(this.senseValue.toFixed(2), -9, 4);
		},
    });

>>>>>>> master
    Sensor.Timer = Timer;
	Sensor.ColorLerper = ColorLerper;

    return Sensor;
});
