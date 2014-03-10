/**
 * @author Kate Compton
 */

define(["common", "graph", "./wiring", "./Tuning", "./attachment/attachments", "./component"], function(common, Graph, Wiring, Tuning, Attachment, Component) {'use strict';
    //Private helpers to hide some ugliness


    //Takes a processing instance, and info for a circle to test
    var insideCircle = function(mVector, nodes, diameter) {
        var retNode;
        nodes.forEach(function(node) {
            var nVector = new common.Vector(node.x, node.y);
            if(mVector.getDistanceTo(nVector) < diameter) {
                retNode = node;
            }
        });
        //will be undefined if we haven't clicked on a node
        return retNode;
    }

    var chassisCount = 0;
    //configure logging for the bot "build" process
    var chassisLog = "";
    function chassislog(s) {
        if (app.getOption("logChassis"))
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
            this.idColor = opts.idColor || bot.idColor;
            this.curveSubdivisions = opts.curveSubdivisions || 3;
			this.attachmentCount = 0;

            this.path = opts.path || new Graph.Path();
            this.center = new Vector(0, 0);

            var pointCount = opts.pointCount || 5;

            for (var i = 0; i < pointCount; i++) {
                var theta = i * Math.PI * 2 / pointCount;
                var r = 100 * utilities.unitNoise(.7 * theta + 50 * this.idNumber);
                var pt = Vector.polar(r, theta);
                this.path.addEdgeTo(pt);
            }            

            this.visualCenter = new common.Transform();
            this.updateChassis();
            
            this.generateAttachments();
            this.generateComponents();
            this.generateWiring();
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
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
            c.bot = this.bot;
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
        // Components
        
        /**
         * Create some basic components to stick on the bot
         * @method generateComponents 
         */
        generateComponents : function(){
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
            p.setTo(this.visualCenter.x + 15, this.visualCenter.y, 0);

            controller.place(this, p);

            battery.addPins();
            controller.addPins();

            this.components.push(battery);
            this.components.push(controller);

			//Note: see commented_out.txt        	
        },
        
        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Wiring

        /**
         * Generate the wiring
         * @method generateWiring
         */
        generateWiring : function() {
            var chassis = this;

            // Connect the components
            var attachmentInPins = [];
            var attachmentOutPins = [];
            var controllerInPins = [];
            var controllerOutPins = [];

            chassis.wires = [];

            //wire attachments to the controller
            $.each(this.attachments, function(index, attachment) {
                attachment.compilePins(attachmentInPins, function(pin) {
                    return pin.positive;
                });
                attachment.compilePins(attachmentOutPins, function(pin) {
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
            if (this.components[0].pins[0].positive === true) {
                chassis.wires.push(new Wiring.Wire(this.components[0].pins[0], controllerOutPins[controllerOutPins.length - 1]));
                chassis.wires.push(new Wiring.Wire(controllerOutPins[controllerInPins.length - 1], this.components[0].pins[1]));
            } else {
                chassis.wires.push(new Wiring.Wire(this.components[0].pins[1], controllerOutPins[controllerOutPins.length - 1]));
                chassis.wires.push(new Wiring.Wire(controllerOutPins[controllerInPins.length - 1], this.components[0].pins[0]));
            }
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Attachments

		/**
         * @method generateAttachment
         */
        generateAttachment : function(typeIndex) {
            this.aTypes = app.attachmentTypes;
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
        	// Create some random point around the path to attach this to.
            if (this.attachmentCount < Tuning.OrangatanPins)
            {
              var edge = this.path.getRandomEdge();
              var pct = Math.random();
            
              // Make the tracer slightly inset
              var attachPoint = edge.getTracer(pct, -3);
              if (!attachPoint || !attachPoint.isValid())
              throw "Found invalid attach point: " + attachPoint + " edge: " + edge + " pct: " + pct;

              // Create an attachment of some random type
              //console.log("hh: " + app.attachmentWeights);
                var typeIndex = utilities.getWeightedRandomIndex(app.attachmentWeights);
                var attachment = new app.attachmentTypes[typeIndex]();
            
              attachment.attachTo(this, attachPoint);
              attachment.addPins();

              this.attachments.push(attachment);
              this.attachPoints.push(attachPoint);
              this.attachmentCount++;
            }
        },

        /**
         * @method generateAttachments
         */
        generateAttachments : function() {
            this.attachments = [];
            this.attachPoints = [];

            this.aTypes = app.attachmentTypes;

            // How many attachments to generate
            var count = 4;

            for (var i = 0; i < count; i++) {
            	var typeIndex = utilities.getWeightedRandomIndex(app.attachmentWeights);
                this.generateAttachment(typeIndex);
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

		// Called after the chassis has changed shape, to recalculate math on anything that cares.
		updateChassis : function() {
			//FIXME: this.center() doesn't actually point to the center when all is said and done, we need to get a "visual" center
            //to actually place the points
            //This is done by finding the centroid of the polygon
            //FIXME: move this over to the graph library?
			
			//Calculate where the visual center of the bot is, by finding the centroid of the convex polygon that makes up the chassis
			var points = this.path.getHull();

            var twiceArea = 0;
            var x = 0;
            var y = 0;
            var numPoints = this.path.getHull().length;
            var p1, p2, f;
            for (var i = 0, j = numPoints - 1; i < numPoints; j = i++) {
                p1 = points[i];
                p2 = points[j];
                f = p1.x * p2.y - p2.x * p1.y;
                twiceArea += f;
                x += (p1.x + p2.x) * f;
                y += (p1.y + p2.y) * f;
            }
            f = twiceArea * 3;
            
          	this.visualCenter.setTo((x / f), (y / f), 0);
          	if(this.components !== undefined){
          		updateComponents();
          		updateWiring();	
          	}  
		},

		/**
		 * Updates the component position in response to the Chassis being changed
		 *@method updateComponents 
		 */
		updateComponents : function() {
			//FIXME: Components are hardcoded in place at the moment, so just replace them at the correct spots.
			// replace the battery
			this.components[0].place(this, this.visualCenter);
			
			//replace the microcontroller
			var p = new common.Transform();
            p.setTo(this.visualCenter.x + 15, this.visualCenter.y, 0);
            
            this.components[1].place(this, p);
		},
		
		/**
		 * Updates the wiring position in response to components being shifted in flight
		 * @method updateWiring 
		 */
		updateWiring : function () {
			
		},
				
        /**
         * Called for when the attachments need to update
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

            $.each(this.attachments, function(index, attachment) {
            	attachment.render(context);
            });
                 
            if(app.editMode && !app.editChassis) {
            	var d = 10;
                var nodes = this.path.nodes;
               	context.g.mouseDragged = function() {
              		var mVector = new common.Vector(g.mouseX - g.width/2, g.mouseY - g.height/2);
                    bot.transform.toLocal(mVector, mVector);

                    var curr = insideCircle(mVector, nodes, d);
                   	if(curr !== undefined) {
                    	curr.x = mVector.x;
                        curr.y = mVector.y;
                        
                    }
                };
                
                //Draw handles
                nodes.forEach(function(node) {
                	context.g.ellipse(node.x, node.y, d, d);
            	});
        	}
            else if (!app.editChassis) {
            //Edit parts mode = Drag, drop and delete attachments
            	cvar d = 10;
                var nodes = this.path.nodes;
               	context.g.mouseDragged = function() {
              		var mVector = new common.Vector(g.mouseX - g.width/2, g.mouseY - g.height/2);
                    bot.transform.toLocal(mVector, mVector);

                    var curr = insideCircle(mVector, nodes, d);
                   	if(curr !== undefined) {
                    	curr.x = mVector.x;
                        curr.y = mVector.y;
                        
                    }
                };
            }
            else {
            	context.g.mouseDragged = undefined;
            }
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
