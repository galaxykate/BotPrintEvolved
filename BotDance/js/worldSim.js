/**
 * @author Kate Compton
 */

function B2DtoString(v) {
    return "(" + v.get_x().toFixed(2) + ", " + v.get_y().toFixed(2) + ")";
};
define(["jQuery", "box2D", "common"], function(JQUERY, Box2D, COMMON) {

    function set(b2D, x, y) {
        b2D.set_x(x);
        b2D.set_y(y);
    }

    var forceOffsets = [];
    // Box2D representation
    var bodies = [];

    // My particle representation
    var objects = [];

    var ZERO = new Box2D.b2Vec2(0.0, 0.0);

    // Make a border
    var corners = [new Box2D.b2Vec2(0, 0), new Box2D.b2Vec2(screenWidth, 0), new Box2D.b2Vec2(screenWidth, screenHeight), new Box2D.b2Vec2(0, screenHeight)];

    var gravity = new Box2D.b2Vec2(0.0, -0.0);

    var world = new Box2D.b2World(gravity);
    b2DWorld = world;
    var bd_ground = new Box2D.b2BodyDef();
    var ground = world.CreateBody(bd_ground);

    // Create a reusable body definition
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    b2DBodyDef = bd;

    // for each corner
    var shape0 = new Box2D.b2EdgeShape();
    for (var i = 0; i < 4; i++) {
        shape0.Set(corners[i], corners[(4 + i + 1) % 4]);
        ground.CreateFixture(shape0, 0.0);
    }

    var removeShape = function(obj) {
        world.DestroyBody(obj);
    };

    var removeAll = function() {
        console.log("Remove all");
        for (var i = 0; i < bodies.length; i++) {
            world.DestroyBody(bodies[i]);
        }

        bodies = [];

    };

    // add something that has a body
    var addShape = function(obj) {

        bodies.push(obj.body);

    };

    // Indexes start from 1

    var spawnPoint = new Box2D.b2Vec2(150.0, 0.0);
    var temp = new Box2D.b2Vec2(0.0, 0.0);

    // Look at the object and read its data into this object

    function objectToData(i) {
        var body = bodies[i];
        var data = body.parent;

        var bpos = body.GetPosition();
        data.setTo(bpos.get_x(), bpos.get_y());

        data.setAngle(body.GetAngle());

    }

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

        if (frame % 10 === 0) {
            var s = "";
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                s += "(" + obj.x.toFixed(2) + " " + obj.y.toFixed(2) + ")";
            }
            //     console.log(s);

        }

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

            //  g.line(offset.x, offset.y, offset.x + r * Math.cos(theta), offset.y + -r * Math.sin(theta));

        });
    }

    return {
        removeAll : removeAll,
        applyForce : applyForce,
        addShape : addShape,
        simulate : simulate,
        draw : draw,
    }

});
