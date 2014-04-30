/**
 * @author Kate Compton
 */

define(["./attachment/attachments"], function(attachments) {'use strict';
    // Attachments and their costs
    var catalog = {
        chassis : {
            radial : {
                name : "radial"
            },

            serpent : {
                name : "serpent"
            }
        },
        
        parts : {
            actuators : {
                wheel : {
                    name : "Wheel",
                    cost : 8,
                    createPart : function() {
                        return new attachments.Actuator.Wheel();
                    }
                },
                LED : {
                    name : "LED",
                    cost : 3,
                    createPart : function() {
                        return new attachments.Actuator.Jet();
                    }
                },

                rgbLED : {
                    name : "RBG LED",
                    cost : 5,
                    createPart : function() {
                        return new attachments.Actuator.Jet();
                    }
                }
            },

            sensors : {
                distance : {
                    name : "Range sensor",
                    cost : 9,
                    createPart : function() {
                        return new attachments.Actuator.Jet();
                    }
                },

                light : {
                    name : "Light sensor",
                    cost : 3,
                    createPart : function() {
                        return new attachments.Actuator.Jet();
                    }
                }
            },
            
            components : {
            	generic : {
            		name : "generic component",
            		cost : 0,
            		createPart : function () {
            			return new attachments.Component();
            		}
            	}
            }
        },

    };

    var allSensors = [];
    var allChassis = [];
    var allActuators = [];
    var allComponents = [];
    var allParts = [];
    var catalogByName = {};

    for (var key in catalog.parts.actuators) {
        if (catalog.parts.actuators.hasOwnProperty(key)) {
            var p = catalog.parts.actuators[key];
            catalogByName[key] = p;
            allActuators.push(p);
            allParts.push(p);
        }
    }

    for (var key in catalog.parts.sensors) {
        if (catalog.parts.sensors.hasOwnProperty(key)) {
            var p = catalog.parts.sensors[key];
            catalogByName[key] = p;
            allSensors.push(p);
            allParts.push(p);
        }
    }
    
    for (var key in catalog.parts.components) {
    	if (catalog.parts.components.hasOwnProperty(key)) {
    		var p = catalog.parts.components[key];
    		catalogByName[key] = p;
    		allComponents.push(p);
    		allParts.push(p);
    	}
    }

    for (var key in catalog.chassis) {
        if (catalog.chassis.hasOwnProperty(key)) {
            var p = catalog.chassis[key];
            catalogByName[key] = p;
            allChassis.push(p);
        }
    }

    return {
        allParts : allParts,

        allChassis : allChassis,

        createRandomActuator : function() {
            return utilities.getRandom(allActuators).createPart();
        },

        createRandomSensor : function() {
            return utilities.getRandom(allActuators).createPart();

        },
        
        createRandomComponent : function() {
        	return utilities.getRandom(allComponents).createPart();
        },

        createPart : function(id) {
            if (id === undefined)
                return utilities.getRandom(allParts).createPart();

            if (isNaN(id))
                return catalogByName[id].createPart();
            else
                return allParts[id].createPart();

        },

        createChassis : function(id) {
            if (id === undefined)
                return utilities.getRandom(allChassis).create();
            if (isNaN(id))
                return chassisByName[id].create();
            else
                return allChassis[id].create();

        }
    };

});
