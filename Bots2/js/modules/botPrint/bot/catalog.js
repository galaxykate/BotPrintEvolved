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
                    createPart : function(parent) {
                        return new attachments.Actuator.Wheel(parent);
                    }
                },
                LED : {
                    name : "LED",
                    cost : 3,
                    createPart : function(parent) {
                        return new attachments.Actuator.Jet(parent);
                    }
                },

                rgbLED : {
                    name : "RBG LED",
                    cost : 5,
                    createPart : function(parent) {
                        return new attachments.Actuator.Jet(parent);
                    }
                }
            },

            sensors : {
                distance : {
                    name : "Range sensor",
                    cost : 9,
                    createPart : function(parent) {
                        return new attachments.Actuator.Jet(parent);
                    }
                },

                light : {
                    name : "Light sensor",
                    cost : 3,
                    createPart : function(parent) {
                        return new attachments.Actuator.Jet(parent);
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

    return {
        allParts : allParts,

        allChassis : allChassis,

        createRandomActuator : function(parent) {
            return utilities.getRandom(allActuators).createPart(parent);
        },

        createRandomSensor : function(parent) {
            return utilities.getRandom(allActuators).createPart(parent);

        },

        createPart : function(id, parent) {
            if (id === undefined)
                return utilities.getRandom(allParts).createPart(parent);

            if (isNaN(id))
                return catalogByName[id].createPart(parent);
            else
                return allParts[id].createPart(parent);

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
