/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';
    var setAsTouchable = function(p) {
        p.excitement = 0;
        p.excite = function() {
            this.excitement = 1;
        };
        p.select = function() {
            this.selected = true;
        };

        p.deselect = function() {
            this.selected = false;
        };
    };

    var Handle = Vector.extend({
        init : function(parent, controlRadius, index) {
            this._super(0, 0);
            this.parent = parent;
            this.controlRadius = controlRadius;
            this.index = index;
            setAsTouchable(this);
        },

        update : function() {
            this.setToPolarOffset(this.parent, this.controlRadius, this.parent.theta + Math.PI * this.index);
        },

        moveTo : function(pos) {
            var offset = this.parent.getOffsetTo(pos);
            this.parent.theta = offset.getAngle() + this.index * Math.PI;
            this.controlRadius = offset.magnitude();
            this.parent.updateControlHandles();

        },

        toString : function() {
            return "Handle" + this.index + this._super();
        },
    });

    var PathPoint = Vector.extend({
        init : function(x, y, radius0, radius1, theta) {
            var pathPoint = this;
            this._super(x, y);
            this.theta = theta;

            this.handles = [new Handle(this, radius0, 0), new Handle(this, radius1, 1)];

            setAsTouchable(this);

            this.subPoints = [this, this.handles[0], this.handles[1]];
            this.excitement = 0;
            this.updateControlHandles();

        },

        setNext : function(p) {
            this.next = p;
            p.previous = this;
        },

        update : function(time) {
            this.excitement = Math.max(0, this.excitement - 1.5 * time.ellapsed);
        },

        moveTo : function(pos) {
            this.setTo(pos);
           this.updateControlHandles();
        },

        makeCurveVertex : function(g) {
            var c0 = this.handles[1];
            var c1 = this.next.handles[0];

            g.bezierVertex(c0.x, c0.y, c1.x, c1.y, this.next.x, this.next.y);
            //    g.vertex(c0.x, c0.y);
            //  g.vertex(c1.x, c1.y);
            //  g.vertex(this.x, this.y);
        },

        updateControlHandles : function() {

            this.handles[0].update();
            this.handles[1].update();

        },

        render : function(context) {
            var g = context.g;

            // Draw the control points

            g.stroke(0);
            g.fill(.3, 1, 1);
            this.handles[0].drawCircle(g, 5);
            g.fill(.8, 1, 1);
            this.handles[1].drawCircle(g, 5);

            if (this.excitement > 0) {
                var r2 = 10 + 20 * this.excitement;
                g.fill(1, 0, 1, .9)
                g.ellipse(this.x, this.y, r2, r2);
            }

            g.fill(0);
            g.noStroke();
            if (this.active) {
                g.fill(.8, 1, 1);
            }

            var r = 10;
            g.ellipse(this.x, this.y, r, r);

        },
    });

    return PathPoint;
});
