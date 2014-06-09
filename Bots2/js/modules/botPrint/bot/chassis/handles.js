/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';
    var types = {
        radialVertex : ["radius", "thetaOffset"],
    };

    var Setting = common.Range.extend({
        init : function(name) {
            this._super({
                min : 0,
                max : 1,
            });
            this.name = name;
        },
    });

    var handleCount = 0;
    var Handle = Vector.extend({
        init : function(type, parent) {
            this.idNumber = handleCount;
            handleCount++;
            // create
            this.type = type;
            this.parent = parent;
            this.settings = {};
            this.className = "Handle";
            var settingNames = type;
            for (var i = 0; i < settingNames.length; i++) {
                this.settings[settingNames[i]] = new Setting(name);

            }
        },

        onTouchEnter : function(touch) {
            //   console.log("touch enter " + this);
        },

        onTouchExit : function(touch) {
            //  console.log("touch exit " + this);
        },

        onDrag : function(touch, overObj) {
        },

        draw : function(context) {
            var g = context.g;
            var r = 10;
            g.fill(0);
            g.noStroke();
            if (this.isHoveredOver) {
                r = 12;
                g.fill(.7, 1, 1);

            }
            this.drawCircle(g, r);
        },

        setFromDNA : function(dna) {
            throw ("Can't set an abstract handle from DNA!");
        },

        toString : function() {
            return this.name + this.toSimpleString();
        }
    });

    var rRange = new common.Range({
        min : 30,
        max : 90,
    });

    var RadialHandle = Handle.extend({
        init : function(r, theta, parent, index) {
            this._super(types.radialVertex, parent);
            this.r = r;
            this.index = index;
            this.theta = theta;
            this.setToPolar(r, theta);
            this.z = 0;
            this.className = "RadialHandle";
            this.name = "RH" + this.idNumber;
            this.resetPos();

        },

        setFromDNA : function() {
            var dna = this.parent.getDNA();

            var rPct = dna.getData("handles", this.index, 0);
            this.r = rRange.getPctValue(rPct);
            var thetaOffset = dna.getData("handles", this.index, 1);
            this.resetPos();
        },

        setDNAFrom : function() {
            console.log("Set data from");
            var rPct = rRange.getPct(this.r);

            var dna = this.parent.getDNA();
            dna.setData("handles", this.index, 0, rPct);

        },

        onDrag : function(touch, overObj) {

            var m = touch.screenPos.magnitude();
            var pct = rRange.getPct(m);
            pct = utilities.constrain(pct, 0, 1);

            touch.follower.html("pct: " + pct.toFixed(2));
            this.r = rRange.getPctValue(pct);
            this.resetPos();
            this.parent.refresh();

            this.setDNAFrom();
        },

        onPickup : function(touch) {
            console.log("Picked up  " + this.name);
            touch.follower.html(name);
            touch.follower.show();
        },

        onDrop : function(touch, overObj) {
            console.log("Drop " + this.name + " on " + overObj);
            touch.follower.hide();

        },

        resetPos : function() {
            this.setToPolar(this.r, this.theta);
            if (!this.isValid()) {
                throw ("Invalid handle! r: " + this.r + " theta: " + this.theta);
            }
        }
    });

    Handle.RadialHandle = RadialHandle;
    return Handle;
});
