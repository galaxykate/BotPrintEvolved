/**
 * @author Johnathan Pagnutti
 * 
 * This Javascript object is a generic component.  Components are internal parts with input and output pins. 
 */

define(["common", "graph", "./wiring"], function(common, Graph, Wiring) {'use strict';
	var componentCount = 0;
	var Component = Class.extend({
		
		/**
		 * Initalizes a new component 
		 */
		init :  function(settings) {
            // Defaults
            // colors!
            this.idNumber = componentCount;
            this.idColor = common.KColor.makeIDColor(this.idNumber);
            componentCount++;
            
            //the shape of the component
            this.path = new Graph.Path();
            
            //pins!
            this.pins = [];
            _.extend(this, settings);
		},
		
		
		//========================================================
		// build the basic shape
		
		buildDetails : function(){
			//currently, we're just gonna create  a rectangle.  BECAUSE RECTANGLES ROCK.
			this.path = Graph.makeRectangle(this.attachPoint, 10, 14);	
		},
		
		//========================================================
		// add pins
		addPins : function() {          
        	//add pins
        	// each component gets three snap points randomly distributed
        	
            //TODO: bringing back pins sitting on random edges of the component.  Word.
            for (var i = 0; i < 3; i++) {
                var pin = new Wiring.Pin({
                    positive : Math.random() > .5,
                    parent : this,
                });
                this.pins.push(pin);
            }
		},
		
		compilePins : function(pinList, filter) {
            $.each(this.pins, function(index, pin) {
                if (filter(pin))
                    pinList.push(pin);
            });
        },
        
        //========================================================
		// attaching 
		place : function(parent, point){
			this.parent = parent;
            
            this.attachPoint = point;
            
            //This needs to be overloaded by any components that are created off of this one.  Essentally builds a Vector.Path representation
            //of the internal component for collision detection and stuff, basing the built object off of the attachPoint.
            
            //This is not a good implementation because it requires the parts to be redrawn.
            //TODO: fix?
            this.buildDetails();
		},
        
        //========================================================
		// rendering
        renderDetails : function(context) {
            
            this.path.draw(context);
        },
        
        render : function(context) {
            var g = context.g;

            g.pushMatrix();
            this.attachPoint.applyTransform(g);
			
            this.renderDetails(context);
            
            g.popMatrix();
            
            //render pins
            $.each(this.pins, function(index, pin) {
                pin.render(context);
            });
        }
    });
	
	var Battery = Component.extend({
		init : function(){
            this._super();
            this.id = "Battery " + this.idNumber;
		},
		
		//build the actual shape of the core component block
		buildDetails : function (){
			this.path = Graph.makeRectangle(this.attachPoint, 10, 14);
		},
		
		//add pins for wire-related things
		addPins : function (){
			
			//setup offsets
			var pinOffset = new common.Transform();
			pinOffset.setTo(0, 3, 0);
			
            var positive = new Wiring.Pin({
                 positive : true,
                 offset : pinOffset,
                 parent : this,
            });
            
            pinOffset.setTo(0, -3, 0);
            var negative = new Wiring.Pin({
            	positive : false,
            	offset : pinOffset,
            	parent : this,
            });
            
        	this.pins.push(positive);
        	this.pins.push(negative);
		},
		
		//we don't need to override the render details, because it just draws the shapes we throw at it.  Ballin'
	});
	
	var Orangutan = Component.extend({
		init : function(){
			this._super();
			this.id = "Orangutan " + this.idNumber;
		},
		
		//build the actual shape of the core component block
		buildDetails : function(){
			this.path = Graph.makeRectangle(this.attachPoint, 5, 5);
		},
		
		//add pins for wire-related things
		addPins : function (){
			//set up pin offsets
			var pinOffset = new common.Transform();
			
			//TODO: pins are a little big right now compared to component size, so I'm just going to space them out.
			pinOffset.setTo(0, 3, 0);
			//positive pins
			for(var i = 0; i < 12; i++){
				var pin = new Wiring.Pin({
					positive : true,
					offset : pinOffset,
					parent : this,
				});
				this.pins.push(pin);
			}
			
			pinOffset.setTo(0, -3, 0);
			//negative pins
			for(var i = 0; i < 12; i++){
				var pin = new Wiring.Pin({
					positive : false,
					offset : pinOffset,
					parent : this,
				});
				this.pins.push(pin);
			}
		}
	});
	
	Component.Battery = Battery;
	Component.Orangutan = Orangutan;
	
	return Component;
 });	