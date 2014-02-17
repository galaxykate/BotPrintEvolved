/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';
    var mutateFloat = function(v, m) {
        return utilities.constrain(v + (Math.random() - .5) * m, 0, 1);
    };

    var DNA = Class.extend({

        init : function(geneCount, geneLength) {
            this.geneCount = geneCount;
            this.geneLength = geneLength;
            this.genes = [];
            for (var i = 0; i < this.geneCount; i++) {
                this.genes[i] = [];
                for (var j = 0; j < this.geneLength; j++) {
                    this.genes[i][j] = Math.random();

                }
            }

        },

        clone : function(original) {
            for (var i = 0; i < this.geneCount; i++) {

                for (var j = 0; j < this.geneLength; j++) {
                    this.genes[i][j] = original.genes[i][j];
                }
            }
        },

        mutate : function(mutationLevel) {
            console.log("MUTATE " + mutationLevel);
            for (var i = 0; i < this.geneCount; i++) {
                var mutLevel = .2 * mutateFloat(mutationLevel, .5);
                for (var j = 0; j < this.geneLength; j++) {

                    if (Math.random() > .3)
                        this.genes[i][j] = mutateFloat(this.genes[i][j], mutLevel);
                }
            }
            this.debugOutput();
        },

        createMutant : function(mutationLevel) {
            var mutant = new DNA(this.geneCount, this.geneLength);
            mutant.clone(this);

            mutant.mutate(mutationLevel);
            return mutant;
        },

        debugOutput : function() {
            console.log("DNA");
            for (var j = 0; j < this.geneLength; j++) {
                var s = "  ";

                for (var i = 0; i < this.geneCount; i++) {
                    s += " " + this.genes[i][j].toFixed(2);
                }
                console.log(s);
            }

        },
    });

    return DNA;
});
