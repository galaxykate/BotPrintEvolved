/**
 * @author Kate Compton
 */

define(["./attachment", "./sensors/sensor", "./actuators/actuator", "./components/component", "./actuators/jet", "./actuators/wheel"], function(Attachment, Sensor, Actuator, Jet, Wheel) {'use strict';
    Attachment.Sensor = Sensor;
    Attachment.Actuator = Actuator;
    Attachment.Component = Component;
    return Attachment;
});
