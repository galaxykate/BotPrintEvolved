/**
 * @author Kate Compton
 */

define(["common", "./chassis", "three"], function(common, Chassis, THREE) {'use strict';
    var botCount = 0;
    var Bot = Class.extend({
        init : function() {
            this.idNumber = botCount;
            botCount++;
            this.mainChassis = new Chassis(this);
            this.transform = new common.Transform();

        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame

        getHull : function() {
            return this.mainChassis.points;
        },

        update : function(time) {
            this.mainChassis.update(time);
        },

        render : function(context) {
            this.mainChassis.render(context);
        },

        getForceAmt : function() {
            if (this.decisionTree === undefined)
                return Math.max(100000 * Math.sin(this.arena.time + this.idNumber), 0);
            else
                return this.decisionTree.makeDecision();
        },

        getForces : function() {
            return [{
                power : this.getForceAmt(),
                direction : 20 * Math.sin(.2 * this.arena.time + this.idNumber), // global direction
                p : this.transform.translation // global position
            }];
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

        },
        toString : function() {
            return "Bot" + this.idNumber;
        }
    });

    return Bot;
});
