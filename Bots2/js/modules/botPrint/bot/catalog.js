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
        color : {
            red : {
                name : "red",
                h : 0.5615166423,
                s : 0.1530200300,
                b : 0.2689264271
            },
            blue : {
                name : "blue",
                h : 0.8676330596,
                s : 0.6865857395,
                b : 0.5286830436
            },
            green : {
                name : "green",
                h : 0.0534922390,
                s : 0.1723305313,
                b : 0.4895575812
            },
            black : {
                name : "black",
                h : 0.3584363914,
                s : 0.4026284323,
                b : 0.1410467357
            },
            white : {
                name : "white",
                h : 0.7412582153,
                s : 0.5091647079,
                b : 0.3237214961
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
                        return new attachments.Actuator.LED(parent);
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
    var allColor = [];
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
    
    for (var key in catalog.color) {
        if (catalog.color.hasOwnProperty(key)) {
            var p = catalog.color[key];
            catalogByName[key] = p;
            allColor.push(p);
        }
    }

    return {
        allParts : allParts,

        allChassis : allChassis,
        
        allColor : allColor,

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
