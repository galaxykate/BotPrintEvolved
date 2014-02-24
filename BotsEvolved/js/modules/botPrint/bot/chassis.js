/**
 * @author Kate Compton
 */

define(["common", "graph", "./wiring", "./attachment/attachments", "./component"], function(common, Graph, Wiring, Attachment, Component) {'use strict';
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

        return path;
    }

    var chassisCount = 0;
    //configure logging for the bot "build" process
    var chassisLog = "";
    function chassislog(s){
        if(app.getOption("logChassis"))
            console.log(s);
        chassisLog += (s + " <br>");

    }

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
        init : function(bot, opts) {
            this._super();

            opts = opts || {};
            this.bot = bot;
            this.curveSubdivisions = opts.curveSubdivisions || 3;
            this.idColor = opts.idColor || bot.idColor;
            this.pointCount = opts.pointCount || 5;

            var chassis = this;
            this.idColor = bot.idColor;

            this.path = opts.path || makePath(this);

            this.center = new Vector(0, 0);

            //FIXME: this.center() doesn't actually point to the center when all is said and done, we need to get a "visual" center
            //to actually place the points
            //This is done by finding the centroid of the polygon
            //FIXME: move this over to the graph library?
            var points = this.path.getHull();

            var twiceArea = 0;
            var x = 0; var y = 0;
            var numPoints = this.path.getHull().length;
            var p1, p2, f;
            for(var i = 0, j = numPoints - 1; i < numPoints; j = i++){
                p1 = points[i];
                p2 = points[j];
                f = p1.x*p2.y - p2.x*p1.y;
                twiceArea += f;
                x += (p1.x + p2.x) * f;
                y += (p1.y + p2.y) * f;
            }
            f = twiceArea * 3;

            this.visualCenter = new common.Transform();
            this.visualCenter.setTo((x/f), (y/f), 0);

            this.generateAttachments();
            //Currently generateWiring relies on the rest of the chassis
            //being set and configured. Must go last.
            this.generateWiring();
        },

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
                 c.bo = this.bot;
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
                 if (this.parent !== undefined) {
                     return this.parent.getBot();
                 }
                 return this.bot;
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
                 //TODO: for the demo, I'm just going to place the battery pack in the center, and offset the baby orangitang
                 var battery = new Component.Battery({
                     name : "Battery",
                 });
                 var controller = new Component.Orangutan({
                     name : "Controller",
                 });

                 battery.place(this, this.visualCenter);
                 //FIXME: temp solution where we drop the parts in the center
                 var p = new common.Transform();
                 p.setTo(this.visualCenter.x + 15, this.visualCenter.y,0);

                 controller.place(this, p);

                 battery.addPins();
                 controller.addPins();

                 this.components.push(battery);
                 this.components.push(controller);

                 //FIXME: I want to return to this later.  Right now, we're just going to place both core components, with the orangitang offset
                 //from center.
                 /*
                 // make one component
                 for (var i = 0; i < 1; i++) {

                 var component = new Component.Core({
                 name : "component " + i,
                 //attachPoint : new Vector(300 * (Math.random() - .5), 300 * (Math.random() - .5)),
                 });
                 var p = undefined;

                 //FIXME: weird to have to stretch the bbox here...
                 this.path.expandBoxToFit(this.path.boundingBox);

                 var box = this.path.boundingBox;

                 var corners = box.getCorners(false);

                 var minX;
                 var maxX;
                 var minY;
                 var maxY;

                 if(corners[0].x < corners[2].x){
                 minX = corners[0].x;
                 maxX = corners[2].x;
                 }else{
                 minX = corners[2].x;
                 maxX = corners[0].x;
                 }

                 if(corners[0].y < corners[2].y){
                 minY = corners[0].y;
                 maxY = corners[2].y;
                 }else{
                 minY = corners[2].y;
                 maxY = corners[0].y;
                 }

                 //chassislog("Bounding vals: (" + minX + ", " + minY + ")" + "\n "
                 //+ "(" + maxX + ", " + maxY + ")" + "\n ");

                 p = new common.Transform(0,0,0);

                 //Use ray tracing (from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html) to see if the point is inside
                 //the chassis
                 var valid = false;

                 while(!valid){
                 p.setTo(utilities.random(minX, maxX), utilities.random(minY, maxY), 0);

                 chassislog("attachPoint: (" + p.x + ", " + p.y + ")");

                 if(p === undefined){
                 chassislog("Attach Point Undefined");
                 }else{
                 var k,j;
                 var vertexes = this.path.getHull();
                 for(k = 0, j = vertexes.length - 1; k < vertexes.length; j = k++){
                 if(((vertexes[k].y > p.y) != (vertexes[j].y > p.y)) && 
                 (p.x < (vertexes[j].x - vertexes[k].x) * (p.y - vertexes[k].y) / (vertexes[j].y - vertexes[k].y) + vertexes[k].x)){
                 valid = !valid;
                 }
                 }	
                 }
                 }

                 component.place(this, p);
                 component.addPins();
                 this.components.push(component);
                 }*/


                 // Connect the components
                 var attachmentInPins = [];
                 var attachmentOutPins = [];
                 var controllerInPins = [];
                 var controllerOutPins = [];

                 chassis.wires = [];

                 //wire attachments to the controller
                 console.log("This: ", this);
                 $.each(this.attachments, function(index, attachment){
                     attachment.compilePins(attachmentInPins, function(pin) {
                         return pin.positive;
                     });
                     attachment.compilePins(attachmentOutPins, function(pin){
                         return !pin.positive;
                     });
                 });

                 this.components[1].compilePins(controllerInPins, function(pin) {
                     return pin.positive;
                 });
                 this.components[1].compilePins(controllerOutPins, function(pin) {
                     return !pin.positive;
                 });

                 $.each(attachmentInPins, function(index, pin) {
                     chassis.wires.push(new Wiring.Wire(attachmentInPins[index], controllerOutPins[index]));
                     chassis.wires.push(new Wiring.Wire(controllerInPins[index], attachmentOutPins[index]));
                 });

                 //and now just hand wire the battery pack to the microcontroller
                 if(this.components[0].pins[0].positive === true){
                     chassis.wires.push(new Wiring.Wire(this.components[0].pins[0], controllerOutPins[controllerOutPins.length - 1]));
                     chassis.wires.push(new Wiring.Wire(controllerOutPins[controllerInPins.length - 1], this.components[0].pins[1]));				
                 }else{
                     chassis.wires.push(new Wiring.Wire(this.components[0].pins[1], controllerOutPins[controllerOutPins.length - 1]));
                     chassis.wires.push(new Wiring.Wire(controllerOutPins[controllerInPins.length - 1], this.components[0].pins[0]));				
                 }
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

                 if (app.getOption("useColorLerpers")) {
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
                     attachment.addPins();

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

                 context.simlifiedBots = false;

                 if (context.simplifiedBots) {

                     if (app.getOption("drawComponents")) {
                         $.each(this.components, function(index, component) {
                             component.render(context);
                         });
                     }

                     if (app.getOption("drawWiring")) {
                         $.each(this.wires, function(index, wire) {
                             wire.render(context);
                         });
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

             },
    });

    return Chassis;
});
