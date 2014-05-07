/**
 * @author Kate Compton
 */
var traceControls = false;
var traceMovement = false;
var traceWindows = false;

define(["common", "./touch"], function(common, Touch) {'use strict';

    var windowCount = 0;

    var activateDragDistance = 5;

    var Controls = Class.extend({

        init : function(mainDiv, defaultControls) {
            var controls = this;
			this.className = "Controls";
            this.touch = new Touch();
            app.touch = this.touch;

            this.mainDiv = mainDiv;
            // Default values:
            this.name = "Undefined control scheme";
            this.localPos = new Vector();
            this.pagePos = new Vector();

            //  if (defaultControls !== undefined)
            //    $.extend(this.defaultControls, defaultControls);

            // Keep sorted by distance?
            this.touchables = {};
            this.setMouseHandlers();
            allowHandlers(this);

            this.addHandlers(defaultControls);

            // Add some fake handers
            $.each(handlerNames, function(index, name) {
                var capName = name.charAt(0).toUpperCase() + name.slice(1);
                controls.on(name, function() {
                    if (traceControls)
                        app.log(this + ": " + name);
                });
            });

        },

        //===============================================================
        // Upgrade to touchable
        createTouchableWindow : function(div, name, world, customSettings) {
            //  var tw = new Touchable(this, div, name, world);
            var touch = this.touch;

            // Defaults
            var settings = {
                centered : true,
            };

            // Override defaults
            $.extend(settings, customSettings);

            var tw = div;
            tw.idNumber = windowCount;
            windowCount++;

            tw.css({
                "pointer-events" : "all",
            });
            tw.addClass("unselectable");
            tw.name = name;
            tw.world = world;
            tw.controls = this;
            tw.mousemove(function(e) {
                if (traceWindows)
                    console.log("Move in " + tw.name);
                touch.moveIn(tw, e);

            });

            tw.mouseenter(function(e) {
                if (traceWindows)
                    console.log("Enter " + tw.name);
                touch.enter(tw, e);
            });

            tw.mouseleave(function(e) {
                if (traceWindows)
                    console.log("Exit " + tw.name);
                touch.exit(tw, e);
            });

            tw.toString = function() {
                return tw.name + "(" + tw.idNumber + ")";
            };

            tw.center = new Vector();
            var w = app.mainCanvas.width();
            var h = app.mainCanvas.height();
            if (settings.centered) {
                tw.center.setTo(w / 2, h / 2);
            }

            this.touchables[name] = tw;
            return tw;

        },

        updateAllPositions : function(ev) {

            this.pagePos.setTo(ev.pageX, ev.pageY);
            if (traceMovement)
                console.log("page pos: " + this.pagePos);

            this.touch.setFromPage(this.pagePos);

            var offset = $("#app").offset();

            var appX = ev.pageX - offset.left;
            var appY = ev.pageY - offset.top;
            this.touch.follower.css({
                "-webkit-transform" : "translate(" + appX + "px," + appY + "px)",
            });
        },

        //============================================================================
        //============================================================================
        //============================================================================

        setMouseHandlers : function() {

            var controls = this;
            var mainDiv = this.mainDiv;
            var touch = this.touch;
            // Add all the handlers

            // Set up the mouse/touch controls
            // Note: these are for things which can't  be done with normal 'click' functions on divs
            //  such as clicking on things in Processing or ThreeJS
            //
            // Features:
            //      Click/tapping on an object
            //      Dragging on object to another
            //      Dragging from one point to another (movement in Stellar)

            function startInteraction(ev) {
                app.ui.moveOutput.clear();
                //      ev.preventDefault();
            };

            // Key handlers
            $(document).keypress(function(event) {
                var c = String.fromCharCode(event.which);
                if (c === " ")
                    c = "space";
                controls.key = c;

                console.log("Key pressed " + c);

                controls.callHandlers("keyPress");
            });

            // Activate processing-style mouse interaction
            mainDiv.mousemove(function(ev) {

                startInteraction(ev);

                controls.updateAllPositions(ev);

                if (touch.down) {
                    touch.drag();
                    controls.callHandlers("drag");
                } else {
                    touch.move();
                    controls.callHandlers("move");
                }

            });

            mainDiv.mousedown(function(ev) {
                startInteraction(ev);

                controls.callHandlers("down");
                touch.press();
            });

            mainDiv.mouseup(function(ev) {
                startInteraction(ev);
                touch.release();
                controls.callHandlers("up");
            });

            mainDiv.mouseleave(function(ev) {
                startInteraction(ev);
                controls.callHandlers("exit");
            });

            mainDiv.mouseenter(function(ev) {
                startInteraction(ev);
                controls.callHandlers("enter");
            });

            mainDiv.click(function(ev) {
                startInteraction(ev);

                controls.callHandlers("click");
            });

            mainDiv.dblclick(function(ev) {
                startInteraction(ev);

                controls.callHandlers("dblClick");
            });

            // Mousewheel zooming
            mainDiv.mousewheel(function(ev, delta) {

                startInteraction(ev);
                controls.scrollDelta = delta;

                controls.callHandlers("scroll");

            });
        },

        toString : function() {
            return "MainControls";
        }
    });

    //======================================================================
    //======================================================================
    //======================================================================

    var handlerNames = ["up", "down", "enter", "exit", "click", "dblClick", "move", "drag", "scroll", "keyPress"];
    // Handler adders
    var callHandlers = function(name) {
        if (this.handlers && this.handlers[name]) {
            var handlers = this.handlers[name];
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].call(this);
            }
        }
    };

    // Add a handler
    var on = function(name, handler) {
        if (!this.handlers)
            this.handlers = {};
        if (!this.handlers[name])
            this.handlers[name] = [];

        this.handlers[name].push(handler);
    };

    var addHandlers = function(handlers) {
        for (var property in handlers) {
            if (handlers.hasOwnProperty(property)) {
                this.on(property, handlers[property]);
            }
        }
    };

    var allowHandlers = function(obj) {
        obj.on = on;
        obj.callHandlers = callHandlers;
        obj.addHandlers = addHandlers;
    }
    return Controls;

});
