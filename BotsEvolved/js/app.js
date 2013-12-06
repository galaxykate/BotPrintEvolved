/**
 * @author Kate Compton
 */

var app;
define(["ui", "common"], function(UI, common) {
    var App = Class.extend({

        init : function(name, dimensions) {
            app = this;
            console.log("app", app);
            app.div = $("#app");

            app.dimensions = dimensions;
            app.time = {
                worldTime : 0,
                appTime : 0,
                ellapsed : 0
            };

            app.rect = new common.Rect(0, 0, app.dimensions.x, app.dimensions.y);
            app.ui = new UI({
                app : app
            });

            app.ui.addDevUI($("#dev_controls"));

            app.timespans = new common.TimeSpan.Manager();
            console.log(name + ": INIT UI");
            this.initUI();

            console.log(name + ": INIT CONTROLS");
            this.initControls();

            console.log(name + ": INIT MODES");
            this.initModes();

            this.touch = this.controls.touch;
            this.controls.activate();
        },

        start : function() {

            // Set the starting time of the app
            var date = new Date();
            this.startTime = date.getTime();
            console.log(name + ": Started at " + this.startTime);

        },

        changeMode : function(modeName) {
            console.log("MODE: Change to " + modeName);
            var next = this.modes[modeName];
            if (this.mode !== next) {

                if (this.mode !== undefined)
                    this.mode.deactivate();

                this.mode = next;
                this.mode.activate();

                if (this.mode.controls !== undefined) {
                    this.controls.setActiveControls(this.mode.controls);
                }
            }
        },

        initModes : function() {

        },

        initControls : function() {
        },

        initUI : function() {

        },

        getPositionRelativeTo : function(div, pos) {
            var v = new Vector(pos.x - div.offset().left, pos.y - div.offset().top);
            return v;
        },

        //========================================
        // Make a shortcut for outputs

        log : function(line) {
            app.ui.output.log(line);
        },

        moveLog : function(line) {
            app.ui.moveOutput.log(line);
        },

        modeLog : function(line) {
            app.ui.modeOutput.log(line);
        },

        //========================================
        // option/tuning value accessors
        getOption : function(key) {
            return app.ui.options[key].value;
        },

        getTuningValue : function(key) {
            return app.ui.tuningValues[key].value;
        },

        //========================================
        // time

        updateWorld : function(t) {

            this.time.ellapsed = t - this.time.worldTime;
            this.time.worldTime = t;
            app.log("Time: ");
            app.log("  world: " + this.time.worldTime.toFixed(2));
            app.log("  ellapsed: " + this.time.ellapsed.toFixed(2));
            app.log("  FPS: " + (1 / this.time.ellapsed).toFixed(2));

            app.timespans.update(this.time.ellapsed);
        },

        getAppTime : function() {
            this.setAppTime();
            return this.time.appTime;
        },

        setAppTime : function() {
            var date = new Date();
            var time = date.getTime() - this.startTime;
            this.time.appTime = time;
        },
    });

    return App;
});
