/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';
    var attachmentCount = 0;
    var Attachment = Class.extend({
        init : function() {
            this.idNumber = attachmentCount;
            attachmentCount++;
        },

        getForce : function() {
            return undefined;
        },

        //========================================================
        // Transformations

        getBotTransform : function() {
            var global = new common.Transform();
            global.setTo(0, 0);
            this.attachPoint.toWorld(global, global);
            return global;
        },

        getWorldTransform : function() {
            var global = new common.Transform();
            global.setTo(-30, 0);
            //   global.rotation += this.attachPoint.rotation;
            this.attachPoint.toWorld(global, global);
            this.parent.transformToGlobal(global, global);

            return global;
        },

        transformToGlobal : function(local, global) {
            app.log("local to attachment: " + local);
            if (this.parent !== undefined)
                this.parent.transformToGlobal(local, global);

            // Transform it relative to the attachment
            this.attachPoint.toWorld(global, global);

            app.log("global: " + global);
        },

        //========================================================
        //

        attachTo : function(parent, attachPoint) {
            this.parent = parent;
            this.attachPoint = attachPoint;
        },

        update : function(time) {

        },

        //========================================================
        // Rendering

        renderDetails : function(context) {
            var r = 10;
            var g = context.g;

            g.fill(.7, 1, 1);
            g.stroke(0);
            g.ellipse(0, 0, r * 1.4, r * 1.4);
            g.rect(0, -r / 2, -r * 3, r);

        },

        render : function(context) {
            var g = context.g;

            g.pushMatrix();
            this.attachPoint.applyTransform(g);

            this.renderDetails(context);

            g.popMatrix();

        }
    });

    return Attachment;
});
