/**
 * @author Kate Compton
 */
define(["common", "mousewheel"], function(common, MOUSEWHEEL) {'use strict';
    //=========================================================================
    // Utilities
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

    //=========================================================================
    // Represents the position on this touchable window
    var WindowPos = Class.extend({
        init : function(tw, name) {
            this.name = name;
            this.screenPos = new Vector();
            this.worldPos = new Vector();
            this.tw = tw;
            this.className = "WindowPos";
            //if (!tw)
              //  console.log("Create window pos with undefined tw");

        },

        clone : function() {
            var p = new WindowPos(this.tw, this.name);
            p.screenPos.setTo(this.screenPos);
            p.worldPos.setTo(this.worldPos);
            return p;
        },

        setFromPage : function(pagePos) {

            if (this.tw)
                setLocalPos(this.screenPos, pagePos, this.tw);
            else
                this.screenPos.setTo(pagePos);

            if (this.tw) {
                app.moveLog("Center: " + this.tw.center);

                if (this.tw.center)
                    this.screenPos.sub(this.tw.center);
                else
                    app.moveLog("No center");

                if (this.tw.world && this.tw.world.toWorldPos)
                    this.tw.world.toWorldPos(this.screenPos, this.worldPos);
                else {
                    this.worldPos.setTo(this.screenPos);
                }
            } else {

            }

            app.moveLog(this.name + ": set from page " + this.toString());
        },

        toString : function() {
            return "[" + this.tw + "] sp:" + this.screenPos.toSimpleString() + " wp:" + this.worldPos.toSimpleString();
        }
    });
    //==================================================================================================
    //==================================================================================================
    //==================================================================================================
    //==================================================================================================
    // Touch

    var Touch = WindowPos.extend({
        init : function() {
            console.log("CREATE TOUCH");
            this._super(undefined, "mainTouch");
            this.down = false;

            this.lastDown = undefined;
            this.lastDownRel = undefined;
            this.lastUp = undefined;
			this.className = "Touch";
            this.follower = $("<div/>", {
                id : "touch_attached",
                html : "touch",
            });
            $("#ui_overlay").append(this.follower);
            this.follower.hide();
        },

        // By knowing where the first and last

        getDragOriginWindow : function() {
            if (this.lastDown)
                return this.lastDown.tw;
        },

        getCurrentWindow : function() {
            return this.tw;

        },

        setFromPage : function(pagePos) {
            this._super(pagePos);
            if (this.lastDownRel)
                this.lastDownRel.setFromPage(pagePos);
        },

        //============================================================
        //============================================================
        //============================================================
        setCurrentWindow : function(tw) {
            if (tw !== this.tw) {

                if (traceControls)
                    console.log("Enter " + tw.name);
                this.tw = tw;
            }
        },

        enter : function(tw) {
            this.setCurrentWindow(tw);
        },

        // Only set the current window if nothing else is set
        moveIn : function(tw) {
            if (!tw)
                this.setCurrentWindow(tw);
        },

        exit : function(tw) {
            if (traceControls)
                console.log("Exit " + tw + " " + this.tw);

            if (tw === this.tw) {
                if (traceControls)
                    console.log("Exit " + tw.name);
                this.tw = undefined;
            }
        },

        //============================================================
        update : function() {
            if (this.tw)
                this.setObjects();
        },

        press : function() {
            this.down = true;
            this.lastDown = this.clone("LastDown");
            this.lastDownRel = this.clone("LastDownRel");
            this.lastDown.t = app.getTime();

            // Grab the current object
            this.grabObject();
        },
        release : function() {
            this.down = false;
            this.lastUp = this.clone("LastUp");
            this.lastUp.t = app.getTime();

            // Drop the current object
            this.dropObject();
        },

        drag : function() {
            if (traceControls) {
                console.log("Dragging from " + this.lastDown);
                console.log("  to " + this);
                if (this.lastDownRel)
                    console.log("  rel to " + this.lastDownRel);

            }
            this.dragObject();
        },

        move : function() {
        },

        //============================================================
        // Picking up, dragging and dropping
        grabObject : function() {
            if (this.tw && this.tw.world) {
                if (this.heldObject)
                    this.heldObject.isHeld = false;

                this.heldObject = this.tw.world.getTouchableAt(this);

                if (this.heldObject && this.heldObject.onPickup) {
                    this.heldObject.isHeld = true;
                    this.heldObject.onPickup(this);
                }
            }
        },
        dropObject : function() {

            if (this.tw && this.tw.world) {
                this.overObject = this.tw.world.getTouchableAt(this);
            }

            if (this.heldObject && this.heldObject.onDrop) {
                this.heldObject.isHeld = false;
                this.heldObject.onDrop(this, this.overObject);
            }
            this.heldObject = undefined;
        },

        dragObject : function() {
            if (this.tw && this.tw.world) {
                if (!this.screenPos)
                    throw ("Touch has no screenPos!");

                this.overObject = this.tw.world.getTouchableAt({
                    screenPos : this.screenPos,
                    not : this.heldObject,
                });
            }

            if (this.heldObject && this.heldObject.onDrag) {
                this.heldObject.onDrag(this, this.overObject);
            }
        },

        //============================================================
        setObjects : function() {
            app.log("world: " + this.tw);
            if (this.tw.world) {
                app.log("Setting objects in " + this.tw);

                var obj = this.tw.world.getTouchableAt(this);
                if (obj !== this.overObject) {

                    if (this.overObject) {
                        this.overObject.isHoveredOver = false;
                        if (this.overObject.onTouchExit) {
                            this.overObject.onTouchExit();
                        }
                    }

                    this.overObject = obj;

                    if (this.overObject) {
                        this.overObject.isHoveredOver = true;
                        if (this.overObject.onTouchEnter) {
                            this.overObject.onTouchEnter();
                        }
                    }
                }

            }
        },
    });

    return Touch;
});
