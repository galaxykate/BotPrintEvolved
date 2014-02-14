/**
 * @author Kate Compton
 */

define(["common", "graph", "./wiring", "./attachment/attachments"], function(common, Graph, Wiring, Attachment) {'use strict';
    //Private helpers to hide some ugliness
    var getAttachmentTypes = function() {
        // Weights and attachment types: there should be the same number in each array, please!
        var attachmentTypes = [Attachment.Sensor, Attachment.Actuator];
        var weights = [.3, .6];
        if (app.getOption("useTimers")) {
            attachmentTypes.push(Attachment.Sensor.Timer), weights.push(1);
        }

        if (app.getOption("useColorLerpers")){
            attachmentTypes.push(Attachment.Sensor.ColorLerper), weights.push(1);
        }

        if (app.getOption("useSharpie")) {
            attachmentTypes.push(Attachment.Actuator.Sharpie), weights.push(1);
        }

        attachmentTypes.push(Attachment.Actuator.DiscoLight), weights.push(1);

        return {types: attachmentTypes, weights: weights};
    }

    var makePath = function(chassis) {
        var path = new Graph.Path();
        for (var i = 0; i < chassis.pointCount; i++) {
            var theta = i * Math.PI * 2 / chassis.pointCount;
            var r = 100 * utilities.unitNoise(.7 * theta + 50 * chassis.idNumber);
            var pt = Vector.polar(r, theta);

            path.addEdgeTo(pt);
        }
        //Close the loop
        if(chassis.pointCount > 0) {
            path.addEdgeTo(path.edges[0].start);
        }

        return path;
    }

    var chassisCount = 0;
    // Points MUST be coplanar

    // var CylinderGeometry = new
    //  IO.saveFile("test", "txt", "M 100 100 L 300 100 L 200 300 z");

    /**
     * @class Chassis
     * @extends Tree
     */
    var Chassis = common.Tree.extend({
        /**
         * @method init
         */
        init : function(parent, opts) {
            this._super();

            opts = opts || {};
            this.curveSubdivisions = opts.curveSubdivisions || 3;
            this.idColor = opts.idColor || new common.KColor((.2813 * this.idNumber + .23) % 1, 1, 1);
            this.pointCount = opts.pointCount || 4;

            this.path = opts.path || makePath(this);

            this.center = new Vector(0, 0);

            this.generateWiring();
            this.generateAttachments();
        },
        // Cloning + modification

             /**
              * @method clone
              * @return {Chassis} newChassis
              */
             clone : function() {
                 var c = new Chassis();
                 c.attachPoints = this.attachPoints.slice(0);
                 c.attachments = this.attachments.slice(0);
                 c.center = JSON.parse(JSON.stringify(this.center));
                 c.components = this.components.slice(0);
                 c.curveSubdivisions = this.curveSubdivisions;
                 c.depth = this.depth;
                 c.idColor = JSON.parse(JSON.stringify(this.idColor));
                 c.parent = this.parent;
                 c.path = JSON.parse(JSON.stringify(this.path));
                 c.wires = this.wires.slice(0);

                 return c;
             },


             //======================================================================================
             //======================================================================================
             //======================================================================================
             // Transformation

             /**
              * @method getBot
              * @return {Bot} returns parent's Bot, or undefined
              */
             getBot : function() {
                 if (this.parent !== undefined)
                     return this.parent.getBot();
             },

             /**
              * @method transformToGlobal
              * @param local
              * @param global
              */
             transformToGlobal : function(local, global) {
                 if (this.parent !== undefined)
                     this.parent.transformToGlobal(local, global);
             },

             //======================================================================================
             //======================================================================================
             //======================================================================================
             // Wiring
             /**
              * Here there be dragons
              * @method generateWiring
              */
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

             /**
              * @method generateAttachments
              */
             generateAttachments : function() {
                 this.attachments = [];
                 this.attachPoints = [];

                 // Weights and attachment types: there should be the same number in each array, please!
                 var weights = [.3, .6];
                 var attachmentTypes = [Attachment.Sensor, Attachment.Actuator];

                 if (app.getOption("useTimers")) {
                     attachmentTypes.push(Attachment.Sensor.Timer), weights.push(1);
                 }

                 if (app.getOption("useColorLerpers")){
                     attachmentTypes.push(Attachment.Sensor.ColorLerper), weights.push(1);
                 }

                 if (app.getOption("useSharpie")) {
                     attachmentTypes.push(Attachment.Actuator.Sharpie), weights.push(1);
                 }


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

             /**
              * @method compileForces
              * @param forces
              */
             compileForces : function(forces) {
                 $.each(this.attachments, function(index, attachment) {
                     var f = attachment.getForce();
                     if (f !== undefined)
                     forces.push(f);
                 });
             },

             /**
              * @method compileAttachments
              * @param attachments
              * @param query
              */
             compileAttachments : function(attachments, query) {
                 $.each(this.attachments, function(index, attachment) {
                     if (query(attachment)) {
                         attachments.push(attachment);
                     }

                 });
             },

             //==========================================
             // Updates

             /**
              * @method update
              * @param time
              */
             update : function(time) {
                 var chassis = this;

                 $.each(this.attachments, function(index, attachment) {
                     attachment.update(time);
                 });

             },

             /**
              * Get something relative to this chassis
              * @method getAt
              * @param query
              */
             getAt : function(query) {

                 app.moveLog("Get at " + query.screenPos);
                 return this.path.getAt(query);

             },

             //-------------------------------------------
             // View stuff - will probably end up in it's own file

             /**
              * Render this bot in a 2D frame
              * @method render
              * @param context
              */
             render : function(context) {
                 var bot = this.getBot();
                 var g = context.g;

                 g.strokeWeight(1);
                 this.idColor.fill(g, .2, 1);

                 this.idColor.stroke(g, -.4, 1);

                 if (bot.selected) {
                     g.strokeWeight(5);
                     this.idColor.stroke(g, .7, 1);
                     this.idColor.fill(g, -.5, 1);
                 }

                 // Draw the region
                 context.drawPath = true;
                 this.path.drawFilled(context);

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

             /**
              * @method hover
              * @param pos
              */
             hover : function(pos) {

             }
    });

    return Chassis;
});
