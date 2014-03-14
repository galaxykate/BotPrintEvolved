/**
 * @author Kate Compton
 */

define(["common", "mousewheel"], function(common, MOUSEWHEEL) {'use strict';
    var handlerNames = ["up", "down", "enter", "exit", "click", "dblClick", "move", "drag", "scroll", "keyPress"];
    var traceControls = false;
    var traceMovement = false;
    var getMousePosition = function(ev) {

        var x = ev.pageX;
        var y = ev.pageY;
        mousePos.setTo(x, y);
        return mousePos;
    };

    var setLocalPos = function(localPos, pagePos, div) {
        var offset = div.offset();
        localPos.setTo(pagePos.x - offset.left, pagePos.y - offset.top);
    };

    var activateDragDistance = 5;

    //======================================================================
    //======================================================================
    //======================================================================
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
    //======================================================================

    var Touchable = Class.extend({
        init : function(controls, name, selector) {

            var tw = this;

            this.name = name;
            this.selector = selector;

            var offset = this.selector.offset();
            this.rect = new common.Rect(offset.x, offset.y, this.selector.width(), this.selector.height());

            this.element = selector.get(0);
            this.controls = controls;
            this.localPos = new Vector();

            this.center = new Vector(this.selector.width() / 2, this.selector.height() / 2);

            allowHandlers(this);

            $.each(handlerNames, function(index, name) {
                var capName = name.charAt(0).toUpperCase() + name.slice(1);
                tw.on(name, function() {

                    // set the local pos from the last mouse pos
                    if (traceControls)
                        console.log(tw + ": " + name);
                });

            });

            // Record which div is being activated in the touch,
            selector.mousedown(function(event) {
                controls.isMouseDown = true;
                tw.activate();
                tw.callHandlers("down");

                return false;
            });

            selector.mouseup(function(event) {
                controls.isMouseDown = false;

                tw.callHandlers("up");
                tw.deactivate();

                return false;
            });

            selector.mouseenter(function(event) {
                tw.controls.enterTouchable(tw);
                tw.callHandlers("enter");
                return false;
            });

            selector.mouseleave(function(event) {
                tw.controls.exitTouchable(tw);
                tw.callHandlers("exit");
                return false;
            });

            selector.click(function(event) {
                tw.callHandlers("click");
                return false;
            });

            selector.dblclick(function(event) {
                tw.callHandlers("dblClick");
                return false;
            });

            selector.mousewheel(function(event, delta) {
                controls.scrollDelta = delta;
                tw.callHandlers("scroll");

                return false;
            });
        },

        updateLocalPos : function() {
            setLocalPos(this.localPos, this.controls.pagePos, this.selector);
            this.localPos.sub(this.center);
        },

        activate : function() {
            this.controls.setActiveTouchable(this);
        },

        deactivate : function() {
            this.controls.setActiveTouchable(undefined);
        },

        toString : function() {
            return this.name;
        }
    });

    var Controls = Class.extend({

        init : function(mainDiv, defaultControls) {
            var controls = this;
            this.mainDiv = mainDiv;
            // Default values:
            this.name = "Undefined control scheme";
            this.localPos = new Vector();
            this.pagePos = new Vector();

            //  if (defaultControls !== undefined)
            //    $.extend(this.defaultControls, defaultControls);

            // Keep sorted by distance?
            this.touchables = [];
            this.setMouseHandlers();
            allowHandlers(this);

            this.addHandlers(defaultControls);

            // Add some fake handers
            $.each(handlerNames, function(index, name) {
                var capName = name.charAt(0).toUpperCase() + name.slice(1);
                controls.on(name, function() {
                    if (traceControls)
                        console.log(this + ": " + name);
                });
            });

        },

        updateAllPositions : function(ev) {

            this.pagePos.setTo(ev.pageX, ev.pageY);
            if (traceMovement)
                console.log("page pos: " + this.pagePos);
            $.each(this.touchables, function(index, tw) {

                tw.updateLocalPos();
                if (traceMovement)
                    console.log("  " + tw + ": " + tw.localPos);

            });
        },

        //===============================================================
        // Manage the current touchable

        enterTouchable : function(tw) {
            this.hoveredTouchable = tw;
        },

        exitTouchable : function(tw) {
            if (this.hoveredTouchable === tw)
                this.hoveredTouchable = undefined;
        },

        addTouchable : function(name, element) {
            var t = new Touchable(this, name, element);
            this.touchables.push(t);
            return t;
        },

        setActiveTouchable : function(touchable) {
            this.activeTouchable = touchable;
        },

        clearTouchable : function() {
            if (this.activeTouchable)
                this.activeTouchable.deactivate();
            this.activeTouchable = undefined;
        },

        //============================================================================
        //============================================================================
        //============================================================================

        setMouseHandlers : function() {

            var controls = this;
            var mainDiv = this.mainDiv;

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
                      ev.preventDefault();
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

                // Is there an active window?
                var current = controls;
                if (controls.activeTouchable) {
                    current = controls.activeTouchable;
                }

                if (controls.isMouseDown) {
                    current.callHandlers("drag");
                } else {
                    current.callHandlers("move");
                }
            });

            mainDiv.mousedown(function(ev) {
                startInteraction(ev);
                controls.isMouseDown = true;
                controls.callHandlers("down");
            });

            mainDiv.mouseup(function(ev) {
                startInteraction(ev);
                controls.isMouseDown = false;
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

    return Controls;

});
