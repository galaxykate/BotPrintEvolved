/**
 * @author Kate Compton
 */

define(["common", "modules/bots/attachment", "modules/bots/attachPoint", "box2DHelpers", "./botBrain"], function(COMMON, Attachment, AttachPoint, box2DHelpers, BotBrain) {
    var botCount = 0;

    // Genotype indices
    var pointCount = 10;
    var attachGeneLength = 4;
    var geneIndices = {
        pointRadii : {
            start : 0,
            count : pointCount,
        },

        attachments : {
            start : pointCount,
            count : pointCount * attachGeneLength,
        },

    }

    var sliceGene = function(genotype, part) {
        return genotype.slice(geneIndices[part].start, geneIndices[part].start + geneIndices[part].count);
    };

    var Bot = Vector.extend({
        init : function(genotype) {
            this._super(0, 0);
            var bot = this;
            this.idNumber = botCount;
            botCount++;

            this.name = "bot" + this.idNumber;
            this.genotype = genotype;
            this.rotation = Math.random(Math.PI * 2);
            this.setTo(Math.random() * 400, Math.random() * 300);
            var hash = 0;
            $.each(this.genotype, function(index, val) {
                hash += val;
            })

            this.idColor = new KColor((hash * .1) % 1, 1, 1);

            this.radius = 20;
            var pointCount = 10;
            this.score = 0;

            // Make the points and edges from this bot
            var pointGenes = sliceGene(genotype, "pointRadii");
            var dTheta = 2 * Math.PI / pointCount;
            this.points = [];
            this.attachPoints = [];
            this.edges = [];
            for (var i = 0; i < pointCount; i++) {
                var theta = i * dTheta;
                var r = this.radius * (.4 + 2 * pointGenes[i] * pointGenes[i]);
                this.points[i] = Vector.polar(r, theta);

                this.attachPoints.push(new AttachPoint(this, this.points[i], theta));
            }

            for (var i = 0; i < pointCount; i++) {
                this.edges = new Edge(this.points[i], this.points[(i + 1) % this.points.length]);
            }

            // Create thrusters
            var attachGenes = sliceGene(genotype, "attachments");

            $.each(this.attachPoints, function(index, point) {
                var gene = attachGenes.slice(index * attachGeneLength, (index + 1) * attachGeneLength);

                if (gene[0] > .7)
                    point.attach(new Attachment.Thruster(point));
                else if (gene[0] > .4) {

                    point.attach(new Attachment.Sensor(point));

                }
            });

            this.createBody();


            this.brain = new BotBrain(this);

        },

        // Make a body, made from triangles
        createBody : function() {
            this.body = b2DWorld.CreateBody(b2DBodyDef);

            // For each triangle
            var triangles = [];
            var center = new Box2D.b2Vec2(0, 0);
            for (var i = 0; i < this.points.length; i++) {
                var vertices = [];
                var p0 = this.points[i];
                var p1 = this.points[(i + 1) % this.points.length];
                vertices[0] = new Box2D.b2Vec2(Math.round(p0.x), Math.round(p0.y));
                vertices[1] = new Box2D.b2Vec2(Math.round(p1.x), Math.round(p1.y));
                vertices[2] = center;

                triangles.push(vertices);

                var shape = box2DHelpers.createPolygonShape(vertices);
                // Fixture attaches the shape to the body
                var fd = new Box2D.b2FixtureDef();
                fd.set_shape(shape);
                fd.set_density(105.0);
                fd.set_friction(0.0);
                this.body.CreateFixture(fd);

            }
            this.triangles = triangles;

            this.body.parent = this;

            this.body.SetLinearDamping(.1);
            this.body.SetAngularDamping(2.2);

            this.body.SetTransform(new Box2D.b2Vec2(this.x, this.y), Math.random());
            this.body.SetLinearVelocity(new Box2D.b2Vec2(0, 0));
            this.body.SetAwake(1);
            this.body.SetActive(1);

        },

        update : function(time) {
            $.each(this.attachPoints, function(index, point) {
                point.update(time);
            });

            this.brain.makeDecision();

            //  if (Math.random() > .9)
            //  this.gainScore(1);

        },

        getForces : function() {
            var forces = [];
            $.each(this.attachPoints, function(index, point) {
                if (point.child) {
                    var f = point.child.getForce();
                    if (f !== undefined)
                        forces.push(f);
                }
            });
            return forces;
        },

        gainScore : function(score) {
            this.score += score;
            this.div.scoreDiv.html(this.score + "pts");

        },
        setAngle : function(angle) {
            this.rotation = angle;
        },

        // Create a list of all this bots sensors
        getAttachmentMap : function() {
            var map = {
                sensors : [],
                actuators : [],
                debugOutput : function() {
                    // for each sensor
                    console.log("Sensors");
                    $.each(this.sensors, function(index, sensor) {
                        console.log(index + ": " + sensor);
                    });

                    console.log("Actuators");
                    $.each(this.actuators, function(index, actuator) {
                        console.log(index + ": " + actuator);
                    });
                }
            }

            // From wikipedia: An actuator is the mechanism by which a control system acts upon an environment.

            // Compile a list of all attachments that have the "sense" function
            $.each(this.attachPoints, function(index, point) {
                point.compileAll(map.sensors, function(attachment) {
                    return attachment.sense !== undefined;
                });
                point.compileAll(map.actuators, function(attachment) {
                    return attachment.actuate !== undefined;
                });

            });
            return map;
        },

        getActuators : function() {

        },

        drawDetails : function(g, t) {

            g.noStroke();
            if (this.selected) {
                var pulse = Math.abs(Math.sin(t * 10));
                this.idColor.fill(g, .4 + .3 * pulse, -.4 - .3 * pulse);
                var r = (1 + .3 * pulse) * 30;
                g.ellipse(0, 0, r, r);
            }

            g.strokeWeight(1);
            this.idColor.fill(g);
            g.noStroke();

            g.beginShape();
            for (var i = 0; i < this.points.length; i++) {
                this.points[i].vertex(g);
            }
            g.endShape(g.CLOSE);

        },
        draw : function(g, t) {
            g.pushMatrix();

            this.translateTo(g);
            g.rotate(this.rotation);

            this.drawDetails(g, t);
            $.each(this.attachPoints, function(index, point) {
                point.draw(g, t);
            });

            g.popMatrix();

            if (app.options.drawB2D) {

                // Draw the collision shape
                var bpos = this.body.GetPosition();

                g.pushMatrix();
                g.translate(bpos.get_x(), bpos.get_y());
                g.rotate(this.body.GetAngle())

                g.stroke(0);
                g.strokeWeight(2);
                g.noFill();

                for (var i = 0; i < this.triangles.length; i++) {
                    g.beginShape();
                    var vertices = this.triangles[i];
                    for (var j = 0; j < vertices.length; j++) {
                        var v = vertices[j];
                        g.vertex(v.get_x(), v.get_y());
                    }
                    g.endShape(g.CLOSE);
                }

                g.popMatrix();
            }
        },

        toString : function() {
            return "Bot" + this.idNumber;
        }
    });

    return Bot;
});
