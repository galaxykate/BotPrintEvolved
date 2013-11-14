/**
 * @author Kate Compton
 */

define(["common", "evo", "./pathPoint", "./wiring"], function(common, Evo, PathPoint, Wiring) {'use strict';
    var chassisCount = 0;
    // Points MUST be coplanar
    var geomFromPointLoop = function(center, points, material) {
        var geom = new THREE.Geometry();
        $.each(points, function(index, vertex) {
            var v = vertex.toThreeVector();
            geom.vertices.push(v);
        });

        geom.vertices.push(center.toThreeVector());

        for (var i = 0; i < points.length; i++) {
            var f = new THREE.Face3(i, (i + 1) % points.length, points.length);

            geom.faces.push(f);
        }

        return geom;
    };

    var Chassis = Class.extend({
        init : function() {
            var chassis = this;
            var genome = new Evo.Genome(10);
            this.idNumber = chassisCount;
            chassisCount++;
            this.idColor = new common.KColor((.2813 * this.idNumber + .23) % 1, 1, 1);
            this.points = [];
            this.center = new Vector(0, 0);
            var pointCount = 5;
            var last = undefined;
            for (var i = 0; i < pointCount; i++) {
                var theta = i * Math.PI * 2 / pointCount;
                var r = 250 * utilities.unitNoise(.7 * theta);
                var pt = new PathPoint(0, 0, 30, 30, theta - Math.PI / 2);
                pt.addPolar(r, theta);

                this.points.push(pt);
                if (last !== undefined) {
                    last.setNext(pt);
                }

                pt.updateControlHandles();
                last = pt;
            }

            last.setNext(this.points[0]);

            // Create components
            this.components = [];
            for (var i = 0; i < 0; i++) {
                var volume = Math.random() * 450 + 200;
                var aspectRatio = Math.random() * 2 + .5;

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

        update : function(time) {
            $.each(this.points, function(index, point) {
                point.update(time);
            });
        },

        getAt : function(query) {
            var closest = undefined;
            var closestDist = 99;

            app.moveLog("Get at " + query.screenPos);
            $.each(this.points, function(index, point) {

                $.each(point.subPoints, function(index, subPoint) {
                    // Ignore the filtered out ones
                    if (query.filter === undefined || query.filter(subPoint)) {
                        var d;
                        // Get the screenspace distance
                        if (query.screenPos) {

                            d = query.screenPos.getDistanceToIgnoreZ(subPoint.screenPos);

                            if (subPoint.screenRadius)
                                d -= subPoint.screenRadius;
                            app.moveLog("Distance to " + subPoint + ": " + d);
                        }

                        // or the worldspace distance
                        else {
                            d = query.pos.getDistanceTo(subPoint);
                            if (subPoint.radius)
                                d -= subPoint.radius;
                        }

                        if (d < closestDist) {
                            closest = subPoint;
                            closestDist = d;
                        }

                        app.moveLog("Distance to " + subPoint + ": " + d);

                    }
                });

            });

            return closest;

        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame

        render : function(context) {
            var g = context.g;
            this.idColor.fill(g, .2, 1);
            this.idColor.stroke(g, -.4, 1);

            g.strokeWeight(1);

            g.beginShape();
            this.points[0].vertex(g);
            $.each(this.points, function(index, point) {

                point.makeCurveVertex(g);
            })
            g.endShape();

            $.each(this.points, function(index, point) {
                point.render(context);
            });

            $.each(this.components, function(index, component) {
                component.render(context);
            })

            $.each(this.wires, function(index, wire) {
                wire.render(context);
            })
        },
        hover : function(pos) {

        },
        createThreeMesh : function() {
            var geom = geomFromPointLoop(this.center, this.points, 15);
            this.mesh = new THREE.Mesh(geom, new THREE.MeshNormalMaterial());
            return this.mesh;
        }
    });

    return Chassis;
});
