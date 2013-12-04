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

		// mutationIntensity should be between 1 (maximum mutation) and 0.
        mutate : function(mutationIntensity) {
            mutationIntensity = mutationIntensity ? mutationIntensity : 1;
			
			// Offsets a value up or down randomly, scaled by the intensity.
			var getWeightedOffset = function(val, intensity) {
				var scaledRandom = (Math.random() * intensity) - (0.5 * intensity);
				val += scaledRandom;
				// Normalize
				if (val > 1) val = 1;
				if (val < 0) val = 0;
				return val;
			}
			
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

			// We classify some mutations as major. Major changes are less likely the lower the mutationIntensity.
			var majorChange = ( Math.random() < mutationIntensity*0.5 );

            //get random number
            var seed = Math.random();
            var PROB = STEP = .2;

            if (!selectedNode) {
                mutationLog("No sub-trees");
                return;
            }//If we have no children, don't mutate
            mutationLog("seed", seed);
            mutationLog("selectedNode", selectedNode);
			
			// If we selected a condition
            if (selectedNode.condition != undefined) {
                mutationLog("decision node");
				if (majorChange) {
	                if (seed < .33) {
	                    mutationLog("replace condition with action");
						selectedNode.condition = undefined;
						selectedNode.setAction(utilities.getRandom(this.actuators), Math.random());
	                } else if (seed < .66) {
	                    mutationLog("swap true/false branches");
	                    var tmp = selectedNode.falseBranch;
	                    selectedNode.setFalseBranch(selectedNode.trueBranch);
	                    selectedNode.setTrueBranch(tmp);
	                } else {
	                    mutationLog("switch sensor");
	                    selectedNode.condition.sensor = utilities.getRandomIndex(selectedNode.sensors);
					}
				} else { // minor change
	                if (seed < .5) {
	                    mutationLog("adjust targetValue");
						/* vary based on mutation strength */
						var newVal = getWeightedOffset(selectedNode.condition.targetValue, mutationIntensity)
	                    selectedNode.condition.targetValue = newVal;
	                } else {
	                    mutationLog("switch comparator");
	                    selectedNode.condition.comparator = (selectedNode.condition.comparator === '>' ? '<' : '>');
	                }
				}
			// If we selected an action
            } else {
                mutationLog("action node");
				if (majorChange) {
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
				} else { // minor change
					if (seed < .5) {
	                    mutationLog("randomize actuator value");
						/* vary based on mutation strength */
						var newVal = getWeightedOffset(selectedNode.action.value, mutationIntensity)
						selectedNode.action.value = newVal;
	                } else  {
	                    mutationLog("randomize actuator");					
						selectedNode.action.actuator = utilities.getRandom(this.actuators);
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
