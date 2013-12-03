/**
 * @author Kate Compton
 */

define(["ui", "app", "modules/stellar/universeView", "modules/stellar/universe", "modules/stellar/inspector/inspectorView", "./stellarSettings", "common"], function(UI, App, UniverseView, Universe, InspectorView, settings, common) {
    var StellarApp = App.extend({
        init : function() {
            var app = this;
            app._super("Stellar", new Vector(800, 600));
            this.settings = settings;
            app.universe = new Universe();
            app.universeView = new UniverseView(app.universe, app.processing);

            app.inspectorView = new InspectorView();
            app.changeMode("nav");
        },

        initModes : function() {

            // create panels

            this.ui.addPanel(new UI.Panel({
                id : "inspector_info",
                title : "Inspector info",
                dimensions : new Vector(200, 300),
                side : "right",
                sidePos : 0,
            }));

            this.modes = {
                inspect : new UI.Mode({
                    title : "Inspect",
                    panels : this.ui.getPanels(["inspector_info"]),
                    onActivate : function() {

                        app.inspectorView.activate();
                    },
                    onDeactivate : function() {
                        app.inspectorView.deactivate();
                    }
                }),

                nav : new UI.Mode({
                    title : "Nav",
                    panels : []
                }),

                universe : new UI.Mode({
                    title : "Universe",
                    panels : []
                })
            };

            $.each(this.modes, function(key, mode) {
                mode.id = key;
            });

        },

        initControls : function() {
            app.ui.addOption("render3D", false, function(key, value) {
                if (value) {
                    $("#three_overlay").show();
                    app.universeView.threeRender.rendering = true;
                } else {
                    $("#three_overlay").hide();
                    app.universeView.threeRender.rendering = false;
                }
            });

            // Set all the default UI controls
            app.controls = new UI.Controls($("body"), {
                onKeyPress : {
                    d : function(event) {
                        app.ui.devMode.toggle()
                    },
                    m : function(event) {
                        ui.modes.main.cycle()
                    },
                },

                onMove : function(touch) {

                    app.moveLog(touch.pos);
                    var obj = app.universeView.getAt({
                        screenPos : touch.pos
                    });

                    //     app.universeView.hoverView(touch.pos);
                },

                onTap : function(touch) {
                    var obj = app.universeView.getAt({
                        screenPos : touch.pos
                    });
                    if (obj !== undefined) {
                        app.universeView.inspect(obj);
                    }
                },

                onDrag : function(touch) {

                    if (app.mode === app.modes.nav) {
                        var planeCenter = app.universeView.getPlanarPos(app.universeView.screenCenter);
                        var planeTouch = app.universeView.getPlanarPos(touch.pos);
                        var centerOffset = Vector.sub(planeTouch, planeCenter);
                        app.ui.moveOutput.log("Drag: " + centerOffset);
                        app.universeView.pullCamera(touch.pos, centerOffset);

                        app.universeView.siphon();
                    }
                },

                onScroll : function(delta) {

                    switch(app.mode.id) {

                        case "inspect":
                            // Zoom out to the nav view
                            app.universeView.zoomTo(app.inspectorView.inspected, app.settings.minNavLevel);
                            app.changeMode("nav");
                            break;
                        case "nav":
                            app.universeView.changeZoom(-delta);
                            var zoom = app.universeView.zoom.getValue();
                            //   console.log("consider changing " + delta + " " + zoom + " " + app.settings.navLimit.up);
                            if (delta < 0 && zoom > app.settings.navLimit.down) {
                                app.changeMode("universe");
                            }
                            break;
                        case "universe":
                            app.universeView.changeZoom(-delta);
                            var zoom = app.universeView.zoom.getValue();
                            if (delta > 0 && zoom > app.settings.navLimit.up) {
                                app.changeMode("nav");
                            }
                            break;

                    }

                }
            });

        },

        updateWorld : function(t) {
            app.log("MODE: " + this.mode);

            this._super(t);
            app.universeView.update(app.time);
            app.universe.update(app.time);
        },

        initUI : function() {
            var ui = this.ui;
            ui.newsbar = ui.addPopupManager("newsBar", new UI.Popup.NoticeBar({
                divName : "news_bar"
            }));

            ui.starInfo = ui.addPopupManager("starInfo", new UI.Popup.PopupManager({
                divName : "star_info"
            }));

            $("#star_info").css({
                perspective : "600px"
            });

            ui.addProcessingWindow($("#universe_canvas"), function(g) {
                app.processing = g;
            }, function(g) {

                app.ui.output.clear();

                app.updateWorld(g.millis() * .001);

                g.colorMode(g.HSB, 1);

                g.background(.55, 1, .1);

                app.universeView.renderMain(g);
            });

            app.ui.addOption("usePositioning", false);
            app.ui.addOption("use2DTranslate", false);
            app.ui.addOption("use3DTranslate", true);
        },
    });

    return StellarApp;
});
