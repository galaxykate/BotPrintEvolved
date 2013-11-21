/**
 * @author Kate Compton
 */

function B2DtoString(v) {
    return "(" + v.get_x().toFixed(2) + ", " + v.get_y().toFixed(2) + ")";
};

define(["jQuery", "box2D", "common"], function(JQUERY, Box2D, common) {
    function set(b2D, x, y) {
        b2D.set_x(x);
        b2D.set_y(y);

    };

    function objectToData(i) {
        var body = bodies[i];
        var data = body.parent;

        var bpos = body.GetPosition();
        data.setTo(bpos.get_x(), bpos.get_y());

        data.setAngle(body.GetAngle());
    };

    var BoxWorld = Class.extend({

        init : function() {
            this.gravity = new Box2D.b2Vec2(0.0, -0.0);
            this.world = new Box2D.b2World(gravity);

            var groundDef = new Box2D.b2BodyDef();
            this.ground = world.CreateBody(groundDef);
            ground.CreateFixture(createEdgeShape(points), 0.0);

            // Create a reusable body definition
            this.bodyDef = new Box2D.b2BodyDef();
            this.bodyDef.set_type(Box2D.b2_dynamicBody);

        },

        addObject : function(regionPath, density) {

        },
        removeShape : function(obj) {
            world.DestroyBody(obj);
        },

        removeAll : function() {
            for (var i = 0; i < bodies.length; i++) {
                world.DestroyBody(bodies[i]);
            }

            bodies = [];

        },

        createEdgeShape : function(points) {
            var shape0 = new Box2D.b2EdgeShape();

            for (var i = 0; i < count; i++) {
                shape0.Set(points[i], points[(count + i + 1) % count]);

            }
        },

        createPolygonShape : function(vertices) {
            var shape = new b2PolygonShape();
            var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
            var offset = 0;
            for (var i = 0; i < vertices.length; i++) {
                Box2D.setValue(buffer + (offset), vertices[i].get_x(), 'float');
                // x
                Box2D.setValue(buffer + (offset + 4), vertices[i].get_y(), 'float');
                // y
                offset += 8;
            }
            var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
            shape.Set(ptr_wrapped, vertices.length);
            return shape;
        },

        // add something that has a body
        createBody : function(points) {
            var count = points.length;
            // for each corner

            bodies.push(obj.body);

        },
    });

    var forceDir = new Box2D.b2Vec2(0, 0);
    var forceOffset = new Box2D.b2Vec2(0, 0);

    // Apply forces to all the bodies
    var applyForce = function() {
        forceOffsets = [];

        for (var i = 0; i < bodies.length; i++) {
            var b = bodies[i];

            var objTheta = b.parent.rotation;

            // Get all the forces of the bot
            var forces = b.parent.getForces();

            $.each(forces, function(index, force) {
                var r = force.power;
                var theta = force.direction;
                force.p.angle = theta;

                // forceDir is the direction/strength of the force
                // forceOffset is the world-relative point at which it is applied
                set(forceDir, r * Math.cos(theta), r * Math.sin(theta));
                set(forceOffset, force.p.x, force.p.y);

                b.ApplyForce(forceDir, forceOffset);
            });

            //  b.ApplyLinearImpulse(force, offset);
            //  b.ApplyAngularImpulse(10000.0, true);

        }
    }
    var totalTime = 0;
    var frame = 0;
    function simulate(dt) {

        applyForce();

        world.Step(dt, 2, 2);

        // Read box2d data into JS objects
        for (var i = 0; i < bodies.length; i++) {
            objectToData(i);
        }

        totalTime += dt;

        frame++;
        return objects;
    }

    function draw(g, t) {
        $.each(forceOffsets, function(index, force) {
            var offset = force.p;
            g.fill(1, 1, 1);
            var theta = offset.b2dTheta;

            g.ellipse(offset.x, offset.y, 2, 2);
            g.stroke(0);
            g.strokeWeight(1);

            var r = 40;

        });
    }

    return BoxWorld

});
