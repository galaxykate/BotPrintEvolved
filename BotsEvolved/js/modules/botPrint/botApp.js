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

            app.changeMode("arena");

            app.arena = new Arena();
            app.editBot(new Bot());
            this.initEvoSims();
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

            var population = app.evoSim.createPopulation(5);
            console.log(population);
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
                            var p = app.toArenaRelative(touch.pos);
                            app.arena.hover(p);
                        },

                        onPress : function(touch) {
                            var p = app.toArenaRelative(touch.pos);
                            app.arena.selectBotAt(p);
                        },
                    }
                }),

                edit : new UI.Mode({
                    title : "inspector",
                    panels : app.ui.getPanels(["inspector"]),
                    // Control mapping
                    controls : {
                        onMove : function(touch) {
                            var p = app.toInspectorRelative(touch.pos);
                            app.currentBot.hover(p);
                        },

                        onDrag : function(touch) {
                            var p = app.toInspectorRelative(touch.pos);
                            app.currentBot.dragPoint(p);
                        },

                        onPress : function(touch) {
                            var p = app.toInspectorRelative(touch.pos);
                            app.currentBot.selectPoint(p);
                        },

                        onRelease : function(touch) {
                            var p = app.toInspectorRelative(touch.pos);
                            app.currentBot.releasePoint(p);

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
            app.controls = new UI.Controls($("#app"), {

                onKeyPress : {
                    d : function(event) {
                        app.ui.devMode.toggle()
                    },
                },

            });

            app.setTouchableDivs(["inspector_canvas", "arena_canvas"]);
        },

        toInspectorRelative : function(p) {
            var screenPos = app.getPositionRelativeTo(app.inspectorDiv, p);
            var localPos = new Vector();

            app.inspectorCamera.toLocal(screenPos, localPos);
            return localPos;
        },

        toArenaRelative : function(p) {
            var screenPos = app.getPositionRelativeTo(app.arenaDiv, p);
            var localPos = new Vector();

            app.arenaCamera.toLocal(screenPos, localPos);
            return localPos;
        },

        initUI : function() {

            $("#test_button").click(function() {
                app.changeMode("arena");
            });

            var ui = this.ui;
            app.inspectorDiv = $("#inspector_canvas");
            app.arenaDiv = $("#arena_canvas");

            app.inspectorDiv.css({
                position : "absolute",
                top : "0px",
                bottom : "0px",
                width : app.fullPanelDimensions.x - 5,
                height : app.fullPanelDimensions.y - 5,
            });
            app.arenaDiv.css({
                position : "absolute",
                top : "0px",
                bottom : "0px",
                width : app.fullPanelDimensions.x - 5,
                height : app.fullPanelDimensions.y - 5,
            });

            app.arenaCamera = new common.Transform();
            app.inspectorCamera = new common.Transform();

            app.inspectorProcessing = ui.addProcessingWindow(app.inspectorDiv, function(g) {
                app.inspectorCamera.translation.setTo(g.width / 2, g.height / 2);

            }, function(g) {
                // Updates
                app.ui.output.clear();
                app.log("Test");
                var context = {
                    g : g,
                    transform : app.inspectorCamera,
                }

                // Updates
                app.updateWorld(g.millis() * .001);

                g.colorMode(g.HSB, 1);
                g.background(.55, .3, 1);

                g.fill(.6, 1, .2);
                g.ellipse(0, 0, 400, 400);

                g.pushMatrix();
                app.inspectorCamera.applyTransform(g);
                app.currentBot.render(context);
                g.popMatrix();
            });

            // Create the arena
            app.arenaProcessing = ui.addProcessingWindow(app.arenaDiv, function(g) {
                app.arenaCamera.translation.setTo(g.width / 2, g.height / 2);
            }, function(g) {
                app.updateWorld(g.millis() * .001);
                var context = {
                    g : g,
                    useScreenPos : false,
                }
                g.colorMode(g.HSB, 1);
                g.background(.75, .1, 1);

                g.pushMatrix();
                app.arenaCamera.applyTransform(g);
                app.arena.render(context);
                g.popMatrix();

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
            //create an empty container
            app.threeBotMesh = new THREE.Object3D();
            app.threeRender.scene.add(app.threeBotMesh);

        },

        updateWorld : function(t) {
            app.log("MODE: " + this.mode);

            this._super(t);

        },

        editBot : function(bot) {
            if (bot === undefined)
                bot = new Bot();

            app.currentBot = bot;
            app.threeBotMesh.add(bot.createThreeMesh());

        },
    });

    return BotApp;
});
