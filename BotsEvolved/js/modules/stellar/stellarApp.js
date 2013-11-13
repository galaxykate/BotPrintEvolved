/**
 * @author Kate Compton
 */

define(["ui", "modules/stellar/universeView", "modules/stellar/universe", "./stellarSettings", "common"], function(UI, UniverseView, Universe, settings, common) {
    var app = {
        rect : new common.Rect(),
        ui : new UI({
        }),

        div : $("#app"),

        width : 800,
        height : 550,

        time : {
            worldTime : 0,
            appTime : 0,
            ellapsed : 0
        },

        getTime : function() {
            var date = new Date();
            var time = date.getTime() - this.startTime;
            return time;
        },

        timespans : new common.TimeSpan.Manager(),
    };

    // Enum of modes
    var MODE = {

    };

    app.start = function() {

        // Set the starting time of the app
        var date = new Date();
        app.startTime = date.getTime();

        app.rect = new common.Rect(0, 20, 800, 580);

        app.ui.addDevUI();
        app.ui.addOption("render3D", false, function(key, value) {
            if (value) {
                $("#three_overlay").show();
                app.universeView.threeRender.rendering = true;
            } else {
                $("#three_overlay").hide();
                app.universeView.threeRender.rendering = false;
            }
        });

        app.getOption = function(key) {
            return app.ui.options[key];
        };

        app.universe = new Universe();
        app.universeView = new UniverseView(app.universe);

        // Initialize the UI
        var ui = app.ui;

        // Make a shortcut for outputs
        app.log = function(line) {
            app.ui.output.log(line);
        }

        ui.modes.dev.activate();

        MODE.nav = new UI.Mode({
            title : "Nav Mode",
            description : "Zoom around",
            panels : ui.getPanels([]),
        });

        MODE.inspect = new UI.Mode({
            title : "Inspect Mode",
            description : "Inspect a star",
            panels : ui.getPanels([]),
        });

        MODE.universe = new UI.Mode({
            title : "Universe Mode",
            description : "Inspect the universe",
            panels : ui.getPanels([]),
        });

        ui.modes.main = new UI.Mode.ModeSet({
            name : "Main mode",
            modes : [MODE.inspect, MODE.nav, MODE.universe],
            onChange : function(mode) {
                ui.modeOutput.log("Changed mode: " + mode.name);
            }
        });

        // Update the world
        var lastUpdateTime = 0;
        app.updateWorld = function(currentTime) {
            var ellapsed = currentTime - lastUpdateTime;
            lastUpdateTime = currentTime;

            var time = app.time;
            // update the time object
            time.worldTime += ellapsed;
            time.ellapsed = ellapsed;
            app.log("Time: ");
            app.log("  world: " + time.worldTime.toFixed(2));
            app.log("  ellapsed: " + time.ellapsed.toFixed(2));
            app.log("  FPS: " + (1 / time.ellapsed).toFixed(2));

            app.timespans.update(ellapsed);
            app.universe.update(time);
            app.universeView.update(time);
        };

        var processingG = ui.addProcessingWindow("universe_canvas", function(g) {
            app.universeView.renderArea.setDimensions(g.width, g.height);
        }, function(g) {

            app.ui.output.clear();
            app.updateWorld(g.millis() * .001);
            g.colorMode(g.HSB, 1);

            g.background(.55, .3, .8);

            if (app.ui.mode === MODE.inspect)
                g.background(.55, .6, .8);

            if (app.ui.mode === MODE.nav)
                g.background(.6, .7, .7);

            if (app.ui.mode === MODE.universe)
                g.background(.65, .8, .5);

            app.universeView.renderMain(g);
        });

        app.navControls = new UI.Controls({
            touchDiv : $("#app"),
            onKeyPress : {
                d : function(event) {
                    ui.modes.dev.toggle()
                },
                m : function(event) {
                    ui.modes.main.cycle()
                },
            },

            onMove : function(touch) {
                app.universeView.hoverView(touch.pos);
            },

            onTap : function(touch) {

                app.universeView.zoomCameraTo(touch);
            },

            onDrag : function(touch) {

                if (app.ui.mode === MODE.nav) {
                    var planeCenter = app.universeView.getPlanarPos(app.universeView.screenCenter);
                    var planeTouch = app.universeView.getPlanarPos(touch.pos);
                    var centerOffset = Vector.sub(planeTouch, planeCenter);
                    app.ui.moveOutput.log("Drag: " + centerOffset);
                    app.universeView.pullCamera(touch.pos, centerOffset);

                    app.universeView.siphon();
                }
            },

            onMouseWheel : function(delta) {

                app.universeView.changeZoom(-delta);
                // Is it zoomed in/out far enough to change modes?
                var zoom = app.universeView.zoom.getValue();
                if (delta > 0) {
                    if (zoom < settings.modeSwitchDistances.down[1]) {
                        if (zoom < settings.modeSwitchDistances.down[0]) {
                            ui.changeMode(MODE.inspect);
                        } else {
                            ui.changeMode(MODE.nav);
                        }
                    }

                } else {
                    if (zoom > settings.modeSwitchDistances.up[0]) {
                        if (zoom > settings.modeSwitchDistances.up[1]) {
                            ui.changeMode(MODE.universe);
                        } else {
                            ui.changeMode(MODE.nav);
                        }
                    }
                }

            }
        });

        app.touch = app.navControls.touch;
        app.navControls.activate();

        ui.addOption("allowTribbles", false);
        ui.addOption("useBunnies", true);
        ui.addOption("manyUnicorns", true);
        ui.addTuningValue("unicornPrettiness", 50, 0, 100);
        ui.addTuningValue("unicornFuzziness", 50, 0, 100);
        ui.addTuningValue("bunnyMultiplier", 50, 0, 100);

        ui.newsbar = ui.addPopupManager("newsBar", new UI.Popup.NoticeBar({
            divName : "news_bar"
        }));

        /*
         setInterval(function() {
         ui.popupManagers.newsBar.addPopup({
         title : utilities.words.getRandomPhrase(),
         deathLocation : new Vector(-10, 100),
         });
         }, 800);
         */
    };

    return app;
});
