/**
 * @author Kate Compton
 */
/**
 * @author Kate Compton
 */

var prefix = "modules/shared/ui/";
define(["common", "processing", prefix + "panel", prefix + "controls", prefix + "popup", prefix + "mode", prefix + "output", prefix + "window"], function(common, Processing, Panel, Controls, Popup, Mode, Output, DrawingWindow) {'use strict';

    // Create a processing window from a jquery canvas element
    function createProcessingWindow(canvas) {

    };

    var PanelGroup = Class.extend({
        init : function(ui, name) {
            ui.panelGroups[name] = this;
            this.name = name;
            this.panels = [];
        },

        open : function() {
            this.panels.forEach(function(p) {
                p.addClass("open");
            });
        },

        close : function() {
            this.panels.forEach(function(p) {
                p.removeClass("open");
            });
        }
    });

    var addSlider = function(parent, key, defaultValue, minValue, maxValue, onChange) {

        // Create an empty slider div
        var optionDiv = $("<div/>", {
        });
        optionDiv.css({
            "pointer-events" : "auto"
        });
        parent.append(optionDiv);

        var slider = $('<div />', {
            id : 'slider_' + key,
            class : "tuning_slider",
            value : key
        });

        var step = maxValue - minValue;
        if (step < 10)
            step = .1;
        else
            step = 1;

        slider.appendTo(optionDiv);
        slider.slider({
            range : "min",
            value : defaultValue,
            min : minValue,
            max : maxValue,
            step : step,
            slide : function(event, ui) {
                $("#" + key + "amt").text(ui.value);
                console.log("Slide " + ui.value);
                if (onChange !== undefined) {
                    onChange(key, ui.value);
                }
            }
        });

        // Create a lable
        $('<label />', {
            'for' : 'slider_' + key,
            text : key + ": "
        }).appendTo(optionDiv);

        // Create a lable
        $('<span />', {
            id : key + "amt",
            text : defaultValue
        }).appendTo(optionDiv);

        return slider;
    };
    //==============================================================
    //==============================================================
    //==============================================================
    // UI, mode switching, panel opening/closing

    var UI = Class.extend({

        init : function(context) {
            var ui = this;
            this.options = {};
            this.tuningValues = {};

            this.panelGroups = {};

            $.extend(this, context);
            this.addDevUI(context.uiOverlayDiv);

            //========================================
            // option/tuning value accessors
            app.getOption = function(key) {
                if (ui.options[key] !== undefined)
                    return ui.options[key].value;
                return false;
            };
            app.getTuningValue = function(key) {
                if (ui.tuningValues[key]) {
                    return ui.tuningValues[key].value;
                }
                return 0;
            };

            //========================================
            // Make a shortcut for outputs

            app.log = function(line) {
                app.ui.output.log(line);
            };
            app.moveLog = function(line) {
                app.ui.moveOutput.log(line);
            };
            app.modeLog = function(line) {
                app.ui.modeOutput.log(line);
            };

        },

        toggleDevMode : function() {
            if (this.devMode) {
                this.devMode = false;
                this.panelGroups.devPanels.open();
            } else {
                this.devMode = true;
                this.panelGroups.devPanels.close();
            }

            console.log("Dev mode:" + this.devMode);
        },

        addDevUI : function(parentDiv) {
            console.log("Add Dev UI");
            var ui = this;
            var w = 210;
            var h = 300;
            var offset = 250;
            var spacing = 24;

            // Create divs for the panels
            if (parentDiv !== undefined) {

                var holder = $("<div/>", {
                    class : "top_menus",
                });

                parentDiv.append(holder);

                var devPanelNames = ["options", "sliders", "output"];
                var devPanels = new PanelGroup(ui, "devPanels");

                devPanelNames.forEach(function(name) {
                    var div = $("<div/>", {
                        id : "dev_" + name,
                        "class" : "panel text_panel dev_panel"
                    });
                    holder.append(div);
                    devPanels.panels.push(div);

                });

                var outputDiv = $("#dev_output");

                outputDiv.append($("<div/>", {
                    id : "debugOutput",
                }));
                outputDiv.append($("<div/>", {
                    id : "moveOutput",
                }));

                outputDiv.append($("<div/>", {
                    id : "modeOutput",
                }));
            }

            this.moveOutput = new Output($("#moveOutput"));
            this.modeOutput = new Output($("#modeOutput"));
            this.output = new Output($("#debugOutput"));

        },
        addOption : function(key, defaultValue, onChange) {
            var ui = this;

            var optionDiv = $("<div/>", {

            });

            var parent = this.panels.devOptions.div;
            parent.append(optionDiv);

            var checkbox = $('<input />', {
                type : 'checkbox',
                id : 'cb_' + key,
                value : key
            });

            checkbox.appendTo(optionDiv);

            $('<label />', {
                'for' : 'cb' + key,
                text : key
            }).appendTo(optionDiv);

            ui.options[key] = {
                value : defaultValue,
                checkbox : checkbox,
            };
            checkbox.prop('checked', defaultValue);

            checkbox.click(function() {
                ui.options[key].value = checkbox.prop('checked');
                console.log(key + ": " + ui.options[key].value);
                if (onChange !== undefined) {
                    onChange(key, ui.options[key].value);
                }
            });

        },
        addTuningValue : function(key, defaultValue, minValue, maxValue, onChange) {
            var ui = this;
            var parent = this.panels.devSliders.div;
            var uiOnChange = function(key, value) {
                ui.tuningValues[key].value = value;
                onChange(key, value);
            }
            var slider = addSlider(parent, key, defaultValue, minValue, maxValue, uiOnChange);

            ui.tuningValues[key] = {
                value : defaultValue,
                slider : slider,
            };

        },
        addPopupManager : function(id, manager) {
            this.popupManagers[id] = manager;
            return manager;
        },
        createSlider : function() {

        }
    });

    UI.Controls = Controls;
    UI.DrawingWindow = DrawingWindow;
    UI.Panel = Panel;
    UI.Popup = Popup;
    UI.Mode = Mode;

    return UI;
});
