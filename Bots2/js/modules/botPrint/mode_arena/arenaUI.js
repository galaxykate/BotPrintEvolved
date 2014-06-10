/**
 * @author Kate Compton
 */

define(["common", "./scoreGraph"], function(common, ScoreGraph) {'use strict';

    var arenaInfoDiv = $("#arena_data");
    var arenaSidebar = $("#arena_sidebar");
    var populationPanel = $("#population_panel");
    var devMode;
    arenaInfoDiv.hide();
    //  arenaSidebar.hide();
    populationPanel.hide();

    return {

        graph : new ScoreGraph.BarGraph($("#scoreboard")),

        // Set up the ui for the arena, add buttons and whatnot
        initUI : function() {
            // Add all the heuristics to the menu
            var heuristicSelect = $("#heuristic");

            console.log(app);
            app.heuristics.forEach(function(heuristic) {
                heuristicSelect.append($('<option>', {
                    value : heuristic.name,
                    text : heuristic.name,
                }));

            });

            heuristicSelect.change(function() {
                setCurrentHeuristic(this.value);
            });

            //=======================================
            // Arena selection
            var arenaComplexity =$("arena_complexity");
            
            var arenaDensity =$("arena_density"); 
			
     		var typeSelect = $("#arena_type");
			
			app.ui.createSlider(arenaComplexity, "complexity", 1, 0, 20, function(key, val) {
               app.arenaMode.arenaComplexity = val; 
            });
            
            app.ui.createSlider(arenaComplexity, "density", 1, 0, 20, function(key, val) {
               app.arenaMode.arenaDensity = val; 
            });
            
            var types = ["rectangle", "hexagon", "circle","random","obstacle","custom"];
            for (var i = 0; i < types.length; i++) {
                typeSelect.append($('<option>', {
                    value : types[i],
                    text : types[i],
                }));
            }

            typeSelect.change(function() {
                app.arenaMode.changeArenaType(this.value);
            });
            
            
            
            //=========== Simspeed

            var settingsDiv = $("#arena_time_settings");

            app.ui.createSlider(settingsDiv, "simspeed", 1, 0, 7, function(key, val) {
                app.simulationSpeed = val * val;
            });

            $("#evolveMany").click(function() {
                console.log("EVOLVE MANY GENERATIONS");
                app.arenaMode.simulateGenerations(10);
            });

        },

        initPopulationPanel : function() {
            // setup the populationmode ui
            $("#mutate").click(function() {
                this.togglePopulationMode();
                console.log("previous population:  " + current.population);

                app.arenaMode.startNewSimulation(current.population.createNextGenerationFromMutants());
            });

        },

        initForPopulation : function(population) {
            population.createPopulationDivs();

        },

        togglePopulationMode : function() {
            app.populationMode = !app.populationMode;
            if (app.populationMode) {
                populationPanel.show();

                app.paused = true;

            } else {
                populationPanel.hide();

                app.paused = false;
            }
        },

        toggleDevMode : function() {
            console.log("TOGGLE DEV MODE");
            devMode = !devMode;
            if (devMode) {
                arenaInfoDiv.show();
            } else {
                arenaInfoDiv.hide();
            }
        },
    };

});
