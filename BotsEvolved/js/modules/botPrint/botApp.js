/**
 * @author Kate Compton
 */

define(["ui", "./bot/tuning", "./bot/bot", "./botCard", "./physics/arena", "threeUtils", "./botEvo", "app", "common", "./population", "./scoreGraph", "./heuristic", "./bot/attachment/attachments"], function(UI, Tuning, Bot, BotCard, Arena, threeUtils, BotEvo, App, common, Population, ScoreGraph, Heuristic, Attachment) {

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
            app.botCardDimensions = {
                width : 150,
                height : 220,
                border : 20,
            };

            app.paused = false;
            app.editChassis = false;

            //app.initModes();

            app._super("Bots", new Vector(30, 30));

            // app.changeMode("inspector");
            app.arena = new Arena("rectangle");

            //app.currentBot = new Bot();

            $("#select_arena").click(function() {
                var arenatype = $("#arena_type_chooser").val();
                app.loadNewArena(arenatype);
            });


            $("#switch_modes").click(function() {
                app.toggleMainMode();
            });

            /*$(".edit_menu").click(function() {
             app.toggleEditMode();
             });*/
            app.createAttachmentList();
            app.closeLoadScreen();

            app.botCard = new BotCard($("#app"));
            app.setPopulation(new Population(5));
            app.currentBot = app.population.bots[0];
            app.botCard.setBot(app.currentBot);

            app.initializeEditMode();

            app.openArenaMode();
        },

        //=====================================================================
        //=====================================================================
        //=====================================================================
        // Create a global list of all the attachments and their weights
        createAttachmentList : function() {

            // Weights and attachment types: there should be the same number in each array, please!
            app.attachmentWeights = [.3];
            app.attachmentTypes = [Attachment.Sensor];
            //app.initModes();
            //console.log("types: " + app.getOption("useTimers"));

			if (app.getOption("useThrusters")){
				app.attachmentTypes.push(Attachment.Actuator), app.attachmentWeights.push(0.6);
			}
			
            if (app.getOption("useTimers")) {
                app.attachmentTypes.push(Attachment.Sensor.Timer), app.attachmentWeights.push(1);
            }

            if (app.getOption("useColorLerpers")) {
                app.attachmentTypes.push(Attachment.Sensor.ColorLerper), app.attachmentWeights.push(1);
            }

            if (app.getOption("useSharpie")) {
                app.attachmentTypes.push(Attachment.Actuator.Sharpie), app.attachmentWeights.push(1);
            }
            
            if(app.getOption("useWheel")) {
            	app.attachmentTypes.push(Attachment.Actuator.Wheel), app.attachmentWeights.push(1);
            }

        },

        //=====================================================================
        //=====================================================================
        //=====================================================================
        //=====================================================================
        setCurrentBot : function(bot) {

            app.currentBot = bot;
            bot.saveBot()
        },

        /**

         * @method loadNewArena
         */
        loadNewArena : function(shape) {
            console.log("Load new arena " + shape);
            //deletes current bots in the arena. We might want to change this.
            app.arena.reset();
            app.arena = new Arena(shape);
            //This adds brand new bots. Need to change to current bots.
            app.setPopulation(this.population);
            //throw("I just set the population?");
            app.currentBot = app.population.bots[0];
        },

        highlightBot : function(bot) {
            //  console.log("Highlighting " + bot);
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
            var bc = app.botCardDimensions;
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
            app.setEditMenu();
            app.openEditMode();
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

        spawnNextGeneration : function() {
            app.setPopulation(app.population.createNextGeneration());
        },

        setPopulation : function(pop) {
            console.log("Set population: ", pop);
            app.population = pop;
            app.currentBot = app.population.bots[0];
            app.arena.reset();
            app.arena.addPopulation(app.population.bots);
            app.scoreGraph.setCompetitors(app.population.bots);
            app.population.updateUI();
        },
        //=====================================================================
        //=====================================================================

        /**
         * @method initModes
         */
        initModes : function() {
            var ui = app.ui;
            app.ui.addOption("logWiring", false);
            app.ui.addOption("logChassis", true);
            app.ui.addOption("drawWiring", true);
            app.ui.addOption("drawComponents", true);
            app.ui.addOption("logConditionTests", false);
            app.ui.addOption("logMutations", true);
            app.ui.addOption("useTimers", true);
            app.ui.addOption("useColorLerpers", true);
            app.ui.addOption("useSharpie", false);
            app.ui.addOption("useWheel", true);
            app.ui.addTuningValue("unicornFluffiness", 100, 1, 700, function(key, value) {
                // do something on change
            });
        },

        //-------------------------------------------------------
        /**
         * @method initializeEditMode
         */
        initializeEditMode : function() {
            $("#parts_edit").append("<br>");
            var button = $("<button/>", {
                id : 'edit_menu_button',
            });
            button.append("Edit Bot");
            button.appendTo($("#parts_edit"));
            button.click(function() {
                app.toggleEditMode();
            });
            app.setEditMenu();
            var ui = app.ui;
            var partNames = new Array();
            var rTest = Attachment.Sensor;
            partNames[0] = "wheel";
            partNames[1] = "light sensor";
            partNames[2] = "servo";
            var attachList = app.attachmentTypes;
            for (var i = 0; i < attachList.length; i++) {

                var canva = $("<canvas/>", {
                    id : 'edit_item ' + i,
                    class : 'edit_item',
                    width : 150,
                    height : 100,
                    //"border-radius": 1,
                });
                var curAttachment = attachList[i];
                //var canvases = document.getElementById('edit_item');
                //var ctx = $(canva).getContext('2d');

                //var attach = this.currentBot.mainChassis.attachments;
                //var attachTypes = this.currentBot.mainChassis.aTypes;

                canva.appendTo($("#parts_edit"));

                //Insert drag/droppable image here?

                canva.click(function(e) {

                    console.log(e.target.id);
                    var strChunks = e.target.id.split(" ");
                    app.currentBot.mainChassis.generateAttachment(parseInt(strChunks[1]));
                    app.currentBot.mainChassis.generateWiring();
                    app.currentBot.compileAttachments();

                    e.stopPropagation();
                });
            }
        },

        setEditMenu : function() {
            $("#chassis_edit").text("");
            var button = $("<button/>", {
                id : 'edit_menu_button',
            });
            button.append("Edit Parts");
            button.appendTo($("#chassis_edit"));
            button.click(function() {
                app.toggleEditMode();
            });
            $("#chassis_edit").append("<hr>");
            nString = "<center>";
            $("#chassis_edit").append(nString.concat(this.currentBot.name));
            $("#chassis_edit").append("</center>");
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

        spawnNextGeneration : function() {
            app.setPopulation(app.population.createNextGeneration());
        },

        setPopulation : function(pop) {
            console.log("Set population: " + pop);
            app.population = pop;
            app.currentBot = app.population.bots[0];
            app.arena.reset();
            app.arena.addPopulation(app.population.bots);
            app.scoreGraph.setCompetitors(app.population.bots);
            app.population.updateUI();
        },
        //=====================================================================
        //=====================================================================

        /**
         * @method initControls
         */
        initControls : function() {
            // Set all the default UI controls
            app.controls = new UI.Controls($("body"), {

                keyPress : function() {
                    // Standard controls: d toggles dev mode, space pauses
                    switch( app.controls.key) {
                        case 'd':
                            app.ui.devMode.toggle();
                            console.log("Dev mode");
                            break;
                        case 'space':
                            app.paused = !app.paused;

                            break;
                    }

                },

                move : function() {

                    if (app.editMode) {
                        // Move the mouse in the edit mode
                        app.controls.hoveredObject = app.currentBot.getAt(touchInspector.localPos, {
                            range : 30
                        });

                    } else {

                        // Move the mouse in the arena mode
                        var previous = app.controls.hoveredObject;
                        var selected = app.arena.getAt(touchArena.localPos, {
                            range : 90,
                        });

                        // Swich which bot is selected
                        if (selected !== previous) {
                            if (previous)
                                previous.deselect();
                            app.controls.hoveredObject = selected;
                            if (selected) {
                                selected.select();
                                app.botCard.setBot(selected);
                            }
                        }

                    }
                },
            });

            // Make some of the windows touchable

            var touchInspector = app.controls.addTouchable("inspector", $("#edit_canvas"));
            var touchArena = app.controls.addTouchable("arena", $("#arena_canvas"));

            // Add handlers for these particular windows
            touchInspector.addHandlers({
                drag : function() {

                }
            });

            // Add handlers for these particular windows
            touchArena.addHandlers({
                drag : function() {

                    if (app.controls.hoveredObject)
                        app.controls.hoveredObject.dragTo(this.localPos);

                },

                click : function() {
                    console.log("Click");
                },

                dblClick : function() {
                    console.log("DBLClick");

                    // Edit this bot
                    app.editBot(app.controls.hoveredObject);
                },
            });

        },

        /**
         * @method initUI
         */
        initUI : function() {

            var ui = app.ui;

            Heuristic.makeHeuristicMenu();

            // Add functionality for some buttons
            $("#next_generation").click(function() {
                app.spawnNextGeneration();
            });

            $("#select_winners").click(function() {
                var winners = app.scoreGraph.getWinners();
                app.population.createNextGenerationFromWinners(winners);
                app.currentBot = app.population.bots[0];
            });

            $("#start_test").click(function() {
                console.log("Start test");
            });

            // Add the score graph
            app.scoreGraph = new ScoreGraph.BarGraph($("#testing_panel"));

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
                    app.ui.output.clear();

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
                    app.ui.output.clear();

                    if (!app.paused) {
                        app.worldTime.updateTime(g.millis() * .001);
                        app.arena.update(app.worldTime.ellapsed);
                        app.scoreGraph.update(app.worldTime);
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
