/**
 * @author Kate Compton
 */

define(["./attachment", "./sensor", "./actuator"], function(Attachment, Sensor, Actuator) {'use strict';
    Attachment.Sensor = Sensor;
    Attachment.Actuator = Actuator;
    return Attachment;
});
