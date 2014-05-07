/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';

    // Drawing tuning values
    var dataW = 6;
    var dataH = 8;
    var border = 3;
    var fontHeight = 12;

    var Gene = Class.extend({

        init : function(root, type) {
            this.parent = root;
            this.children = [];
            this.type = type;

            // create the data
            this.data = [];
            for (var i = 0; i < this.type.size; i++) {
                this.data[i] = [];
                for (var j = 0; j < this.type.complexity; j++) {
                    this.data[i][j] = Math.random();
                }
            }

            // Make the children
            var names = Object.keys(type.children);

            // Is this a variable length set of stuff?
            // if (parent.multiple)

            for (var i = 0; i < names.length; i++) {
                var child = new Gene(this, type.children[names[i]]);
                this.children[i] = child;
                console.log(child);
            }

        },

        // How much space does it take to draw this gene?
        getDrawHeight : function() {
            var h = 0;
            if (this.children.length > 0) {
                for (var i = 0; i < this.children.length; i++) {
                    h = Math.max(h, this.children[i].getDrawHeight());
                }
            }
            h += border * 2 + fontHeight;
            if (this.type.size > 0)
                h += this.type.complexity * dataH;

            return h;
        },

        // How much space does it take to draw this gene?
        getDrawWidth : function() {
            var w = border * 2;
            if (this.children.length > 0) {
                for (var i = 0; i < this.children.length; i++) {
                    w += this.children[i].getDrawWidth() + border;
                }
            }
            if (this.type.size > 0)
                w += this.type.size * dataW;
            return Math.max(w, 20);

        },

        drawData : function(g) {
            g.pushMatrix();
            g.fill(1);
            g.stroke(0);
            g.strokeWeight(1);
            g.rect(0, 0, this.getDrawWidth(), this.getDrawHeight());

            g.fill(0);
            g.text(this.type.name, border + 1, fontHeight - 1 + border);

            // Draw the data
            for (var i = 0; i < this.type.size; i++) {
                for (var j = 0; j < this.type.complexity; j++) {
                    var v = this.data[i][j];
                    g.fill(v, 1, 1);
                    g.rect(i * dataW + border, j * dataH + fontHeight + border, dataW, dataH);
                }
            }
            g.translate(border, border + fontHeight);

            // draw children
            if (this.children.length > 0) {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].drawData(g);
                    g.translate(this.children[i].getDrawWidth() + border, 0);
                }
            }
            g.popMatrix();
        }
    });

    return Gene;
});
