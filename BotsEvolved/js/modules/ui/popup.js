/**
 * @author Kate Compton
 */
/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {'use strict';
    var popupCount = 0;

    // Popup contains a div at some location
    // Popup features
    //      Pointing popups: popups with an arrow to an onscreen object
    //      Click-to-zoom popups, click to show...something
    //      Thumbnail popups: popups containing some processing drawing
    //      Click-to-close popups, click

    var Popup = Class.extend({

        init : function(context) {
            this.idNumber = popupCount;
            popupCount++;

            // Default values:

            this.id = "popup" + this.idNumber;
            this.title = "";
            this.html = "";
            this.active = false;
            this.timeout = 0;
            this.animate = false;
            this.clickToClose = true;
            this.addCloseButton = false;

            // Nothing to point to
            this.pointerTarget = undefined;
            this.pointerRelative = false;

            this.closedDimensions = new Vector(0, 0);
            // random location
            this.location = new Vector(Math.random() * 400, Math.random() * 400);

            // Overlay with custom context
            $.extend(this, context);

            // If birth and death locations aren't specified, clone the location
            if (this.birthLocation === undefined)
                this.birthLocation = new Vector(this.location);

            if (this.deathLocation === undefined)
                this.deathLocation = new Vector(this.location);

        },

        // Setup this div to represent this popup (div pooling)
        setDiv : function(div) {

            var popup = this;
            this.div = div;
            div.removeClass();

            var html = this.html;
            if (this.title) {
                html = "<b>" + this.title + "</b><br>" + html;
            }

            div.html(html);
            div.addClass("popup " + this.classes);

            if (popup.animate) {
                div.css({
                    left : this.birthLocation.x + "px",
                    top : this.birthLocation.y + "px",
                    width : this.closedDimensions.x + "px",
                    height : this.closedDimensions.y + "px",
                    "border-radius" : "0px",

                });
                div.animate({
                    left : this.location.x + "px",
                    top : this.location.y + "px",
                    width : 200 + "px",
                    height : 40 + "px",

                }, 300);
            }

            div.removeClass("popup_hidden");
            div.addClass("popup_active");

            div.click(function(event) {
                console.log("clicked " + popup);
                if (this.onClick !== undefined) {

                    this.onClick();
                }
                if (popup.clickToClose) {
                    popup.close();
                }
            });

            // start the timer
            if (this.timeout > 0 && this.timeout !== undefined) {
                setTimeout(function() {
                    popup.close();
                }, this.timeout * 1000);
            }
        },

        close : function() {
            var popup = this;
            console.log("Close " + this);
            if (popup.onClose !== undefined) {
                popup.onClose();
            }

            popup.div.addClass("popup_hidden");
            popup.div.removeClass("popup_active");
            // remove it quickly
            setTimeout(function() {

                popup.deleted = true;
                popup.manager.cleanup();
            }, 700);

            if (popup.animate) {
                popup.div.animate({
                    left : popup.deathLocation.x + "px",
                    top : popup.deathLocation.y + "px",
                    width : popup.closedDimensions.x + "px",
                    height : popup.closedDimensions.y + "px",
                    opacity : 0,

                }, 500, function() {
                    // popup.div.hide()

                });
            }
        },
    });

    var PopupManager = Class.extend({
        init : function(context) {

            // Default values:
            this.maxPopups = 40;

            // Overlay with custom context
            $.extend(this, context);

            this.div = $("#" + this.divName);

            this.freeDivs = [];
            this.popups = [];

            // Create a div pool
            for (var i = 0; i < this.maxPopups; i++) {
                var popupDiv = this.createPopupDiv(i);
                this.div.append(popupDiv);
                this.freeDivs[i] = popupDiv;
            }

        },

        createPopupDiv : function(index) {
            var div = $("<div/>", {
                "class" : "popup popup_hidden",
                id : "popupHolder" + index,
            });

            return div;
        },

        // Do something to add a popup
        addPopup : function(context) {
            // Get a free div
            var div = this.freeDivs.pop();
            var popup = new Popup(context);
            popup.manager = this;
            popup.setDiv(div);
            this.popups.push(popup);

            return popup;
        },

        cleanup : function() {
            var manager = this;
            // Free up all the divs
            $.each(manager.popups, function(index, popup) {
                if (popup.deleted) {
                    manager.freeDivs.push(popup.div);
                }
            });
            this.popups = _.filter(this.popups, function(popup) {
                return popup.deleted;
            });

        }
    });

    var NoticeBar = PopupManager.extend({
        init : function(context) {
            this._super(context);
        },

        addPopup : function(context) {
            // Overwrite the locations
            var popup = this._super(context);

            popup.div.css({
                position : "static",
            });

            return popup;
        },
    });

    Popup.PopupManager = PopupManager;
    Popup.NoticeBar = NoticeBar;
    return Popup;

});
