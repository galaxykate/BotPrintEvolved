/**
 * @author Kate Compton
 */

define(["common"], function(common) {
    var nodeCount = 0;

    /**
     * @class Tree
     */
    var Tree = Class.extend({
        /**
         * @method init
         */
        init : function() {
            // Set the depth if there's a parent
            this.depth = 0;

            this.idNumber = nodeCount;
            this.children = [];
            nodeCount++;
        },

        /**
         * @method compileNodes
         * @param {Array} list
         * @param {Function} query
         * @return Pushes all nodes that return true to the query onto the list.
         */
        compileNodes : function(list, query) {

            if (query(this))
                list.push(this);
            if (this.children) {
                $.each(this.children, function(index, child) {
                    child.compileNodes(list, query);
                });
            }
        },

        /**
         * Severs all children from the tree, sets this.children to []
         * @method removeChildren
         */
        removeChildren : function() {
            $.each(this.children, function(index, child) {
                child.removeParent();
            });
            this.children = [];
        },

        /**
         * Severs the node from the tree.
         * @method removeParent
         */
        removeParent : function() {
            this.parent = undefined;
            this.depth = 0;
        },

        /**
         * @method setParent
         * @param {Tree} parent
         */
        setParent : function(parent) {

            this.parent = parent;
            this.depth = this.parent !== undefined ? this.parent.depth + 1 : 0;

            // this NEEDS TO HAVE CHILDREN DEFINED
            if (this.parent) {
                if (this.parent.children === undefined)
                    this.parent.children = [];

                this.parent.children.push(this);
            }
        },

        /**
         * @method getChildren
         * @return {Array} children
         */
        getChildren : function() {
            return this.children;
        },

        /**
         * @method debugPrint
         */
        debugPrint : function() {
            var spacer = "";
            for (var i = 0; i < this.depth; i++) {
                spacer += "   ";
            }
            console.log(spacer + this);

            var children = this.getChildren();
            if (children !== undefined) {
                $.each(children, function(index, node) {
                    node.debugPrint();
                });
            }
        },

        /**
         * @method reduceDown
         * @param {Function} f
         * @param base
         */
        reduceDown : function(f, base) {
            console.log(this.depth + " Reduce down " + this);
            base = f(base, this);

            if (this.children !== undefined) {
                $.each(this.children, function(index, node) {
                    base = node.reduceDown(f, base);
                });
            }

            return base;
        },

        /**
         * @method toString
         */
        toString : function() {
            return "Node" + this.idNumber;
        },

        /**
         * @method generateTree
         * @param initNode
         */
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
