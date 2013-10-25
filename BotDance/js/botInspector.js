/**
 * @author Kate Compton
 */
var debug;
var screenWidth = 400;
var screenHeight = 400;
var testDots = [];
var b2DWorld;
var b2DBodyDef;

var botApp = {};
var app;

define(["jQuery", "three", "common"], function(JQUERY, THREE, COMMON) {

    var OrbitalCamera = Vector.extend({
        init : function(viewAngle, aspect, near, far) {
            this._super();

            this.threeCamera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
            this.orbitPosition = new Vector();
            this.radius = 400;
            this.center = new Vector();
            this.theta = .8;
            this.phi = .45;
            this.threeCenter = new THREE.Vector3(0, 0, 0);
            this.updateCameraPos();

        },

        setRotation : function(theta, phi) {
            this.theta = theta;
            this.phi = phi;
            this.updateCameraPos();
        },

        modifyRotation : function(theta, phi) {
            this.theta += theta;
            this.phi += phi;
            this.updateCameraPos();
        },

        setTilt : function(phi) {

            this.phi = phi;
            this.updateCameraPos();
        },

        updateCameraPos : function() {

            var center = this.position;

            this.orbitPosition.setTo(this);
            this.orbitPosition.addSpherical(this.radius, this.theta, this.phi);

            this.threeCamera.position.set(this.orbitPosition.x, this.orbitPosition.y, this.orbitPosition.z);
            this.threeCamera.up = new THREE.Vector3(0, 0, 1);
            this.threeCamera.lookAt(this.threeCenter);

            this.threeCamera.updateMatrix();
            // make sure camera's local matrix is updated
            this.threeCamera.updateMatrixWorld();
            // make sure camera's world matrix is updated
            this.threeCamera.matrixWorldInverse.getInverse(this.threeCamera.matrixWorld);
        }
    });

    // Create a window (with UI, etc) to edit the bot
    var BotInspector = Class.extend({
        init : function() {
            var inspector = this;
            this.frameCount = 0;

            // set the scene size
            var WIDTH = 400, HEIGHT = 300;

            // set some camera attributes
            var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;
            this.camera = new OrbitalCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
            var camera = this.camera.threeCamera;

            // get the DOM element to attach to
            // - assume we've got jQuery to hand
            this.panel = $('#inspector_panel');
            this.panel.css({
                width : WIDTH + "px",
                height : HEIGHT + "px"
            });

            // create a WebGL renderer, camera
            // and a scene
            var renderer = new THREE.WebGLRenderer();

            var scene = new THREE.Scene();
            this.scene = scene;
            this.renderer = renderer;

            // add the camera to the scene
            scene.add(this.camera.threeCamera);

            // start the renderer
            renderer.setSize(WIDTH, HEIGHT);

            // attach the render-supplied DOM element
            this.panel.append(renderer.domElement);

            // set up the sphere vars
            var radius = 50, segments = 16, rings = 16;

            this.inspect();

            // create a point light
            var pointLight = new THREE.PointLight(0xFFFFFF);

            // set its position
            pointLight.position.x = 10;
            pointLight.position.y = 50;
            pointLight.position.z = 130;

            // add to the scene
            scene.add(pointLight);

            // shim layer with setTimeout fallback
            window.requestAnimFrame = (function() {
                return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
            })();

            // usage:
            // instead of setInterval(render, 16) ....

            (function animloop() {
                requestAnimFrame(animloop);
                inspector.update();
            })();
            // place the rAF *before* the render() to assure as close to
            // 60fps with the setTimeout fallback.
        },

        update : function() {
            this.frameCount++;
            var t = this.frameCount * .05;
            // draw!
            this.camera.modifyRotation(.1, 0);
            this.camera.setTilt(0.5 + 0.4 * Math.sin(t));

            this.renderer.render(this.scene, this.camera.threeCamera);
        },

        inspect : function(bot) {
            this.inspected = bot;

            // Create the bot geometry
            var geom = new THREE.Geometry();
            var v1 = new THREE.Vector3(0, 0, 0);
            var v2 = new THREE.Vector3(0, 500, 0);
            var v3 = new THREE.Vector3(0, 500, 500);

            geom.vertices.push(v1);
            geom.vertices.push(v2);
            geom.vertices.push(v3);

            geom.faces.push(new THREE.Face3(0, 1, 2));
            geom.computeFaceNormals();

            var object = new THREE.Mesh(geom, new THREE.MeshNormalMaterial());

            object.position.z = -100;
            //move a bit back - size of 500 is a bit big
            object.rotation.y = -Math.PI * .5;
            //triangle is pointing in depth, rotate it -90 degrees on Y

            this.scene.add(object);
        }
    });
    return BotInspector;
});
