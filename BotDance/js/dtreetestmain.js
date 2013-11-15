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

    console.log("Ready!");
	
	var actuate = function(val) { console.log("Actuating at ", val); };
	// var sense = function() { console.log("Sensing " + 0.15); return 0.15; };
	var actuators = [
		{ actuate: actuate },
		{ actuate: actuate }		
	];
	var sensors = [
		{ sense: function() { console.log("Sensing " + 0.15); return 0.15; } },
		{ sense: function() { console.log("Sensing " + 0.01); return 0.01; } }
	];
	
	var topLevel = new dTree.DTree();

	var aDTreeAction = new dTree.DTreeAction({
		0: 0.85,
		1: 0.5
	});
	
	var secondAction = new dTree.DTreeAction({
		0: 1.0,
		1: 1.0
	});
	
	var emptyAction = new dTree.DTreeAction({});

	var anotherTest = new dTree.DTree();
	anotherTest.setCondition(1, "<", 0.5);
	anotherTest.trueBranch = secondAction;
	anotherTest.falseBranch = emptyAction;

	topLevel.setCondition(0, ">", 0.25);
	topLevel.trueBranch = aDTreeAction;
	topLevel.falseBranch = anotherTest;
	
	
	var result = topLevel.makeDecision(actuators, sensors);
	console.log("Result: ", result);

});
