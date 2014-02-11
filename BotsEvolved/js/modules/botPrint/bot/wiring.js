/**
 * @author Kate Compton
 */

define(["common", "graph"], function(common, Graph) {'use strict';
    var wireCount = 0;
    /**
     * @class Wire
     */
    var Wire = Class.extend({
        /**
         * @method init
         * @param start
         * @param end
         */
        init : function(start, end) {
            this.idNumber = wireCount;
            this.idColor = common.KColor.makeIDColor(this.idNumber);
            wireCount++;

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
            this.idColor.stroke(g);
            var p0 = this.start.edgePos;
            var p1 = this.end.edgePos;

            g.line(p0.x, p0.y, p1.x, p1.y);
        }
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
            this.positive = true;
            this.pct = .5;
            _.extend(this, settings);
            this.edgePos = new Vector();

            this.wire = undefined;
        },

        /**
         * @method render
         * @param context
         */
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

    /**
     * @class Component
     */
    var Component = Class.extend({
        /**
         * @method init
         * @param settings
         */
        init : function(settings) {
            // Defaults
            this.idNumber = componentCount;
            this.idColor = common.KColor.makeIDColor(this.idNumber);
            componentCount++;
            this.pins = [];

            _.extend(this, settings);

            this.region = Graph.makeRectangle(this.center, this.width, this.height);

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

        /**
         * @method compilePins
         * @param {Array} pinList
         * @param {Function} filter
         */
        compilePins : function(pinList, filter) {
            $.each(this.pins, function(index, pin) {
                if (filter(pin))
                    pinList.push(pin);
            });
        },

        /**
         * @method render
         * @param context
         */
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
