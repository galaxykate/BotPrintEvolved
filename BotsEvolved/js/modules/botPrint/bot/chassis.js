/**
 * @author Kate Compton
 */

define(["common", "evo", "./pathPoint"], function(common, Evo, PathPoint) {'use strict';
    var chassisCount = 0;
    // Points MUST be coplanar
    var geomFromPointLoop = function(center, points, material) {
        var geom = new THREE.Geometry();
        $.each(points, function(index, vertex) {
            var v = vertex.toThreeVector();
            //  console.log(v);
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
            var genome = new Evo.Genome(10);
            this.idNumber = chassisCount;
            chassisCount++;
            this.idColor = new common.KColor((.2813 * this.idNumber + .23) % 1, 1, 1);
            this.points = [];
            this.center = new Vector(0, 0);
            var pointCount = 40;
            for (var i = 0; i < pointCount; i++) {
                var theta = i * Math.PI * 2 / pointCount;
                var r = 150 * utilities.unitNoise(.7 * theta);
                var pt = new PathPoint();
                pt.addPolar(r, theta);

                this.points.push(pt);

            }
        },

        update : function(time) {
            $.each(this.points, function(index, point) {
                point.update(time);
            });
        },

        getAt : function(query) {
            var closest = undefined;
            var closestDist = 99;

            $.each(this.points, function(index, point) {
                // Ignore the filtered out ones
                if (query.filter === undefined || query.filter(point)) {
                    var d;

                    // Get the screenspace distance
                    if (query.screenPos) {
             
                        d = query.screenPos.getDistanceToIgnoreZ(point.screenPos);

                        if (point.screenRadius)
                            d -= point.screenRadius;
                    }

                    // or the worldspace distance
                    else {
                        d = query.pos.getDistanceTo(obj);
                        if (point.radius)
                            d -= point.radius;
                    }

                    if (d < closestDist) {
                        closest = point;
                        closestDist = d;
                    }
                }

            });

            return closest

        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame

        setScreenPositions : function(camera) {
            var chassis = this;
            $.each(this.points, function(index, point) {
                camera.setScreenPosition(point, chassis.layer);
            })
        },

        render2D : function(g) {

            this.idColor.fill(g, .2, 1);
            this.idColor.stroke(g, -.4, 1);

            g.strokeWeight(1);

            g.beginShape();
            $.each(this.points, function(index, point) {
                point.screenPos.vertex(g);
            })
            g.endShape();

            $.each(this.points, function(index, point) {
                point.render2D(g);
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
