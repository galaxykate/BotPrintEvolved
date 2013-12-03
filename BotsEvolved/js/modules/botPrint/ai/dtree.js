define(["common", "./dtreeViz"], function(common, DTreeViz) {
    function testLog(s) {
        if (app.getOption("logConditionTests"))
            console.log(s);

    };

    function mutateLog(s) {
        if (app.getOption("logMutations"))
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
            console.log("Step");
            var nextNode = this.currentNode.getNextNode();
            this.currentNode.active = false;

            this.currentNode = nextNode;
            this.currentNode.active = true;
            this.viz.updateText();
        }
    });

    // Adding a condition class
    var Condition = Class.extend({
        init : function(sensor, comparator, targetValue) {
            this.sensor = sensor;
            this.comparator = comparator;
            this.targetValue = targetValue;
        },

        test : function() {
            return this.comparator.evaluate(this.sensor.sense(), this.targetValue);
        },

        toString : function() {
            return this.sensor + " " + this.comparator.symbol + " " + this.targetValue.toFixed(2);
        }
    });

    // Adding a condition class
    var Action = Class.extend({
        init : function(actuator, value) {
            this.actuator = actuator;
            this.value = value;
        },

        activate : function() {
            this.actuator.actuate(this.value);
        },

        toString : function() {
            return "Set " + this.actuator + " to " + this.value.toFixed(2);

        }
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

        init : function(parent, actuators, sensors) {
            this._super(parent);
            this.actuators = actuators;
            this.sensors = sensors;

            this.type = "tree";
            console.log(this);
        },

        resetActive : function() {
            this.active = false;
            console.log(this);

            var children = this.getChildren();
            if (this.children !== undefined) {
                $.each(children, function(index, child) {
                    child.resetActive();
                });
            }
        },

        // Return the node that is taken
        getNextNode : function() {
            if (this.condition !== undefined) {
                if (this.testCondition(this.sensors)) {
                    return this.trueBranch;
                } else {
                    return this.falseBranch;
                }
            }
        },

        makeDecision : function() {
            this.active = true;
            if (this.condition !== undefined) {
                if (this.condition.test()) {
                    return this.trueBranch.makeDecision();
                } else {
                    return this.falseBranch.makeDecision();
                }
            }

            if (this.action !== undefined) {
                this.action.activate();
            }
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

        setCondition : function(sensor, comparator, targetValue) {
            // inheritance.js apparently passes objects by ref instead of a deep copy, so we need to recreate condition here.
            this.condition = new Condition(sensor, comparator, targetValue);

        },

        setAction : function(actuator, value) {
            this.action = new Action(actuator, value);

        },

        mutate : function(mutationIntensity) {
            mutationIntensity ? mutationIntensity : 1;
            //Get lookup tables for nodes in the tree
            var decisions = getNodes(this, function(tree) {
                return tree.condition !== undefined
            });
            var actions = getNodes(this, function(tree) {
                return tree.condition === undefined
            });

            //Randomly select node to mutate
            var table = Math.random() > .5 ? decisions : actions;
            var currTree = utilities.getRandom(table);

            //get random number
            var seed = Math.random();
            var PROB = STEP = .2;

            if (!currTree) {
                mutationLog("No sub-trees");
                return;
            }//If we have no children, don't mutate
            mutationLog("seed", seed);
            mutationLog("currTree", currTree);
            if (currTree.condition != undefined) {
                mutationLog("decision node");
                if (seed < PROB) {
                    mutationLog("replace condition with action");
                } else if (seed < PROB + STEP) {
                    mutationLog("switch sensor");
                    currTree.condition.sensor = utilities.getRandomIndex(currTree.sensors);
                } else if (seed < PROB + 2 * STEP) {
                    mutationLog("adjust targetValue");
                    currTree.condition.targetValue = Math.random();
                } else if (seed < PROB + 3 * STEP) {
                    mutationLog("swap true/false branches");
                    var tmp = currTree.falseBranch;
                    currTree.falseBranch = currTree.trueBranch;
                    currTree.trueBranch = tmp;
                } else if (seed < PROB + 4 * STEP) {
                    mutationLog("switch comparator");
                    currTree.condition.comparator = (currTree.condition.comparator === '>' ? '<' : '>');
                }
            } else {
                mutationLog("action node");
                if (seed < PROB) {
                    if (currTree.actionDict != {}) {
                        mutationLog("switch actuator values");

                        //Not quite right..
                        //currTree.actionDict[utilities.getRandomKey(currTree.actionDict)] = currTree.actionDict[utilities.getRandomKey(actionDict)];
                    }
                } else if (seed < PROB + STEP) {
                    mutationLog("replace action with condition");
                } else if (seed < PROB + 2 * STEP) {
                    mutationLog("modify action");
                    currTree.actionDict[utilities.getRandomKey(currTree.actionDict)] = Math.random();
                } else if (seed < PROB + 3 * STEP) {
                    mutationLog("remove action");
                    delete currTree.actionDict[utilities.getRandomKey(currTree.actionDict)]
                } else if (seed < PROB + 4 * STEP) {
                    mutationLog("add action");
                    var key = utilities.getRandomKey(currTree.actuators);
                    currTree.actionDict[key] = Math.random();
                } else if (seed < PROB + 5 * STEP) {
                    mutationLog("switch actuators");
                    if (Object.keys(actionDict).length >= 2) {
                        var key1 = utilities.getRandomKey(currTree.actionDict);
                        var key2 = utilities.getRandomKey(currTree.actionDict);
                        var tmp = currTree.actionDict[key1];
                        currTree.actionDict[key1] = currtree.actionDict[key2];
                        currTree.actionDict[key2] = tmp;
                    }
                }
            }
            return this;
        },

        clone : function() {
            var newTree = new DTree(this.actuators, this.sensors);
            newTree.setCondition(this.condition.sensor, this.condition.comparator, this.condition.targetValue);
            newTree.trueBranch = this.trueBranch !== undefined ? this.trueBranch.clone() : undefined;
            newTree.falseBranch = this.falseBranch !== undefined ? this.falseBranch.clone() : undefined;
            return newTree;
        },

        toString : function() {
            if (this.condition !== undefined) {
                return this.condition.toString();
            } else if (this.action !== undefined) {
                return this.action.toString();
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

        DTreeIterator : DTreeIterator,
        comparators : comparators,
    };
})
