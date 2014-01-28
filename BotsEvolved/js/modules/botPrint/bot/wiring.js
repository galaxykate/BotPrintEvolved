/**
 * @author Kate Compton
 */

define(["common", "graph"], function(common, Graph) {'use strict';
    var wireCount = 0;
    //log various details about wiring
    var wireLog = "";
    function wirelog(s){
    	if(app.getOption("logWiring"))
    		console.log(s);
    	wireLog += (s + " <br>");
    	
    }
    
    var Wire = Class.extend({
        init : function(start, end) {
            this.idNumber = wireCount;
            this.idColor = common.KColor.makeIDColor(this.idNumber);
            wireCount++;

            this.start = start;
            this.end = end;
        },

        render : function(context) {
            var g = context.g;
            g.strokeWeight(1);
            this.idColor.stroke(g);
            var p0 = this.start.pos;
            var p1 = this.end.pos;

            g.line(p0.x, p0.y, p1.x, p1.y);
        }
    });

    var Pin = Class.extend({
        init : function(settings) {
            this.positive = true;
            this.pct = .5;
            _.extend(this, settings);
            this.pos = new Vector();
			this.pos.add(this.parent.attachPoint);
            this.wire = undefined;
        },

        render : function(context) {
            //this.edge.setToPct(this.edgePos, this.pct);  
            var g = context.g;
            g.fill(0, 0, 0);
            if (this.positive)
                g.fill(0, 1, 1);

            g.ellipse(this.pos.x, this.pos.y, 5, 5);
        }
    });

    var Wiring = {
        Wire : Wire,
        Pin : Pin,
    };

    return Wiring;

});
