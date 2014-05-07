/**
 * @author Kate Compton
 */
define(["common", "./gene"], function(common, Gene) {'use strict';

    var GeneType = Class.extend({

        // specification is a nested javascript object

        init : function(parent, name, specification) {

            this.name = name;
            this.size = specification.size;
            this.complexity = specification.complexity;
            this.weight = 1;
            if (this.size === undefined)
                this.size = 0;
            if (this.complexity === undefined)
                this.complexity = 0;

            // Recursively go down the tree and build the gene type structure
            this.children = [];
            if (specification.children) {
                var names = Object.keys(specification.children);
                for (var i = 0; i < names.length; i++) {
                    this.children[i] = new GeneType(this, names[i], specification.children[names[i]]);
                }

            }
            console.log("created: " + this);
        },

        // Recursively build a tree from this gene
        createGene : function(root) {
            var gene = new Gene(root, this);
            console.log(gene);
            return gene;
        },

        toString : function() {
            var s = this.name;
            if (this.children.length > 0) {
                s += "[";
                for (var i = 0; i < this.children.length; i++) {
                    s += this.children[i].name;
                    if (i < this.children.length - 1)
                        s += ",";
                }
                s += "]";

            }
            return s;
        }
    });

    console.log("CREATE GENOME");
    var botGenome = new GeneType(null, "bot", {
        children : {
            brain : {

            },
            body : {
                children : {
                    name : {
                        size : 1,
                        complexity : 3
                    },
                    color : {
                        size : 1,
                        complexity : 3
                    },
                    attachments : {

                        // How many children?
                        multiple : true,

                        children : {
                            attachment : {
                                children : {
                                    pos : {
                                        size : 3,
                                        complexity : 3,
                                    },

                                    type : {
                                        size : 1,
                                        complexity : 3,
                                    }
                                },
                            }
                        }
                    }
                }
            }
        }
    });

    return {
        createDNA : function() {
            return botGenome.createGene(null);
        },
    };
});
