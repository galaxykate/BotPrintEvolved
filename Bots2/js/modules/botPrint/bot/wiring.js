/**
 * @author Kate Compton
 */

define(["common", "graph"], function(common, Graph) {'use strict';
    var wireCount = 0;
    /**
     * @class Wire
     */
    //log various details about wiring
    var wireLog = "";
    function wirelog(s){
    	if(app.getOption("logWiring"))
    		console.log(s);
    	wireLog += (s + " <br>");
    }

    var Wire = Class.extend({
        /**
         * @method init
         * @param start
         * @param end
         */
        init : function(start, end) {
        	console.log(start);
        	console.log(end);
            this.idNumber = wireCount;
            this.idColor = common.KColor.makeIDColor(this.idNumber);
            wireCount++;
			this.className = "Wire";
            this.start = start;
            this.end = end;
        },

        /**
         * @method render
         * @param context
         */
        render : function(context) {
            var g = context.g;

            g.strokeWeight(1);
            //TODO: I guess that's an ok wire color?

            g.stroke(204, 102, 255);
            //this.idColor.stroke(g);

            var p0 = this.start.pos;
            var p1 = this.end.pos;

			//p0.toWorld(p0, this.start.parent.attachPoint);
			//p1.toWorld(p1, this.end.parent.attachPoint);

            g.line(p0.x, p0.y, p1.x, p1.y);
        },
        
        //update : function(start, end){
        	//this.start = start;
            //this.end = end;
        //}
    });

    /**
     * @class Pin
     */
    var Pin = Class.extend({
        /**
         * @method init
         * @param settings
         */
        init : function(settings) {
            //defaults
            _.extend(this, settings);
            this.pos = new common.Transform();
            this.className = "Pin";
            //TODO: right now, pins sit on a random edge from their parent
            //or the attach point.

           	//Pins can either be calculated from the center of an object, or from an edge.
            if(this.edge === undefined){
            	if(this.parent.attachPoint !== undefined){
            		this.pos.setTo(this.parent.attachPoint);	
            	}
            	
            	//allow us to define offsets from the center for pin positioning
            	if(this.offset !== undefined){
            		console.log("Adding offset: (" + this.offset.x + ", " + this.offset.y + ")"); 
            		this.pos.add(this.offset);	
            	}
            }else{
            	var pct  = Math.random();
				this.pos.add(this.edge.getTracer(pct, -3));
            }

			console.log(this.pos);
            //this.wire = undefined;
        },
        
        update : function(){
        	if(this.edge === undefined){
        		this.pos.setTo(this.parent.attachPoint);
        		
        		if(this.offset !== undefined){
        			wirelog("Adding offset: (" + this.offset.x + ", " + this.offset.y + ")"); 
            		this.pos.add(this.offset);
        		}
        	}else{
        		//gonna just hope edge styled definitions just work out.
        	}
        },

        /**
         * @method render
         * @param context
         */
        render : function(context) {
            //this.edge.setToPct(this.edgePos, this.pct);
            var g = context.g;

            g.fill(0, 0, 0);
            if (this.positive)
                g.fill(0, 1, 1);

            g.ellipse(this.pos.x, this.pos.y, 3, 3);
        }
    });

    var Wiring = {
        Wire : Wire,
        Pin : Pin,
    };

    return Wiring;

});
