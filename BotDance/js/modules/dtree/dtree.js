
define(["inheritance"], function(inher) {
	
	var DTree = Class.extend({
	
		condition: {
			comparator: ">",
			sensor: "0",
			targetValue: 1.0,
		},
		printCondition: function() {
			return "sensor " + this.condition.sensor + " " + this.condition.comparator + " " + this.condition.targetValue;
		},
		trueBranch: emptyAction,
		falseBranch: emptyAction,
		
		init: function() {
		},
		
		makeDecision: function(actuators, sensors) {
			if (this.testCondition(sensors)) {
				return this.trueBranch.makeDecision(actuators, sensors);
			} else {
				return this.falseBranch.makeDecision(actuators, sensors);
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
		
		toGenome: function() {
			
		}
		
	});
	
	var DTreeAction = DTree.extend({

		actionDict: {},
		
		init: function(actionDict) {
			// TODO: actionDict needs to be cloned so it's not just a reference
			this.actionDict = actionDict;
		},
		
		// Note that this function will be called with a second parameter (sensors) but we can just ignore that in JS.
		makeDecision : function(actuators) {
			// Take action
			for (key in this.actionDict) {
				if (this.actionDict.hasOwnProperty(key)) {
					actuators[key].actuate(this.actionDict[key]);
				}
			}
			// return result object for debug purposes
			return this.actionDict;
		}
	});
	
	var emptyAction = new DTreeAction({});
	
	return {
		DTree: DTree,
		DTreeAction: DTreeAction,
		emptyAction: emptyAction
	};
})