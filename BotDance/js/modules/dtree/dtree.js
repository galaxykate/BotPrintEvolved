define(["inheritance"], function(inher) {

	var DTree = Class.extend({

    /*
     * Conditions take this form; targetValue is between 0-1 and sensor is an index
        condition: {
          comparator: ">",
          sensor: "0",
          targetValue: 1.0,
        },
    */

		printCondition: function() {
			return "sensor " + this.condition.sensor + " " + this.condition.comparator + " " + this.condition.targetValue;
		},

		trueBranch: emptyAction,
		falseBranch: emptyAction,
    actuators: undefined,
    sensors: undefined,

		init: function(actuators, sensors) {
      this.actuators = actuators;
      this.sensors = sensors;
		},

		makeDecision: function() {
			if (this.testCondition(this.sensors)) {
				return this.trueBranch.makeDecision();
			} else {
				return this.falseBranch.makeDecision();
			}
		},

		setCondition: function(sensor, comparator, targetValue) {
			// inheritance.js apparently passes objects by ref instead of a deep copy, so we need to recreate condition here.
			this.condition = {};
			this.condition.sensor = sensor;
			this.condition.comparator = comparator;
			this.condition.targetValue = targetValue;
		},

		testCondition: function(sensors) {
			if (this.condition.comparator === ">") {
				if (sensors[this.condition.sensor].sense() > this.condition.targetValue) {
					console.log("condition true: ", this.printCondition());
					return true;
				}
			} else if (this.condition.comparator === "<") {
				console.log("condition true: ", this.printCondition());
				if (sensors[this.condition.sensor].sense() < this.condition.targetValue) {
					return true;
				}
			}
			console.log("condition false: ", this.printCondition());
			return false;
		},

    mutate: function(mutationIntensity) {
      mutationIntensity ? mutationIntensity : 1;
      //Get lookup tables for nodes in the tree
      var decisions = getNodes(this,
        function(tree) { return tree.condition !== undefined }
      );
      var actions = getNodes(this,
        function(tree) { return tree.condition === undefined }
      );

      //Randomly select node to mutate
      var table = Math.random() > .5 ? decisions : actions;
      var currTree = utilities.getRandom(table);

      //get random number
      var seed = Math.random();
      var PROB, STEP = .01;

      if(!currTree) { console.log("No sub-trees"); return;} //If we have no children, don't mutate
      console.log("seed", seed);
      console.log("currTree", currTree);
      if(currTree.condition != undefined) {
        console.log("decision node");

        if(seed > PROB) {
          console.log("switch comparator");

          currTree.condition.comparator = this.condition.comparator === '>' ? '<' : '>';
        } else if(seed > PROB + STEP) {
          console.log("switch sensor");

          currTree.condition.sensor = getRandomIndex(this.sensors);
        } else if(seed > PROB + STEP) {
          console.log("adjust targetValue");

          currTree.condition.targetValue = Math.random();
        } else if(seed > PROB + STEP) {
          console.log("swap true/false branches");

          var tmp = currTree.falseBranch;
          currTree.falseBranch = currTree.trueBranch;
          currTree.trueBranch = tmp;
        } else if(seed > PROB + STEP) {
          console.log("replace condition with action");
        }
      } else {
        console.log("action node");
        if(seed > PROB) {
          if(currTree.actionDict != {}) {
            console.log("switch actuator values");

            actionDict[getRandomKey(actionDict)] = this.actionDict[getRandomKey(actionDict)];
          }
        } else if(seed > PROB + STEP) {
          console.log("switch actuators");

          if(Object.keys(actionDict).length >= 2) {
            var key1 = getRandomKey(actionDict);
            var key2 = getRandomKey(actionDict);
            var tmp = actionDict[key1];
            actionDict[key1] = actionDict[key2];
            actionDict[key2] = tmp;
          }
        } else if(seed > PROB + STEP) {
          console.log("modify action");

          actionDict[getRandomKey(actionDict)] = Math.random();
        } else if(seed > PROB + STEP) {
          console.log("remove action");

          delete actionDict[getRandomKey(actionDict)]
        } else if(seed < PROB + STEP) {
          console.log("add action");

          var key = getRandomKey(this.actuators);
          actionDict[key] = Math.random();
        } else if(seed > PROB + STEP) {
          console.log("replace action with condition");
        }
      }
      return this;
    },

    clone: function() {
      var newTree = new DTree(this.actuators, this.sensors);
      newTree.setCondition(this.condition.sensor, this.condition.comparator, this.condition.targetValue);
      newTree.trueBranch = this.trueBranch !== undefined ? this.trueBranch.clone() : undefined;
      newTree.falseBranch = this.falseBranch !== undefined ? this.falseBranch.clone() : undefined;
      return newTree;
    }
	});

	var DTreeAction = DTree.extend({

		init: function(actuators, sensors, actionDict) {
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

    clone: function() {
      return new DTreeAction(this.actuators, this.sensors, this.actionDict);
    }
	});

	var emptyAction = new DTreeAction({}, {}, {});

  var getNodes = function(tree, condition) {
    if(tree === undefined) { return []; }
    else {
      if(condition(tree)) {
        return getNodes(tree.trueBranch, condition)
               .concat(tree)
               .concat(getNodes(tree.falseBranch, condition));
      } else {
        return getNodes(tree.trueBranch, condition)
               .concat(getNodes(tree.falseBranch, condition));
      }
    }
  }

	return {
		DTree: DTree,
		DTreeAction: DTreeAction,
		emptyAction: emptyAction
	};
})
