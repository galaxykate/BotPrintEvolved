/**
 * @author Kate Compton
 */

define(["common", "./chassis", "three"], function(common, Chassis, THREE) {'use strict';
    var botCount = 0;
    var Bot = Class.extend({
        init : function() {
            this.idNumber = botCount;
            botCount++;
            this.setMainChassis(new Chassis(this));
            this.transform = new common.Transform();
            this.compileAttachments();
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        // Transformation

        getBot : function() {
            return this;
        },

        // Transform this bot-local position to a global one
        transformToGlobal : function(local, global) {
            this.transform.toWorld(local, global);
        },

        setMainChassis : function(chassis) {
            this.mainChassis = chassis;
            this.mainChassis.setParent(this);
        },

        //======================================================================================
        //======================================================================================
        //======================================================================================
        //

        clone : function() {
            var bot = new Bot();
            bot.setMainChassis(this.mainChassis.clone());

            this.compileAttachments();
            return bot;
        },

        setBrain : function(dtree) {
            this.brain = {
                defaultTree : dtree
            };
        },

        compileAttachments : function() {
            this.attachments = [];
            this.sensors = [];
            this.actuators = [];

            this.mainChassis.compileAttachments(this.sensors, function(attachment) {
                return attachment.sense !== undefined;
            });
            this.mainChassis.compileAttachments(this.actuators, function(attachment) {
                return attachment.actuate !== undefined;
            });
        },

        //-------------------------------------------
        // View stuff - will probably end up in it's own file
        // render this bot in a 2D frame

        getHull : function() {
            return this.mainChassis.path.getHull();
        },
        update : function(time) {
            this.mainChassis.update(time);

        },
        act : function(time) {
            var bot = this;
            if (this.brain !== undefined) {
                var dtree = this.brain.defaultTree;
                if (this.intention !== undefined) {
                    dtree = this.brain[this.intention];
                }

                //Deprecated?
                //dtree.resetActive();
                dtree.makeDecision();
            } else {
                $.each(this.actuators, function(index, actuator) {
                    var value = Math.sin(index + time.total + bot.idNumber) * 3;
                    value = utilities.constrain(value, 0, 1);
                    actuator.actuate(value);
                });
            }
        },

        render : function(context) {
            var g = context.g;
            g.pushMatrix();
            this.transform.applyTransform(g);

            context.useChassisCurves = true;
            this.mainChassis.render(context);

            /*
             $.each(this.attachments, function(index, attachment) {
             var p = attachment.getBotTransform();
             g.fill(.4, 1, 1);
             p.drawCircle(g, 20);
             });
             */

            g.popMatrix();
            /*
             $.each(this.attachments, function(index, attachment) {
             var p2 = attachment.getWorldTransform();
             g.fill(.56, 1, 1);
             p2.drawCircle(g, 10);

             });
             */

        },
        getForceAmt : function() {
            if (this.decisionTree === undefined)
                return Math.max(100000 * Math.sin(this.arena.time + this.idNumber), 0);
            else
                return this.decisionTree.makeDecision();
        },
        getForces : function() {
            var forces = [];
            this.mainChassis.compileForces(forces);
            return forces;
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
            this.mainChassis.path.createThreeMesh({
                rings : 3,
                capRings : 2,
                height : 18
            });
            // set up the sphere vars

            var sphereMaterial = new THREE.MeshLambertMaterial({
                color : 0xCC0000
            });
            this.mesh = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), sphereMaterial);

            this.mesh.add(this.mainChassis.path.mesh);

            return this.mesh;

        },
        toString : function() {
            return "Bot" + this.idNumber;
        }
    });

    return Bot;
});
