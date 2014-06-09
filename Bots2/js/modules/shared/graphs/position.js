/**
 * @author Kate Compton
 */
define(["common"], function(common) {
    var Position = common.Transform.extend({
        init : function(edge, pct, offset, thetaOffset) {
            this._super();
            this.edge = edge;
            this.className = "Position";
            this.pct = isNaN(pct) ? .5 : pct;
            this.offset = isNaN(offset) ? 0 : offset;
            this.thetaOffset = isNaN(thetaOffset) ? 0 : thetaOffset;
            this.refresh();
            this.className = "Position";
        },

        refresh : function() {
            var theta = this.edge.getAngle();
            this.rotation = theta + Math.PI / 2 + this.thetaOffset;
            this.setToLerp(this.edge.start, this.edge.end, this.pct);
            this.addMultiple(this.edge.getNormal(), this.offset);
        },

        getEdgePoint : function() {
            var linePos = this.edge.start.lerp(this.edge.end, this.pct);
            return linePos;
        },

        drawCircle : function(g) {
            var r = 8;

            this._super(g, r * .4);
            var linePos = this.edge.start.lerp(this.edge.end, this.pct);
            linePos.drawLineTo(g, this);
            //     g.line(this.x, this.y, this.x + r * Math.cos(this.rotation), this.y + r * Math.sin(this.rotation));
        },

        toString : function() {
            return " pct: " + this.pct.toFixed(2) + " " + this.offset.toFixed(2) + ": " + this.toSimpleString();
        }
    });

    return Position;
});
