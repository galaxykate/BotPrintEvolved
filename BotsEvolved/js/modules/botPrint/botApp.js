/**
 * @author Kate Compton
 */

define(["ui", "./bot/bot", "./physics/arena", "modules/threeUtils/threeView", "modules/evo/evoSim", "app", "common"], function(UI, Bot, Arena, ThreeView, EvoSim, App, common) {

    var BotApp = App.extend({
        init : function() {
            var app = this;

            var w = 800;
            var h = 600;
            this.fullPanelDimensions = new Vector(w - 20, h - 40);

            app._super("Bots", new Vector(w, h));
            app.controls.addListeners(app.inspectorWindow);
            app.controls.addListeners(app.arenaWindow);
            app.controls.addListeners(app.threeWindow);

            app.changeMode("arena");

            app.arena = new Arena();
            this.initEvoSims();
            this.testArena();
        },

        // Set up all the info about the evolutionary algorithm
        initEvoSims : function() {
            // Create the bot evosim
            app.evoSim = new EvoSim();

            app.evoSim.createGenome = function() {
                var count = 20;
                var genome = [];
                for (var i = 0; i < count; i++) {
                    genome[i] = Math.random();
                }
                return genome;
            };

            app.evoSim.createIndividualFromGenome = function(genome) {
                return new Bot();
            };

        },

        testArena : function() {
            console.log("Reset arena");
            // reset the arena
            app.arena.reset();

            var population = app.evoSim.createPopulation(5);
            app.arena.runTest(population);
        },

        initModes : function() {

            var ui = app.ui;

            ui.addPanel({
                id : "arena",
                div : $("#arena_panel"),
                title : "Arena",
                description : "An arena to view bots in",
                side : "right",
                sidePos : 5,
                dimensions : app.fullPanelDimensions

            });

            ui.addPanel({
                id : "inspector",
                div : $("#inspector_panel"),
                title : "Inspector",
                description : "A window to inspect and modify bots in",
                side : "left",
                sidePos : 5,
                dimensions : app.fullPanelDimensions

            });

            ui.addPanel({
                id : "threeRender",
                div : $("#render_panel"),
                title : "Render Panel",
                description : "3D preview",
                side : "left",
                sidePos : 5,
                dimensions : new Vector(200, 200),

            });

            // Create modes:
            // Each mode has some panels that only appear during that mode, and
            // Some custom control functionality

            this.modes = {
                arena : new UI.Mode({
                    title : "arena",
                    panels : app.ui.getPanels(["arena"]),

                    // Custom controls for the arena mode
                    controls : {
                        onMove : function(touch) {
                            var p = app.arenaWindow.localPos;
                            app.arena.hover(p);
                        },

                        onPress : function(touch) {
                            var p = app.arenaWindow.localPos;
                            app.arena.selectBotAt(p);
                        },
                    }
                }),

                inspector : new UI.Mode({
                    title : "inspector",
                    panels : app.ui.getPanels(["inspector", "threeRender"]),
                    // Control mapping
                    controls : {
                        onMove : function(touch) {
                            var p = app.inspectorWindow.localPos;
                            app.currentBot.hover(p);
                        },

                        onDrag : function(touch) {
                            if (app.threeWindow.active) {
                                var p = app.threeWindow.localPos;
                                app.threeRender.camera.offsetFromBookmark(p.x * .01, p.y * .01);

                            } else {
                                var p = app.inspectorWindow.localPos;
                                app.currentBot.dragPoint(p);
                            }

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

            $("#test_button").click(function() {
                app.changeMode("arena");
            });

            $("#reset_arena").click(function() {
                app.testArena();
            });

            var ui = this.ui;

            $(".full_canvas").css({
                width : "800px",
                height : "600px",
            });

            app.inspectorWindow = new UI.DrawingWindow("inspector", $("#inspector_canvas"));
            app.arenaWindow = new UI.DrawingWindow("arena", $("#arena_canvas"));

            app.inspectorProcessing = ui.addProcessingWindow(app.inspectorWindow.element, function(g) {
                app.inspectorWindow.setProcessing(g);

            }, function(g) {
                // Updates

                // only do if its the inspector mode
                if (app.mode === app.modes.inspector) {
                    // Updates
                    app.updateWorld(g.millis() * .001);
                    app.currentBot.update(app.time);

                    app.inspectorWindow.render(function(context) {
                        app.currentBot.render(context);
                    });
                }
            });

            // Create the arena
            app.arenaProcessing = ui.addProcessingWindow(app.arenaWindow.element, function(g) {
                app.arenaWindow.setProcessing(g);
            }, function(g) {

                // only do if its the arena mode
                if (app.mode === app.modes.arena) {
                    app.updateWorld(g.millis() * .001);
                    app.arena.update(app.time);

                    app.arenaWindow.render(function(context) {
                        app.arena.render(context);
                    });
                }

            });

            //================================================
            //================================================
            //================================================
            // Iniialize the viewing ports (Processing and Three.JS)
            // Create the processing.  camera stuff will move into own file eventually

            // Create the Three scene
            app.threeRender = new ThreeView($("#render_panel"), function() {
                // update the camera

                if (!app.pauseSpinning)
                    this.camera.orbit.theta += .03;
                // app.log(this.camera.orbit.theta);
                this.camera.updateOrbit();
            });
            app.threeWindow = new UI.DrawingWindow("3D Bot View", $("#render_panel"));

            //create an empty container
            app.threeBotMesh = new THREE.Object3D();
            app.threeRender.scene.add(app.threeBotMesh);

        },

        updateWorld : function(t) {

            this._super(t);
            app.ui.output.clear();

        },

        editBot : function(bot) {
            app.changeMode("inspector");

            if (bot === undefined)
                bot = new Bot();

            app.currentBot = bot;
            app.threeBotMesh.add(bot.createThreeMesh());

        },
    });

    return BotApp;
});
