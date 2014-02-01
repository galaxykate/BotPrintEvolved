/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["modules/common/vector"], function(Vector) {
    function Edge(start, end) {
        this.start = start;
        this.end = end;
    };

    // Shared class attributes
    Edge.prototype = {
        getAngleTo : function(p) {
            var u = this.getOffset();
            var v = this.start.getOffsetTo(p);

            var theta = Math.acos(u.dot(v) / (u.magnitude() * v.magnitude()));
            return theta;

        },

        getSide : function(p) {
            var offset = this.getOffset();
            var val = (offset.x * (p.y - this.start.y) - offset.y * (p.x - this.start.x));
            if (val > 0)
                return 1;
            if (val < 0)
                return -1;
            return val;
        },

        getOffset : function() {
            return this.start.getOffsetTo(this.end);
        },
        toString : function() {
            return "[" + this.start + " to " + this.end + "]";
        },
    };

    return Edge;

});
