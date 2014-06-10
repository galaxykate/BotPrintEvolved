/**
 * @author Kate Compton
 */

define(["common", "graph", "./handles", "../catalog"], function(common, Graph, Handle, catalog) {'use strict';

	// A chassis is some single piece of acrylic capable of holding parts
	//  It has some modifiable handles
	var Chassis = Class.extend({

        init : function(bot, parent) {
            this.bot = bot;
            this.parent = parent;

            this.handles = [];
			this.className = "Chassis";
            var sideCount = 10;
            for (var i = 0; i < sideCount; i++) {
                var r = 50 + Math.random() * 20;
                var theta = 2 * Math.PI * i / sideCount;
                this.handles[i] = new Handle.RadialHandle(r, theta, this, i);
            }

            this.parts = [];
            this.path = new Graph.Path();
            this.centroid = new Vector();

            this.isStale = false;
            this.refresh();

            this.attachmentForces = [];
        },

        //Turns DNA into attachments
        makeAttachments : function(dna) {
            for(var i=0; i<this.parts.length; i++) {
                this.removePart(this.parts[i]);
            }
            var edge, pct, offset, thetaOffset, part;
            var parent = this;
            var smoothIndex = function(real, array) {
                real = real * (array.length - 1);
                var id = utilities.roundNumber(real, 0);
                if(id >= array.length || id < 0) {
                    //This is not a very smart way to handle this
                    id = utilities.getRandomIndex(array);
                }
                return id
            }

            var attachData = dna.getData("attachments");
            if(attachData !== undefined) {
                console.log("adding from dna");
                //Set attachments from DNA
                attachData.forEach(function(gene) {
                    //gene[0] is the type of attachment
                    var id = smoothIndex(gene[0], catalog.allParts);
                    part = catalog.createPart(id, parent);

                    //gene[1] is the intensity
                    //gene[2] is the decay
                    //gene[3] is the edge
                    var edgeI = smoothIndex(gene[3], parent.path.edges);
                    edge = parent.path.edges[edgeI];
                    //gene[4] is the pct
                    pct = gene[4];
                    //gene[5] is the offset
                    offset = gene[5];
                    //gene[6] is the thetaOffset
                    thetaOffset = gene[6];
                    var p = new Graph.Position(edge, pct, offset, thetaOffset);
                    parent.attachPartAt(part, p);

                });
            } else {
                console.log("ADDING");
                for (var i = 0; i < 2; i++) {
                    part = catalog.createPart(undefined, parent);
                    edge = utilities.getRandom(this.path.edges);
                    pct = .5;
                    offset = 0;
                    thetaOffset = 0;
                    var p = new Graph.Position(edge, pct, offset, thetaOffset);
                    this.attachPartAt(part, p);
                }
            }
        },
        // Given some 2D array, set from this
        setFromDNA : function(dna) {
            var chassis = this;
            for (var i = 0; i < this.handles.length; i++) {

                this.handles[i].setFromDNA(dna);
            };
            this.isStale = true;
            this.makeAttachments(dna);
        },

        setDNAFrom : function() {

        },

        getDNA : function() {
            return this.bot.dna;
        },

        //========================================================================
        //========================================================================
        // Update

        update : function(time) {

            // Refresh if stale (ie, something has changed)
            if (this.isStale) {
                this.refresh();
                this.isStale = false;
            }

            // Update all the attachments
            this.parts.forEach(function(part) {
                part.update(time);
            });
        },

        refresh : function() {
            // Refresh the shape, set the path from the handles
            this.setPathFromHandles();

            // Recalculate the center
            this.path.setToCentroid(this.centroid);

            // Refresh the dependents (attachments, components)
            this.parts.forEach(function(part) {
                part.refresh();
            });

            // Refresh the wiring
            // TODO
        },

        setPathFromHandles : function() {
            var path = this.path;
            path.clear();
            this.handles.forEach(function(handle) {
                path.addEdgeTo(handle);
            });
            path.close();
        },

        compileForces : function(forces) {
            return this.attachmentForces;
        },

        //========================================================================
        //========================================================================
        // Interactions

        // options include range, allowHandles, allowParts
        getTouchableAt : function(query) {
            var closest = {
                obj : undefined,
                dist : 9999,
            };


            // Search the handles
            if (query.allowHandles) {
                this.handles.forEach(function(handle) {
                    if (query.not !== handle) {
                        var d = handle.getDistanceTo(query.screenPos);

                        if (d < closest.dist) {
                            closest.dist = d;
                            closest.obj = handle;
                        }
                    }
                });
            }
            if (query.allowParts) {
            	app.log("Screen Pos: " + query.screenPos);
                this.parts.forEach(function(part) {
					if (query.not !== part) {
                      var d = part.attachPoint.getDistanceTo(query.screenPos);
                      var p = part.attachPoint;
                      app.log("Distance to p " + p.toSimpleString());
                      app.log("Distance to " + part + " " + d);
                      //app.log("Distance to part " + part.toSimpleString());
                      if (d < closest.dist) {
                          closest.dist = d;
                          closest.obj = part;
                      }
                    }
                });
            }
			
            return closest;
        },

        //p is a Position
        attachPartAt : function(part, p) {
            //console.log("Attach " + part + " at " + p);
            if (part.chassis !== this) {
                part.detach();
                part.attachTo(this);
            }

            // Don't allow an arbitrary offset of p
            if (p.refresh) {
                p.offset = utilities.constrain(p.offset, -18, -8);
                p.refresh();
            }
            part.setAttachPoint(p);
        },

        addPart : function(part) {
            this.parts.push(part);
            this.attachmentForces.push(part.force);
        },

		findPartIndex : function(part) {
			var rVal = -1;
			for (var i = 0; i < this.parts.length; i++) {
				if (part === this.parts[i]) {
					rVal = i;
				}
			}
			return rVal
		},

		removePart : function(part) {
		//	console.log("Remove Part logging: ");
			//console.log(part);
			//get rid of the force this attachment generates
			for(var i = 0; i < this.attachmentForces.length; i++){
				if(this.attachmentForces[i].attachment.id === part.id){
					this.attachmentForces.splice(i, 1);
				}
			}
			
			//and remove the part
			var index = this.findPartIndex(part);
			this.parts.splice(index, 1);
			//this.attachmentForces.splice(index,1);
		},
        transformToGlobal : function(local, global) {

            this.bot.transform.toWorld(local, global);

        },
        //========================================================================
        //========================================================================
        // Drawing

        render : function(context) {
            var g = context.g;
            // Just draw a line around the points

            this.drawBorder(context);

            // Draw handles
            if (context.drawHandles) {
                this.handles.forEach(function(h) {
                    h.draw(context);
                });
            }

            // Draw handles
            this.parts.forEach(function(part) {
                part.render(context);
            });

            // draw the centroid for debugging purposes
            this.bot.idColor.fill(g, .5, 1);
            this.centroid.drawCircle(g, 10);

        },
        drawBorder : function(context) {
            var g = context.g;
            var idColor = this.bot.idColor;

            g.strokeWeight(1);
            idColor.fill(g, .2, 1);
            idColor.stroke(g, -.4, 1);

            if (this.bot.isHoveredOver) {
                g.strokeWeight(5);
                idColor.stroke(g, .7, 1);
                idColor.fill(g, -.5, 1);
            }

            g.beginShape();
            this.handles.forEach(function(h) {
                h.vertex(g);
            });
            g.endShape(g.CLOSE);
        },

        drawForces : function(context) {
            var g = context.g;

            for (var i = 0; i < this.attachmentForces.length; i++) {
                this.attachmentForces[i].draw(g);
            }

        },
    });

    return Chassis;
});
