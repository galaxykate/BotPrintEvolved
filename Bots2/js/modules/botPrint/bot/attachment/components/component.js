/**
 * File details how components work.
 * Components are internal parts of the bot, things we wouldn't want to put on an edge.  The two obvious exmaples are the battery pack 
 * and the processor.
 * 
 * These components, unlike sensors or actuators, do not add forces to the robot or get information from the environment.  They're mostly
 * static.
 * 
 * TODO: for the future, we'll want some Box2D modeling of components, so we can add forces to them to use a FDG approch to component layout.
 * Right now, they're just going to be calculated in the center
 * @see wheel.js for box2D modeling hooks
 *
 * @author Johnathan Pagnutti
 */
define(["common", "../attachment"], function(common, Attachment) {'use strict';

    var Component = Attachment.extend({
        init : function() {
            this._super();
            this.id = "Component " + this.idNumber;
        },

		/**
		 * Update function.  This function fires on every tick.
		 * Although not typically described for components, the function is stubbed here for future use. 
 		 * @param {Object} time
		 */
        update : function(time) {
            this._super(time);
			// stub!
        },
        
        /**
         *Stub because we need a refresh command.  The standard attachment refresh isn't going to work.
         * We'll probably put in wiring updates here. 
         */
        refresh : function() {
        	
        },

		/**
		 * How to render this particular component, as opposed to any other attachment
		 * Typically, we would want this to be  
 		 * @param {Object} context
		 */
        renderDetails : function(context) {
            var g = context.g;
            var r = 10
            g.fill(0);
            g.noStroke();
            g.rect(r / 2, -r / 2, -r * 2, r);
        },

		/**
		 * A way to represent this object as a string.  mostly for debugging purposes 
		 */
        toString : function() {
            return this.id;
        }
    });
    
    return Component;
});