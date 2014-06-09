/**
 * @author Kate Compton
 */

define(["common", "./actuator", "graph"], function(common, Actuator, Graph) {'use strict';

    var Wheel = Actuator.extend({
        init : function() {
            this._super();
            this.actuation = 1;
            this.decay = .5;
            this.id = "wheel " + this.idNumber;
            this.spinAngle = 0;
            
            //some extra info to get the box2D stuff working
            this.type = "wheel";
            this.transform = new common.Transform();
            this.height = 30;
            this.width = this.height * .3;
            
            //a more complete representation for Box2D
            this.nodes = [];
            this.path = new Graph.Path();
            this.className = "Wheel";
        },

        actuate : function(value) {
            this.actuation = value;
        },
        
        /**
         * Function to redraw the path after updates
         * Stubbed at the moment 
         */
        // refresh : function() {
        	// return undefined;
        // },
        
        /**
         * Overloaded for box2D integration
         */
        getHull : function(){
        	return this.path.getHull();
        },
        
        /**
         * For box2D integration
         * TODO: this is pretty quick and dirty.  There is probably a better way to handle this
         */
        getForces : function(){
        	return [this.force];
        },
        
        /**
         * Overloaded for box2D integration 
         */
        setAttachPoint : function(p) {
            console.log("Set attach point " + this.attachPoint + " to " + p);
            //if(this.attachPoint !== undefined) {
               // throw new Error("Attachpoint already set");
            //}
            
            this.attachPoint = p;
            this.updateFromPosition();
            //this.transform = this.chassis.bot.transform;
             
            console.log("Transform location at setAttachPoint():");
            console.log(this.transform.x + ", " + this.transform.y);
            
            console.log("Attach point: ");
            console.log(this.attachPoint.x + ", " + this.attachPoint.y);
            
            if (p.rotation){
            	//this.attachPoint.rotation = p.rotation;
            	//this.transform.rotation = p.rotation;
            }
            
            //do box2D things
            //clear out old nodes
            this.nodes = [];
            
            //push the verticies in counter clockwise order, because Box2D is very picky
        	this.nodes.push(new common.Vector(this.transform.x - (this.width / 2), this.transform.y - (this.height / 2)));
            this.nodes.push(new common.Vector(this.transform.x + (this.width / 2), this.transform.y - (this.height / 2)));
            this.nodes.push(new common.Vector(this.transform.x + (this.width / 2), this.transform.y + (this.height / 2)));
            this.nodes.push(new common.Vector(this.transform.x - (this.width / 2), this.transform.y + (this.height / 2)));
            
            var path = this.path;
            path.clear();
            this.nodes.forEach(function(node){
            	path.addEdgeTo(node);
            });
            
            path.close();
            this.path = path;
        },


        update : function(time) {
            this._super(time);

			//Going to log both the transform and attachpoint position here.  I'll also log the transformation to the attach point
			//app.log(this.id + " transform: " + this.transform.x + ", " + this.transform.y);
			//app.log(this.id + " attach point: " + this.attachPoint.x + ", " + this.attachPoint.y);
			//app.log(this.id + " world transform: " + this.getWorldTransform().x + ", " + this.getWorldTransform().y);
			//app.log(this.id + " bot transform: " + this.getBotTransform().x + ", " + this.getBotTransform().y);
            // Set the force's position
            var p = this.getWorldTransform();
            
            //try to lock the wheel down
            this.force.setToPolar(2200 * this.actuation, p.rotation);
            this.spinAngle += time.ellapsed * this.actuation;
            
            //and set the attach point direction
            if(this.transform.rotation !== undefined){
            	this.attachPoint.rotation = this.transform.rotation;
            }
        },
        
        /**
         * Overloaded for box2D integration 
         */
        render : function(context) {
            var g = context.g;
            
            if(this.transform.rotation !== undefined){
            	this.attachPoint.rotation = this.transform.rotation;
            }
            
            g.pushMatrix();
            this.attachPoint.applyTransform(g);
			
            this.renderDetails(context);
            g.popMatrix();
			//this.attachPoint.drawCircle(g);
			//this.transform.drawCircle(g);
            //render pins
            $.each(this.pins, function(index, pin) {
                pin.render(context);
            });
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
            g.rect(-this.height / 2, -this.width / 2, this.height, this.width);

            // draw lines
            var lines = 10;
            for (var i = 0; i < lines; i++) {
                var pct = (i / lines + this.spinAngle) % 1;
                pct = .5 + .5 * Math.cos(pct * Math.PI);
                g.stroke(0);
                var y = this.height / 2 + -pct * this.height;
                g.line(y, -this.width / 2, y, this.width / 2);
            }
        },
    });

    Actuator.Wheel = Wheel;
    return Wheel;
});
