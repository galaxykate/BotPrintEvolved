/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {'use strict';

    // Some output that gets dumped to a div, and reset on occaision
    var UniverseObject = Vector.extend({
        init : function(x, y, context) {
            this._super(x, y);
            this.radius = 10;
            this.excitement = 0;

            this.canSiphon = true;
            this.canInspect = true;
            this.canHoverInspect = true;

            // Overwrite with any custom functionality
            $.extend(this, context);
        },

        //=======================================================
        // Things the player/touch could to to this object

        excite : function() {
            this.excitement = 1;
        },

        siphon : function() {
            app.newsbar.addPopup({
                html : "Siphoned from " + this,
                timeout : 2,
            });
        },

        //=======================================================
        //

        update : function(time) {
            this.excitement -= time.ellapsed * 1;
            this.excitement = Math.max(0, this.excitement);

        },

        render : function(context) {
            var g = context.g;
            var r = this.radius * this.screenScale;
            r = this.radius * this.screenScale;

            if (this.excitement > 0) {
                var r2 = r + 10 * this.excitement;

                g.fill(1);
                g.ellipse(this.screenPos.x, this.screenPos.y, r2, r2);
            }

            g.fill(0);
            g.ellipse(this.screenPos.x, this.screenPos.y, r, r);

        },
    });

    return UniverseObject;
});
