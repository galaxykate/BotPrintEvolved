/**
 * @author Kate Compton
 */

define(["common", "modules/threeUtils/modGeo", "./pathpoint", "./pathtracer"], function(common, ModGeo, PathPoint, PathTracer) {'use strict';

    var Path = Class.extend({
        init : function() {
            this.points = [];
            this.curveSubdivisions = 4;
        },

        addPoint : function(pt) {

            var last = this.points[this.points.length - 1];

            this.points.push(pt);
            if (last !== undefined) {
                last.setNext(pt);
            }

            // Close the path
            pt.setNext(this.points[0]);
        },

        // Get the point at this index, wrapped around
        getPoint : function(index) {
            var i = index % this.points.length;
            if (i < 0)
                i += this.points.length;
            return this.points[i];
        },

        update : function(time) {
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
                this.setMeshFromPoints();

            }
        },

        createThreeMesh : function() {

            this.geometry = new ModGeo.Cylinder(this.points.length * this.curveSubdivisions, 20, 1);

            this.mesh = this.geometry.createMesh();
            this.setMeshFromPoints();
            return this.mesh;

        },

        setMeshFromPoints : function() {
            var path = this;
            this.geometry.modSideVertices(function(v, context) {
                var index = context.side;

                var ptIndex = Math.floor(index / path.curveSubdivisions);
                var pct = (index - ptIndex * path.curveSubdivisions) / path.curveSubdivisions;

                var pt = path.points[ptIndex].getSubdivisionPoint(pct);

                var theta = context.thetaPct * Math.PI * 2;
                var r = 20 * (Math.sin(3 * theta) + 2) + 10 * Math.cos(6 * context.lengthPct);

                var z = -30 + 70 * context.lengthPct;
                //  v.setToCylindrical(r, theta, z);
                v.setTo(pt.x, pt.y, z);

            });
        },

        drawPath : function(g, useCurves) {
            g.beginShape();
            this.points[0].vertex(g);

            $.each(this.points, function(index, point) {
                if (useCurves)
                    point.makeCurveVertex(g);
                else
                    point.vertex(g);
            })
            g.endShape(g.CLOSE);
        },

        drawPoints : function(g, drawControlPoints) {
            g.strokeWeight(1);

            $.each(this.points, function(index, point) {
                point.drawPoints(g, drawControlPoints);
            });
        },

        getAt : function(query) {
            var closest = undefined;
            var closestDist = 100;

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
        }
    });

    Path.Point = PathPoint;
    Path.Tracer = PathTracer;

    return Path;

});
