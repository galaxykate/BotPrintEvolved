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
                app.arenaMode.setCurrentHeuristic(this.value);
            });

            //=======================================
            // Arena selection
            var typeSelect = $("#arena_type");

            var types = ["rectangle", "hexagon", "circle"];
            for (var i = 0; i < types.length; i++) {
                typeSelect.append($('<option>', {
                    value : types[i],
                    text : types[i],
                }));
            }

            typeSelect.change(function() {
                app.arenaMode.changeArenaType(this.value);
            });

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
            var current = app.arenaMode.getCurrent();
            //Scope issue
            var toggle = this.togglePopulationMode;

            // setup the populationmode ui
            $("#mutate").click(function() {
                toggle();
                console.log("previous population:  " + current.population);

                app.arenaMode.startNewSimulation(current.population.createNextGenerationFromMutants());
            });

            //jquery spaghetti
            //refactor laters
            $("#breed").click(function() {
                var parent0 = current.population.getByName(
                    $('#parent0')[0].textContent);
                var parent1 = current.population.getByName(
                    $('#parent1')[0].textContent);

                current.population = current.population.createNextGenerationFromParents(parent0, parent1);
            });

            $(".parent_slot").click(function() {
                var $parent = $(this);
                $parent.append("Select parent from left");

                //TODO:
                //Unbinding the click might break other stuff
                $('.population_bot').unbind("click").click(function() {
                    var name = this.textContent;
                    $parent.empty();
                    $parent.append(name);
                });
            });

        },

        initForPopulation : function(population) {
            population.createPopulationDivs();
        },

        togglePopulationMode : function() {
            app.populationMode = !app.populationMode;
            if (app.populationMode) {
                var pop = app.arenaMode.getCurrent().population;
                this.initForPopulation(pop);
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
            if(devMode) {
                arenaInfoDiv.show();
            } else {
                arenaInfoDiv.hide();
            }
        }
    };
});
