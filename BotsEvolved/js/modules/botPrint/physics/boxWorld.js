/**
 * @author Kate Compton
 */

define(["jQuery", "box2D", "common"], function(JQUERY, Box2D, common) {

    function B2DtoString(v) {
        return "(" + v.get_x().toFixed(2) + ", " + v.get_y().toFixed(2) + ")";
    };

    var b2Vec2 = Box2D.b2Vec2;

    var BoxWorld = Class.extend({

        init : function(gravity) {

            this.scale = 30;
            this.frame = 0;
            this.gravity = new Box2D.b2Vec2(0.0, gravity);
            this.world = new Box2D.b2World(this.gravity);

            this.bodies = [];

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
            transform.setTo(bpos.get_x() * this.scale, bpos.get_y() * this.scale);
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
        setBodyToTransform : function(bodyDef, transform) {

            bodyDef.set_position(this.toB2Vec(transform));
            bodyDef.set_angle(transform.rotation);
        },

        // Add some set of objects that have "getHull" and a "transform"
        addObjects : function(objects) {
            var boxWorld = this;
            var a = 7.5;
            var testShape = new Box2D.b2PolygonShape();
            testShape.SetAsBox(a, a);

            var bodyDef = new Box2D.b2BodyDef();
            bodyDef.angularDamping = 10.01;
            bodyDef.set_type(Box2D.b2_dynamicBody);

            $.each(objects, function(index, obj) {

                var points = obj.getHull();
                
                // var customShapes = boxWorld.createPolygonShapes(obj.points);
                var customShapes = boxWorld.createTriFanShapes(points);

                boxWorld.setBodyToTransform(bodyDef, obj.transform);
                var body = boxWorld.world.CreateBody(bodyDef);

                // set the parent object
                body.parentObject = obj;
                $.each(customShapes, function(index, shape) {
                    body.CreateFixture(shape, 5.0);
                })
                boxWorld.bodies.push(body);

            });
        },
        addSquares : function() {
            var a = 7.5;
            var shape = new Box2D.b2PolygonShape();
            shape.SetAsBox(a, a);

            var bodyDef = new Box2D.b2BodyDef();
            bodyDef.set_type(Box2D.b2_dynamicBody);

            for (var i = 0; i < 30; i++) {

                bodyDef.set_position(new b2Vec2(Math.random() * 40 - 20, Math.random() * 40 - 20));
                var body = this.world.CreateBody(bd);
                body.CreateFixture(shape, 5.0);
                this.bodies[i] = body;
                this.readObject(i);
            }

        },

        render : function(g) {
            var boxWorld = this;
            var w = 15;
            $.each(this.bodies, function(index, body) {
                var forces = body.parentObject.getForces();

                g.fill(1, 1, 1);
                $.each(forces, function(index, force) {
                    //  force.position.drawCircle(g, 10);
                    g.strokeWeight(3);
                    g.stroke(1, 1, 1);
                    //                    force.position.drawArrow(g, Vector.polar(1, force.direction), Math.sqrt(force.power));

                });

                var bpos = body.GetPosition();
                var x = bpos.get_x() * boxWorld.scale;
                var y = bpos.get_y() * boxWorld.scale;
                var angle = body.GetAngle();
                g.pushMatrix();
                g.translate(x, y);
                g.rotate(angle);
                g.noStroke();
                g.fill((.12 + .7823 * index) % 1, 1, 1);
                g.rect(-w / 2, -w / 2, w, w);
                g.popMatrix();

            });

        },
        addObject : function(regionPath, density) {

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

                $.each(forces, function(index, force) {
                    var r = force.power;
                    var theta = force.direction;

                    // forceDir is the direction/strength of the force
                    // forceOffset is the world-relative point at which it is applied
                    boxWorld.setTo(forceDir, r * Math.cos(theta), r * Math.sin(theta));
                    boxWorld.setTo(forceOffset, force.position.x, force.position.y);
                    body.ApplyForce(forceDir, forceOffset);
                });

                //  b.ApplyLinearImpulse(force, offset);
                // b.ApplyAngularImpulse(10000.0, true);

            }
        }
    });

    return BoxWorld

});
