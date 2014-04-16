/**
 * @author Kate Compton
 */

define(["jQuery", "box2D", "common"], function(JQUERY, Box2D, common) {

    function B2DtoString(v) {
        return "(" + v.get_x().toFixed(2) + ", " + v.get_y().toFixed(2) + ")";
    };

    var firstTime = true;

    var b2Vec2 = Box2D.b2Vec2;

    var BoxWorld = Class.extend({

        init : function(gravity) {

            this.scale = 30;
            this.frame = 0;
            this.gravity = new Box2D.b2Vec2(0.0, gravity);
            this.world = new Box2D.b2World(this.gravity);
            //this.listener = new Box2D.b2ContactListener();

            this.bodies = [];
            //console.log("I've hit something");
            this.enableEventListeners();

            var listener = new Box2D.b2ContactListener();

            Box2D.customizeVTable(listener, [{
                original : Box2D.b2ContactListener.prototype.BeginContact,
                replacement : function(thsPtr, contactPtr) {
                    var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
                    var fixtureA = contact.GetFixtureA();
                    var fixtureB = contact.GetFixtureB();
                    //    console.log("Hit ", fixtureA ,fixtureB);
                    // now do what you wish with the fixtures
                }
            }]);

            this.world.SetContactListener(listener);

        },

        //replaces the default event listener with out own custom one
        enableEventListeners : function() {
            var listener = new Box2D.b2ContactListener();

            Box2D.customizeVTable(listener, [{
                original : Box2D.b2ContactListener.prototype.BeginContact,
                replacement : function(thsPtr, contactPtr) {
                    var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
                    var botA = contact.GetFixtureA().GetBody().parentObject;
                    var botB = contact.GetFixtureB().GetBody().parentObject;

                    //catches when the bot turns undefined
                    if ( typeof (botA) != 'undefined' && typeof (botB) != 'undefined') {
                        botA.incrementCollisionAmount();
                        botB.incrementCollisionAmount();
                    }
                }
            }]), this.world.SetContactListener(listener);
        },

        removeBodies : function() {
            var world = this.world;
            $.each(this.bodies, function(index, body) {
                if (!body.isTerrain) {
                    world.DestroyBody(body);
                }
            });
            this.bodies = [];
        },

        makeEdgeRing : function(points) {
            var ground = this.world.CreateBody(new Box2D.b2BodyDef());

            for (var i = 0; i < points.length; i++) {
                var p0 = points[i];
                var p1 = points[(i + 1) % points.length];

                var edge = new Box2D.b2EdgeShape();

                edge.Set(this.toB2Vec(p0), this.toB2Vec(p1));
                ground.CreateFixture(edge, 0.0);
            }
            return ground;
        },

        setTo : function(b2D, x, y) {
            b2D.set_x(x / this.scale);
            b2D.set_y(y / this.scale);
        },

        readIntoTransform : function(body, transform) {
            var bpos = body.GetPosition();
            transform.rotation = body.GetAngle();
            try {
                transform.setTo(bpos.get_x() * this.scale, bpos.get_y() * this.scale);
            } catch(err) {
                console.log(this.scale);
            }
        },

        toB2Vec : function(p) {
            if (arguments.length === 1)
                return new b2Vec2(arguments[0].x / this.scale, arguments[0].y / this.scale);
            if (arguments.length === 2)
                return new b2Vec2(arguments[0] / this.scale, arguments[1] / this.scale);
        },

        setBodyPosition : function(bodyDef, p) {
            bodyDef.set_position(this.toB2Vec(p));
        },

        /**
         * @method toggleMainMode
         * Set the body definition to this transform
         */

        setBodyToTransform : function(body, transform) {
            var angle = body.GetAngle();
            if (!isNaN(transform.rotation))
                angle = transform.rotation;
            body.SetTransform(this.toB2Vec(transform), angle);
        },

        // Add some set of objects that have "getHull" and a "transform"
        addObjects : function(objects) {
            var boxWorld = this;

            var bodyDef = new Box2D.b2BodyDef();
            //
            bodyDef.set_type(Box2D.b2_dynamicBody);
            bodyDef.set_angularDamping(3);
            //iterates though all the objects i.e bots
            $.each(objects, function(index, obj) {

                var points = obj.getHull();

                // var customShapes = boxWorld.createPolygonShapes(obj.points);
                var customShapes = boxWorld.createTriFanShapes(points);

                var body = boxWorld.world.CreateBody(bodyDef);

                boxWorld.setBodyToTransform(body, obj.transform);

                $.each(customShapes, function(index, shape) {
                    var fixtureDef = new Box2D.b2FixtureDef();
                       fixtureDef.set_density(2.0);
                
                    fixtureDef.set_shape(shape);
                    body.CreateFixture(fixtureDef);
                }),

                // set the parent object
                body.parentObject = obj;

                //body.SetUserData(obj);

                boxWorld.bodies.push(body);

            });
        },

        createEdgeShape : function(points) {
            var shape0 = new Box2D.b2EdgeShape();

            for (var i = 0; i < count; i++) {
                shape0.Set(points[i], points[(count + i + 1) % count]);
            }
        },

        setBuffer : function(v, buffer, offset) {
            Box2D.setValue(buffer + (offset), v.x / this.scale, 'float');
            Box2D.setValue(buffer + (offset + 4), v.y / this.scale, 'float');
        },

        createPolygonShapes : function(vertices) {
            var boxWorld = this;
            var shape = new Box2D.b2PolygonShape();
            var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
            var offset = 0;
            for (var i = 0; i < vertices.length; i++) {
                boxWorld.setBuffer(vertices[i], buffer, offset);
                offset += 8;
            }
            var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
            shape.Set(ptr_wrapped, vertices.length);
            return [shape];
        },

        createTriFanShapes : function(vertices) {
            var boxWorld = this;
            if (vertices === undefined)
                throw "No vertices: can't make B2D triangle-fan";

            var center = Vector.average(vertices);
            var shapes = [];
            for (var j = 0; j < vertices.length; j++) {

                var shape = new Box2D.b2PolygonShape();
                var offset = 0;

                var triVerts = [vertices[j], vertices[(j + 1) % vertices.length], center];
                var buffer = Box2D.allocate(triVerts.length * 8, 'float', Box2D.ALLOC_STACK);

                for (var i = 0; i < 3; i++) {
                    boxWorld.setBuffer(triVerts[i], buffer, offset);

                    offset += 8;
                }

                var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
                shape.Set(ptr_wrapped, triVerts.length);
                shapes[j] = shape;
            }

            return shapes;
        },

        simulate : function(dt) {
            var boxWorld = this;

            // Set the bodies from the boxes
            $.each(this.bodies, function(index, body) {
                boxWorld.setBodyToTransform(body, body.parentObject.transform);
            });

            this.applyForce();

            this.world.Step(dt, 2, 2);

            // Read box2d data into JS objects
            $.each(this.bodies, function(index, body) {

                boxWorld.readIntoTransform(body, body.parentObject.transform);
            });

            this.frame++;

        },

        // Apply forces to all the bodies
        applyForce : function() {
            var boxWorld = this;
            this.forceOffsets = [];

            // Holders for the force and direction
            var forceOffset = new Box2D.b2Vec2(0.0, 0.0);
            var forceDir = new Box2D.b2Vec2(0.0, 0.0);

            for (var i = 0; i < this.bodies.length; i++) {
                var body = this.bodies[i];

                var objTheta = body.parentObject.transform.rotation;

                // Get all the forces of the bot
                var forces = body.parentObject.getForces();

                app.log("Apply " + forces.length + " to " + body);
                $.each(forces, function(index, force) {

                    // forceDir is the direction/strength of the force
                    // forceOffset is the world-relative point at which it is applied
                    boxWorld.setTo(forceDir, force.x, force.y);
                    boxWorld.setTo(forceOffset, force.center.x, force.center.y);

                    body.ApplyForce(forceDir, forceOffset);
                });

                //  b.ApplyLinearImpulse(force, offset);
                // b.ApplyAngularImpulse(10000.0, true);

            }
        }
    });

    return BoxWorld;

});
