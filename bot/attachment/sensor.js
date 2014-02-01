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
    
    
    /*
	 * This sensor helps blind bots explore their environment.
	 * The sensor pretends that the bot is initially unaware of 
	 * how big its playpen is. As the bot explores the playpen, 
	 * the sensor keeps track of the farthest it has gone up, down, 
	 * left, and right, changing its opacity to indicate how 
	 * close it is to the boundaries it has found.
	 * 
	 * The sensor will become more opaque as it gets closer to a 
	 * boundary, and become more transparent as it moves away from 
	 * one.
	 */
	
    var Explorer = Sensor.extend({
        init : function() {
            this._super();
            this.id = "Explorer" + this.idNumber;
            this.maxXDist;
            this.maxYDist;
            this.minXDist;
            this.minYDist;
        },

        update : function(time) {
			var worldPos = this.getWorldTransform();
			var xPos = worldPos.x;
			var yPos = worldPos.y;
			var dist;
            
            //initializing boundaries
            if(typeof this.maxXDist === 'undefined')
            	this.maxXDist = xPos;
            if(typeof this. maxYDist === 'undefined')
            	this.maxYDist = yPos;
            if(typeof this. minXDist === 'undefined')
            	this.minXDist = xPos;
            if(typeof this.minYDist === 'undefined')
            	this.minYDist = yPos;

  			//if we've pushed the boundaries, change boundary
  			if(yPos > this.maxYDist){	
            	this.maxYDist = yPos;
            }
			if(xPos > this.maxXDist){
				this.maxXDist = xPos;
			}
			if(xPos <= this.minXDist){	
				this.minXDist = xPos;
            }
            if(yPos <= this.minYDist){
            	this.minYDist = yPos;
            }
	
           	//calculate distance from each boundary
            var distFromMaxX = Math.abs(this.maxXDist - xPos);
            var distFromMinX = Math.abs(this.minXDist - xPos);
            var distFromMaxY = Math.abs(this.maxYDist - yPos);
            var distFromMinY = Math.abs(this.minYDist - yPos);
			
			//find boundary we're closest to
			var lowest = Math.min(distFromMaxX, distFromMinX);
			lowest = Math.min(lowest, distFromMaxY);
			lowest = Math.min(lowest, distFromMinY);

            //calculate how close we are to that boundary as a percentage
        	if(distFromMaxX == lowest)
        		this.senseValue = Math.abs(xPos) / Math.abs(this.maxXDist);
        	else if (distFromMinX == lowest)
        		this.senseValue = Math.abs(xPos) / Math.abs(this.minXDist);
        	else if (distFromMaxY == lowest)
        		this.senseValue = Math.abs(yPos) / Math.abs(this.maxYDist);
        	else if (distFromMinY == lowest)
        		this.senseValue = Math.abs(yPos) / Math.abs(this.minYDist);
        	
			//in case we accidentally divided by zero
            if (this.senseValue == Number.POSITIVE_INFINITY){
            	this.senseValue = 1;
            }
        },
        
        renderDetails : function(context) {
            var g = context.g;
            var r = 10;

			//create a circle with the alpha corresponding to 
			//how close we are to a boundary
            g.fill(1, 1, 1, this.senseValue);
            g.ellipse(1, 3, r * 1.7, r * 1.5);
        },
    });
    

	Sensor.Explorer = Explorer;
    Sensor.Timer = Timer;
	Sensor.ColorLerper = ColorLerper;

    return Sensor;
});
