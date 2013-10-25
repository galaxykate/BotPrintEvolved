/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {
    var AttachPoint = Class.extend({
        init : function(parent, offset, baseAngle) {
            this.parent = parent;
            this.offset = offset;
            this.baseAngle = baseAngle;
            this.attachAngle = 2 * (Math.random() - .5);
        },

        attach : function(attachment) {
            this.child = attachment;
            this.child.parent = this;
        },

        draw : function(g, t) {
            var w = 4;
            g.pushMatrix();
            this.offset.translateTo(g);
            g.rotate(this.baseAngle);
            g.noStroke();
            this.parent.idColor.fill(g, -.4, .4);
            g.rect(0, -w / 2, -w * .6, w);
            // g.fill(1);
            //g.rect(-w / 2, 0, w, w * .5);
            g.rotate(this.attachAngle);
            if (this.child) {

                this.child.draw(g, t);
            }
            g.popMatrix();
        },

        update : function(time) {
            if (this.child !== undefined) {
                this.child.globalRotation = this.parent.rotation + this.baseAngle + this.attachAngle;
                this.child.globalPosition.setTo(this.parent);
                this.child.globalPosition.angle = this.child.globalAngle;

                //this.child.globalPosition.addRotated(this.offset, this.angle);

                this.child.globalPosition.addRotated(this.offset, this.parent.rotation);
                this.child.update(time);
            }
        },
    });

    return AttachPoint;
});
