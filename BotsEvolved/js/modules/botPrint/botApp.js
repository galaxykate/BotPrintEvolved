/**
 * @author Kate Compton
 */

define(["ui", "./bot/bot", "./physics/arena", "threeUtils", "./botEvo", "app", "common"], function(UI, Bot, Arena, threeUtils, BotEvo, App, common) {

    var BotApp = App.extend({
        init : function() {
            var app = this;

            var w = 800;
            var h = 600;
            this.fullPanelDimensions = new Vector(w - 20, h - 40);

            app._super("Bots", new Vector(w, h));

            // app.changeMode("inspector");
            app.editBot();
            app.arena = new Arena();

            app.changeMode("arena");

            //   this.createAndTestNewBot();
            this.createAndTestManyBots();

            $("*").click(function(evt) {
                console.log("Clicked ", this);
            });

        },

        createAndTestManyBots : function() {
            var task = "doThing";
            var bots = [];
            var count = 5;
            for (var i = 0; i < count; i++) {
                var bot = new Bot();
                bots[i] = bot;
            }
            app.currentBot = bots[0];

            app.arena.addPopulation(bots);

        },

        createAndTestNewBot : function() {
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
            app.ui.addOption("logMutations", true);
            app.ui.addOption("useTimers", true);
			app.ui.addOption("useColorLerpers", true);
            app.ui.addOption("useSharpie", false);
            app.ui.addTuningValue("unicornFluffiness", 100, 1, 700, function(key, value) {
                // do something on change
            });
            
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
                dimensions : new Vector(400, 100),

            });

            // Create modes:
            // Each mode has some panels that only appear during that mode, and
            // Some custom control functionality

            this.modes = {
                arena : new UI.Mode({
                    title : "arena",
                    panels : app.ui.getPanels(["arena", "scores"]),

                }),

                inspector : new UI.Mode({
                    title : "inspector",
                    panels : app.ui.getPanels(["inspector", "threeRender"]),

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

            // Make some of the windows touchable

            var touchRender = app.controls.addTouchable("threeRender", $("#render_panel"));
            var touchInspector = app.controls.addTouchable("inspector", $("#inspector_canvas"));
            var touchArena = app.controls.addTouchable("arena", $("#arena_canvas"));

            // Camera Controls
            touchRender.onDrag(function(touchwindow, p) {
                var cam = app.threeRender.camera;
                cam.orbit.theta = p.x * -.003;
                cam.orbit.phi = -p.y * .004 + 1.7;
                cam.updateOrbit();

            });
            touchRender.onUp(function(touchwindow, p) {
                app.pauseSpinning = false;
            });

            touchRender.onDown(function(touchwindow, p) {
                app.pauseSpinning = true;
            });

            touchRender.onScroll(function(touchwindow, delta) {
                var cam = app.threeRender.camera;
                cam.orbit.distance *= 1 + .03 * delta;
                cam.orbit.distance = utilities.constrain(cam.orbit.distance, 300, 1200);
                cam.updateOrbit();

            });

            // Inspector controls
            touchInspector.onDrag(function(touchwindow, p) {
                var x = p.x - touchwindow.rect.w / 2;
                var y = p.y - touchwindow.rect.h / 2;
                // app.coin.designTransform.setTo(x, y, 0);
            });

            touchInspector.onMove(function(touchwindow, p) {
                //  get midPoint
                var x = p.x - touchwindow.rect.w / 2;
                var y = p.y - touchwindow.rect.h / 2;
                //  app.coin.selectAt(new Vector(x, y));

            });

        },

        initUI : function() {

            $("#test_button").click(function() {
                app.changeMode("arena");
            });

            $("#reset_arena").click(function() {
                app.createAndTestNewBot();
            });

            $("#mutate").click(function() {
                console.log("-------------------------- ");
                console.log("Mutating ");
                app.currentBot.brain.defaultTree.debugPrint();
                app.evoSim.mutateGenome(app.currentBot.brain.defaultTree);

                app.evoSim.treeViz.setTree(app.currentBot.brain.defaultTree);
                console.log("defaultTree after: ", app.currentBot.brain.defaultTree)

            });

            $("#mutateBig").click(function() {
                console.log("-------------------------- ");
                console.log("Mutating Generations");
                app.evoSim.runGenerations(2);
                /*
                 app.currentBot.brain.defaultTree.debugPrint();
                 for (var i = 0; i < 20; i++) {
                 app.evoSim.mutateGenome(app.currentBot.brain.defaultTree);
                 }

                 app.evoSim.treeViz.setTree(app.currentBot.brain.defaultTree);
                 app.currentBot.brain.defaultTree.debugPrint();
                 */
            });

            $("#spawnRelatives").click(function() {
                console.log("Spawn relatives");
                var bots = [];
                // Create relatives
                console.log(app.currentBot.clone());
                for (var i = 0; i < 10; i++) {
                    bots[i] = app.currentBot.clone();
                    // bots[i].mutate(.7);
                }
                app.arena.addPopulation(bots);
            });

            var ui = this.ui;

            $(".full_canvas").css({
                width : "800px",
                height : "600px",
            });

            // Create the Three scene
            app.threeRender = new threeUtils.ThreeView($("#render_panel"), function() {
                // update the camera

                if (!app.pauseSpinning) {
                    this.camera.orbit.theta += .01;

                    this.camera.orbit.phi = .93;
                }
                // app.log(this.camera.orbit.theta);
                this.camera.updateOrbit();

            });

            // Initial camera settings
            var cam = app.threeRender.camera;
            cam.orbit.distance = 600;
            cam.updateOrbit();

            app.threeWindow = new UI.DrawingWindow("3D Bot View", $("#render_panel"));

            //create an empty container
            app.threeBotMesh = new THREE.Object3D();
            app.threeRender.scene.add(app.threeBotMesh);

            // These windows all use processing for the drawing
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

                    app.worldTime.updateTime(g.millis() * .001);
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
                    app.worldTime.updateTime(g.millis() * .001);

                    app.arena.update(app.worldTime.ellapsed);

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
                if (app.mode === app.modes.arena && app.evoSim) {
                    g.background(.8, 1, .3);
                    app.evoSim.renderScores(g);

                }

            });

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
