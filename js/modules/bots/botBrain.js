/**
 * @author Kate Compton
 */

define(["common"], function(common) {

    var BotBrain = Class.extend({
        init : function(parent) {
            _.extend(this, parent.getAttachmentMap());
            this.seed = Math.floor(Math.random() * 999999);
            this.debugOutput();
        },

        makeDecision : function() {
            $.each(this.actuators, function(index, actuator) {
                var firePct = 3 * Math.sin(app.worldTime + index) - 1;
               firePct = utilities.constrain(firePct, 0, 1);
                 actuator.actuate(firePct);
            });
        },
    });

    return BotBrain;
});
