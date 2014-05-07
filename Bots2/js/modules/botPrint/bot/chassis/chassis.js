/**
 * @author Kate Compton
 */

define(["common", "graph", "./handles"], function(common, Graph, Handle) {'use strict';

    // A chassis is some single piece of acrylic capable of holding parts
    //  It has some modifiable handles
    var Chassis = Class.extend({

        init : function(bot, parent) {
            this.bot = bot;
            this.parent = parent;

            this.handles = [];

            var sideCount = 10;
            for (var i = 0; i < sideCount; i++) {
                var r = 50 + Math.random() * 20;
                var theta = 2 * Math.PI * i / sideCount;
                this.handles[i] = new Handle.RadialHandle(r, theta, this, i);
            }

            this.parts = [];
            this.path = new Graph.Path();
            this.centroid = new Vector();

            this.isStale = false;
            this.refresh();

            this.attachmentForces = [];
        },

        // Given some 2D array, set from this
        setFromDNA : function(dna) {
            var chassis = this;

            for (var i = 0; i < this.handles.length; i++) {

                this.handles[i].setFromDNA(dna);
            };
        },

        setDNAFrom : function() {

        },

        getDNA : function() {
            return this.bot.dna;
        },

        //========================================================================
        //========================================================================
        // Update

        update : function(time) {

            // Refresh if stale (ie, something has changed)
            if (this.isStale) {
                this.refresh();
                this.isStale = false;
            }

            // Update all the attachments
            this.parts.forEach(function(part) {

                part.update(time);
            });
        },

        refresh : function() {
            // Refresh the shape, set the path from the handles
            this.setPathFromHandles();

            // Recalculate the center
            this.path.setToCentroid(this.centroid);

            // Refresh the dependents (attachments, components)
            this.parts.forEach(function(part) {
                part.refresh();
            });

            // Refresh the wiring
            // TODO
        },

        setPathFromHandles : function() {
            var path = this.path;
            path.clear();
            this.handles.forEach(function(handle) {
                path.addEdgeTo(handle);
            });
            path.close();
        },

        compileForces : function(forces) {
            return this.attachmentForces;
        },

        //========================================================================
        //========================================================================
        // Interactions

        // options include range, allowHandles, allowParts
        getTouchableAt : function(query) {
            var closest = {
                obj : undefined,
                dist : 9999,
            };

            // Search the handles
            if (query.allowHandles) {
                this.handles.forEach(function(handle) {
                    if (query.not !== handle) {
                        var d = handle.getDistanceTo(query.screenPos);

                        if (d < closest.dist) {
                            closest.dist = d;
                            closest.obj = handle;
                        }
                    }
                });
            }
            if (query.allowParts) {
                this.parts.forEach(function(part) {

                    var d = part.getDistanceTo(query.screenPos);
                    if (d < closest.dist) {
                        closest.dist = d;
                        closest.obj = part;
                    }
                });
            }

            return closest;

        },

        attachPartAt : function(part, p) {
            console.log("Attach " + part + " at " + p);
            if (part.chassis !== this) {
                part.detach();
                part.attachTo(this);

            }

            // Don't allow an arbitrary offset of p
            if (p.refresh) {
                p.offset = utilities.constrain(p.offset, -18, -8);
                p.refresh();
            }
            part.setAttachPoint(p);
        },

        addPart : function(part) {
            this.parts.push(part);
            this.attachmentForces.push(part.force);
        },

        removePart : function() {

        },
        transformToGlobal : function(local, global) {

            this.bot.transform.toWorld(local, global);

        },
        //========================================================================
        //========================================================================
        // Drawing

        render : function(context) {
            var g = context.g;
            // Just draw a line around the points

            this.drawBorder(context);

            // Draw handles
            if (context.drawHandles) {
                this.handles.forEach(function(h) {
                    h.draw(context);
                });
            }

            // Draw handles
            this.parts.forEach(function(part) {
                part.render(context);
            });

            // draw the centroid for debugging purposes
            this.bot.idColor.fill(g, .5, 1);
            this.centroid.drawCircle(g, 10);

        },
        drawBorder : function(context) {
            var g = context.g;
            var idColor = this.bot.idColor;

            g.strokeWeight(1);
            idColor.fill(g, .2, 1);
            idColor.stroke(g, -.4, 1);

            if (this.bot.isHoveredOver) {
                g.strokeWeight(5);
                idColor.stroke(g, .7, 1);
                idColor.fill(g, -.5, 1);
            }

            g.beginShape();
            this.handles.forEach(function(h) {
                h.vertex(g);
            });
            g.endShape(g.CLOSE);
        },

        drawForces : function(context) {
            var g = context.g;

            for (var i = 0; i < this.attachmentForces.length; i++) {
                this.attachmentForces[i].draw(g);
            }

        },
    });

    return Chassis;
});
