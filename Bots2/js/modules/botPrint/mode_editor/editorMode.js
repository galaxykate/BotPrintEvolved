/**
 * @author Kate Compton
 */

define(["common", "../bot/catalog"], function(common, catalog) {'use strict';
    var realTime = new common.Time("realArenaTime");

    function initialize() {
        createProcessing();

        createPalettes();
        toggleMode();
        isStarted = true;
    };

    //============================================================
    // Which part are we editting?

    var editChassisMode = false;

    function toggleMode() {
        if (editChassisMode) {
            $("#parts_catalog").removeClass("open");
            $("#chassis_catalog").addClass("open");
            editChassisMode = false;
        } else {
            $("#parts_catalog").addClass("open");
            $("#chassis_catalog").removeClass("open");
            editChassisMode = true;
        }
    };

    //============================================================
    // Mode stuff

    var isStarted = false;
    var isOpen = false;
    var div = $("#edit_panel");

    var subpanels = ["catalog"];

    function open() {
        div.addClass("open");
        isOpen = true;

        for (var i = 0; i < subpanels.length; i++) {
            $("#" + subpanels[i]).show();
        }
    };

    function close() {
        div.removeClass("open");
        isOpen = false;
        for (var i = 0; i < subpanels.length; i++) {
            $("#" + subpanels[i]).hide();
        }
    };

    //=========================================================================
    //=========================================================================
    // UI

    // Create processing and attach it to a canvas element
    function createProcessing() {
        var canvasDiv = $("#edit_canvas");
        var editWindow = app.controls.createTouchableWindow(canvasDiv, "edit", mode);

        // attaching the sketchProc function to the canvas
        var processingInstance = new Processing(canvasDiv.get(0), function(g) {
            var w = canvasDiv.width();
            var h = canvasDiv.height();
            g.size(w, h);
            editWindow.center = new Vector(w / 2, h / 2);
            g.colorMode(g.HSB, 1);
            g.ellipseMode(g.CENTER_RADIUS);
            g.draw = function() {
                if (isOpen) {
                    app.update();
                    //   update(g.millis() * .001);

                    g.background(.69, .72, 1);
                    g.pushMatrix();
                    g.translate(w / 2, h / 2);

                    g.fill(0);
                    g.ellipse(0, 0, 50, 50);
                    var context = {
                        g : g,
                        centerBot : true,
                        drawHandles : true,
                    };

                    if (app.currentBot)
                        app.currentBot.render(context);

                    g.popMatrix();
                }
            };
        });
    };

    function createSwatch(name, entry, paletteDiv) {
        var controls = app.controls;

        console.log("name " + name);
        var div = $("<div/>", {
            class : "palette_swatch",
            html : name,
        });

        // Create a default object to be dropped on stuff
        var obj = {
            name : name,
            onDrag : function(touch, overObj) {
                console.log("Drag " + this.name + " over " + overObj);

            },

            onPickup : function(touch) {
                console.log("Picked up  " + this.name);
                touch.follower.html(name);
                touch.follower.show();
                div.addClass("activated");
            },

            onDrop : function(touch, overObj) {
                console.log("Drop " + this.name + " on " + overObj);
                touch.follower.hide();
                div.removeClass("activated");

            }
        };

        var world = {
            getTouchableAt : function() {
                return obj;
            }
        };
        paletteDiv.append(div);
        controls.createTouchableWindow(div, name, world);
    };

    // Create a palette for either chassis or parts
    function createPalette(entries, paletteDiv) {

    };

    function createPalettes() {
        $(".palette_switch").click(function() {
            toggleMode();
        });

        var partsDiv = $("#parts_catalog");
        var chassisDiv = $("#chassis_catalog");

        for (var i = 0; i < catalog.allParts.length; i++) {
            var part = catalog.allParts[i];
            createSwatch(part.name, part, partsDiv);
        }
        catalog.allChassis.forEach(function(chassis) {
            var div = $("<div/>", {
                html : chassis.name,
                "class" : "panel"
            });
            chassisDiv.append(div);

            div.click(function() {
                switchChassisType(chassis);
            });
        });
    };

    function switchChassisType(type) {
        console.log("Switch to chassis type " + type.name);
    };
    //=========================================================================
    // Exposed

    function getTouchableAt(query) {
        query.allowBots = true;
        // return the closest bot

        if (editChassisMode) {
            // Find the closest handle on the path
            query.allowHandles = true;
        } else {
            // Editing parts
            query.allowParts = true;
            query.allowEdges = true;

        }
        var chassis = app.currentBot.mainChassis;
        var found = chassis.getTouchableAt(query).obj;
        return found;

    };

    var mode = {
        initialize : initialize,
        getTouchableAt : getTouchableAt,
        open : open,
        close : close,
        isOpen : function() {
            return isOpen;
        },
    };
    // interface (all other functions are hidden)
    return mode;
});
