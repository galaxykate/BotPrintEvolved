/**
 * @author Kate Compton
 */

define(["common", "three"], function(common, THREE) {'use strict';
    var defaultMaterial = new THREE.MeshNormalMaterial();
    defaultMaterial.side = THREE.DoubleSide;

    var ModGeo = Class.extend({
        init : function() {
            this.geom = new THREE.Geometry();
            this.geom.dynamic = true;
        },

        update : function() {

            // Update the geometry
            this.geom.computeFaceNormals();
            this.geom.verticesNeedUpdate = true;
        },

        createMesh : function(material) {
            if (material === undefined)
                material = defaultMaterial;
            return new THREE.Mesh(this.geom, material);
        }
    });

    var Cylinder = ModGeo.extend({
        init : function(sides, rings, capRings) {
            this._super();
            this.sides = sides;
            this.rings = rings;

            this.edgeVertices = [];
            var edgeVertCount = sides * (rings + 1);
            // Store the edge vertices in a way that we can access them easily
            for (var i = 0; i < rings + 1; i++) {
                this.edgeVertices[i] = [];
                for (var j = 0; j < sides; j++) {
                    var v = new THREE.Vector3(0, 0, 0);

                    this.edgeVertices[i][j] = v;
                    this.geom.vertices.push(v);
                }
            }
            var capVertCount = sides * capRings + 1;
        
            // Create all the faces
            for (var i = 0; i < sides; i++) {
                for (var j = 0; j < rings; j++) {
                    var p0 = this.getSideVertexIndex(i, j);
                    var p1 = this.getSideVertexIndex(i + 1, j);
                    var p2 = this.getSideVertexIndex(i, j + 1);
                    var p3 = this.getSideVertexIndex(i + 1, j + 1);

                    var f0 = new THREE.Face3(p0, p1, p3);
                    var f1 = new THREE.Face3(p3, p2, p0);
                    this.geom.faces.push(f0);
                    this.geom.faces.push(f1);
                }
            }
        },

        modSideVertices : function(modVertex) {
            var v = new Vector();
            var context = {

            };

            for (var i = 0; i < this.rings + 1; i++) {
                context.rings = i;
                context.lengthPct = i / this.rings;
                for (var j = 0; j < this.sides; j++) {
                    context.side = j;
                    context.thetaPct = j / this.sides;
                    var vertex = this.getSideVertex(i, j);
                    v.setTo(vertex);
                    modVertex(v, context);
                    vertex.set(v.x, v.y, v.z);
                }
            }
            this.update();
        },

        getSideVertex : function(ring, side) {
            var ringArray = this.edgeVertices[ring];
            return ringArray[side % (this.sides)];

        },
        getSideVertexIndex : function(side, ring) {
            return (side % this.sides) + ring * this.sides;
        },
    });

    ModGeo.Cylinder = Cylinder;
    return ModGeo;
});
