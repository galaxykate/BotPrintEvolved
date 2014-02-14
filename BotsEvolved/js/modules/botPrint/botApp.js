/**
 * @author Kate Compton
 */

define(["ui", "./bot/bot", "./physics/arena", "threeUtils", "./botEvo", "app", "common", "./population"], function(UI, Bot, Arena, threeUtils, BotEvo, App, common, Population) {

    /**
     * @class BotApp
     * @extends App
     */
    var BotApp = App.extend({
        /**
         * @method init
         */
        init : function() {
            app = this;
            app.width = 900;
            app.height = 600;
            app.botCard = {
                width : 150,
                height : 220,
                border : 20,
            }

            app.paused = false;
            app.editChassis = false;

            app._super("Bots", new Vector(30, 30));

            // app.changeMode("inspector");
            app.arena = new Arena("rectangle");

            app.currentBot = new Bot();

            $("#switch_modes").click(function() {
                app.toggleMainMode();
            });

            $(".edit_menu").click(function() {
                app.toggleEditMode();
            });

            app.closeLoadScreen();
            app.createEmptyBotCard($("#app"));

            app.setPopulation(new Population(5));

            app.openArenaMode();

        },

        //=====================================================================
        //=====================================================================
        //=====================================================================
        //=====================================================================

        highlightBot : function(bot) {
            //  console.log("Highlighting " + bot);
        },

        // Create a bot card and attach it here
        createEmptyBotCard : function(parentHolder) {

        },

        /**
         * @method toggleMainMode
         */

        toggleMainMode : function() {
            console.log("Toggle main mode " + app.editMode);
            if (app.editMode)
                app.openArenaMode();
            else
                app.openEditMode();
        },

        /**
         * @method openEditMode
         */
        openEditMode : function() {
            app.editMode = true;
            $("#arena").addClass("away");
            $("#edit").removeClass("away");

            // Make wiring for this bot?
            app.currentBot.transform.setTo(0, 0, 0);
            app.openEditChassis();

            var p = new Vector();
            $(".bot_card").css({
                "-webkit-transform" : "translate(" + p.x + "px, " + p.y + "px) rotateX(360deg) scale3d(1, 1, 1)",
            });
        },

        /**
         * @method openArenaMode
         */
        openArenaMode : function() {
            var bc = app.botCard;
            app.editMode = false;
            $("#edit").addClass("away");
            $("#arena").removeClass("away");

            var p = new Vector(app.width - bc.width - (bc.border * 2), app.height - bc.height - (bc.border * 2));
            $(".bot_card").css({
                "-webkit-transform" : "translate(" + p.x + "px, " + p.y + "px) rotateX(.01deg) scale3d(1, 1, 1)",
            });

            app.population.updateUI();

        },

        createBot : function() {
            return new Bot();
        },

        editBot : function(bot) {
            this.currentBot = bot;
            app.openEditMode();
        },

        //-------------------------------------------------------
        /**
         * @method toggleEditMode
         */
        toggleEditMode : function() {
            console.log("Toggle edit mode " + app.editChassis);
            if (app.editChassis)
                app.openEditChassis();
            else
                app.openEditParts();
        },

        /**
         * @method openEditParts
         */
        openEditParts : function() {
            app.editChassis = true;
            $("#chassis_edit").addClass("away");
            $("#parts_edit").removeClass("away");

        },

        /**
         * @method openEditChassis
         */

        openEditChassis : function() {
            app.editChassis = false;
            $("#chassis_edit").removeClass("away");
            $("#parts_edit").addClass("away");
        },

        openLoadScreen : function() {
            $("#load_screen").show();
        },
        closeLoadScreen : function() {
            $("#load_screen").hide();
        },

        /**
         * @method openLoadScreen
         */
        openLoadScreen : function() {
            $("#load_screen").show();
        },

        /**
         * @method closeLoadScreen
         */
        closeLoadScreen : function() {
            $("#load_screen").hide();

            /* $("*").click(function(evt) {
             console.log("Clicked ", this);
             });*/

        },

        //=====================================================================
        //=====================================================================

        //=====================================================================
        //=====================================================================

        /**
         * @method createAndTestManyBots
         */
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

        /**
         * @method createAndTestNewBot
         */
        createAndTestNewBot : function() {
            var task = "doThing";

            app.currentBot = new Bot();

            app.evoSim = new BotEvo.BrainEvo(app.currentBot, task, app.arena);
            var testBrain = app.evoSim.createIndividual(app.evoSim.createGenome());
            app.currentBot.setBrain(testBrain);
            app.arena.addPopulation([app.currentBot]);

            app.evoSim.treeViz.setTree(testBrain);
        },

        spawnNextGeneration : function() {
            app.setPopulation(app.population.createNextGeneration());
        },

        setPopulation : function(pop) {
            console.log("Set population: " + pop);
            app.population = pop;
            app.arena.reset();
            app.arena.addPopulation(app.population.bots);

            app.population.updateUI();

        },
        //=====================================================================
        //=====================================================================

        /**
         * @method initModes
         */

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

        /**
         * @method initControls
         */
        initControls : function() {

            // Set all the default UI controls
            app.controls = new UI.Controls($("body"), {

                onKeyPress : {

                    d : function(event) {
                        app.ui.devMode.toggle()
                    },

                    space : function() {
                        app.paused = !app.paused;
                    }
                },

            });

            // Make some of the windows touchable

            var touchInspector = app.controls.addTouchable("inspector", $("#edit_canvas"));
            var touchArena = app.controls.addTouchable("arena", $("#arena_canvas"));

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

        /**
         * @method initUI
         */
        initUI : function() {

            var ui = app.ui;

            $("#next_generation").click(function() {
                app.spawnNextGeneration();
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
            app.editWindow = new UI.DrawingWindow("edit", $("#edit_canvas"));
            app.arenaWindow = new UI.DrawingWindow("arena", $("#arena_canvas"));

            app.editorProcessing = ui.addProcessingWindow(app.editWindow.element, function(g) {
                app.editWindow.setProcessing(g);

            }, function(g) {
                // Updates

                // only do if its the inspector mode
                if (app.editMode) {
                    // Updates

                    if (!app.paused) {
                        app.worldTime.updateTime(g.millis() * .001);
                        app.currentBot.update({
                            total : app.worldTime.total,
                            elapsed : app.worldTime.ellapsed
                        });
                    }

                    app.editWindow.render(function(context) {

                        var g = context.g;
                        g.background(.8);
                        context.useChassisCurves = true;
                        // Draw the bot

                        g.fill(.8, 1, 1);
                        g.ellipse(0, 0, 90, 90);

                        app.currentBot.render(context);

                    });
                }
            });

            // Create the arena
            app.arenaProcessing = ui.addProcessingWindow(app.arenaWindow.element, function(g) {
                app.arenaWindow.setProcessing(g);
            }, function(g) {
                // only do if its the arena mode
                if (!app.editMode) {

                    if (!app.paused) {
                        app.worldTime.updateTime(g.millis() * .001);
                        app.arena.update(app.worldTime.ellapsed);
                    }
                    app.arenaWindow.render(function(context) {
                        context.scale = 3;
                        app.arena.render(context);
                    });
                }

            });

        },
    });

    return BotApp;
});
