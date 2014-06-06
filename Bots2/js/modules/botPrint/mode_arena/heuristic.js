/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';

    var heuristics = {
        x : {
            range : new common.Range({
                min : -300,
                max : 300,
            }),

            evaluate : function(bot, time) {
                return bot.transform.x;
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
                return bot.length
            }
        },

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
    var heursticList = [];
    $.each(heuristicNames, function(index, name) {
        heursticList[index] = heuristics[name];
        heursticList[index].name = name;
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

    return {
        makeHeuristicMenu : makeHeuristicMenu,
        heuristics : heursticList,
    };

});
