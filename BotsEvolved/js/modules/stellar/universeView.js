/**
 * @author Kate Compton
 */

define(["common", "modules/threeUtils/threeView"], function(common, ThreeView) {

    var LayerOpacity = Class.extend({
        init : function(name, start, end, blendBorder) {
            this.name = name;
            this.blendStart = blendBorder;
            this.blendEnd = blendBorder;
            this.start = start;
            this.end = end;
            this.opacity = 0;
        },

        setOpacity : function(zoom) {
            this.opacity = this.getOpacity(zoom);
        },

        // Get the opacity at the zoom level
        getOpacity : function(zoom) {

            var p0 = this.start - this.blendStart;
            var p3 = this.end + this.blendEnd;
            if (zoom < p0 || zoom > p3)
                return 0;

            var p1 = this.start + this.blendStart;
            var p2 = this.end - this.blendEnd;

            if (zoom < p1)
                return (zoom - p0) / (p1 - p0);
            if (zoom > p2)
                return (p3 - zoom) / (p3 - p2);
            return 1;

        },
    })

    var UniverseView = Class.extend({

        init : function(universe, processing) {
            this.universe = universe;
            this.screenCenter = new Vector();
            this.zoom = new common.Range({
                min : 0,
                max : 100,
                defaultValue : 50,
            });

            this.lods = {
                region : new LayerOpacity("region outlines", 20, 200, 4),
                large : new LayerOpacity("large objects", 5, 60, 4),
                medium : new LayerOpacity("medium objects", 5, 50, 4),
                small : new LayerOpacity("small objects", 5, 30, 4),
                dust : new LayerOpacity("dust objects", 5, 20, 4),
                inspected : new LayerOpacity("inspection stuff", -5, 12, 3),
            }

            this.onscreenObjects = [];

            // Create the Three scene
            this.threeRender = new ThreeView($("#three_overlay"));

            this.focus = new common.Vector();
            this.screenCenter = new common.Vector(0, 0);
            this.renderArea = new common.Rect(0, 0, processing.width, processing.height);

            this.changeZoom(10);

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

        calculateOnscreenObjects : function() {
            var view = this;
            // Calculate the opacity for all the layers
            $.each(view.lods, function(key, layer) {
                layer.setOpacity(view.zoom.getValue());
            });

            // update the onscreenQuad
            view.onscreenObjects = [];

            $.each(view.universe.regions, function(index, region) {
                view.onscreenObjects = view.onscreenObjects.concat(region.objects);
            });

            // Add label divs for any objects that are big enough
            // Remove from any objects that arent
            $.each(view.onscreenObjects, function(index, obj) {

                // Deal with popups
                // console.log(obj.lod + ": " + view.lods[obj.lod]);

            });

        },

        update : function(time) {
            var view = this;

            var camera = this.threeRender.camera;
            // camera.orbit.theta += .01;

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

            this.calculateOnscreenObjects();
            $.each(view.onscreenObjects, function(index, obj) {
                // Update this oject
                view.setScreenPos(obj);
                obj.update(time);

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

        inspect : function(target) {

            app.changeMode("inspect");
            app.inspectorView.inspect(target);
            this.zoomTo(target, app.settings.inspectionDistance);

        },

        zoomTo : function(target, targetZoom) {

            var view = this;
            var camera = this.threeRender.camera;
            var origin = new Vector(camera.center);
            var offset = Vector.sub(target, origin);
            var originalZoom = this.zoom.getValue();
            view.autoZoom = true;

            var zoomTimespan = new common.TimeSpan({
                lifespan : .04 * Math.pow(offset.magnitude(), .5),
                onChange : function(ellapsed, pct) {
                    var offset = Vector.sub(target, origin);
                    var pct2 = utilities.sCurve(pct, 1);
                    camera.center.setToLerp(origin, target, pct2);
                    view.setZoom(utilities.lerp(originalZoom, targetZoom, pct2));

                },
                onFinish : function() {
                    view.autoZoom = false;

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
            var zoom = view.zoom.getValue();

            // Limit if we are in nav
            if (!view.autoZoom && app.mode !== undefined && app.mode === app.modes.nav) {
                zoom = Math.max(app.settings.minNavLevel, zoom);
                view.zoom.setTo(zoom);
            }

            view.zoomScale = .5 + .005 * Math.pow(zoom, 2);
            var cameraDist = .25 * Math.pow(zoom, 2) + 50;

            this.tilt = 1.5 - .012 * zoom;
            this.threeRender.camera.orbit.phi = this.tilt;

            view.threeRender.camera.orbit.distance = cameraDist;
            view.threeRender.camera.updateOrbit();
            app.moveLog("Zoom: " + this.zoom.getValue() + " -> " + cameraDist);

            var overlap = 5;
            view.drawPcts = [];
            var zoom = view.zoom.getValue();
            $.each(this.lods, function(key, layer) {
                layer.setOpacity(zoom);
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
                lod : this.lods,
                useScreenPos : true,
                drawPcts : this.drawPcts,
            }

            app.log("Rendering " + this.onscreenObjects.length + " onscreen");

            app.log("Zoom: " + this.zoom);
            $.each(this.lods, function(key, layer) {
                app.log(layer.name + ": " + layer.opacity);
            });

            this.universe.render(context);
            $.each(this.onscreenObjects, function(index, obj) {

                obj.render(context);

            });

            if (context.lod.inspected.opacity > 0) {
                context.opacity = context.lod.inspected.opacity;
                app.inspectorView.render(context);
            }

            g.popMatrix();
        },
    });

    return UniverseView;
});
