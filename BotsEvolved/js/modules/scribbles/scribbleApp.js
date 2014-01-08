/**
 * @author Kate Compton
 */

define(["ui", "app", "common", "geo"], function(UI, App, common, geo) {

    var ScribbleApp = App.extend({
        init : function() {
            window.watch("app", function() {
                console.log("app changed to " + app);
            });

            var w = 500;
            var h = 500;
            this._super("Scribbles", new Vector(w, h));

            this.path = new geo.Path();
        },

        initModes : function() {

            var ui = app.ui;

            //app.ui.addOption("drawWiring", false);

            ui.addPanel({
                id : "arena",
                div : $("#arena_panel"),
                title : "Arena",
                description : "An arena to view bots in",
                side : "right",
                sidePos : 5,
                dimensions : app.fullPanelDimensions

            });

            // Create modes:
            // Each mode has some panels that only appear during that mode, and
            // Some custom control functionality

            this.modes = {

                drawing : new UI.Mode({
                    title : "drawing",
                    panels : app.ui.getPanels(),
                    // Control mapping
                    controls : {
                        onMove : function(touch) {
                            var p = app.inspectorWindow.localPos;
                            app.currentBot.hover(p);
                        },

                        onDrag : function(touch) {
                            var p = app.drawingWindow.localPos;
                            app.path.add
                        },

                        onPress : function(touch) {
                            if (app.threeWindow.active) {
                                app.pauseSpinning = true;
                                app.threeRender.camera.bookmark();

                            } else {
                                var p = app.inspectorWindow.localPos;
                                app.currentBot.selectPoint(p);
                            }
                        },

                        onRelease : function(touch) {

                            if (app.threeWindow.active) {
                                app.pauseSpinning = true;
                                app.threeRender.camera.bookmark();

                            } else {
                                var p = app.inspectorWindow.localPos;
                                app.currentBot.releasePoint(p);
                            }

                        }
                    }
                }),

            };

            $.each(this.modes, function(key, mode) {
                mode.id = key;
            });

        },

        initControls : function() {

            // Set all the default UI controls
            app.controls = new UI.Controls($("body"), {

                onKeyPress : {
                    d : function(event) {
                        app.ui.devMode.toggle()
                    },
                },

            });

        },

        initUI : function() {
            var ui = this.ui;

            app.drawingWindow = new UI.DrawingWindow("drawing", $("#drawing_canvas"));
            app.drawingProcessing = ui.addProcessingWindow(app.drawingWindow.element, function(g) {
                app.drawingWindow.setProcessing(g);

            }, function(g) {
                // Updates

                // only do if its the inspector mode
                if (app.mode === app.modes.inspector) {
                    // Updates
                    app.updateWorld(g.millis() * .001);

                    app.drawingWindow.render(function(context) {

                    });
                }
            });

        },

        updateWorld : function(t) {

            this._super(t);
            app.ui.output.clear();

        },
    });

    return ScribbleApp;
});
