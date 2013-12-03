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

        toString : function() {
            return this.sensor + " " + this.comparator.symbol + " " + this.targetValue.toFixed(2);
        }
    });

    // Adding an class
    var Action = Class.extend({
        init : function(actuator, value) {
            this.actuator = actuator;
            this.value = value;
        },

        toString : function() {
            return "Set " + this.actuator + " to " + this.value.toFixed(2);

        },

        clone : function() {
            return new Action(this.actuator, this.value);
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

        trueBranch : emptyAction,
        falseBranch : emptyAction,
        actuators : undefined,
        sensors : undefined,

        init : function(parent, actuators, sensors) {
            this._super(parent);
            this.actuators = actuators;
            this.sensors = sensors;
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
            if (this.condition) {
                if (this.testCondition(this.sensors)) {
                    return this.trueBranch.makeDecision();
                } else {
                    return this.falseBranch.makeDecision();
                }
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

        testCondition : function(sensors) {
            if (this.condition.comparator === ">") {
                if (sensors[this.condition.sensor].sense() > this.condition.targetValue) {
                    testLog("condition true: ", this.printCondition());
                    return true;
                }
            } else if (this.condition.comparator === "<") {
                testLog("condition true: ", this.printCondition());
                if (sensors[this.condition.sensor].sense() < this.condition.targetValue) {
                    return true;
                }
            }
            testLog("condition false: ", this.printCondition());
            return false;
        },

        mutate : function(mutationIntensity) {
            mutationIntensity = mutationIntensity ? mutationIntensity : 1;
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

        clone : function(parent) {
            var newTree = new DTree(parent, this.actuators, this.sensors);
            if (this.condition !== undefined) {
                newTree.setCondition(this.condition.sensor, this.condition.comparator, this.condition.targetValue);
            }
            if (this.action !== undefined) {
                newTree.setAction(this.action.clone());
            }
            if (this.trueBranch !== undefined) {
                newTree.setTrueBranch(this.trueBranch.clone(this));
            }
            if (this.falseBranch  !== undefined) {
                newTree.setFalseBranch(this.falseBranch.clone(this));
            }
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

    // Terminal nodes for the decision tree

    var DTreeAction = DTree.extend({

        init : function(actuators, sensors, actionDict) {
            this._super(actuators, sensors);
            this.actionDict = {};
            this.actionDict = actionDict;
        },

        makeDecision : function() {
            // Take action
            for (key in this.actionDict) {
                if (this.actionDict.hasOwnProperty(key)) {
                    this.actuators[key].actuate(this.actionDict[key]);
                }
            }
            // return result object for debug purposes
            return this.actionDict;
        },

        clone : function() {
            return new DTreeAction(this.actuators, this.sensors, this.actionDict);
        },
    });

    var emptyAction = new DTreeAction({}, {}, {});

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
        DTreeAction : DTreeAction,
        DTreeIterator : DTreeIterator,
        emptyAction : emptyAction,
        comparators : comparators,
    };
})
