/**
 * @author Kate Compton
 */

define(["ui", "./bot/bot", "./physics/arena", "modules/threeUtils/threeView", "common"], function(UI, Bot, Arena, ThreeView, common) {

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
            ellapsed : 0,
            lastUpdateTime : 0,
        },

        getTime : function() {
            var date = new Date();
            var time = date.getTime() - this.startTime;
            return time;
        },

        timespans : new common.TimeSpan.Manager(),
    };

    app.editBot = function(bot) {
        if (bot === undefined)
            bot = new Bot();

        app.currentBot = bot;
        app.threeBotMesh.add(bot.createThreeMesh());
        app.currentBot.setScreenPositions(app.inspectorCamera);

    };

    app.updateWorld = function(currentTime) {
        var ellapsed = currentTime - app.time.lastUpdateTime;
        app.time.lastUpdateTime = currentTime;

        var time = app.time;
        // update the time object

        time.worldTime += ellapsed;
        time.ellapsed = ellapsed;
        app.log("Time: ");
        app.log("  world: " + time.worldTime.toFixed(2));
        app.log("  ellapsed: " + time.ellapsed.toFixed(2));
        app.log("  FPS: " + (1 / time.ellapsed).toFixed(2));

        app.timespans.update(ellapsed);
        app.currentBot.update(time);

    };

    app.initializeUI = function() {
        app.rect = new common.Rect(0, 20, 800, 580);

        app.ui = new UI({
        });

        var appDiv = $("#app");

        // Initialize the UI
        var ui = app.ui;

        // Make a shortcut for outputs
        app.log = function(line) {
            app.ui.output.log(line);
        };

        ui.addDevUI($("#dev_controls"));

        var fullPanelDimensions = new Vector(app.rect.w - 20, app.rect.h - 40);
        ui.addPanel({
            id : "arena",
            div : $("#arena_panel"),
            title : "Arena",
            description : "An arena to view bots in",
            side : "right",
            sidePos : 0,
            dimensions : fullPanelDimensions

        });
        ui.addPanel({
            id : "inspector",
            div : $("#inspector_panel"),
            title : "Inspector",
            description : "A window to inspect and modify bots in",
            side : "left",
            sidePos : 0,
            dimensions : fullPanelDimensions

        });

        // Create modes
        app.arenaMode = new UI.Mode({
            title : "Arena Mode",
            description : "Test and evolve your bots",
            panels : ui.getPanels(["arena"]),
        });

        app.inspectMode = new UI.Mode({
            title : "Inspect Mode",
            description : "Edit and customize your bot",
            panels : ui.getPanels(["inspector"]),
        });

        app.saveMode = new UI.Mode({
            title : "Save Mode",
            description : "Save or print your bot",
            panels : ui.getPanels([]),
        });

        ui.modes.main = new UI.Mode.ModeSet({
            name : "Main mode",
            modes : [app.arenaMode, app.inspectMode],
            onChange : function(mode) {
                ui.modeOutput.log("Changed mode: " + mode.name);
            }
        });

        //================================================
        //================================================
        //================================================
        // Iniialize the viewing ports (Processing and Three.JS)
        // Create the processing.  camera stuff will move into own file eventually

        app.inspectorCamera = {
            scale : 2,
            center : new Vector(),
            setScreenPosition : function(point, layer) {
                if (point.screenPos === undefined) {
                    point.screenPos = new Vector();
                }

                point.screenPos.setTo(point);
                point.screenPos.mult(this.scale);
                point.screenPos.add(this.center);

            },

            screenPosToWorldPos : function(screenPos) {
                var worldPos = new Vector(screenPos);
                worldPos.sub(this.center);
                worldPos.div(this.scale);
                return worldPos;
            },
        };

        app.arenaDiv = $("#arena_canvas");
        app.inspectorDiv = $("#inspector_canvas");

        app.inspectorProcessing = ui.addProcessingWindow(app.inspectorDiv, function(g) {
            app.inspectorCamera.center.setTo(g.width / 2, g.height / 2);
        }, function(g) {
            // Updates
            app.ui.output.clear();

            // Updates
            app.updateWorld(g.millis() * .001);

            g.colorMode(g.HSB, 1);
            g.background(.55, .3, 1);

            g.fill(.6, 1, .2);
            g.ellipse(0, 0, 400, 400);

            app.currentBot.setScreenPositions(app.inspectorCamera);

            app.currentBot.render2D(g);
        });

        // Create the arena
        app.arenaProcessing = ui.addProcessingWindow(app.arenaDiv, function(g) {
        }, function(g) {
            app.updateWorld(g.millis() * .001);

            g.colorMode(g.HSB, 1);
            g.background(.75, .1, 1);

            app.arena.render2D(g);

        });

        // Create the Three scene
        app.threeRender = new ThreeView($("#render_panel"), function() {
            // update the camera

            if (!app.pauseSpinning)
                this.camera.orbit.theta += .03;
            app.log(this.camera.orbit.theta);
            this.camera.updateOrbit();
        });
        //create an empty container
        app.threeBotMesh = new THREE.Object3D();
        app.threeRender.scene.add(app.threeBotMesh);

    };

    app.initializeControls = function() {
        //================================================
        //================================================
        //================================================
        // Setup controls
        var ui = app.ui;

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

            onPress : function(touch) {
                switch(app.focusedWindow) {
                    case "render_panel":
                        app.pauseSpinning = true;
                        break;
                    case "inspector_panel":
                        app.currentBot.selectPoint(touch.pos);
                        break;

                }

            },

            onRelease : function(touch) {

                app.pauseSpinning = false;
                app.focusedWindow = undefined;
            },

            onMove : function(touch) {

                switch(app.focusedWindow) {
                    case "render_panel":
                        break;
                    case "inspector_panel":
                        app.currentBot.hover(touch.pos);
                        break;

                }

            },

            onDrag : function(touch) {
                app.ui.moveOutput.log("focus: " + app.focusedWindow);

                switch(app.focusedWindow) {
                    case "render_panel" :
                        app.threeRender.camera.orbit.theta = touch.pos.x * .01;
                        app.threeRender.camera.orbit.phi = .4 + touch.pos.y * .004;
                        app.threeRender.camera.updateOrbit();
                        break;

                    case "inspector_panel":

                        var localPos = app.getPositionRelativeTo(app.inspectorDiv, touch.pos);

                        var worldPos = app.inspectorCamera.screenPosToWorldPos(localPos);
                        app.currentBot.dragPoint(worldPos);
                        console.log("WorldPos: " + worldPos);

                        break;
                }

            },

            onMouseWheel : function(delta) {

            }
        });

        function logAndBubbleMouseActions(id) {
            var div = $("#" + id);

            div.on('mousedown', function(event) {
                event.preventDefault();
                console.log(this);
                app.focusedWindow = id;

            });

            div.on('mouseup', function(event) {
                event.preventDefault();
                console.log(this);
                app.focusedWindow = undefined;

            });
        }


        app.div.mousedown(function() {
            app.div.scrollTop(0);
        });

        app.div.mouseup(function() {
            app.div.scrollTop(0);
        });

        logAndBubbleMouseActions("render_panel");
        logAndBubbleMouseActions("inspector_panel");

    };

    app.getPositionRelativeTo = function(div, pos) {
        console.log(div);
        var v = new Vector(pos.x - div.offset().left, pos.y - div.offset().top);
        console.log("pos: " + pos + "relpos: " + v);
        return v;
    };

    app.start = function() {

        app.initializeUI();
        app.initializeControls();
        app.arena = new Arena();

        app.navControls.activate();

        app.editBot();

        var ui = app.ui;
        ui.addOption("allowTribbles", false);
        ui.addOption("useBunnies", true);
        ui.addOption("manyUnicorns", true);
        ui.addTuningValue("unicornPrettiness", 50, 0, 100);
        ui.addTuningValue("unicornFuzziness", 50, 0, 100);
        ui.addTuningValue("bunnyMultiplier", 50, 0, 100);

        ui.addPopupManager("newsBar", new UI.Popup.NoticeBar({
            divName : "news_bar"
        }));

        ui.modes.main.activate(app.arenaMode);
      //  ui.modes.dev.activate();

    };

    return app;
});
