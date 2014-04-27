/**
 * @author Kate Compton
 */

//FIXME: Right now, as a dependacy, boxWorld is defined.  This is not something we want to leave in here
define(["common", "graph", "./attachment", "../wiring", "../../physics/boxWorld"], function(common, Graph, Attachment, Wiring, boxWorld) {'use strict';

	var Actuator = Attachment.extend({
		init : function() {
			this._super();
			this.actuation = 1;
			this.decay = .5;
			this.id = "Jet" + this.idNumber;
		},

		actuate : function(value) {
			this.actuation = value;
		},

		update : function(time) {
			this.actuation *= Math.pow(this.decay, time.ellapsed) - .1 * this.decay * time.ellapsed;
			this.actuation = utilities.constrain(this.actuation, 0, 1);
		},

		getForce : function() {
			var globalPos = new Vector(0, 0);
			globalPos.rotation = 0;
			var p = this.getWorldTransform();

			// Get the global force
			return {
				position : p,
				//power : 1000 * Math.max(0, Math.sin(app.arena.time + this.idNumber)) + 100,
				power : 2000 * this.actuation,
				direction : p.rotation,
			};
		},

		renderDetails : function(context) {
			var g = context.g;
			var r = 10;
			g.fill(0);
			g.noStroke();
			g.ellipse(r / 2, 0, r * 1.2, r * 1.2);

			g.fill(0);
			g.rect(r / 2, -r / 2, -r * 2, r);
			g.fill(0);
			g.ellipse(-r * 1.5, 0, r * .5, r * .9);

			var r2 = r + .3 * r * this.actuation;
			var rlength = 2 * r * this.actuation + r * .1;
			g.fill(.12, 1, 1);
			g.ellipse(-r * 1.5 - rlength, 0, rlength, r2 * .5);

			g.fill(1, 0, 1, .7);
			g.text(this.idNumber, -3, 5);
		},

		toString : function() {
			return this.id;
		}
	});

	var Sharpie = Actuator.extend({

		init : function() {
			this._super();

			this.stamp = "";
			if (Math.random() > .999)
				this.stamp = "BotPrint!";
			this.id = "Sharpie" + this.idNumber;

			this.color = new common.KColor(Math.random(), 1, 1);
		},

		update : function(time) {
			var marker = this;
			this.actuation *= Math.pow(this.decay, time.ellapsed) - .1 * this.decay * time.ellapsed;
			this.actuation = utilities.constrain(this.actuation, 0, 1);
			var worldPos = this.getWorldTransform();

			var strength = this.actuation;
			app.arena.drawOnto(worldPos, function(g) {
				marker.color.fill(g, 0, -1 + 2 * strength);
				g.ellipse(0, 0, 5, 15);

				if (marker.stamp.length > 0)
					g.text(marker.stamp, -5, 0);
			});

		},

		getForce : function() {
			return undefined;
		},

		renderDetails : function(context) {
			var g = context.g;
			var r = 10;
			g.fill(0);
			g.noStroke();
			g.ellipse(r / 2, 0, r * 1.2, r * 1.2);

			g.fill(0);
			g.ellipse(-r * 1.5, 0, r * 1.4, r * .4);

			var length = -r * 2.7;
			var r2 = .2 * r;
			this.color.fill(g);
			g.ellipse(length, 0, r2, r2);

			g.fill(1, 0, 1, .7);
			g.text(this.idNumber, -3, 5);

		},
	});

	var DiscoLight = Actuator.extend({
		init : function() {
			this._super();
			this.stamp = "";
			this.id = "DiscoLight" + this.idNumber;
			this.color = new common.KColor(Math.random(), 1, 1);
			this.blinkOffset = 0;
		},

		update : function(time) {
			var marker = this;
			this.actuation *= Math.pow(this.decay, time.ellapsed) - .1 * this.decay * time.ellapsed;
			this.actuation = utilities.constrain(this.actuation, 0, 1);
			var worldPos = this.getWorldTransform();
			this.color = new common.KColor(Math.random(1), Math.random(1), 1);
			var strength = this.actuation;
			app.arena.drawOnto(worldPos, function(g) {
				marker.color.fill(g, 0, -1 + 2 * strength);
				g.rect(0, 0, 20, 20);

				if (marker.stamp.length > 0)
					g.text(marker.stamp, -5, 0);
			});

		},

		getForce : function() {
			return undefined;
		},

		renderDetails : function(context) {
			var g = context.g;
			var r = 10;
			g.fill(0.5);
			g.noStroke();
			g.ellipse(r / 2, 0, r * 1.5, r * 1.5);

			g.fill(0.5);
			g.ellipse(-r * 1.5, 0, r * 2.4, r * .8);

			var length = -r * 4;
			var r2 = .2 * r;
			this.color.fill(g);
			g.ellipse(length, 0, r2, r2);

			g.fill(1, 0, 1, .7);
			g.text(this.idNumber, -3, 5);

		},
	});

	var Wheel = Actuator.extend({

		init : function() {

			this._super();
			this.id = "Wheel " + this.idNumber;
			this.color = new common.KColor(266, 87, 52);
			//yay, purple!

			this.maxSteeringAngle = 1;
			this.steeringAngle = 0;
			this.STEER_SPEED = 3;
			this.mspeed
			this.sf = false;
			this.sb = false;
			this.ENGINE_SPEED = 300;

			this.p1 = app.createForceVec(0, 0);
			this.p2 = app.createForceVec(0, 0);
			this.p3 = app.createForceVec(0, 0);

			this.moveVec = new common.Transform();
			this.boxWorldRef = app.getBoxWorldInstance();

			this.b2dWheel = undefined;
		},

		//overloading the attachTo() method to pass new values to the box2D bodies
		attachTo : function(parent, attachPoint) {
			this.parent = parent;
			this.attachPoint = attachPoint;
			
			this.b2dWheel = this.boxWorldRef.createWheel(attachPoint.x, attachPoint.y, this);
		},

		update : function(time) {
			//this is where we'll cancel the lateral velocity on a wheel
		},

		getForce : function() {
			//position in world space
			var p = this.getWorldTransform();
			
			return {
				position : p,
				power : this.ENGINE_SPEED,
				direction : p.rotation,
				location : "wheel",
			};
		},

		//some calculating helper methods
		steerForward : function() {
			this.b2dWheel.ApplyForce(app.createForceVec(this.p3.x, this.p3.y), this.b2dWheel.GetWorldPoint(app.createForceVec(0, 0)));
		},

		cancelVel : function() {
			//there might be this weird object presistance problem

			var aaaa = app.createForceVec(0, 0);
			var bbbb = app.createForceVec(0, 0);
			var newlocal = app.createForceVec(0, 0);
			var newworld = app.createForceVec(0, 0);

			aaaa = this.b2dWheel.GetLinearVelocity();
			bbbb = this.b2dWheel.GetLocalVector(aaaa);
			newlocal.Set(bbbb.get_x() * -1, bbbb.get_y());
			newworld = this.b2dWheel.GetWorldVector(newlocal);
			this.b2dWheel.SetLinearVelocity(newworld);
		},

		renderDetails : function(context) {
			var g = context.g;
			var r = 10;
			g.fill(0);
			g.noStroke();
			g.rect(r / 2, -r / 2, -r * 2, r);
		}
	});

	Actuator.Wheel = Wheel;
	Actuator.Sharpie = Sharpie;
	Actuator.DiscoLight = DiscoLight;
	return Actuator;
});
