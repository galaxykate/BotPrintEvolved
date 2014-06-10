/**
 * @author Kate Compton
 */

define(["./attachment", "./sensors/sensor", "./actuators/actuator", "./actuators/jet", "./actuators/led", "./actuators/wheel", "./components/component", "./components/BatteryPack", "./components/Microprocessor"], function(Attachment, Sensor, Actuator, Jet, LED, Wheel, Component, BatteryPack, Microprocessor) {'use strict';
    Attachment.Sensor = Sensor;
    Attachment.Actuator = Actuator;
    Attachment.Component = Component;
    return Attachment;
});
