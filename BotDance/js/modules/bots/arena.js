/**
 * @author Kate Compton
 */

define(["common", "modules/bots/pickup", "box2D", "worldSim"], function(COMMON, Pickup, Box2D, WorldSim) {
 
    var Arena = Class.extend({
        init : function() {
            var border = 20;
            this.bots = [];
            this.worldSim = WorldSim;
            this.pickups = [];
            this.boundary = new Rect(border, border, screenWidth - border * 2, screenHeight - border * 2);
            

        },

        createB2DBorders : function() {
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
        },

        addBots : function(bots) {
            this.bots = bots;
            
            // Add all the bot bodies
            $.each(bots, function(index, bot) {
               bot.createBody(); 
            
               WorldSim.addShape(bot);
            });
        },
        
        getAt : function(target) {
            var closestDist = 50;
            var closest = undefined;
            
            $.each(this.bots, function(index, bot) {
                var d = bot.getDistanceTo(target);
                if (d < closestDist) {
                    closest = bot;
                    closestDist = d;
                }
            });  
            return closest;
        },
        
        
        clear: function() {
            WorldSim.removeAll();
            this.bots = [];
            this.pickups = [];
        },

        spawnPickups : function(count) {

        },

        remove : function() {

        },

        update : function(time) {
            $.each(this.bots, function(index, bot) {
                bot.update(time);
            });

            this.boxBodies = WorldSim.simulate(.05);
        },

        draw : function(g, t) {
            app.world.lightMap.draw(g, t);

            WorldSim.draw(g, t);

            // Draw the rotations of the bodies
            var r = 20;
            g.fill(0);

            $.each(this.boxBodies, function(index, body) {
                debug.output(body);
                g.pushMatrix();
                g.translate(body.x, body.y);
                g.rotate(body.rotation);
                g.rect(-r, -r, r * 2, r * 2);
                g.popMatrix();

            });

            $.each(this.pickups, function(index, pickup) {
                pickup.draw(g, t);
            });

            $.each(this.bots, function(index, bot) {
                bot.draw(g, t);
            });
        },
    });

    return Arena;
});
