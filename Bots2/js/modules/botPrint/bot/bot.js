/**
 * This is the core class of what a bot is.  Handles bot DNA, the bot chassis, which parts are attached to the bot, etc.
 *  
 * @author Kate Compton
 */

define(["common", "graph", "./chassis/chassis", "three", "./dna", "./catalog", "./wiring"], function(common, graph, Chassis, THREE, DNA, catalog, Wiring) {'use strict';

    var animals = "okapi pheasant cobra amoeba capybara kangaroo chicken rooster boa-constrictor nematode sheep otter quail goat agoutis zebra giraffe yak corgi pomeranian rhinocerous skunk dolphin whale duck bullfrog okapi sloth monkey orangutan grizzly-bear moose elk dikdik ibis stork robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum camel dromedary pigeon squirrel hamster leopard panda boar squid parakeet crocodile flamingo terrier cat wallaby wombat koala orangutan bonobo lion salamander".split(" ");

    var adjectives = "rampaging flying sky flanged robotic vigilant happy sorrowful sinister willful brave wild lovely endless red silver blue obsidian black ivory steel striped iron orange cobalt golden copper ruby emerald purple violet sincere sleeping radioactive rad".split(" ");
    var makeBotName = function() {
        return "The " + utilities.capitaliseFirstLetter(utilities.getRandom(adjectives)) + " " + utilities.capitaliseFirstLetter(utilities.getRandom(animals));
    };

    var botCount = 0;

    var Bot = Class.extend({
        init : function(parent, mutationLevel) {
        	var bot = this;
        	
            this.idNumber = botCount;
            botCount++;
            this.className = "Bot";
            this.childCount = 0;

            this.name = makeBotName();
            this.transform = new common.Transform();
            this.lastTransform = new common.Transform();

            //keeps track of the amount of times this bot has collided.
            this.amountOfCollisions = 0;

            this.setMainChassis(new Chassis(this, undefined));
            
            this.wiring = [];

			//create core components.  Based on an ofset from the centroid of the chassis.
            var batteryPack = catalog.createPart("batteryPack");
            var microprocessor = catalog.createPart("microprocessor");
            this.microWiringTarget = microprocessor;
           	var batteryPackOffset = new common.Transform();
           	batteryPackOffset.x = 10;
           	batteryPackOffset.y = 10;
           	var microprocessorOffset = new common.Transform();
           	microprocessorOffset.x = -10;
           	microprocessorOffset.y = -10;
            this.addPart(microprocessor, microprocessorOffset);
            this.addPart(batteryPack, batteryPackOffset);
            
            for (var i = 0; i < 2; i++) {
                var part = catalog.createPart();
                //The position should be set intelligently later on
                var edge, pct, offset, thetaOffset;
                edge = utilities.getRandom(this.mainChassis.path.edges);
                pct = .5;
                offset = 0;
                thetaOffset = 0;
                var p = new graph.Position(edge, pct, offset, thetaOffset);
                this.addPart(part, p);
            }
            
            // Create DNA for the bot
            if (parent) {
                this.parent = parent;
                this.parent.childCount++;
                this.generation = parent.generation + 1;
                this.setFromDNA(parent.dna.createMutant(mutationLevel));
            } else {
                this.generation = 0;
                this.setFromDNA(new DNA());
            }

            this.testPoints = [];
        },

        setFromDNA : function(dna) {
            this.dna = dna;
            var colorGene = this.dna.getData("color");
            this.idColor = new common.KColor(colorGene[0], colorGene[1] * .4 + .6, colorGene[2]);

            this.mainChassis.setFromDNA(this.dna);

        },
        
        setColorDNA : function() {
            this.dna.getData("color")[0] = this.idColor.h;
            this.dna.getData("color")[1] = (this.idColor.s - .6) * 2.5;
            this.dna.getData("color")[2] = this.idColor.b;
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Heredity

        createChild : function(instructions) {
            var child = new Bot(this, instructions.mutationLevel);
            return child;
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Interaciton

        addPart : function(part, position) {
        	
            this.mainChassis.attachPartAt(part, position);
            
            if(part.type !== "Microprocessor"){
            	//and wire it.
            	//now that we have the components, we can generate wires.
            	//get the microprocessor's pins..
            	var mPositivePin;
            	var mNegativePin;
            	var pPositivePin;
            	var pNegativePin;
            
            	this.microWiringTarget.pins.forEach(function(pin){
            		if(pin.positive){
            			mPositivePin = pin;
            		}else{
            			mNegativePin = pin;
            		}
            	});
            
            	part.pins.forEach(function(pin){
            		if(pin.positive){
            			pPositivePin = pin;
            		}else{
            			pNegativePin = pin;
            		}
            	});
            	
            	//Wire these suckers to the microprocessor
            	this.wiring.push(new Wiring.Wire(pPositivePin, mPositivePin));
            	this.wiring.push(new Wiring.Wire(pNegativePin, mNegativePin));	
            }
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Selection

        select : function() {
            this.selected = true;
        },
        deselect : function() {
            this.selected = false;
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Transformation

        getBot : function() {
            return this;
        },

        // Transform this bot-local position to a global one
        transformToGlobal : function(local, global) {
            this.transform.toWorld(local, global);
        },
        setMainChassis : function(chassis) {
            this.mainChassis = chassis;
        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame

        getHull : function() {
            return this.mainChassis.path.getHull();
        },

        update : function(time) {
            this.mainChassis.update(time);
			
            this.angularVelocity = (this.transform.rotation - this.lastTransform.rotation) / time.ellapsed;

            this.lastTransform.setToTransform(this.transform);
            
            //update wiring
            //this.wiring.forEach(function(wire){
            	//wire.update();
            //});

        },

        render : function(context) {
            var g = context.g;
            g.pushMatrix();
            
            if (!context.centerBot)
                this.transform.applyTransform(g);

            context.useChassisCurves = true;
            this.mainChassis.render(context);

            for (var i = 0; i < this.testPoints.length; i++) {
                g.fill(.9, 1, 1);
                g.stroke(.9, .2, 1);
                g.strokeWeight(2);
                this.testPoints[i].drawCircle(g, 10);
            }

            // Non rotated
            if (context.drawNames) {
                g.rotate(-this.transform.rotation);
                g.text(this.name, 10, 10);
            }
            
            this.wiring.forEach(function(wire){
            	wire.render(context);
            });

            g.popMatrix();

            // draw globally positioned stuff
            if (context.drawForces)
                this.mainChassis.drawForces(context);

        },

        getForces : function() {
            return this.mainChassis.compileForces();
        },

        //=======================================================
        // Interactions

        getDistanceTo : function(p) {
            // Hacky and incorrect, will do for now
            return p.getDistanceTo(this.transform);
        },

        getClosestEdgePosition : function(target) {
            this.testPoints = [];
            this.testPoints.push(target);

            var path = this.mainChassis.path;
            //    var found = path.getClosestEdgePosition(query.screenPos, 99);
            //  path.compileAllEdgePositions(query.screenPos, this.testPoints);
            var found = path.getClosestEdgePosition(target, 100, true);
            if (found)
                this.testPoints.push(found);
            return found;
        },

        clearTestPoints : function() {
            this.testPoints = [];
        },

        //Finds the closest 'touchable' to the query
        getTouchableAt : function(query) {
            if (query.not === this)
                return undefined;

            if (query.searchChassis)
                return this.mainChassis.getTouchableAt(query);

            if (query.searchBots) {
                // localize the position
                var localQuery = new Vector();
                this.transform.toLocal(query.screenPos, localQuery);

                return {
                    obj : this,
                    dist : localQuery.magnitude(),
                };
            }
        },

        onTouchEnter : function() {
            console.log("Enter " + this);
        },

        onTouchExit : function() {
            console.log("Enter " + this);
        },

        onDrag : function(touch, overObj) {
            console.log("Drag " + this + " over " + overObj);
            this.transform.setTo(touch.screenPos);
        },

        onDrop : function(touch, overObj) {
            console.log("Drop " + this + " onto " + overObj);

            if (overObj.addBot) {
                overObj.addBot(this);
            }
            //  this.transform.setTo(touch.screenPos);
        },

        onClick : function(touch) {
            console.log("CLICK " + this);
        },

        onDblClick : function(touch) {
            console.log("DBLCLICK " + this);
            app.editBot(this);
        },

        //=======================================================
        //

        createThreeMesh : function() {
            this.mainChassis.path.createThreeMesh({
                rings : 3,
                capRings : 2,
                height : 18
            });
            // set up the sphere vars

            var sphereMaterial = new THREE.MeshLambertMaterial({
                color : 0xCC0000
            });
            this.mesh = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), sphereMaterial);

            this.mesh.add(this.mainChassis.path.mesh);

            return this.mesh;
        },

        incrementCollisionAmount : function() {
            this.amountOfCollisions++;
        },

        resetCollisionAmount : function() {
            this.amountofCollisions = 0;
        },

        //========================================================================
        // IO

        saveBot : function() {

            // Save just enough to reconstruct
            var saveObj = {
                dna : this.dna,
                botName : this.name,
            };

            var saveData = JSON.stringify(saveObj);
            var lastBot = localStorage.getItem("bot");
            console.log("Last bot: " + lastBot);
            localStorage.setItem("bot", saveData);
            console.log("Saving bot: " + saveData);

        },

        toDebugString : function() {
            var s = this.name;
            if (this.parent)
                s += "(" + this.generation + ", child of " + this.parent + ")";
            return s;
        },

        toString : function() {
            return this.name;
        },
    });

    return Bot;
});
