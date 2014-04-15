/**
 * @author Kate Compton
 */

define(["./attachment/attachments"], function(attachments) {'use strict';
    // Attachments and their costs
    var catalog = {
        chassis : {
            regular : {}
        },
        parts : {
            actuators : {
                wheel : {
                    cost : 8,
                    createPart : function() {
                        return new attachments.Actuator.Wheel();
                    }
                },
                LED : {
                    cost : 3,
                    createPart : function() {
                        return new attachments.Actuator.Jet();
                    }
                },

                rgbLED : {
                    cost : 5,
                    createPart : function() {
                        return new attachments.Actuator.Jet();
                    }
                }
            },

            sensors : {
                distance : {
                    cost : 9,
                    createPart : function() {
                        return new attachments.Actuator.Jet();
                    }
                },

                light : {
                    cost : 3,
                    createPart : function() {
                        return new attachments.Actuator.Jet();
                    }
                }
            }
        },

    };

    var allSensors = [];
    var allChassis = [];
    var allActuators = [];
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

    for (var key in catalog.chassis) {
        if (catalog.chassis.hasOwnProperty(key)) {
            var p = catalog.chassis[key];
            catalogByName[key] = p;
            allChassis.push(p);
        }
    }

    console.log("AllParts: " + allParts);

    return {
        createRandomActuator : function() {
            return utilities.getRandom(allActuators).createPart();
        },

        createRandomSensor : function() {
            return utilities.getRandom(allActuators).createPart();

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
