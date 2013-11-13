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

        getOtherEnd : function(p) {
            if (p === this.start)
                return this.end;
            if (p === this.end)
                return this.start;

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
        render : function(context, centerLabel) {
            var p0 = this.start.center.screenPos;
            var p1 = this.end.center.screenPos;
            context.g.line(p0.x, p0.y, p1.x, p1.y);
        },
        toString : function() {
            return "[" + this.start + " to " + this.end + "]";
        },
    };

    return Edge;

});
