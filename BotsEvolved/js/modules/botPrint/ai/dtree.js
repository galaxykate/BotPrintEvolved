define(["common", "./dtreeViz"], function(common, DTreeViz) {
    function testLog(s) {
        if (app.getOption("logConditionTests"))
            console.log(s);

    };

    var comparators = [{
        symbol : "<",
        evaluate : function(a, b) {
            return a < b;
        }
    }, {
        symbol : ">",
        evaluate : function(a, b) {
            return a > b;
        }
    }];

    var DTreeIterator = Class.extend({
        init : function(dtree, viz) {
            var iter = this;
            this.dtree = dtree;
            this.viz = viz;
            this.currentNode = this.dtree;
            this.currentNode.active = true;
            this.viz.updateText();

        },

        test : function(speed) {
            var iter = this;
            var interval = setInterval(function() {

                if (iter.currentNode.getNextNode() !== undefined)
                    iter.step();
                else
                    clearInterval(interval);
            }, speed);
        },

        step : function() {
            var nextNode = this.currentNode.getNextNode();
            this.currentNode.active = false;

            this.currentNode = nextNode;
            this.currentNode.active = true;
            this.viz.updateText();
        }
    });

    // Adding a condition class
    var Condition = Class.extend({
        init : function(sensor, comparator, value) {
            this.sensor = sensor;
            this.comparator = comparator;
            this.value = value;
        },
        changeValue : function(delta) {
            this.value += delta;
            this.value = utilities.constrain(this.value, 0, 1);
        },

        clone : function() {
            return new Condition(this.sensor, this.comparator, this.value);
        },

        test : function() {
            return this.comparator.evaluate(this.sensor.sense(), this.value);
        },

        changeComparator : function() {
            if (this.comparator.symbol === '>')
                this.comparator = comparators[0];
            else
                this.comparator = comparators[1];
        },

        toString : function() {
            return this.sensor + " " + this.comparator.symbol + " " + this.value.toFixed(2);
        }
    });

    // Adding a condition class
    var Action = Class.extend({
        init : function(actuator, value) {
            this.actuator = actuator;
            this.value = value;
            if (value === undefined) {
                console.log("action.init() called with undefined value");
            }
        },

        changeValue : function(delta) {
            this.value += delta;
            this.value = utilities.constrain(this.value, 0, 1);
        },

        clone : function() {
            return new Action(this.actuator, this.value);
        },

        activate : function() {
            if (this.actuator !== undefined)
                this.actuator.actuate(this.value);
        },

        toString : function() {

            return "Set " + this.actuator + " to " + this.value.toFixed(2);

        },
        //         clone : function() {
        // console.log("Action.clone() called, value is ", this.value);
        //             return new Action(this.actuator, this.value);
        //         }
    });

    var DTree = common.Tree.extend({

        /*
         * Conditions take this form; targetValue is between 0-1 and sensor is an index
         condition: {
         comparator: ">",
         sensor: "0",
         targetValue: 1.0,
         },
         */

        printCondition : function() {
            return "sensor " + this.condition.sensor + " " + this.condition.comparator + " " + this.condition.targetValue;
        },

        resetActive : function() {
            this.active = false;
            if (this.children) {
                $.each(this.children, function(index, child) {
                    child.resetActive();
                });
            }
        },

        init : function(parent) {
            this._super();
            this.setParent(parent);
        },

        // Return the node that is taken
        // This is used for visualization to just navigate the tree without taking any actions.
        getNextNode : function() {

            if (this.condition !== undefined) {
                if (this.condition.test()) {
                    testLog("True branch");
                    return this.trueBranch;
                } else {
                    testLog("False branch");
                    return this.falseBranch;
                }
            }
            testLog("No Condition?");

        },

        makeDecision : function() {
            this.active = true;
            if (this.condition !== undefined) {
                testLog("Make choice");

                return this.getNextNode().makeDecision();
            }

            if (this.action !== undefined) {
                testLog("Take action", this);
                this.action.activate();
                return this.action;
            }

            console.log("NEITHER CONDITION NOR ACTION FOR", this);
        },

        // Set true and false branches (some bookkeeping needs to happen, so its better in a function)
        setFalseBranch : function(node) {
            this.falseBranch = node;
            node.choice = false;
            node.setParent(this);
        },

        setTrueBranch : function(node) {
            this.trueBranch = node;
            node.choice = true;
            node.setParent(this);
        },

        setCondition : function(condition) {
            this.action = undefined;
            this.condition = condition;
        },

        setAction : function(action) {
            this.condition = undefined;
            this.trueBranch = undefined;
            this.falseBranch = undefined;
            this.removeChildren();
            this.action = action;
        },

        // Clone the entire branch starting from here
        cloneBranch : function(parent) {
            var node = this.clone();
            node.setParent(parent);

            // Clone the subbranches, parenting is taken care of in "setFalseBranch" or "setTrueBranch"
            if (this.trueBranch !== undefined) {
                var trueBranch = this.trueBranch.cloneBranch(this);
                node.setTrueBranch(trueBranch);
            }
            if (this.falseBranch !== undefined) {
                var falseBranch = this.trueBranch.cloneBranch(this);
                node.setFalseBranch(trueBranch);
            }
            return node;
        },

        //=================================================================================
        //=================================================================================
        //=================================================================================
        // Mutations

        swapBranches : function() {
            var trBranch = this.falseBranch;
            var flBranch = this.trueBranch;
            this.removeChildren();
            this.setFalseBranch(flBranch);
            this.setTrueBranch(trBranch);
        },

        //=================================================================================
        //=================================================================================
        //=================================================================================
        //

        // just clone this node
        clone : function() {
            var node = new DTree();
            if (this.condition !== undefined) {
                node.condition = this.condition.clone();
            }
            if (this.action !== undefined) {
                node.action = this.action.clone();
            }

            return node;
        },

        toString : function() {
            var s = "(" + this.depth + ")";

            s = "(" + this.idNumber + ")";

            if (this.condition !== undefined) {
                return s + this.condition.toString();
            } else if (this.action !== undefined) {
                return s + this.action.toString();
            }
            return "Node" + this.idNumber + "(" + this.choice + ")";
        },
    });

    var getNodes = function(tree, condition) {
        if (tree === undefined) {
            return [];
        } else {
            if (condition(tree)) {
                return getNodes(tree.trueBranch, condition).concat(tree).concat(getNodes(tree.falseBranch, condition));
            } else {
                return getNodes(tree.trueBranch, condition).concat(getNodes(tree.falseBranch, condition));
            }
        }
    }

    return {
        DTreeViz : DTreeViz,
        DTree : DTree,
        Action : Action,
        Condition : Condition,
        DTreeIterator : DTreeIterator,

        comparators : comparators,
    };
})
