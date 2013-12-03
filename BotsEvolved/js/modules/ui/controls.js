/**
 * @author Kate Compton
 */

define(["common", "mousewheel"], function(COMMON, MOUSEWHEEL) {'use strict';
    var activateDragDistance = 5;

    var createControlSet = function() {
        return {
            onKeyPress : {

            },
            onMove : function(touch) {
            },
            onDrag : function(touch) {
            },
            onPress : function(touch) {
            },
            onRelease : function(touch) {
            },
            onTap : function(touch) {
            },
            onDoubleTap : function(touch) {
            },
            onScroll : function(delta) {
            },
        }
    }
    var Controls = Class.extend({

        init : function(touchDiv, defaultControls) {
            this.touchDiv = touchDiv;
            // Default values:
            this.name = "Undefined control scheme";
            this.defaultControls = createControlSet();
            if (defaultControls !== undefined)
                $.extend(this.defaultControls, defaultControls);

            this.touch = {
                pos : new Vector(),

                lastMove : {
                    pos : new Vector(),
                    time : 0,
                    divID : undefined
                },
                lastDown : {
                    pos : new Vector(),
                    time : 0,
                    divID : undefined
                },
                lastUp : {
                    pos : new Vector(),
                    time : 0,
                    divID : undefined
                },

                activePos : new Vector(),
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
            this.selectedObjects = [];
            this.setActiveControls();

        },

        setActiveControls : function(customControls) {
            this.activeControls = { };
            $.extend(this.activeControls, this.defaultControls);
            $.extend(this.activeControls, customControls);

        },

        //=================
        // Window relative

        getPositionRelativeTo : function(element, pos) {
            var v = new Vector(pos.x - element.offset().left, pos.y - element.offset().top);
            return v;
        },

        // Add listeners to a specific element
        // This allows us to use click-dragging even if the dragging goes outside the element that it started in
        addListeners : function(drawingWindow) {
            var controls = this;

            // Record which div is being activated in the touch,
            drawingWindow.element.on('mousedown', function(event) {
                controls.lock(drawingWindow);

            });

            drawingWindow.element.on('mousemove', function(event) {
                var mouse = new Vector(event.pageX, event.pageY);
                var touch = controls.touch;

                // If no window is currently locked,
                // then the last window that the mouse is in is the active window
                if (this.lockedWindow !== undefined) {
                    controls.setActiveWindow(lockedWindow);

                } else {
                    controls.setActiveWindow(drawingWindow);
                }

            });
        },

        setActiveWindow : function(drawingWindow) {

            if (this.locked) {
                drawingWindow = this.locked;
            }
            
            if (this.activeWindow !== undefined)
                this.activeWindow.active = false;

            if (this.activeWindow !== drawingWindow) {

                this.activeWindow = drawingWindow;
            }
            this.activeWindow.active = true;

        },

        lock : function(lockWindow) {
            this.locked = lockWindow;
            this.setActiveWindow(lockWindow);

        },
        clearLocked : function() {
            this.locked = undefined;
        },
        //================

        touchDown : function(position) {

            var controls = this.activeControls;
            var touch = this.touch;
            touch.lastDown.pos.setTo(position);
            touch.lastDown.time = app.getAppTime();
            touch.down = true;
            touch.dragging = false;
            touch.draggedDistance = 0;
            controls.onPress(touch);
        },
        touchUp : function(position) {

            var controls = this.activeControls;
            var touch = this.touch;
            touch.lastUp.pos.setTo(position);
            touch.lastUp.time = app.getAppTime();
            touch.down = false;
            touch.dragging = false;

            var timeDown = touch.lastUp.time - touch.lastDown.time;

            if (timeDown < 200 && touch.draggedDistance < 10) {
                console.log("Tap");
                controls.onTap(touch);
            }

            touch.draggedDistance = 0;
            controls.onRelease(touch);
            this.clearLocked();

        },

        // drag or move (the same if using touchscreen)
        touchMove : function(position) {
            var controls = this;
            var touch = this.touch;

            touch.pos.setTo(position);
            app.moveLog("Move: " + touch.pos);

            // Set to the local position of the active element
            if (this.activeWindow === undefined) {

            } else {
                this.activeWindow.setLocalPosition(touch.pos);
            }

            app.moveLog("Active: " + touch.activeElement + ": " + touch.activePos);

            touch.offset.setToDifference(touch.pos, touch.lastMove.pos);
            var d = touch.offset.magnitude();

            // velocity
            var t = app.getAppTime();
            var ellapsed = touch.lastMove.time - t;
            touch.offset.setToMultiple(touch.offset, 1 / ellapsed);

            touch.lastMove.pos.setTo(position);
            touch.lastMove.time = t;

            if (touch.down) {
                touch.draggedDistance += d;
                if (touch.draggedDistance > activateDragDistance) {
                    touch.dragging = true;
                }
            }

            // Do something with this info
            if (touch.down) {
                if (touch.dragging) {
                    controls.activeControls.onDrag(touch);
                } else {
                    //   controls.onHold(touch);
                }
            } else {
                controls.activeControls.onMove(touch);
            }
        },
        activate : function() {

            var controls = this;

            var mousePos = new Vector();
            var touchDiv = this.touchDiv;
        
            // Key handlers
            $(document).keypress(function(event) {
                var c = String.fromCharCode(event.which);

                var keyHandler = controls.activeControls.onKeyPress[c];
                if (keyHandler !== undefined) {
                    keyHandler.call(controls.activeControls);
                }

            });

            var getMousePosition = function(ev) {

                var x = ev.pageX;
                var y = ev.pageY;
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

            });

            // Mousewheel zooming
            touchDiv.mousewheel(function(event, delta) {
                controls.activeControls.onScroll(delta);
                event.preventDefault();

            });

        },
        deactivate : function() {

        },
    });

    return Controls;

});
