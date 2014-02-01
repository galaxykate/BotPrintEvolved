/**
 * The entry point to the application.
 * @author Kate Compton
 */

var app;
define(["ui", "common"], function(UI, common) {

    /**
     * @class Time
     */
    var Time = Class.extend({
        /**
         * @constructor
         * @param {String} name
         */
        init : function(name) {
            this.name = name;
            this.ellapsed = 0;
            this.total = 0;
            this.timespans = new common.TimeSpan.Manager();

        },

        /**
         * @method addElapsed
         * @param {Number} t The amount of time to be added
         */

        addElapsed : function(t) {
            this.ellapsed = t;
            this.total += t;
        },

        /**
         * @method updateTime
         * @param {Number} t
         */
        updateTime : function(t) {

            this.ellapsed = t - this.total;
            this.total = t;
        },

        /**
         * @method toString
         */
        toString : function() {
            return this.name + ": " + this.total.toFixed(2) + "(" + this.ellapsed.toFixed(3) + ")";
        }
    });

    /**
     * @class App
     */
    var App = Class.extend({

        /**
         * @method init
         * @constructor
         * @param {String} name
         * @param {Object} dimensions
         *   @param {Number} dimensions.x
         *   @param {Number} dimensions.y
         */
        init : function(name, dimensions) {
            app = this;
            console.log("app", app);
            app.div = $("#app");

            app.dimensions = dimensions;

            app.worldTime = new Time("world");
            app.appTime = new Time("app");

            app.rect = new common.Rect(0, 0, app.dimensions.x, app.dimensions.y);
            app.ui = new UI({
                app : app
            });

            app.ui.addDevUI($("#dev_controls"));

            console.log(name + ": INIT UI");
            this.initUI();

            console.log(name + ": INIT CONTROLS");
            this.initControls();

            console.log(name + ": INIT MODES");
            this.initModes();

            this.touch = this.controls.touch;
            this.controls.activate();
        },

        /**
         * Set the starting time of the app
         * @method start
         */
        start : function() {

            var date = new Date();
            this.startTime = date.getTime();
            console.log(name + ": Started at " + this.startTime);

        },

        /**
         * @method changeMode
         * @param modeName {String}
         */
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

        /**
         * @method getPositionRelativeTo
         * @param div
         * @param {Object} pos
         *   @param {Number} pos.x
         *   @param {Number} pos.y
         * @return {Vector}
         */
        getPositionRelativeTo : function(div, pos) {
            var v = new Vector(pos.x - div.offset().left, pos.y - div.offset().top);
            return v;
        },

        //========================================
        // Make a shortcut for outputs


        /**
         * Logs to the UI logger, not the console
         * @method log
         * @param line
         */
        log : function(line) {
            app.ui.output.log(line);
        },

        /**
         * Logs when things move in the UI
         * @method moveLog
         * @param line
         */
        moveLog : function(line) {
            app.ui.moveOutput.log(line);
        },

        /**
         * Logs mode changes
         * @method modeLog
         * @param line
         */
        modeLog : function(line) {
            app.ui.modeOutput.log(line);
        },

        //========================================
        //  Option/tuning value accessors
        /**
         * @method getOption
         * @param key
         * @return Returns the option, or false if undefined
         */
        getOption : function(key) {
            if (app.ui.options[key] !== undefined)
                return app.ui.options[key].value;
            return false;
        },

        /**
         * @method getTuningValue
         * @param key
         * @return Returns the tuning value or 0 if undefined
         */
        getTuningValue : function(key) {
            if (app.ui.tuningValues[key]) {
                return app.ui.tuningValues[key].value;
            }
            return 0;
        },
        //========================================
        // time

    });

    return App;
});
