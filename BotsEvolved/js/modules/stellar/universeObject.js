/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';
    var objCount = 0;
    var lodSizes = ["dust", "small", "medium", "large"];
    // Some output that gets dumped to a div, and reset on occaision
    var UniverseObject = Vector.extend({
        init : function(x, y, context) {
            this._super(x, y);

            var size = Math.floor(Math.pow(Math.random(), 1.5) * 4);
            this.radius = (Math.random() * .2 + .8) * 5 * Math.pow(size + 1, 1.5) + 4;
            this.lod = lodSizes[size];
            this.inView = false;
            this.name = "Unnamed object (" + lodSizes[size] + ")";

            this.idNumber = objCount;
            objCount++;
            this.idColor = new common.KColor(size * .2 + .15, 1, 1);
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

        createPopup : function() {

            app.ui.starInfo.addPopup({
                title : this.toString(),
                pointerTarget : this.screenPos,
                pointerRelative : true,
            });

        },

        //=======================================================
        //

        update : function(time) {
            this.excitement -= time.ellapsed * 1;
            this.excitement = Math.max(0, this.excitement);

        },

        render : function(context) {
            var opacity = context.lod[this.lod].opacity;
            if (opacity > 0) {
                var g = context.g;
                var r = this.radius * this.screenScale;
                r = this.radius * this.screenScale;

                if (this.excitement > 0) {
                    var r2 = r + 10 * this.excitement;

                    g.fill(1);
                    g.ellipse(this.screenPos.x, this.screenPos.y, r2, r2);
                }

                this.idColor.stroke(g, -.5, 2 * opacity - 1);
                this.idColor.fill(g, 0, 2 * opacity - 1);
                g.ellipse(this.screenPos.x, this.screenPos.y, r, r);
            }
        },

        renderInspected : function(context) {
            var pos = this;
            var g = context.g;

            g.pushMatrix();
            g.translate(g.width / 2, g.height / 2);
            g.fill(.8, 1, 1, context.opacity);
            g.ellipse(0, 0, 500, 600);
            g.popMatrix();

        },

        //========
        // Outputs

        toInspectorHTML : function() {
            return "<h2>" + this.name + "</h2>"
        },
    });

    return UniverseObject;
});
