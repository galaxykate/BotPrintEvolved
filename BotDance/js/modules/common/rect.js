/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["modules/common/vector"], function(Vector) {
    var Rect = Class.extend({
        init : function(x, y, w, h) {
            this.w = w;
            this.h = h;
            this.x = x;
            this.y = y;
        },

        clone : function() {
            return new Rect(this.x, this.y, this.w, this.h);
        },

        // return the Vectors of the corners
        getCorners : function(ccw) {
            var x0 = this.x + this.w;
            var x1 = this.x;
            var y0 = this.y;
            var y1 = this.y + this.h;

            if (ccw)
                return [new Vector(x0, y0), new Vector(x1, y0), new Vector(x1, y1), new Vector(x0, y1)];
            return [new Vector(x0, y0), new Vector(x0, y1), new Vector(x1, y1), new Vector(x1, y0)];
        },
        getRandomPosition : function(border) {
            var x = this.x + border + Math.random() * (this.w - border * 2);
            var y = this.y + border + Math.random() * (this.h - border * 2);

            return new Vector(x, y);
        },
        toString : function() {
            return "[(" + this.x.toFixed(2) + "," + this.y.toFixed(2) + "), " + this.w.toFixed(2) + "x" + this.h.toFixed(2) + "]";
        }
    });

    return Rect;

});
