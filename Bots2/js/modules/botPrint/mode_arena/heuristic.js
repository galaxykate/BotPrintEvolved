/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';

    var heuristics = {
        /*
        x : {
            range : new common.Range({
                min : -300,
                max : 300,
            }),

            evaluate : function(bot, time) {
                return bot.transform.x;
            },
        },
        */

        mostBlue : {
            range : new common.Range({
                min : -.5,
                max : .5,
            }),
            evaluate : function(bot, time) {
                var dblue = Math.abs(0.6 - bot.idColor.h);
                dblue = dblue % 1;
                return (.5 - dblue) * bot.idColor.b * bot.idColor.s;
            },
        },

        angularVelocity : {
            range : new common.Range({
                min : -3,
                max : 3,
            }),
            evaluate : function(bot, time) {
                return bot.angularVelocity;
            },
        },

        mostAttachments : {
            range : new common.Range({
                min : 0,
                max : 10

            }),
            evaluate : function(bot, time) {
                return bot.mainChassis.parts.length
            }
        },

        mostGreen : {
            range : new common.Range({
                min : -.5,
                max : .5,
            }),
            evaluate : function(bot, time) {
                var dblue = Math.abs(0.3 - bot.idColor.h);
                dblue = dblue % 1;
                return (.5 - dblue) * bot.idColor.b * bot.idColor.s;
            },
        }
    };

    var heuristicNames = Object.getOwnPropertyNames(heuristics);
    var heuristicList = [];
    $.each(heuristicNames, function(index, name) {
        heuristicList[index] = heuristics[name];
        heuristicList[index].name = name;
    });

    var makeHeuristicMenu = function() {

        var parent = $("#test_heuristic");
        var s = $("<select/>");

        var heuristicNames = Object.getOwnPropertyNames(heuristics);
        parent.append(s);
        $.each(heuristicNames, function(index, name) {
            var option = $("<option />", {
                value : name,
                text : name
            });

            s.append(option);
        });

        app.heuristic = heuristics[heuristicNames[0]];

        s.change(function() {
            var txt = $(this).val();
            console.log(txt);
            app.heuristic = heuristics[txt];

        });
    };

    var getHeuristic = function(name) {
        return heuristics[name];
    }

    return {
        makeHeuristicMenu : makeHeuristicMenu,
        heuristics : heuristics
    };

});
