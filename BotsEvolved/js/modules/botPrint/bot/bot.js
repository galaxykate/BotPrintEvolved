/**
 * @author Kate Compton
 */

define(["common", "./chassis", "three"], function(COMMON, Chassis, THREE) {'use strict';

    var Bot = Class.extend({
        init : function() {
            this.mainChassis = new Chassis();
        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame

        setScreenPositions : function(camera) {
            this.mainChassis.setScreenPositions(camera);
        },

        update : function(time) {
            this.mainChassis.update(time);
        },

        render2D : function(g) {
            this.mainChassis.render2D(g);
        },

        hover : function(pos) {
            var pt = this.getAt({
                screenPos : pos,

            });
            if (pt !== undefined)
                pt.excite();

        },

        selectPoint : function(pos) {
            var pt = this.getAt({
                screenPos : pos,

            });

            this.selectedPoint = pt;
        },

        dragPoint : function(pos) {
            
         
            if (this.selectedPoint !== undefined) {
                this.selectedPoint.moveTo(pos);
            }
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
