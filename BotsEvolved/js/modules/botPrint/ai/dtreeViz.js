/**
 * @author Kate Compton
 */

define(["d3"], function(_d3) {

    var DTreeViz = Class.extend({
        init : function() {
        },

        updateText : function() {
            var node = this.svg.selectAll(".node").attr("class", function(d) {
                if (d.active)
                    return "node active";
                return "node";
            });

        },

        setTree : function(tree) {

            $("#ai_overlay").html(tree.mutLog);
            var width = 400, height = 400;

            this.cluster = d3.layout.cluster().size([height, width - 190]);

            // Convert
            this.diagonal = d3.svg.diagonal().projection(function(d) {
                return [d.y, d.x];
            });

            this.svg = d3.select("#ai_overlay").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(40,0)");

            var nodes = this.cluster.nodes(tree);
            var links = this.cluster.links(nodes);

            var link = this.svg.selectAll(".link").data(links).enter().append("path").attr("class", function(d) {
                var linkStyle = "link_false";
                if (d.target.choice)
                    linkStyle = "link_true";

                return "link " + linkStyle;
            }).attr("d", this.diagonal);

            var node = this.svg.selectAll(".node").data(nodes).enter().append("g").attr("class", "node").attr("id", function(d) {
                // Set the id to the node's id
                return "node" + d.idNumber;

            }).attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            // Add a circle to all the nodes
            node.append("circle").attr("r", 4.5);

            // Adding text to the node?
            node.append("text").attr("dx", function(d) {
                return d.children ? -8 : 8;
            }).attr("dy", 3).style("text-anchor", function(d) {
                return d.children ? "end" : "start";
            }).text(function(d) {
                return d.toString();
            });

        }
    });

    return DTreeViz;
});
