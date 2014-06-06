/**
 * @author Kate Compton
 */

define(["common", "./simulation", "../physics/arena", "./population", "./heuristic", "./arenaUI"], function(common, Simulation, Arena, Population, heuristic, ui) {'use strict';

    var populationMode = false;
    var arenaType = "circle";

    var current = {
        population : undefined,
        arena : undefined,
        simulation : undefined,
    };

    function initialize() {

        app.heuristics = heuristic.heuristics;
        
        app.currentHeuristic = heuristics.mostBlue;
        app.simulationSpeed = 1;

        //console.log(app.heuristics);
        console.log(app);

        console.log("Init Arena Mode");
        createProcessing();
        console.log(ui);
        ui.initUI();
        ui.initPopulationPanel();

        // Create the botCard
        app.arenaCard = new app.createBotCard($("#arena_card"));

        Population.initUI();
        // Create the graph

        isStarted = true;

    };

    function startSimulation() {
        console.log("Start a new simulation");
        if (!current.simulation) {
            arenaMode.startNewSimulation(current.population);

        } else {
            current.simulation.refreshBots();
        }
    };

    function setCurrentHeuristic(name) {
        console.log("settting!");
        app.currentHeuristic = app.heuristics[name];
        ui.graph.setTest(current.simulation.getTest(name));
    };

    //============================================================
    // Mode stuff

    var isStarted = false;
    var isOpen = false;
    var mainPanel = $("#arena_panel");

    function open() {
        mainPanel.addClass("open");
        isOpen = true;

        startSimulation();
    };

    function close() {
        mainPanel.removeClass("open");
        isOpen = false;

    };

    //=========================================================================
    //=========================================================================
    // UI

    // Create processing and attach it to a canvas element
    function createProcessing() {
        var canvasDiv = $("#arena_canvas");
        var arenaWindow = app.controls.createTouchableWindow(canvasDiv, "arena", arenaMode);

        // attaching the sketchProc function to the canvas
        var processingInstance = new Processing(canvasDiv.get(0), function(g) {
            var w = canvasDiv.width();
            var h = canvasDiv.height();
            g.size(w, h);
            arenaWindow.center = new Vector(w / 2, h / 2);
            g.colorMode(g.HSB, 1);
            g.ellipseMode(g.CENTER_RADIUS);

            var last = 0;
            g.draw = function() {
                if (isOpen) {
                    app.update();

                    if (!app.paused) {
                        var ellapsed = last - g.millis();
                        ellapsed = utilities.constrain(ellapsed, .01, .1);

                        ellapsed *= app.simulationSpeed;

                        update(ellapsed);
                    }

                    g.background(.69, .72, 1);
                    g.pushMatrix();
                    g.translate(w / 2, h / 2);

                    g.fill(0);
                    g.ellipse(0, 0, 50, 50);
                    var context = {
                        g : g,
                    };

                    drawArena(context);

                    g.popMatrix();
                    // Draw a shaded rectangle
                    if (app.paused) {
                        g.fill(0, 0, 0, .4);
                        g.rect(0, 0, g.width, g.height);
                    }
                }
            };
        });
    };

    function drawArena(context) {
        if (current.simulation)
            current.simulation.draw(context);
    };

    //=========================================================================
    // Updates and experiments
    function update(ellapsed) {

        app.worldTime.addEllapsed(ellapsed);
        current.simulation.simStep(app.worldTime);

        // Update the bar graph

    };

    //=========================================================================
    // Exposed

    function getTouchableAt(query) {
        query.allowBots = true;
        // return the closest bot

        return current.simulation.getAt(query);

    };

    // Accessible functions

    var arenaMode = {
        initialize : initialize,
        setCurrentHeuristic: setCurrentHeuristic,

        //Maybe wrong to expose, but fixes some UI stuff.
        getCurrent : function() {
            console.log("current:", current);
            return current;
        },

        changeArenaType : function(type) {
            arenaType = type;
            // Create a new simulation
            arenaMode.startNewSimulation(current.population, new Arena(arenaType));
        },

        // Simulate some large number of new generations
        simulateGenerations : function(count, breedNextGen) {
            if (!breedNextGen)
                breedNextGen = function(winners) {
                    // Mutate some winners
                    current.population.mutants = winners;
                    current.population = current.population.createNextGenerationFromMutants();
                };

            for (var i = 0; i < count; i++) {
                console.log("Simulate generation " + count);
                current.population.debugOutput();
                arenaMode.startNewSimulation(current.population);
                // Run this simulation

                var winners = current.simulation.getWinners();
                console.log("Winners: " + utilities.arrayToString(winners));
                var nextGen = breedNextGen(winners);
            }
        },

        startNewSimulation : function(population, arena) {

            if (arena)
                current.arena = arena;
            if (population)
                current.population = population;
            else
                current.population = current.population = new Population(5);

            if (!current.arena)
                current.arena = new Arena(arenaType);

            current.simulation = new Simulation(current.population.bots, current.arena, app.heuristics);
            current.simulation.start();
            current.simulation.run(1, .04);
        },

        getTouchableAt : getTouchableAt,
        open : open,
        close : close,
        isOpen : function() {
            return isOpen;
        },

        keyPress : function(key) {
            switch(key) {

                case 'p':
                    ui.togglePopulationMode();
                    break;
                case 'd':
                    ui.toggleDevMode();
                    break;

            }
        }
    };
    // interface (all other functions are hidden)
    return arenaMode;
});
