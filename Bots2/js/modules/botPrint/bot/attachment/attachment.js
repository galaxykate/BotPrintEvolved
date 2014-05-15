/**
 * @author Kate Compton
 */

define(["common", "graph", "../wiring"], function(common, Graph, Wiring) {'use strict';

    var AttachmentForce = Vector.extend({
        init : function(attachment) {
            this._super();
            this.attachment = attachment;
            this.idColor = new common.KColor((.145 * attachment.idNumber + .2) % 1, 1, 1);
            this.center = new common.Transform();
            this.className = "AttachmentForce";
        },

        draw : function(g) {
            g.strokeWeight(1);
            this.idColor.stroke(g, -.3, 1);
            this.idColor.fill(g, .3, 1);
            this.center.drawCircle(g, 5);
            g.pushMatrix();
            this.center.applyTransform(g);

            g.line(0, 0, 30, 0);

            g.popMatrix();

            this.idColor.stroke(g);
            this.idColor.fill(g);

            this.center.drawArrow(g, this, .1, 2, 10, 3);

        },
    });

    var attachmentCount = 0;
    var Attachment = Class.extend({
        init : function() {
            this.idNumber = attachmentCount;
            attachmentCount++;

			this.className = "Attachment";
            this.pins = [];
            this.force = new AttachmentForce(this);
        },

        //========================================================
        // Attachment

        detach : function() {
            if (this.chassis) {
                console.log("Detach " + this + " from " + this.chassis);
                this.chassis.removePart(this);
                this.chassis = undefined;
            }
        },

        attachTo : function(chassis) {
            if (this.chassis !== chassis)
                this.detach();

            this.chassis = chassis;
            this.chassis.addPart(this);

        },

        setAttachPoint : function(p) {
            console.log("Set attach point " + this.attachPoint + " to " + p);
            /*if(this.attachPoint !== undefined) {
                throw new Error("Attachpoint already set");
            }*/
            this.attachPoint = p;
            this.updateFromPosition();

        },

        updateFromPosition : function() {
            this.attachPoint.refresh();
            //this.attachPoint.setToLerp(this.position.edge.start, this.position.edge.end, this.position.pct);
        },

        //========================================================
        // Transformations

        getBotTransform : function() {
            var global = new common.Transform();
            this.attachPoint.toWorld(global, global);
            return global;
        },

        getWorldTransform : function() {
            var global = new common.Transform();
            //   global.rotation += this.attachPoint.rotation;
            this.attachPoint.toWorld(global, global);

            this.chassis.transformToGlobal(global, global);

            return global;
        },

        transformToGlobal : function(local, global) {
            if (this.chassis !== undefined)
                this.chassis.transformToGlobal(local, global);

            // Transform it relative to the attachment
            this.attachPoint.toWorld(global, global);

        },

        getDistanceTo : function(p) {
            return this.getWorldTransform().getDistanceTo(p);
        },

        //========================================================
        //

        update : function(time) {
            // Set the force's position
            this.force.center.setToTransform(this.getWorldTransform());
        },

        refresh : function() {
            this.attachPoint.refresh();
            //this.position.edge.setToTracer(this.attachPoint, this.position.pct, this.position.offset);
        },

        //========================================================
        // add pins
        addPins : function() {

            //add pins
            // each component (right now) gets a positive and a negative pin

            var positive = new Wiring.Pin({
                positive : true,
                parent : this,
            });
            this.pins.push(positive);

            var negative = new Wiring.Pin({
                positive : false,
                parent : this,
            });
            this.pins.push(negative);
        },

        //========================================================
        // Rendering
        // overloading this to also account for pin shifts
        // TODO: not entirely happy with this impementation

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
            //this.attachPoint.drawCircle(g);
            this.attachPoint.applyTransform(g);

            //ATTACHPOINT
            //g.fill(.7, 2, 1);
            //g.stroke(0);
            //g.ellipse(this.attachPoint.x, this.attachPoint.y, 5, 5);


            this.renderDetails(context);

            g.popMatrix();

            //render pins
            $.each(this.pins, function(index, pin) {
                pin.render(context);
            });
        },

		onPickup : function(touch) {
        	console.log("HI!");
            console.log(this.name);
            touch.follower.html(this.id);
            touch.follower.show();
        },
        
        onDrag : function(touch, overObj) {
        	console.log("WHEEEE~");
            console.log(overObj);
            //console.log(touch);
            //console.log(overObj);
            var found = app.currentBot.getClosestEdgePosition(touch.screenPos);
            console.log("Drag " + this.id + " over " + overObj + " at " + found);
            if (found)
                app.currentBot.addPart(this, found);
        },
        
        onDrop : function(touch, overObj) {
        	console.log("Bye!");
            touch.follower.hide();
            },

        //===========================================================
        // Configure Pins
        compilePins : function(pinList, filter) {
            $.each(this.pins, function(index, pin) {
                if (filter(pin))
                    pinList.push(pin);
            });
        }
    });

    return Attachment;
});
