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
                    //edge : this.path.getRandomEdge(),
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
            //of the internal component for collision detection and stuff.
            
            //sadly, I can't thread and delay, so this needs to go in an awkward spot.
            //TODO: fix?
            this.buildDetails();
		},
        
        //========================================================
		// rendering
        renderDetails : function(context) {
        	//var r = 10;
        	//var g = context.g;
			        	
            //g.fill(.7, 1, 1);
            //g.stroke(0);
            
            //g.rect(0, -r / 2, -r * 3, r);
            
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

	return Component;
 });	