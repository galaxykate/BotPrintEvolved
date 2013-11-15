
define(["inheritance"], function(inher) {
	
	var DTree = Class.extend({
	
		condition: {
			comparator: ">",
			sensor: "",
			targetValue: 0.5
		},
		trueBranch: undefined,
		falseBranch: undefined,
		
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
			this.condition.sensor = sensor;
			this.condition.comparator = comparator;
			this.condition.targetValue = targetValue;
		},
		
		testCondition: function(sensors) {
			if (this.condition.comparator === ">") {
				if (sensors[this.condition.sensor].sense() > this.condition.targetValue) {
					return true;
				} 
			} else if (this.condition.comparator === "<") {
				if (sensors[this.condition.sensor].sense() < this.condition.targetValue) {
					return true;
				} 
			}
			console.log("nope!");
			console.log(this.condition);
			return false;
		},
		
		toGenome: function() {
			
		}
		
	});
	
	var DTreeAction = DTree.extend({

		actionDict: {},
		
		init: function(actionDict) {
			this.actionDict = actionDict;
		},
		
		// Note that sensors is not used here, but the variable is there so the function is called the same way as DTree.makeDecision (not that it matters in JS but...)
		makeDecision : function(actuators, sensors) {
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
	
	
	
	return {
		DTree: DTree,
		DTreeAction: DTreeAction
	};
})