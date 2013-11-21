/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var EvoSim = Class.extend({

        init : function() {

        },

        // Create a population with random genomes
        createPopulation : function(count) {
            var population = [];
            for (var i = 0; i < count; i++) {
                var seed = Math.floor(Math.random() * 9999999);
                var genome = this.createGenome(seed);

                population[i] = this.createIndividualFromGenome(genome);
            }
            return population;
        },

        setScores : function(callback) {
            callback();
        },

        // Must return some genome
        createGenome : function(seed) {

        },
        cloneGenome : function(genome) {

        },

        // Change
        mutateGenome : function(mutationAmt) {

        },

        createIndividualFromGenome : function(genome) {

        }
    });

    return EvoSim;
});
