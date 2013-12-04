/**
 * @author Kate Compton
 */

define(["ui", "./bot/bot", "./physics/arena", "modules/threeUtils/threeView", "./botEvo", "app", "common"], function(UI, Bot, Arena, ThreeView, BotEvo, App, common) {

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

            // app.changeMode("inspector");
            app.editBot();
            app.arena = new Arena();

            app.changeMode("arena");
            var task = "doThing";

            app.currentBot = new Bot();
            app.evoSim = new BotEvo.BrainEvo(app.currentBot, task, app.arena);
            var testBrain = app.evoSim.createIndividual(app.evoSim.createGenome());
            app.currentBot.setBrain(testBrain);
            app.arena.addPopulation([app.currentBot]);

            app.evoSim.treeViz.setTree(testBrain);
        },

        initModes : function() {

            var ui = app.ui;

            app.ui.addOption("drawWiring", false);
            app.ui.addOption("drawComponents", false);
            app.ui.addOption("logConditionTests", false);
            app.ui.addOption("logMutations", false);

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
                side : "top",
                sidePos : 5,
                dimensions : new Vector(200, 200),

            });

            ui.addPanel({
                id : "scores",
                div : $("#scores_panel"),
                title : "Scores Panel",
                description : "Current scores",
                side : "top",
                sidePos : 5,
                dimensions : new Vector(400, 200),

            });

            // Create modes:
            // Each mode has some panels that only appear during that mode, and
            // Some custom control functionality

            this.modes = {
                arena : new UI.Mode({
                    title : "arena",
                    panels : app.ui.getPanels(["arena", "scores"]),

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
                                app.threeRender.camera.offsetFromBookmark(p.x * .01, -p.y * .01);

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

            $("#mutate").click(function() {
				console.log("defaultTree before: ", app.currentBot.brain.defaultTree)
                app.evoSim.mutateGenome(app.currentBot.brain.defaultTree);
                app.evoSim.treeViz.setTree(app.currentBot.brain.defaultTree);
				console.log("defaultTree after: ", app.currentBot.brain.defaultTree)
            });

            var ui = this.ui;

            $(".full_canvas").css({
                width : "800px",
                height : "600px",
            });

            app.inspectorWindow = new UI.DrawingWindow("inspector", $("#inspector_canvas"));
            app.arenaWindow = new UI.DrawingWindow("arena", $("#arena_canvas"));
            app.scoreWindow = new UI.DrawingWindow("score", $("#score_canvas"));

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
                        context.useChassisCurves = true;
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

            // Create the arena
            app.scoreProcessing = ui.addProcessingWindow(app.scoreWindow.element, function(g) {
                app.scoreWindow.setProcessing(g);
            }, function(g) {

                // only do if its the arena mode
                if (app.mode === app.modes.arena) {
                    g.background(.8, 1, .3);
                    app.evoSim.renderScores(g);
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
