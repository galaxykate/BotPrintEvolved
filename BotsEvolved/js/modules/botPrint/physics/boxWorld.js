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

			//if (BoxWorld.prototype._singletonInstance){
			//return BoxWorld.prototype._singletonInstance;
			//}

			//BoxWorld.prototype._singletonInstance = this;

			this.scale = 30;
			this.frame = 0;

			this.gravity = new Box2D.b2Vec2(0.0, gravity);
			this.world = new Box2D.b2World(this.gravity);

			//this.listener = new Box2D.b2ContactListener();

			this.bodies = [];
			this.wheels = [];
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

			//static access
			app.createForceVec = function(x, y) {
				return new Box2D.b2Vec2(x, y);
			};

			//singleton (not enforced)
			app.getBoxWorldInstance = function() {
				if (app.boxWorld === undefined) {
					app.boxWorld = new BoxWorld(0);
				}

				return app.boxWorld;
			};
		},

		//WHEEL THINGS
		//===================================================================
		//===================================================================
		//===================================================================
		createWheel : function(x, y, parent) {

			var bodyDef = new Box2D.b2BodyDef();
			bodyDef.type = Box2D.b2Body.b2_dynamicBody;
			bodyDef.set_position(x, y);

			//var fixDef = new Box2D.b2FixtureDef();
			//fixDef.set_density(30);
			//fixDef.set_friction(10);
			//fixDef.set_restitution(0.1);
			//fixDef.shape = new Box2D.b2PolygonShape();
			//fixDef.shape.SetAsBox(0.2, 0.4);
			//fixDef.set_isSensor(true);

			var wheel = this.world.CreateBody(bodyDef);

			var shape = new Box2D.b2PolygonShape();
			shape.SetAsBox(0.2, 0.4);
			wheel.CreateFixture(shape, 30);

			wheel.parentObject = parent;
			wheel.userData = wheel.parentObject.parent.bot.name;

			this.wheels.push(wheel);
			return wheel;
		},

		createRevJoint : function(chassis, wheel, parent) {
			//connect a wheel to the chassis with a revolution joint
			var revolutionJointDef = new Box2D.b2RevoluteJointDef();

			revolutionJointDef.Initialize(chassis, wheel, wheel.GetWorldCenter());
			revolutionJointDef.motorSpeed = 0;
			revolutionJointDef.maxMotorTorque = 1000;
			revolutionJointDef.enableMotor = true;
			revolutionJoint = this.world.CreateJoint(revolutionJointDef);

			revolutionJoint.parentObject = parent;

			this.joints.push(revolutionJoint);

			return revolutionJoint;
		},

		//END WHEEL THINGS
		//===========================================================
		//===========================================================

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
			console.log("bpos: [" + bpos.get_x() + ", " + bpos.get_y() + "]");
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

		//Helper function to create the rev joints and attach the wheels to the chassis that need them
		attachWheels : function(chassis) {
			for (var i = 0; i < this.wheels.length - 1; i++) {
				if (chassis.parentObject.name === this.wheels[i].userData) {
					var curJoint = this.createRevJoint(chassis, this.wheels[i], chassis.parentObject);
				}
			}
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

			//iterates though all the objects i.e bots
			$.each(objects, function(index, obj) {

				var points = obj.getHull();

				// var customShapes = boxWorld.createPolygonShapes(obj.points);
				var customShapes = boxWorld.createTriFanShapes(points);

				var body = boxWorld.world.CreateBody(bodyDef);

				boxWorld.setBodyToTransform(body, obj.transform);

				$.each(customShapes, function(index, shape) {
					var fixtureDef = new Box2D.b2FixtureDef();
					fixtureDef.set_density(5.0);
					fixtureDef.set_friction(0.6);
					fixtureDef.set_shape(shape);
					body.CreateFixture(fixtureDef);
				}),

				// set the parent object
				body.parentObject = obj;

				//body.SetUserData(obj);

				boxWorld.attachWheels(body);
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
			// Set the bodies from the boxes
			$.each(this.bodies, function(index, body) {
				boxWorld.setBodyToTransform(body, body.parentObject.transform);

			});
			
			$.each(this.wheels, function(index, wheel) {
				boxWorld.setBodyToTransform(wheel, wheel.parentObject.attachPoint);

			});

			// // do the same for wheels
			// $.each(this.wheels, function(index, wheel){
			// boxWorld.setBodyToTransform(wheel, wheel.parentObject.attachPoint);
			// });

			this.applyForce();

			// console.log("List of bodies in the box2D world representation:");
			// var b = this.world.GetBodyList();
			// for(var i = 0; i < 10; i++){
			// console.log(b);
			// var vel = b.GetLinearVelocity();
			// console.log(vel.get_x() + ", " + vel.get_y());
			// b = b.GetNext();
			// }
			// debugger;

			this.world.Step(dt, 2, 2);

			$.each(this.wheels, function(index, wheel){
				boxWorld.readIntoTransform(wheel, wheel.parentObject.attachPoint);
			});
			
			// Read box2d data into JS objects
			$.each(this.bodies, function(index, body) {
				var bpos = body.GetPosition();
				console.log("After applying forces and shifting frames: ");
				console.log(bpos.get_x() + ", " + bpos.get_y());

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

			console.log("Force calc: ");
			for (var i = 0; i < this.bodies.length; i++) {
				var body = this.bodies[i];

				var objTheta = body.parentObject.transform.rotation;

				// Get all the forces of the bot
				var forces = body.parentObject.getForces();

				console.log("For: " + body.parentObject.name);
				
				$.each(forces, function(index, force) {
					var r = force.power;
					var theta = force.direction;
					//console.log("Calculated: ");
					//console.log("Power: " + r);
					//console.log("Rotation: " + theta);
					//console.log("Position: " + force.position.x + ", " + force.position.y);
					
					//forceDir is the direction/strength of the force
					//forceOffset is the world-relative point at which it is applied
					boxWorld.setTo(forceDir, r * Math.cos(theta), r * Math.sin(theta));
					boxWorld.setTo(forceOffset, force.position.x, force.position.y);

					//console.log("Applying: ");
					//console.log("forceDir: " + forceDir.get_x() + ", " + forceDir.get_y());
					//console.log("forceOffset: " + forceOffset.get_x() + ", " + forceOffset.get_y());
					console.log("\n");
					
					for(var j = 0; j < boxWorld.wheels.length - 1; j++){
						if(body.parentObject.name === boxWorld.wheels[j].userData){
							console.log("forceOffset: " + forceOffset.get_x() + ", " + forceOffset.get_y());
							console.log(boxWorld.wheels[j].parentObject);
							console.log("wheel location: " + boxWorld.wheels[j].GetWorldPoint(new b2Vec2(0,0)).get_x() + ", " + boxWorld.wheels[j].GetWorldPoint(new b2Vec2(0,0)).get_y());
							boxWorld.wheels[j].ApplyForce(forceDir, forceOffset);
						}
					}
					
					debugger;
				});
				//  b.ApplyLinearImpulse(force, offset);
				// b.ApplyAngularImpulse(10000.0, true);

			}
		}
	});

	return BoxWorld;

});
