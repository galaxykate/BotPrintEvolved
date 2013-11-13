/**
 * @author Kate Compton
 */

define(["common", "mousewheel"], function(COMMON, MOUSEWHEEL) {'use strict';
    var activateDragDistance = 5;

    var Controls = Class.extend({

        init : function(context) {
            // Default values:
            this.name = "Undefined control scheme";
            this.onKeyPress = {

            };

            this.onMove = function(touch) {

            };
            this.onDrag = function(touch) {

            };
            this.onHold = function(touch) {

            };

            this.onPress = function(touch) {

            };

            this.onRelease = function(touch) {

            };
            this.onTap = function(touch) {

            };

            this.onMouseWheel = function(delta) {

            };

            // Overlay with custom context
            $.extend(this, context);

            this.touch = {
                pos : new Vector(),

                lastMove : {
                    pos : new Vector(),
                    time : 0,
                },
                lastDown : {
                    pos : new Vector(),
                    time : 0,
                },
                lastUp : {
                    pos : new Vector(),
                    time : 0,
                },

                down : false,
                dragging : false,

                velocity : new Vector(),
                offset : new Vector(),
                dragOffset : new Vector(),
                draggedDistance : 0,
            };

            // Keep sorted by distance?
            this.touchedObjects = [];
            this.heldObject = undefined;
            this.selecteObjects = [];

        },

        touchDown : function(position) {

            var controls = this;
            var touch = this.touch;
            touch.lastDown.pos.setTo(position);
            touch.lastDown.time = app.getTime();
            touch.down = true;
            touch.dragging = false;
            touch.draggedDistance = 0;
            controls.onPress(touch);
        },

        touchUp : function(position) {

            var controls = this;
            var touch = this.touch;
            touch.lastUp.pos.setTo(position);
            touch.lastUp.time = app.getTime();
            touch.down = false;
            touch.dragging = false;

            var timeDown = touch.lastUp.time - touch.lastDown.time;
            console.log("Time down: " + touch.lastUp.time + " " + touch.lastDown.time);

            if (timeDown < 200 && touch.draggedDistance < 10) {
                console.log("Tap");
                controls.onTap(touch);
            }

            touch.draggedDistance = 0;
            controls.onRelease(touch);

        },

        // drag or move (the same if using touchscreen)
        touchMove : function(position) {

            var controls = this;
            var touch = this.touch;
            touch.pos.setTo(position);
            touch.offset.setToDifference(touch.pos, touch.lastMove.pos);
            var d = touch.offset.magnitude();

            // velocity
            var ellapsed = touch.lastMove.time - app.getTime();
            touch.offset.setToMultiple(touch.offset, 1 / ellapsed);

            touch.lastMove.pos.setTo(position);
            touch.lastMove.time = app.getTime();

            if (touch.down) {
                touch.draggedDistance += d;
                if (touch.draggedDistance > activateDragDistance) {
                    touch.dragging = true;
                }
            }

            // Do something with this info
            if (touch.down) {
                if (touch.dragging) {
                    controls.onDrag(touch);
                } else {
                    controls.onHold(touch);
                }
            } else {
                controls.onMove(touch);
            }
        },

        activate : function() {
            var controls = this;
            var mousePos = new Vector();
            var touchDiv = this.touchDiv;

            // Key handlers
            $(document).keypress(function(event) {
                var c = String.fromCharCode(event.which);

                var keyHandler = controls.onKeyPress[c];
                if (keyHandler !== undefined) {
                    keyHandler.call(controls);
                }

            });

            var getMousePosition = function(ev) {

                var x = ev.pageX - touchDiv.offset().left
                var y = ev.pageY - touchDiv.offset().top
                mousePos.setTo(x, y);
                return mousePos;
            };

            // Set up the mouse/touch controls
            // Note: these are for things which can't  be done with normal 'click' functions on divs
            //  such as clicking on things in Processing or ThreeJS
            //
            // Features:
            //      Click/tapping on an object
            //      Dragging on object to another
            //      Dragging from one point to another (movement in Stellar)

            // Activate processing-style mouse interaction
            touchDiv.mousemove(function(ev) {
                ev.preventDefault();
                app.ui.moveOutput.clear();

                var p = getMousePosition(ev);
                controls.touchMove(p);
            });

            touchDiv.mousedown(function(ev) {
                ev.preventDefault();
                app.ui.moveOutput.clear();

                var p = getMousePosition(ev);
                controls.touchDown(p);
            });

            touchDiv.mouseup(function(ev) {
                app.ui.moveOutput.clear();

                var p = getMousePosition(ev);
                controls.touchUp(p);
                app.focusedWindow = undefined;
            });

            // Mousewheel zooming
            touchDiv.mousewheel(function(event, delta) {
                controls.onMouseWheel(delta);
                event.preventDefault();

            });

        },
        deactivate : function() {

        },
    });

    return Controls;

});
