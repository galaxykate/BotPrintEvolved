/**
 * @author Kate Compton
 */
// Reusable Vector class

define(["modules/common/vector"], function(Vector) {
    var Transform = Class.extend({
        init : function() {
            this.rotation = 0;
            this.scale = 1;
            this.translation = new Vector();
        },

        cloneFrom : function(t) {
            this.rotation = t.rotation;
            this.scale = t.scale;
            this.translation.setTo(t.translation)
        },

        reset : function() {
            this.rotation = 0;
            this.scale = 1;
            this.translation.setTo(0, 0, 0);
        },

        applyTransform : function(g) {
            this.translation.translateTo(g);
            g.rotate(this.rotation);
            g.scale(this.scale);
        },

        toWorld : function(localPos, worldPos) {
            worldPos.setTo(localPos);
            worldPos.add(this.translation);
            worldPos.mult(this.scale);
            worldPos.rotate(this.rotation);
        },

        toLocal : function(worldPos, localPos) {
            localPos.setTo(worldPos);
            localPos.rotate(-this.rotation);
            localPos.div(this.scale);
            localPos.sub(this.translation);

        },

        toString : function() {
            return "[" + this.translation + " " + this.rotation + "rad " + this.scale + "X]";
        }
    });

    return Transform;

});
