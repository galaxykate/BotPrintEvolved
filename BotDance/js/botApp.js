/**
 * @author Kate Compton
 */
var debug;
var screenWidth = 400;
var screenHeight = 400;
var testDots = [];
var b2DWorld;
var b2DBodyDef;

var botApp = {};
var app;

define(["jQuery", "processing", "evo", "modules/bots/bot", "botInspector", "box2D", "common", "modules/bots/arena"], function(JQUERY, Processing, EvoPopulation, Bot, BotInspector, Box2D, COMMON, BotArena) {
    // Create the bot app

    app = {
        world : {
            lightMap : new Map(),
        },
        options : {
            drawB2D : false,
            debugDrawLightmap : false,
        },

    };

    // Keyboard shortcuts
    $("#app").keypress(function(e) {
        var c = String.fromCharCode(e.which);
        if (c === 'l') {
            app.options.debugDrawLightmap = !app.options.debugDrawLightmap;
        }
    });

    var inspector = new BotInspector();

    var createOutput = function(divName) {
        var div = $("#" + divName);

        div.html("test");
        var outputLines = [];
        var output = {
            clear : function() {
                div = $("#" + divName);
                outputLines = [];
                this.updateOutput();
            },

            add : function(line) {
                outputLines.push(line);
                div.append(line + "<br>");
            },

            output : function(line) {
                outputLines.push(line);
                div.append(line + "<br>");
            },

            outputArray : function(lines) {
                var htmlLines = "";
                $.each(lines, function(index, line) {
                    htmlLines += line + "<br>";
                });
                div.append(htmlLines);
            },

            updateOutput : function() {
                var htmlLines = "";
                $.each(outputLines, function(index, line) {
                    htmlLines += line + "<br>";
                });
                div.html(htmlLines);
            }
        };
        return output;

    };

    debug = createOutput("debug_output_pane");

    // Make a processing window in the
    var botDriveCanvas = document.getElementById("test_drive_canvas");
    var useGridster = false;
    if (useGridster) {
        //--------
        // Gridster

        var tileSize = 60;
        var canvasSize = 60;
        var gridster = $(".gridster > ul").gridster({
            widget_margins : [10, 10],
            widget_base_dimensions : [tileSize, tileSize],
            min_cols : 3
        }).data('gridster');
    }

    var tileCount = 0;
    var currentTime = 0;
    var useProcessingOnTiles = false;

    botApp.addTile = function() {

        var idNumber = tileCount;
        if (useGridster) {
            gridster.add_widget('<li class="new"><div id="tile' + idNumber + '""/> </li>', 1, 1);
        } else {

        }
        var tile = $("#tile" + idNumber);
        tile.idNumber = idNumber;

        if (useProcessingOnTiles) {
            // Add processing
            var canvasID = "tile" + idNumber + "_canvas";
            var canvas = $("<canvas/>", {
                id : canvasID,
                "class" : "tile_canvas",

            });
            tile.append(canvas);

            var canvasElem = document.getElementById(canvasID);
            // attaching the sketchProc function to the canvas
            var processingInstance = new Processing(canvasElem, function(g) {

                g.size(canvasSize, canvasSize);
                g.colorMode(g.HSB, 1);
                g.draw = function() {

                    if (tile.idNumber === 0) {
                        currentTime = .001 * g.millis();

                    }
                    g.background((tile.idNumber * 2.1231 + 0.2 * Math.sin(5.6 * currentTime) + 5.3) % 1, 0.6 + Math.sin(4.6 * currentTime) * 0.4, 1);
                }
            });
        }

        tileCount++;

    };

    //-----------------
    // Population
    // test class

    function rerollPopulation() {
        population.createPopulation();
        arena.addBots(population.activePopulation);
    };

    $("#reroll_population").click(function() {
        rerollPopulation();
    });

    var population = new EvoPopulation({
        createIndividual : Bot,
    });
    var arena = new BotArena();

    rerollPopulation();

    // ---------------
    // Utilities

    //-----------------
    // Processing
    var processingG;

    var arenaCanvas = $("#test_drive_canvas");
    arenaCanvas.mousemove(function(e) {
        var parentOffset = $(this).parent().offset();
        //or $(this).offset(); if you really just want the current element's offset
        var relX = e.pageX - parentOffset.left;
        var relY = e.pageY - parentOffset.top;
        var pos = new Vector(relX, processingG.height - relY);
        console.log("Click " + pos);
        
        var bot = arena.getAt(pos);
        population.selectIndividual(bot);
        
    });

    var botDriveG = new Processing(botDriveCanvas, function(g) {
        g.colorMode(g.HSB, 1);
        processingG = g;
        g.ellipseMode(g.CENTER_RADIUS);
        g.size(400, 400);

        app.world.lightMap.setDimensions(g.width, g.height, 20);
        // Override draw function
        var lastUpdate = 0;
        g.draw = function() {
            testDots = [];
            debug.clear();

            g.background(.55, .7, 1);

            var t = g.millis() * .001;
            var ellapsed = t - lastUpdate;
            var time = {
                total : t,
                ellapsed : ellapsed,
            }

            lastUpdate = t;
            arena.update(time);

            g.pushMatrix();
            g.translate(0, g.height);
            g.scale(1, -1);

            arena.draw(g, t);
            g.popMatrix();
        };

    });

});
