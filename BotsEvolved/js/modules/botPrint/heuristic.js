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
            evaluate : function(bot) {
                return bot.transform.x;
            },
        },

        angularVelocity : {
            range : new common.Range({
                min : -3,
                max : 3,
            }),
            evaluate : function(bot) {
                return bot.angularVelocity;
            },
        },

        mostBlue : {
            range : new common.Range({
                min : -.5,
                max : .5,
            }),
            evaluate : function(bot) {
                var dblue = Math.abs(0.6 - bot.idColor.h);
                dblue = dblue % 1;
                console.log(bot.idColor.h + ": " + dblue);
                return (.5 - dblue) * bot.idColor.b * bot.idColor.s;
            },
        }
    }

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
        makeHeuristicMenu : makeHeuristicMenu
    };

});
