define(["common", "./dtreeViz"], function(common, DTreeViz) {
    function testLog(s) {
        if (app.getOption("logConditionTests"))
            console.log(s);

    };

    function mutationLog(s) {
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
			if (value === undefined) {
				console.log("action.init() called with undefined value");
			}
        },

        activate : function() {
            this.actuator.actuate(this.value);
        },

        toString : function() {
			console.log("toString this.value: ", this.value);
			// console.log("toString this.value.toFixed(2): ", this.value.toFixed(2));
			// var v = this.value;
			// console.log("v", v);
			// console.log("v.toFixed(2)", v.toFixed(2));
            return "Set " + this.actuator + " to " + (this.value).toFixed(2);

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
		// This is used for visualization to just navigate the tree without taking any actions.
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
            mutationIntensity = mutationIntensity ? mutationIntensity : 1;
            //Get lookup tables for nodes in the tree
            var decisions = getNodes(this, function(tree) {
                return tree.condition !== undefined
            });
            var actions = getNodes(this, function(tree) {
                return tree.action !== undefined
            });

            //Randomly select node to mutate
            var table = Math.random() > .5 ? decisions : actions;
            var selectedNode = utilities.getRandom(table);

            //get random number
            var seed = Math.random();
            var PROB = STEP = .2;

            if (!selectedNode) {
                mutationLog("No sub-trees");
                return;
            }//If we have no children, don't mutate
            mutationLog("seed", seed);
            mutationLog("selectedNode", selectedNode);
            if (selectedNode.condition != undefined) {
                mutationLog("decision node");
                if (seed < PROB) {
                    mutationLog("(TODO) replace condition with action");
                } else if (seed < PROB + STEP) {
                    mutationLog("switch sensor");
                    selectedNode.condition.sensor = utilities.getRandomIndex(selectedNode.sensors);
                } else if (seed < PROB + 2 * STEP) {
                    mutationLog("adjust targetValue");
                    selectedNode.condition.targetValue = Math.random();
                } else if (seed < PROB + 3 * STEP) {
                    mutationLog("swap true/false branches");
                    var tmp = selectedNode.falseBranch;
                    selectedNode.setFalseBranch(selectedNode.trueBranch);
                    selectedNode.setTrueBranch(tmp);
                } else  {
                    mutationLog("switch comparator");
                    selectedNode.condition.comparator = (selectedNode.condition.comparator === '>' ? '<' : '>');
                }
            } else {
                mutationLog("action node");
                if (seed) { // < PROB + STEP) {
                    mutationLog("replace action with condition");
					selectedNode.action = undefined;
					
					var newSensor = utilities.getRandom(this.sensors);
					selectedNode.setCondition(newSensor, utilities.getRandom(comparators), Math.random());
					console.log("selectedNode: ", selectedNode);
					
					var newTrueNode = new DTree(selectedNode, this.sensors, this.actuators);
					newTrueNode.setAction(utilities.getRandom(this.actuators), Math.random());
					selectedNode.setTrueBranch(newTrueNode);
					
					var newFalseNode = new DTree(selectedNode, this.sensors, this.actuators);
					newFalseNode.setAction(utilities.getRandom(this.actuators), Math.random());
					selectedNode.setFalseBranch(newFalseNode);
										
					
					
                } else if (seed < PROB + 2 * STEP) {
                    mutationLog("randomize actuator value");
					selectedNode.action.value = Math.random();
                } else  {
                    mutationLog("randomize actuator");					
					selectedNode.action.actuator = utilities.getRandom(this.actuators);
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
                newTree.setAction(this.action.actuator, this.action.value);
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
