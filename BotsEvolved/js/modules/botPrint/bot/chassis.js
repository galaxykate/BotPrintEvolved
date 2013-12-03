/**
 * @author Kate Compton
 */

define(["common", "./pathPoint", "./wiring", "io", "modules/threeUtils/modGeo", "./attachment/attachments"], function(common, Path, Wiring, IO, ModGeo, Attachment) {'use strict';
    var chassisCount = 0;
    // Points MUST be coplanar

    // var CylinderGeometry = new
    //  IO.saveFile("test", "txt", "M 100 100 L 300 100 L 200 300 z");

    var Chassis = Path.extend({
        init : function(parent) {
            this._super();

            var chassis = this;
            this.curveSubdivisions = 3;

            this.parent = parent;
            if (parent.bot === undefined)
                this.bot = parent;
            else
                this.bot = this.parent.bot;

            this.idNumber = chassisCount;
            chassisCount++;
            this.idColor = new common.KColor((.2813 * this.idNumber + .23) % 1, 1, 1);

            this.center = new Vector(0, 0);
            var pointCount = 5;

            for (var i = 0; i < pointCount; i++) {
                var theta = i * Math.PI * 2 / pointCount;
                var r = 100 * utilities.unitNoise(.7 * theta + 50 * this.idNumber);
                var pt = new Path.PathPoint(0, 0, 30, 30, theta - Math.PI / 2);
                pt.addPolar(r, theta);
                pt.updateControlHandles();
                this.addPoint(pt);
            }
            this.generateWiring();
            this.generateAttachments();
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Transformation

        transformToGlobal : function(local, global) {

            if (this.parent !== undefined)
                this.parent.transformToGlobal(local, global);
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Wiring
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

        generateAttachments : function() {
            this.attachments = [];
            this.attachPoints = [];
            var count = 5;
            for (var i = 0; i < count; i++) {
                var index = Math.floor(Math.random() * this.points.length);
                var pct = Math.random();
                var attachPoint = new Path.PathTracer(this, index, pct);

                var attachment = new Attachment();
                if (Math.random() > .5) {
                    attachment = new Attachment.Sensor();
                } else {
                    attachment = new Attachment.Actuator();

                }

                attachment.attachTo(this, attachPoint);
                this.attachments.push(attachment);
                this.attachPoints.push(attachPoint);
            }
        },

        compileForces : function(forces) {
            $.each(this.attachments, function(index, attachment) {
                var f = attachment.getForce();
                if (f !== undefined)
                    forces.push(f);
            });
        },

        compileAttachments : function(attachments, query) {
            $.each(this.attachments, function(index, attachment) {
                if (query(attachment)) {
                    attachments.push(attachment);
                }

            });
        },

        //==========================================
        // Updates

        update : function(time) {
            var chassis = this;

            $.each(this.points, function(index, point) {
                point.update(time);
            });
            // Is any point dirty?  Update the geomety
            var isDirty = false;
            $.each(this.points, function(index, point) {
                if (point.isDirty) {
                    console.log("Dirty point!");
                    point.isDirty = false;
                    isDirty = true;
                }
            });
            if (isDirty) {
                chassis.setMeshFromPoints();
                $.each(this.attachPoints, function(index, point) {
                    point.updatePosition();
                });
            }

            $.each(this.attachments, function(index, attachment) {
                attachment.update(time);
            });

        },

        // Get something relative to this chassis
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

            g.strokeWeight(1);
            this.idColor.fill(g, .2, 1);

            this.idColor.stroke(g, -.4, 1);
            if (this.bot.selected) {
                g.strokeWeight(5);
                this.idColor.stroke(g, -.7, 1);
                this.idColor.fill(g, .5, 1);
            }

            // Draw the region
            g.beginShape();
            this.points[0].vertex(g);

            $.each(this.points, function(index, point) {
                if (context.useChassisCurves)
                    point.makeCurveVertex(g);
                else
                    point.vertex(g);
            })
            g.endShape(g.CLOSE);

            if (!context.simplifiedBots) {
                g.strokeWeight(1);

                $.each(this.points, function(index, point) {
                    point.render(context);
                });

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
        hover : function(pos) {

        },
        createThreeMesh : function() {

            this.geometry = new ModGeo.Cylinder(this.points.length * this.curveSubdivisions, 20, 1);

            this.mesh = this.geometry.createMesh();
            this.setMeshFromPoints();
            return this.mesh;

        },
        setMeshFromPoints : function() {
            var chassis = this;

            this.geometry.modSideVertices(function(v, context) {
                var index = context.side;

                var ptIndex = Math.floor(index / chassis.curveSubdivisions);
                var pct = (index - ptIndex * chassis.curveSubdivisions) / chassis.curveSubdivisions;

                var pt = chassis.points[ptIndex].getSubdivisionPoint(pct);

                var theta = context.thetaPct * Math.PI * 2;
                var r = 20 * (Math.sin(3 * theta) + 2) + 10 * Math.cos(6 * context.lengthPct);

                var z = -30 + 70 * context.lengthPct;
                //  v.setToCylindrical(r, theta, z);
                v.setTo(pt.x, pt.y, z);

            });
        }
    });

    return Chassis;
});
