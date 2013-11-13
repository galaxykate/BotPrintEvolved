/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {'use strict';
    var geneLength = 10;
    var generateGene = function() {
        var gene = [];
        for (var i = 0; i < geneLength; i++) {
            gene[i] = Math.random();
        }
        return gene;
    };

    // A genome has a tree structure
    var Genome = Class.extend({
        init : function(geneCount) {
            this.genes = [];
            for (var i = 0; i < geneCount; i++) {
                this.genes.push(generateGene());
            }
        },
    });

    return Genome;
});
