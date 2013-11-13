/**
 * @author Kate Compton
 */

define(["common", "modules/threeUtils/threeView"], function(common, ThreeView) {
    var UniverseView = Class.extend({

        init : function(universe) {
            this.universe = universe;
            this.screenCenter = new Vector();
            this.zoom = new common.Range({
                min : 0,
                max : 100,
                defaultValue : 50,
            });

            this.onscreenObjects = [];

            // Create the Three scene
            this.threeRender = new ThreeView($("#three_overlay"));

            this.focus = new common.Vector();
            this.screenCenter = new common.Vector(0, 0);
            this.renderArea = new common.Rect(0, 0, 0, 0);

            this.changeZoom(0);

        },

        pullCamera : function(p, centerOffset) {
            this.threeRender.camera.center.addMultiple(centerOffset, .1);
        },

        siphon : function(touch) {
            var closest = this.getAt({
                screenPos : app.touch.pos,
                range : 10,
                filter : function(obj) {
                    return obj.isSiphonable;
                }
            });

            if (closest !== undefined) {
                closest.siphon();
            }
        },

        zoomCameraTo : function(touch) {
            var closest = this.getAt({
                screenPos : app.touch.pos,
                range : 10,
                filter : function(obj) {
                    return true;
                }
            });

            if (closest !== undefined) {
                this.zoomTo(closest, 0);
            }

        },
        hoverView : function(touch) {
            this.threeRender.moveMarkerToScreenPos(p);
            // Get the closest item

            var closest = this.getAt({
                screenPos : app.touch.pos,
                range : 10,
                filter : function(obj) {
                    return true;
                }
            });

            if (this.hoverTarget !== closest && closest !== undefined) {
                app.ui.newsbar.addPopup({
                    html : "Hovered over " + closest,
                    timeout : 2,
                });
            }
            this.hoverTarget = closest;
        },

        update : function(time) {
            var view = this;

            var camera = this.threeRender.camera;
            // camera.orbit.theta += .01;
            camera.orbit.phi = .9 + .2 * Math.sin(1 * time.worldTime);
            camera.updateOrbit();

            var closest = this.getAt({
                screenPos : app.touch.pos,
                range : 10,
                filter : function(obj) {
                    return true;
                }
            });

            if (closest !== undefined) {
                closest.excite();

            }

            // update the onscreenQuad
            this.onscreenObjects = [];

            $.each(this.universe.regions, function(index, region) {

                view.onscreenObjects = view.onscreenObjects.concat(region.objects);
            });

            $.each(view.onscreenObjects, function(index, obj) {
                // Update this oject
                obj.update(time);

                view.setScreenPos(obj);

            });

        },

        setScreenPos : function(p) {
            if (p.screenPos === undefined)
                p.screenPos = new Vector(0, 0, 0);

            var valid = this.threeRender.worldToScreen(p, p.screenPos);
            p.screenScale = 400 / p.screenPos.z;
            
            return valid;

        },
        getPlanarPos : function(screenPos) {
            var planarPos = new Vector();
            this.threeRender.screenToPlanar(screenPos, planarPos);
            return planarPos;

        },

        getAt : function(query) {
            // go through all on-screen objects
            var closest = undefined;
            var closestDist = 9999;
            if (query.range)
                closestDist = query.range;

            // all onscreen objects should inherit from vectors
            $.each(this.onscreenObjects, function(index, obj) {

                // Ignore the filtered out ones
                if (query.filter === undefined || query.filter(obj)) {
                    var d;

                    // Get the screenspace distance
                    if (query.screenPos) {

                        d = query.screenPos.getDistanceToIgnoreZ(obj.screenPos);

                        if (obj.screenRadius)
                            d -= obj.screenRadius;
                    }

                    // or the worldspace distance
                    else {
                        d = query.pos.getDistanceTo(obj);
                        if (obj.radius)
                            d -= obj.radius;
                    }

                    if (d < closestDist) {
                        closest = obj;
                        closestDist = d;
                    }
                }
            });

            return closest;
        },

        zoomTo : function(target, targetZoom) {
            var view = this;
            var camera = this.threeRender.camera;
            var origin = new Vector(camera.center);
            var offset = Vector.sub(target, origin);
            var originalZoom = this.zoom.getValue();

            var zoomTimespan = new common.TimeSpan({
                lifespan : .04 * Math.pow(offset.magnitude(), .5),
                onChange : function(ellapsed, pct) {
                    var offset = Vector.sub(target, origin);
                    var pct2 = utilities.sCurve(pct, 1);
                    camera.center.setToLerp(origin, target, pct2);
                    view.setZoom(utilities.lerp(originalZoom, targetZoom, pct2));

                }
            });

            app.timespans.add(zoomTimespan);
        },

        changeZoom : function(amt) {
            this.zoom.add(amt);
            this.updateZoom();

        },

        setZoom : function(zoom) {
            this.zoom.setTo(zoom);
            this.updateZoom();
        },

        updateZoom : function() {
            var view = this;
            view.zoomScale = .5 + .005 * Math.pow(view.zoom.getValue(), 2);
            var cameraDist = .25 * Math.pow(view.zoom.getValue(), 2) + 50;
            view.threeRender.camera.orbit.distance = cameraDist;

            app.ui.moveOutput.log("Zoom: " + this.zoom.getValue() + " -> " + cameraDist);

            view.drawLevels = [0, 20, 100];
            var overlap = 5;
            view.drawPcts = [];
            var zoom = view.zoom.getValue();
            $.each(view.drawLevels, function(index, level0) {
                var level1 = view.drawLevels[index + 1];
                view.drawPcts[index] = 0;
                // rising
                if (zoom > level0 - overlap && zoom < level0 + overlap) {
                    view.drawPcts[index] = (zoom - (level0 - overlap)) / (overlap * 2);
                }

                if (zoom > level1 - overlap && zoom < level1 + overlap) {
                    view.drawPcts[index] = 1 - (zoom - (level1 - overlap)) / (overlap * 2);
                }

                if (zoom >= level0 + overlap && zoom <= level1 - overlap)
                    view.drawPcts[index] = 1;
            });

        },

        // Render all the current on-screen objects
        renderMain : function(g) {

            g.pushMatrix();

            this.screenCenter.setTo(g.width / 2, g.height / 2);

            // g.translate(this.screenCenter.x, this.screenCenter.y);
            var context = {
                g : g,
                zoom : this.zoom,
                zoomScale : this.zoomScale,
                view : this,
                drawOpacity : {
                    universe : 0,
                    inspected : 0,
                },
                drawPcts : this.drawPcts,
            }

            this.universe.render(context);

            app.log("Rendering " + this.onscreenObjects.length + " onscreen");
            $.each(this.onscreenObjects, function(index, obj) {

                obj.render(context);

            });
            g.popMatrix();
        },
    });

    return UniverseView;
});
