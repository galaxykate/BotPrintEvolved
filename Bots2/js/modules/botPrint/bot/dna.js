/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';
    var mutateFloat = function(v, m) {
        return utilities.constrain(v + (Math.random() - .5) * m, 0, 1);
    };

    var GeneType = Class.extend({
        init : function(name, length) {
            this.complexity = 3;
            this.length = length;
        },

        createGene : function() {
            return new Gene(this);
        }
    });

    var geneBorder = 2;
    var Gene = Class.extend({
        init : function(gene) {
            this.gene = gene;
            this.data = [];
            for (var i = 0; i < this.gene.length; i++) {
                this.data[i] = [];
                for (var j = 0; j < this.gene.complexity; j++) {
                    this.data[i][j] = Math.random();
                }
            }
            console.log(this.data);
        },

        clone : function(original) {

        },

        draw : function(g) {
            g.fill(0);
            g.rect(0, 0, this.gene.length * 2 * geneWidth, this.gene.geneComplexity * geneHeight);
            g.text(this.gene.name, 0, -2);
        }
    });

    var geneTypes = {
        color : new GeneType("Color", 1),
        name : new GeneType("Name", 1),
        chassis : new GeneType("Chassis type", 1),
        handles : new GeneType("Handles", 10),
        parts : new GeneType("Parts", 1),
    };

    var DNA = Class.extend({

        init : function() {
            this.genes = {};
            // Create copies of all the genes
            for (var geneName in geneTypes) {
                if (geneTypes.hasOwnProperty(geneName)) {
                    var g = geneTypes[geneName];
                    this.genes[geneName] = g.createGene();

                }
            }

            console.log(this.genes);
        },

        getData : function(name, index) {
            if (index === undefined)
                index = 0;
            return this.genes[name].data[index];
        },

        draw : function(g) {
            g.pushMatrix();
            this.genes.forEach(function(gene) {
                gene.draw(g);
            });

            g.popMatrix();
        },
    });

    return DNA;
});
