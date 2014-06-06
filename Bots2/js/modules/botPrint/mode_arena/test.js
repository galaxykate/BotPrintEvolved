/**
 * @author Kate Compton
 */
define(["common", "../physics/arena"], function(common, Arena) {'use strict';

    // Running a test: the results of running a set of bots on a particular heuristic

    var Test = Class.extend({

        init : function(population, heuristic) {
            // console.log("Make test from heuristic: " + heuristic.name + " for " + population.length + " bots");
            this.resultsOverTime = [];

            this.population = population;
            this.heuristic = heuristic;
            this.currentIndex = 0;
            this.className = "Test";
            for (var i = 0; i < this.population.length; i++) {
                this.resultsOverTime[i] = [];
            }
        },

        evaluate : function(time) {
            this.currentIndex++;
            for (var i = 0; i < this.population.length; i++) {
                var v = this.heuristic.evaluate(this.population[i], time);
                this.resultsOverTime[i][this.currentIndex] = v;
            }
        },

        getCurrentScores : function() {
            var i = this.currentIndex;
            return this.resultsOverTime.map(function(array) {
                return array[i];
            });
        },

        getScore : function(individual, step) {
            return this.resultsOverTime[individual][step];
        },

        calculateFinalScores : function() {
            var finalScores = [];
            for (var i = 0; i < this.population.length; i++) {
                var total = 0;
                for (var j = 0; j < this.currentIndex; j++) {
                    //  this.resultsOverTime[i][this.currentIndex] = v;
                    if(this.resultsOverTime[i][j]) {
                        total += this.resultsOverTime[i][j];
                    }
                }
                finalScores[i] = total;
            }
            //console.log("finalScores:", finalScores);
            return finalScores;
        },

        // Return a sorted list of bots
        getWinners : function() {
            // Sort by
            function compare(a, b) {
                return a.score < b.score;
            }

            var values = this.calculateFinalScores();
            var winners = this.population.map(function(bot, index) {
                return {
                    bot : bot,
                    score : values[index],
                };
            });

            winners.sort(compare);
            for (var i = 0; i < winners.length; i++) {
                console.log(i + ": " + winners[i].score + " " + winners[i].bot.name);

            }
            return winners;

        },

        //====================================================================
        // output

        scoresToString : function() {
            var s = this.heuristic.name + ": " + this.currentIndex + "<br>";
            var scores = this.getCurrentScores();

            if (scores) {
                for (var i = 0; i < this.population.length; i++) {
                    var v = scores[i];
                    if (v !== undefined)
                        v = v.toFixed(2);
                    s += this.population[i] + ": " + v + "<br>";
                }
            }

            return s;
        }
    });

    return Test;

});
