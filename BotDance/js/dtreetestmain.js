/**
 * @author Kate Compton
 */



require.config({
    paths : {
		'dTree' : 'modules/dtree/dtree',
		// 'common' : 'modules/common/common',
		'inheritance' : 'libs/inheritance',
    },
    shim : {

        'dTree' : {
            exports : 'DTree'
        },
        'inheritance' : {
            exports : 'Inheritance'
        }

    }
});

require(["dTree"], function(dTree) {

	var actuate = function(val) { console.log("Actuating at ", val); };
	var actuators = [
		{ actuate: actuate },
		{ actuate: actuate }
	];
	var sensor1Val = 0;
	var sensor2Val = 0;
	var sensors = [
		{ sense: function() { console.log("Sensing " + sensor1Val); return sensor1Val; } },
		{ sense: function() { console.log("Sensing " + sensor2Val); return sensor2Val; } }
	];

	var topLevel = new dTree.DTree();

	var firstAction = new dTree.DTreeAction({
		0: 0.3
	});

	var secondAction = new dTree.DTreeAction({
		0: 1.0,
		1: 1.0
	});

	/* Setup a tree such that:
		if sensor 0 > .4 and sensor 1 < 0.25, fire actuator 0 at 0.3
		else if sensor 0 > .4, fire actuators 1 and 2 at 1.0
		else do nothing.
	*/
	var anotherTest = new dTree.DTree();
	anotherTest.setCondition(1, "<", 0.25);
	anotherTest.trueBranch = firstAction;
	anotherTest.falseBranch = secondAction;

	topLevel.setCondition(0, ">", 0.4);
	topLevel.trueBranch = anotherTest;
	topLevel.falseBranch = dTree.emptyAction;

	sensor1Val = 0.5;
	sensor2Val = 0.1;
	var result = topLevel.makeDecision(actuators, sensors);
	//console.log("Result should be fire 0 at 0.3: ", result);

	sensor1Val = 0.99;
	sensor2Val = 0.5;
	var result = topLevel.makeDecision(actuators, sensors);
	//console.log("Result should be fire 1 and 2 at 1.0: ", result);

	sensor1Val = 0.1;
	sensor2Val = 0.9;
	var result = topLevel.makeDecision(actuators, sensors);
	//console.log("Result should be to fire nothing: ", result);

  var newTree = topLevel.clone();
  console.log(newTree);
  newTree.mutate();
  console.log(newTree);
});
