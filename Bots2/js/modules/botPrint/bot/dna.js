/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';
    var mutateFloat = function(v, m) {
        return utilities.constrain(v + (Math.random() - .5) * m, 0, 1);
    };

    var GeneType = Class.extend({
        init : function(name, length) {
            this.name = name;
            this.complexity = 3;
            this.length = length;
            this.className = "GeneType";
        },

        createGene : function() {
            return new Gene(this);
        },

        toString : function() {
            return "[" + this.name + " size:" + this.length + " index:" + this.index + "]";
        },
    });

    var geneBorder = 1;
    var geneSpacing = 30;
    var geneWidth = 7;
    var geneHeight = 10;

    var Gene = Class.extend({
        init : function(gene) {
            this.gene = gene;
            this.data = [];
            this.className = "Gene";
            for (var i = 0; i < this.gene.length; i++) {
                this.data[i] = [];
                for (var j = 0; j < this.gene.complexity; j++) {
                    this.data[i][j] = Math.random();
                }
            }
        },

        clone : function(original) {
            for (var i = 0; i < this.gene.length; i++) {
                for (var j = 0; j < this.gene.complexity; j++) {
                    this.data[i][j] = original.data[i][j];
                }
            }
        },

        mutate : function(amt) {
            var count = amt * this.gene.length * this.gene.complexity * .3;
            var log = "";
            for (var i = 0; i < count; i++) {
                var index0 = Math.floor(Math.random() * this.gene.length);
                var index1 = Math.floor(Math.random() * this.gene.complexity);
                var delta = (Math.random() - .5) * amt;

                this.data[index0][index1] = utilities.constrain(this.data[index0][index1] + delta, 0, 1);
                if (log.length > 0)
                    log += ", ";
                log += index0 + "," + index1 + " += " + delta.toFixed(2);
            }
            console.log("Mutate " + this.gene.name + ": " + log);
        },

        setData : function(index0, index1, data) {
            this.data[index0][index1] = data;
        },

        getData : function(index0, index1) {
            if (index0 === undefined) {
                if (this.data.length === 1)
                    index0 = 0;
                else
                    throw ("ERROR: can't get undefined index " + index0 + " from " + this.gene.name + " data of length" + this.data.length);
            }

            if (index0 >= this.data.length)
                throw ("ERROR: can't get index " + index0 + " from " + this.gene.name + " data of length" + this.data.length);

            if (index1 === undefined) {
                return this.data[index0];
            }

            if (index1 >= this.gene.complexity)
                throw ("ERROR: can't get index " + index1 + " from " + this.gene.name + " data of complexity" + this.gene.complexity);

            if (this.data[index0] === undefined) {
                console.log(this.data);
                throw ("ERROR: nonexistant index:" + index0 + "  of " + this.gene.name + "!");
            }

            return this.data[index0][index1];
        },

        getWidth : function() {
            return this.gene.length * geneWidth + geneBorder * 2;
        },
        getHeight : function() {
            return this.gene.complexity * geneHeight + geneBorder * 2;
        },

        draw : function(g) {

            g.fill(0);
            g.ellipse(0, 0, 10, 10);
            g.rect(0, 0, this.getWidth(), this.getHeight());
            g.noStroke();
            for (var i = 0; i < this.gene.length; i++) {

                for (var j = 0; j < this.gene.complexity; j++) {
                    var v = this.data[i][j];
                    g.fill(v, 1, 1);
                    g.rect(geneBorder + i * geneWidth, geneBorder + geneHeight * j, geneWidth, geneHeight);
                }
            }

            g.fill(0, 0, 0);
            g.text(this.gene.name, 0, -4);
            //   g.text(this.gene.geneComplexity, 4, 10);
        },

        dataToString : function() {
            var s = "";
            for (var i = 0; i < this.gene.length; i++) {
                s += "[";
                for (var j = 0; j < this.gene.complexity; j++) {
                    s += this.data[i][j].toFixed(2) + ", ";
                }
                s += "]";
            }
            return "[" + s + "]";
        },

        toString : function() {
            return "Gene " + this.gene + this.dataToString();
        },

        debugOutput : function() {
            console.log("Gene " + this.gene);

            for (var i = 0; i < this.gene.length; i++) {
                var s = "";
                for (var j = 0; j < this.gene.complexity; j++) {
                    if (s.length > 0)
                        s += ", ";
                    s += this.data[i][j].toFixed(2);
                }
                console.log("   " + s);

            }
        },
    });

    var geneTypes = {
        color : new GeneType("Color", 1),
        name : new GeneType("Name", 1),
        chassis : new GeneType("Chassis type", 1),
        handles : new GeneType("Handles", 10),
        parts : new GeneType("Parts", 1),
    };

    var geneNames = [];
    var index = 0;
    for (var geneName in geneTypes) {
        if (geneTypes.hasOwnProperty(geneName)) {
            geneNames[index] = geneName;
            geneTypes[geneName].index = index;
            index++;
        }
    };

    var dnaCount = 0;
    var DNA = Class.extend({

        init : function() {
            this.idNumber = dnaCount;
            dnaCount++;
            this.genes = [];
            this.className = "DNA";
            // Create copies of all the genes
            for (var i = 0; i < geneNames.length; i++) {
                var name = geneNames[i];
                var g = geneTypes[name];
                this.genes[i] = g.createGene();
            }

        },

        createMutant : function() {
            this.mutant = new DNA();
            this.mutant.clone(this);
            // Clone
            return this.mutant;
        },

        mutate : function(amt) {

            // pick how many mutations to do
            var count = utilities.constrain(Math.floor(amt * 5), 1, 10);
            for (var i = 0; i < count; i++) {
                var gene = utilities.chooseWeighted(this.genes, function(obj) {
                    return obj.gene.length;
                });
                gene.mutate(amt * .4);
                console.log("  mutate " + gene.gene);
            }
        },

        clone : function(parent) {
            for (var i = 0; i < this.genes.length; i++) {
                this.genes[i].clone(parent.genes[i]);
            }
        },

        getGene : function(name) {
            var i = geneTypes[name].index;
            return this.genes[i];
        },

        getData : function(name, index0, index1) {
            return this.getGene(name).getData(index0, index1);
        },

        setData : function(name, index0, index1, data) {
            return this.getGene(name).setData(index0, index1, data);
        },

        draw : function(g) {

            g.fill(0);
            // g.ellipse(0, 0, 40, 40);
            g.pushMatrix();
            for (var i = 0; i < this.genes.length; i++) {

                this.genes[i].draw(g);
                g.translate(this.genes[i].getWidth() + geneSpacing, 0);
            }

            g.text(this.genes.length, 0, 0);

            g.popMatrix();
            if (this.mutant) {
                g.pushMatrix();
                g.translate(0, 55);
                this.mutant.draw(g);
                g.popMatrix();
            }
        },

        debugOutput : function() {
            for (var i = 0; i < this.genes.length; i++) {
                this.genes[i].debugOutput();
            }
        },

        toString : function() {
            return "DNA" + this.idNumber;
        },
    });

    return DNA;
});
