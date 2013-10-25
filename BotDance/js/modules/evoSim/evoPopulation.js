/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {

    function generateGenotype(length) {
        var genes = [];
        for (var i = 0; i < length; i++) {
            genes[i] = Math.random();
        }
        return genes;
    };

    function cloneGenotype(genotype, variance) {
        var genes = [];
        for (var i = 0; i < genotype.length; i++) {
            genes[i] = genotype[i];

            // mutate rarely for low variance
            if (Math.random() * 3 > (1 - variance)) {
                genes[i] += 2 * (Math.random() - .5) * variance;
                genes[i] = utilities.constrain(genes[i], 0, 1);
            }
        }
        return genes;
    };

    function drawGenotype(g, width, height, genes) {

        var step = width / genes.length;
        g.fill(0, 0, 1);
        g.noStroke();
        g.rect(0, 0, width, height);
        for (var i = 0; i < genes.length; i++) {
            var v = genes[i];

            g.fill(v, 1, 1);
            g.rect((i) * step, height - height * v, step, height * v);
        }
    };

    //========================================================================
    //========================================================================
    //========================================================================

    // An evolutionary population, has a number of individuals
    var EvoPopulation = Class.extend({

        init : function(options) {

            // Must take an array of floats and return an object
            this.createIndividual = options.createIndividual;
            this.geneLength = 40;
            this.populationCount = 15;
            this.activePopulation = [];

            // Create the genotype pool
            this.genotypeDivPool = [];
            this.geneDivHolder = $("#gene_viz_holder");
            for (var i = 0; i < this.populationCount; i++) {

                this.genotypeDivPool[i] = this.createGenotypeDiv(i);
                this.geneDivHolder.append(this.genotypeDivPool[i]);

                // add the tiles
                botApp.addTile();
            }

            this.setGeneDivDimensions(360, 300);

        },

        forEachActive : function(fxn) {
            $.each(this.activePopulation, function(index, individual) {
                fxn(individual);
            });
        },

        setGeneDivDimensions : function(width, height) {
            var nameWidth = 150;
            var geneWidth = width - nameWidth;
            this.geneDivHolder.css({
                width : width,
                height : height,
                "background-color" : "red"
            });

            $(".gene_sequence").css({
                width : width,
                height : height / this.populationCount,
            });
            $(".gene").css({
                width : Math.round(geneWidth / this.geneLength) + "px",
            });
        },

        setDivToIndividual : function(div, individual) {
            var population = this;
            var gene = individual.genotype;
            var length = gene.length;
            div.nameDiv.html(individual.name);
            div.individual = individual;
            individual.div = div;

            for (var i = 0; i < length; i++) {
                var v = gene[i];
                var color = new KColor(v, 1, 1);
                div.genes[i].css({
                    height : Math.round(v * 100) + "%",
                    "background-color" : color.toCSS(),

                });
            }

            // If the genotype is clicked on, clone it into the population
            div.click(function() {
                population.selectIndividual(individual);
                

            })
        },

        deselectIndividual : function(individual) {
            individual.div.removeClass("selected_genotype");
            individual.selected = false;
        },

        selectIndividual : function(individual) {
            if (this.selected !== undefined) {
                this.deselectIndividual(this.selected);
            }

            this.selected = individual;
            if (this.selected) {
                individual.div.addClass("selected_genotype");
                individual.selected = true;
            }
        },

        createGenotypeDiv : function(index) {
            var holder = $("<div/>", {
                "class" : "gene_sequence",
                id : "genotype" + index,
            });

            var geneName = $("<div/>", {
                "class" : "gene_sequence_name",
            });
            var geneScore = $("<div/>", {
                "class" : "gene_sequence_score",
                html : "0pts",
            });

            holder.nameDiv = geneName;
            holder.scoreDiv = geneScore;
            holder.append(geneName);

            // Create the genes
            holder.genes = [];

            for (var i = 0; i < this.geneLength; i++) {
                var gene = $("<div/>", {
                    "class" : "gene",

                });
                var geneFill = $("<div/>", {
                    "class" : "gene_fill",

                });

                holder.genes[i] = geneFill;

                gene.append(geneFill);
                holder.append(gene);
            }

            holder.append(geneScore);

            return holder;
        },

        createPopulation : function(individual) {
            for ( i = 0; i < this.populationCount; i++) {
                if (individual !== undefined) {
                    this.activePopulation[i] = this.cloneIndividual(individual);
                } else {
                    this.activePopulation[i] = this.createRandomIndividual();
                }
            }

            // Display genotypes
            for (var i = 0; i < this.populationCount; i++) {

                var individual = this.activePopulation[i];
                var div = this.genotypeDivPool[i];
                this.setDivToIndividual(div, individual);
            }

        },

        createRandomIndividual : function() {

            var genes = generateGenotype(this.geneLength);
            return new this.createIndividual(genes);
        },

        cloneIndividual : function(individual) {

            var genes = cloneGenotype(individual.genotype, .2);
            return new this.createIndividual(genes);
        },
        //========================================================================
        draw : function(g, t) {

            var count = this.activePopulation.length;
            for ( i = 0; i < count; i++) {
                this.activePopulation[i].draw(g, t);
            }

        },

        update : function(time) {

            var count = this.activePopulation.length;
            for ( i = 0; i < count; i++) {
                this.activePopulation[i].update(time);
            }

        },

        drawGenotypes : function(g, width, height) {
            g.rectMode(g.CORNER);
            g.pushMatrix();
            var count = this.activePopulation.length;
            var step = height / count;

            for ( i = 0; i < count; i++) {
                drawGenotype(g, width, step, this.activePopulation[i].genotype);
                g.translate(0, step);
            }

            g.popMatrix();
        },
    });

    return EvoPopulation;
});
