/**
 * @author Kate Compton
 */

define(["common", "./shared/ui/uiUtils", "./botPrint/mode_arena/arenaMode", "./botPrint/mode_editor/editorMode", "./botPrint/botCard"], function(common, UI, arenaMode, editMode, BotCard) {

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
            this.editMode = editMode;
            this.arenaMode.initialize();
            this.editMode.initialize();

            this.arenaMode.open();
            this.editMode.close();

            app.toggleMode();
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

        //========================================================
        // Bot selection

        createBotCard : function(parentDiv) {
            return new BotCard(parentDiv);
        },

        setCurrentBot : function(bot) {
            console.log("Set bot ", bot);
            // load into the bot card
            app.currentBot = bot;
            app.arenaCard.update();
            app.editorCard.update();

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
