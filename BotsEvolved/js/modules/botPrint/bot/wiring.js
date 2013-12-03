/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';
    var wireCount = 0;
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
            var p0 = this.start.edgePos;
            var p1 = this.end.edgePos;

            g.line(p0.x, p0.y, p1.x, p1.y);
        }
    });

    var Pin = Class.extend({
        init : function(settings) {
            this.positive = true;
            this.pct = .5;
            _.extend(this, settings);
            this.edgePos = new Vector();

            this.wire = undefined;
        },

        render : function(context) {
            this.edge.setToPct(this.edgePos, this.pct);
            this.edgePos.add(this.parent.center);

            var g = context.g;
            g.fill(0, 0, 0);
            if (this.positive)
                g.fill(0, 1, 1);

            g.ellipse(this.edgePos.x, this.edgePos.y, 5, 5);
        }
    });

    var componentCount = 0;
    var Component = Class.extend({
        init : function(settings) {
            // Defaults
            this.idNumber = componentCount;
            this.idColor = common.KColor.makeIDColor(this.idNumber);
            componentCount++;
            this.pins = [];

            _.extend(this, settings);

            this.region = new common.Region.makeRectangle(this.center, this.width, this.height);

            // construct snap points
            for (var i = 0; i < 3; i++) {

                var pin = new Pin({
                    edge : this.region.getRandomEdge(),
                    pct : (i + .5) / 6,
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

        render : function(context) {
            var g = context.g;
            this.idColor.fill(context.g);
            this.region.render(context);
            $.each(this.pins, function(index, pin) {
                pin.render(context);
            });

        }
    });

    var Wiring = {
        Wire : Wire,
        Component : Component,
    };

    return Wiring;

});
