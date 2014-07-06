/**
 * Battery Pack code
 * @author Johnathan Pagnutti
 */
define(["common", "./component"], function(common, Component) {'use strict';

	var BatteryPack = Component.extend({
		init : function() {
            this._super();
            this.id = "BatteryPack " + this.idNumber;
            this.type = "BatteryPack";
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
		 * How to render a battery pack
		 * Typically, we would want this to be  
 		 * @param {Object} context
		 */
        renderDetails : function(context) {
            var g = context.g;
            var r = 25;
            g.fill(0);
            g.noStroke();
            g.rect(r / 2, -r / 2, -r * 2, r);
        },
	});
	
	Component.BatteryPack = BatteryPack;
	return BatteryPack;
});