/**
 * @author Kate Compton
 */

define(["common"], function(common) {
    var Graph = Class.extend({
        init : function(nodes, edges) {
            this.nodes = nodes;
            this.edges = edges;
            this.startSearch();
            this.updateCount = 0;

        },

        getNextSearchNode : function() {
            console.log("-------");
            console.log("Next");
            // Djikstras: get the shortest current path
            var f = function(node) {
                return node.djDistance;
            };
            // A* get the shortest combo of current path and h(v) estimated distance

            var min = 9999999;
            var best = undefined;

            $.each(this.openSet, function(index, node) {
                console.log(index + ": " + node);
                var val = f(node);
                if (val < min) {
                    min = val;
                    best = node;
                }
            });
            return best;
        },

        startSearch : function() {

            $.each(this.nodes, function(index, node) {
                node.djDistance = 99999;
                node.visited = false;
                node.active = false;
            });

            this.startNode = utilities.getRandom(this.nodes);
            this.startNode.djDistance = 0;
            this.openSet = [this.startNode];

            this.endNode = utilities.getRandom(this.nodes);
            this.currentNode = this.startNode;
            this.startNode.setMode(0);
            this.endNode.setMode(1);
        },

        updateSearch : function() {
            var graph = this;
            var current = this.currentNode;
            // Add all the current nodes edges
            $.each(current.paths, function(index, path) {

                var node = path.getOtherEnd(current);
                console.log(current + " " + node + " " + path);
                if (node.visited) {

                } else {
                    graph.openSet.push(node);
                    node.visited = true;
                    node.isOpen = true;
                    node.active = true;
                }

            });

            // Get the next
            var next = this.getNextSearchNode();
            this.currentNode.current = false;
            this.currentNode = next;
            this.currentNode.current = true;

        },

        update : function() {
            this.updateCount++;

            if (this.updateCount % 10000 === 0) {
                this.updateSearch();
            }
        },

        render : function(context) {
            var g = context.g;
            g.strokeWeight(2);
            g.stroke(1, 0, 1, .3);
            $.each(this.nodes, function(index, node) {
                node.render(context);
            });

            $.each(this.nodes, function(index, node) {
                node.renderAsPoint(context, 20);
            });

        },
    });

    return Graph;
});
