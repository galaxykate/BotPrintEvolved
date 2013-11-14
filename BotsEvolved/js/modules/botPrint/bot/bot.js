/**
 * @author Kate Compton
 */

define(["common", "./chassis", "three"], function(common, Chassis, THREE) {'use strict';

    var Bot = Class.extend({
        init : function() {
            this.mainChassis = new Chassis();
            this.transform = new common.Transform();

        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame

        update : function(time) {
            this.mainChassis.update(time);
        },

        render : function(context) {
            this.mainChassis.render(context);
        },

        hover : function(pos) {
            app.moveLog("Hovered " + pos);
            var pt = this.getAt({
                pos : pos,
            });

            if (pt !== undefined)
                pt.excite();

        },

        selectPoint : function(pos) {
            var pt = this.getAt({
                pos : pos,
            });

            this.selectedPoint = pt;
            if (this.selectedPoint !== undefined) {
                this.selectedPoint.select();
            }
        },

        dragPoint : function(pos) {
            app.moveLog("Dragging " + this.selectedPoint);
            if (this.selectedPoint !== undefined) {
                this.selectedPoint.moveTo(pos);
            }

        },

        releasePoint : function() {
            if (this.selectedPoint !== undefined) {
                this.selectedPoint.deselect();
            }
            this.selectedPoint = undefined;
        },

        getAt : function(query) {

            return this.mainChassis.getAt(query);

        },
        createThreeMesh : function() {
            this.mainChassis.createThreeMesh();
            // set up the sphere vars

            var sphereMaterial = new THREE.MeshLambertMaterial({
                color : 0xCC0000
            });
            this.mesh = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), sphereMaterial);

            this.mesh.add(this.mainChassis.mesh);

            return this.mesh;

        }
    });

    return Bot;
});
