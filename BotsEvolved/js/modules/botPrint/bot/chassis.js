/**
 * @author Kate Compton
 */

define(["common", "graph", "./wiring", "./attachment/attachments"], function(common, Graph, Wiring, Attachment) {'use strict';
    var chassisCount = 0;
    // Points MUST be coplanar

    // var CylinderGeometry = new
    //  IO.saveFile("test", "txt", "M 100 100 L 300 100 L 200 300 z");

    var Chassis = common.Tree.extend({
        init : function() {
            this._super();

            var chassis = this;

            this.path = new Graph.Path();
            this.curveSubdivisions = 3;

            this.idColor = new common.KColor((.2813 * this.idNumber + .23) % 1, 1, 1);

            this.center = new Vector(0, 0);
            var pointCount = 5;

            for (var i = 0; i < pointCount; i++) {
                var theta = i * Math.PI * 2 / pointCount;
                var r = 100 * utilities.unitNoise(.7 * theta + 50 * this.idNumber);
                var pt = Vector.polar(r, theta);

                this.path.addEdgeTo(pt);
            }
            this.generateWiring();
            this.generateAttachments();
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Cloning + modification

        clone : function() {
            return new Chassis();
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Transformation

        getBot : function() {
            if (this.parent !== undefined)
                return this.parent.getBot();
        },

        transformToGlobal : function(local, global) {

            if (this.parent !== undefined)
                this.parent.transformToGlobal(local, global);
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Wiring
        generateWiring : function() {
            var chassis = this;
            // Create components
            this.components = [];
            for (var i = 0; i < 5; i++) {
                var volume = Math.random() * 850 + 400;
                var aspectRatio = Math.random() * 1 + .5;

                var component = new Wiring.Component({
                    name : "obj" + i,
                    width : Math.sqrt(volume) * aspectRatio,
                    height : Math.sqrt(volume) / aspectRatio,
                    center : new Vector(300 * (Math.random() - .5), 300 * (Math.random() - .5)),
                });

                this.components.push(component);
            }
            // Connect the components

            var inPins = [];
            var outPins = [];
            $.each(this.components, function(index, component) {
                component.compilePins(inPins, function(pin) {
                    return pin.positive;
                });
                component.compilePins(outPins, function(pin) {
                    return !pin.positive;
                });
            });

            chassis.wires = [];
            // For each in pin, connect it to a random out pin
            $.each(inPins, function(startIndex, pin) {
                var tries = 0;
                var index = Math.floor(Math.random() * outPins.length);
                while (outPins[index].wire !== undefined && tries < outPins.length) {
                    index = (index + 1) % 1;
                    tries++;
                }

                if (outPins[index].wire === undefined) {
                    chassis.wires.push(new Wiring.Wire(inPins[startIndex], outPins[index]));
                }

            });

        },
        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Attachments

        generateAttachments : function() {
            this.attachments = [];
            this.attachPoints = [];

            // Weights and attachment types: there should be the same number in each array, please!
            var weights = [.3, .6];
            var attachmentTypes = [Attachment.Sensor, Attachment.Actuator];

            if (app.getOption("useTimers")) {
                attachmentTypes.push(Attachment.Sensor.Timer), weights.push(1);
            }

            if (app.getOption("useSharpie")) {
                attachmentTypes.push(Attachment.Actuator.Sharpie), weights.push(1);
            }

            attachmentTypes.push(Attachment.Actuator.DiscoLight), weights.push(1);



            // How many attachments to generate
            var count = 4;

            for (var i = 0; i < count; i++) {
                // Create some random point around the path to attach this to.
                var edge = this.path.getRandomEdge();
                var pct = Math.random();

                // Make the tracer slightly inset
                var attachPoint = edge.getTracer(pct, -3);
                if (!attachPoint || !attachPoint.isValid())
                    throw "Found invalid attach point: " + attachPoint + " edge: " + edge + " pct: " + pct;
                // Create an attachment of some random type
                var typeIndex = utilities.getWeightedRandomIndex(weights);
                var attachment = new attachmentTypes[typeIndex]();

                attachment.attachTo(this, attachPoint);
                this.attachments.push(attachment);
                this.attachPoints.push(attachPoint);
            }
        },

        compileForces : function(forces) {
            $.each(this.attachments, function(index, attachment) {
                var f = attachment.getForce();
                if (f !== undefined)
                    forces.push(f);
            });
        },

        compileAttachments : function(attachments, query) {
            $.each(this.attachments, function(index, attachment) {
                if (query(attachment)) {
                    attachments.push(attachment);
                }

            });
        },

        //==========================================
        // Updates

        update : function(time) {
            var chassis = this;

            $.each(this.attachments, function(index, attachment) {
                attachment.update(time);
            });

        },

        // Get something relative to this chassis
        getAt : function(query) {

            app.moveLog("Get at " + query.screenPos);
            return this.path.getAt(query);

        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame

        render : function(context) {
            var bot = this.getBot();
            var g = context.g;

            g.strokeWeight(1);
            this.idColor.fill(g, .2, 1);

            this.idColor.stroke(g, -.4, 1);
            if (bot.selected) {
                g.strokeWeight(5);
                this.idColor.stroke(g, -.7, 1);
                this.idColor.fill(g, .5, 1);
            }

            // Draw the region
            context.drawPath = true;
            this.path.draw(context);

            if (!context.simplifiedBots) {

                if (app.getOption("drawComponents")) {
                    $.each(this.components, function(index, component) {
                        component.render(context);
                    })
                }

                if (app.getOption("drawWiring")) {
                    $.each(this.wires, function(index, wire) {
                        wire.render(context);
                    })
                }
            }

            $.each(this.attachments, function(index, attachment) {
                attachment.render(context);
            });

        },
        hover : function(pos) {

        },
    });

    return Chassis;
});
