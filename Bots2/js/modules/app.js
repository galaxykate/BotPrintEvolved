/**
 * @author Kate Compton
 */

define(["common", "./shared/ui/uiUtils", "./botPrint/mode_arena/arenaMode", "./botPrint/mode_editor/editorMode"], function(common, UI, arenaMode, editMode) {

    var App = Class.extend({

        init : function() {
            app = this;
            app.mainCanvas = $("#app");

            app.worldTime = new common.Time("worldTime");

            this.ui = new UI({
                uiOverlayDiv : $("#ui_overlay"),
            });

            this.createControls();

            // Create the modes
            this.arenaMode = arenaMode;
            this.arenaMode.initialize();
            this.arenaMode.open();
            this.editMode = editMode;
            this.editMode.initialize();
            this.editMode.close();

            app.toggleMode();
            app.toggleMode();
            app.ui.toggleDevMode();
            app.ui.toggleDevMode();

        },

        createControls : function() {
            var appDiv = $("#app");
            this.controls = new UI.Controls(appDiv, {
                keyPress : function() {
                    var key = app.controls.key;
                    console.log("Key:" + key);
                    switch(key) {

                        case 'd':
                            app.ui.toggleDevMode();
                            break;

                        case 'm':
                            app.toggleMode();
                            break;
                    }
                }
            });

        },

        toggleMode : function() {
            if (app.arenaMode.isOpen()) {
                app.arenaMode.close();
                app.editMode.open();

            } else {
                app.arenaMode.open();
                app.editMode.close();
            }

        },

        setCurrentBot : function(bot) {
            console.log("Set bot ", bot);
            // load into the bot card
            app.currentBot = bot;
        },

        editBot : function(bot) {
            app.setCurrentBot(bot);
            if (app.arenaMode.isOpen()) {
                app.toggleMode();
            }

        },

        //========================================================
        //========================================================
        // World interface

        update : function(t) {
            app.ui.output.clear();
            //  app.worldTime.setTime(t);
            app.controls.touch.update();
        },

        getTime : function() {
            return this.worldTime.total;
        },
     
    });

    return App;
});
