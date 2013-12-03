/**
 * @author Kate Compton
 */

define(["common"], function(common) {
    var nodeCount = 0;

    var Tree = Class.extend({
        init : function() {
            // Set the depth if there's a parent
            this.depth = 0;

            this.idNumber = nodeCount;
            this.children = [];
            nodeCount++;
        },

        setParent : function(parent) {

            this.parent = parent;
            this.depth = this.parent !== undefined ? this.parent.depth + 1 : 0;
            if (this.parent)
                this.parent.children.push(this);
        },

        getChildren : function() {
            return this.children;
        },

        debugPrint : function() {
            var spacer = "";
            for (var i = 0; i < this.depth; i++) {
                spacer += "   ";
            }
            console.log(spacer + this);
            var children = this.getChildren();
            $.each(children, function(index, node) {
                node.debugPrint();
            })
        },
        toString : function() {
            return "Node" + this.idNumber;
        },
        generateTree : function(initNode) {
            initNode(this);
            var children = this.getChildren();
            $.each(children, function(index, node) {
                node.generateTree(initNode);
            });
        }
    });

    return Tree;

});
