/**
 * @author Kate Compton
 * Comments by Johnathan Pagnutti
 */

define(["jQuery", "box2D", "common"], function(JQUERY, Box2D, common) {

	/**
	 * Get the x,y pair of a box2D object 
	 */
    function B2DtoString(v) {
        return "(" + v.get_x().toFixed(2) + ", " + v.get_y().toFixed(2) + ")";
    };

    var firstTime = true;

    var b2Vec2 = Box2D.b2Vec2;

	/**
	 *Initalization function.  The box2D world is created here, as well as the list of bodies that go into the world.
	 * Also, the a contact listener is set up to allow the bots to have hit detection.  We're using a custom event listener
	 * to figure out collisions.
	 * 
	 * The scaling factor is also set here
	 */
    var BoxWorld = Class.extend({

        init : function(gravity) {

            this.scale = 30;
            this.frame = 0;
            this.gravity = new Box2D.b2Vec2(0.0, gravity);
            this.world = new Box2D.b2World(this.gravity);
            this.className = "BoxWorld";
            //this.listener = new Box2D.b2ContactListener();

            this.bodies = [];
            this.joints = [];
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

		/**
		 * replaces the default event listener with out own custom one
		 * used to figure out bot collisions 
		 */
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

		/**
		 * Removes all bodies from the world 
		 */
        removeBodies : function() {
            var world = this.world;
            $.each(this.bodies, function(index, body) {
                if (!body.isTerrain) {
                    world.DestroyBody(body);
                }
            });
            this.bodies = [];
        },

		/**
		 * Creates a box2D body given an edge ring
		 * @param points the points that make up the edge 
		 */
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
		
		/** 
		 * Sets the x and y components of a box2D object, scaled down
		 * 
		 * @param b2D the box2D object to set
		 * @param x the x coordinate to scale down and set b2D to
		 * @param y the y coordinate to scale down and set b2D to
		 */
        setTo : function(b2D, x, y) {
            b2D.set_x(x / this.scale);
            b2D.set_y(y / this.scale);
        },

		/**
		 * This function takes a box2D body and sets a transform from the view to this body's position, scaled back up.
		 * 
		 * @param body the box2D body to get a position of
		 * @param transform the transform to update with the scaled up box2D position
		 */
        readIntoTransform : function(body, transform) {
            var bpos = body.GetPosition();
            transform.rotation = body.GetAngle();
            try {
                transform.setTo(bpos.get_x() * this.scale, bpos.get_y() * this.scale);
            } catch(err) {
            	console.log("readIntoTransform() error");
                console.log(this.scale);
            }
        },

		/**
		 * Takes an object with some position information, either as seperate x/y arguments, 
		 * or as a single argument with an x and y property, and scales the position down.  The
		 * new position is used to create a new b2d vector, which is returned
		 * 
		 * @param p either two arguments (first one x, second one y) or a single object that has an x and y parameter
		 */
        toB2Vec : function(p) {
            if (arguments.length === 1)
                return new b2Vec2(arguments[0].x / this.scale, arguments[0].y / this.scale);
            if (arguments.length === 2)
                return new b2Vec2(arguments[0] / this.scale, arguments[1] / this.scale);
        },

		/**
		 * Set the position of a body given a position.
		 * Note: the position is probably ment to come from somewhere else that isn't box2D,
		 * as the function is 
		 * 
		 * @param bodyDef the box2D body we want to reposition
		 * @param p either a two argument x, y position, or an object with an x and y parameter 
		 */
        setBodyPosition : function(bodyDef, p) {
            bodyDef.set_position(this.toB2Vec(p));
        },

        /**
         * the inverse of @method readIntoTransform
         * Sets a box2D body to the same position and angle as a transform
         * 
         * @param body the box2D body definition
         * @param transform the transform to set the box2D body to
         */

        setBodyToTransform : function(body, transform) {
            var angle = body.GetAngle();
            if (!isNaN(transform.rotation))
                angle = transform.rotation;
            // magic?
            body.SetTransform(this.toB2Vec(transform), angle);
        },
        
        /**
         * Creates a revolution joint for the wheels, so we can attach them
         * to the main chassis of the bot, and also turn them.
         * 
         * If the joint already exsists, this function does nothing
         * @param {b2Body} wheel the wheel we want to attach to the bot
         * @param {b2Body} chassis the chassis we want to attach the wheel too
         */
		createRevJoint : function(wheel, chassis) {
			for (var i = 0; i < this.joints.length; i++) {
				if ((this.joints[i].GetBody1 === wheel || this.joints[i].GetBody1 === chassis) && (this.joints[i].GetBody2 === wheel || this.joints[i].GetBody2 === chassis)) {
					// we already have this joint, return with nothing done
					// or, we've asked for something to be jointed to itself, in which, we still don't want to do anything
					return;
				}
			}

			var revoluteJointDef = new Box2D.b2RevoluteJointDef();
			revoluteJointDef.Initialize(chassis, wheel, wheel.GetPosition());
			revoluteJointDef.motorSpeed = 0;
			revoluteJointDef.maxMotorTorque = 1000;
			revoluteJointDef.enableMotor = true;
			revoluteJoint = this.world.CreateJoint(revoluteJointDef);
		
			this.joints.push(revoluteJoint);
			
			return revoluteJoint;
		},


		/**
		 * Add some set of objects that have "getHull" and a "transform"
		 * This is done by getting the convex hull of the object, then
		 * then creating custom shapes based on the hull.
		 * 
		 * A box2D body is created and set to the same location as the object's transform,
		 * then fixtures are created out of the custom shapes, given a density, and set to the body
		 * 
		 * In addition, an object's get hull method needs to return the vertices in counter-clockeise order
		 * 
 		 * @param {Object} objects the objects to add
 		 * @param density the density of the b2d object
 		 * @param friction the coefficent of friction of the object
 		 * @param restitution the restitution of the object
		 */
        addObjects : function(objects, density, friction, restitution) {
            var boxWorld = this;

            var bodyDef = new Box2D.b2BodyDef();
            bodyDef.set_type(Box2D.b2_dynamicBody);
            bodyDef.set_angularDamping(3);
            //iterates though all the objects i.e bots
            $.each(objects, function(index, obj) {

                var points = obj.getHull();
                
				//check to make sure the verticies are in counter-clockwise order
				//beacuse Box2D is sometimes silly.
				var checkSum;
				for(var j = 0; j < points.length; j++) {
					checkSum += ((points[(j + 1) % points.length].x - points[j].x) * (points[(j + 1) % points.length].y + points[j].y));
				}
				
				if(checkSum < 0)
					throw "Vertices are not in counter clockwise order!";

                // var customShapes = boxWorld.createPolygonShapes(obj.points);
                var customShapes = boxWorld.createTriFanShapes(points);
                var body = boxWorld.world.CreateBody(bodyDef);

                boxWorld.setBodyToTransform(body, obj.transform);
				
                $.each(customShapes, function(index, shape) {
                    var fixtureDef = new Box2D.b2FixtureDef();
                    fixtureDef.set_density(density);
                	fixtureDef.set_friction(friction);
                	fixtureDef.set_restitution(restitution);	
                    fixtureDef.set_shape(shape);
                    // magic?
                    body.CreateFixture(fixtureDef);
                }),

                // set the parent object
                body.parentObject = obj;

                //body.SetUserData(obj);

                boxWorld.bodies.push(body);
                
                //for wheels, create joints to attach them to parent objects, so they don't go flying off into space
                for(var i = 0; i < boxWorld.bodies.length; i++){
                	//console.log(boxWorld.bodies[i].parentObject);
                	if(boxWorld.bodies[i].parentObject.type === "wheel"){
                		for(var j = 0; j < boxWorld.bodies.length; j++) {
                			if(boxWorld.bodies[i].parentObject.chassis.bot.name === boxWorld.bodies[j].parentObject.name){
                				var joint = boxWorld.createRevJoint(boxWorld.bodies[i], boxWorld.bodies[j]);
                				
                			}
                		}
                	}
                }
            });
        },

		/**
		 * Creates an edge shape based on a set of points.  Note that this uses modulus devision to ensure that the points suppled make a ring
 		 * @param {Object} points the points that create a ring
		 */
        createEdgeShape : function(points) {
            var shape0 = new Box2D.b2EdgeShape();

            for (var i = 0; i < count; i++) {
                shape0.Set(points[i], points[(count + i + 1) % count]);
            }
        },

		/**
		 * Magic for creating dynamic shapes
 		 * @param {Object} v some object with position information as an x and y parameter
 		 * @param {Object} buffer a buffer
 		 * @param {Object} offset an offset
		 */
        setBuffer : function(v, buffer, offset) {
            Box2D.setValue(buffer + (offset), v.x / this.scale, 'float');
            Box2D.setValue(buffer + (offset + 4), v.y / this.scale, 'float');
        },

		/**
		 * Creates box2D polygon shapes from a set of verticies
		 * Note that the verticies here are probably from an external source, as they will be scaled
 		 * @param {Object} vertices
		 */
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

		/**
		 * Creates a triangle fan shape from a set of external vertices
		 * This is mostly magic
		 * 
 		 * @param {Object} vertices a set of external verticies to create a triangle fan shape
		 */
        createTriFanShapes : function(vertices) {
            console.log("Logging triVert things:");
            console.log(vertices);
            var boxWorld = this;
            if (vertices === undefined)
                throw "No vertices: can't make B2D trifan";
                
                
			//check to make sure the verticies are unique
			for(var j = 0; j < vertices.length; j++){
				for(var i = 0; i < vertices.length; i++){
					if(vertices[j].x == vertices[i].x && vertices[j].y == vertices[i].y && i != j){
						throw "Non-unique verticies: " + vertices[j] + " == " + vertices[i];
					}
				}
			}
			
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
        
        
		/**
		 * Cancel a perpendicular velocity on a wheel
		 *
		 * @param {b2Body} wheel the b2d Body representation of the wheel in question
		 */ 
		 cancelPerpVel : function(wheel) {
			var worldVel = new b2Vec2();
			var localVel = new b2Vec2();
			var newlocal = new b2Vec2();
			var newworld = new b2Vec2();
			
			worldVel = wheel.GetLinearVelocityFromLocalPoint(new b2Vec2(0, 0));
			localVel = wheel.GetLocalVector(worldVel);
			newlocal.x = -localVel.x;
			newlocal.y = localVel.y;
			newworld = wheel.GetWorldVector(newlocal);
			
			wheel.SetLinearVelocity(newworld);
		},

        
		/**
		 * Simulate the entire world for 2 iterations and icrement frame
		 * Apply all forces, move everything according to accelerations
		 * 
 		 * @param {Object} dt magic(?)
		 */
        simulate : function(dt) {
            var boxWorld = this;

			var initBodyPoints = [];
            var initAttachPoints = [];
            // Set the bodies from the boxes
            $.each(this.bodies, function(index, body) {
                boxWorld.setBodyToTransform(body, body.parentObject.transform);
                initBodyPoints.push(body.GetPosition());
            });
            
            $.each(this.joints , function(index, joint) {
            	initAttachPoints.push(joint);
            });
            
            //additional wheel math goes here
            $.each(this.bodies, function(index, body) {
            	if(body.parentObject.type === "wheel"){
            		//cancel perpendicular velocities
            		boxWorld.cancelPerpVel(body);
            	}
            });
			
            this.applyForce();
			
            this.world.Step(dt, 2, 2);

            // Read box2d data back into BotPrint objects objects
            $.each(this.bodies, function(index, body) {
                boxWorld.readIntoTransform(body, body.parentObject.transform);          	
            });

            this.frame++;
        },
        

		/**
		 * Apply all forces to all bodies.  Forces that should be applied are externally 
		 * Note: forces will get scaled down
		 * 
		 */
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
					
                    // forceDir is the direction/strength of the force
                    // forceOffset is the world-relative point at which it is applied
                    boxWorld.setTo(forceDir, force.x, force.y);
                    boxWorld.setTo(forceOffset, force.center.x, force.center.y);

					//apply forces
                    body.ApplyForce(forceDir, forceOffset);  
                });
                
                //  b.ApplyLinearImpulse(force, offset);
                // b.ApplyAngularImpulse(10000.0, true);
            }
        }
    });

    return BoxWorld;

});
