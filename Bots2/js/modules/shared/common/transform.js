/**
 * @author Kate Compton
 */
// Reusable Vector class

define(["./vector"], function(Vector) {
    var Transform = Vector.extend({
        init : function() {
            this._super();
            this.rotation = 0;
            this.scale = 1;
            this.className = "Transform";

        },

        setToTransform : function(t) {
        	if (isNaN(t.rotation)){
        		throw "Passing in a NaN value for rotation.  crashing...";
        	}
            this.rotation = t.rotation;
            this.scale = t.scale;
            this.setTo(t);
        },

        reset : function() {
            this.rotation = 0;
            this.scale = 1;
            this.setTo(0, 0, 0);
        },

		//Transforms g to the 'this' space
        applyTransform : function(g) {
            this.translateTo(g);
            g.rotate(this.rotation);
            g.scale(this.scale);
        },
        
		//Sets the second param to the first, then transforms to 'this' space
        toWorld : function(localPos, worldPos) {
       		if(isNaN(localPos.x) || isNaN(localPos.y)){
       			throw "Passing in a NaN value in local position, crashing...";
       		}      		
       		if(isNaN(this.rotation)){
            	throw "This transform currently has a NaN value for it's rotation, crashing...";
            }
       		
            worldPos.setTo(localPos);
            worldPos.rotate(this.rotation);
            worldPos.add(this);
            worldPos.mult(this.scale);

            if (localPos.rotation !== undefined)
                worldPos.rotation += this.rotation;
        },

		//Sets the second param to the first, then transforms to 'this' space
        toLocal : function(worldPos, localPos) {
            localPos.setTo(worldPos);
            localPos.div(this.scale);
            localPos.sub(this);
            localPos.rotate(-this.rotation);

            if (worldPos.rotation !== undefined)
                localPos.rotation -= this.rotation;
        },

        toString : function() {
            return "[" + this._super() + " " + this.rotation.toFixed(2) + "rad " + this.scale + "X]";
        }
    });

    return Transform;

});
