/**
 * @author Kate Compton
 */


define(["three", "inheritance", "box2D"], function(THREE, Inheritance, Box2D) {

    /**
     * Reusable Vector class
     * @class Vector
     */
    Vector = Class.extend({

        /**
         * @method init
         * @param x
         * @param y
         * @param z
         */
        init : function(x, y, z) {
            // actually another vector, clone it
            if (x === undefined) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
            } else {
                if (x.x !== undefined) {
                    this.x = x.x;
                    this.y = x.y;
                    this.z = x.z;
                } else {
                    this.x = x;
                    this.y = y;

                    this.z = 0;
                    if (z !== undefined)
                        this.z = z;

                }
            }

            if (!this.isValid())
                throw new Error(this.invalidToString() + " is not a valid vector");
        },

        /**
         * @method clone
         * @return {Vector} this
         */
        clone : function() {
            return new Vector(this);
        },

        /**
         * Copies x, y, and z from this into v.
         * @method cloneInto
         * @param {Vector} v
         */
        cloneInto : function(v) {
            v.x = this.x;
            v.y = this.y;
            v.z = this.z;
        },

        /**
         * @method addMultiple
         * @param {Vector} v
         * @param {Number} m
         */
        addMultiple : function(v, m) {
            this.x += v.x * m;
            this.y += v.y * m;
            this.z += v.z * m;
        },

        /**
         * @method addPolar
         * @param r
         * @param theta
         */
        addPolar : function(r, theta) {
            this.x += r * Math.cos(theta);
            this.y += r * Math.sin(theta);
        },

        /**
         * @method addSpherical
         * @param r
         * @param theta
         * @param phi
         */
        addSpherical : function(r, theta, phi) {
            this.x += r * Math.cos(theta) * Math.cos(phi);
            this.y += r * Math.sin(theta) * Math.cos(phi);
            this.z += r * Math.sin(phi);
        },

        /**
         * @method addRotated
         * @param {Vector} v
         * @param theta
         */
        addRotated : function(v, theta) {
            var cs = Math.cos(theta);
            var sn = Math.sin(theta);
            var x = v.x * cs - v.y * sn;
            var y = v.x * sn + v.y * cs;
            this.x += x;
            this.y += y;
        },

        /**
         * @method setToPolar
         * @param r
         * @param theta
         */
        setToPolar : function(r, theta) {
            this.x = r * Math.cos(theta);
            this.y = r * Math.sin(theta);
        },

        /**
         * @method setToCylindrical
         * @param r
         * @param theta
         * @param z
         */
        setToCylindrical : function(r, theta, z) {
            this.x = r * Math.cos(theta);
            this.y = r * Math.sin(theta);
            this.z = z;
        },

        /**
         * @method setToPolarOffset
         * @param {Vector} v
         * @param theta
         * @param r
         */
        setToPolarOffset : function(v, r, theta) {
            this.x = v.x + r * Math.cos(theta);
            this.y = v.y + r * Math.sin(theta);
            this.z = v.z;
        },

        /**
         * @method setToMultiple
         * @param {Vector} v
         * @param {Number} m
         */
        setToMultiple : function(v, m) {
            this.x = v.x * m;
            this.y = v.y * m;
            this.z = v.z * m;
        },

        /**
         * @method setToLerp
         * @param {Vector} v0
         * @param {Vector} v1
         * @param {Number} m
         */
        setToLerp : function(v0, v1, m) {
            var m1 = 1 - m;
            this.x = v0.x * m1 + v1.x * m;
            this.y = v0.y * m1 + v1.y * m;
            this.z = v0.z * m1 + v1.z * m;
        },

        /**
         * @method setToAddMultiple
         * @param {Vector} v0
         * @param {Number} m0
         * @param {Vector} v1
         * @param {Number} m1
         */
        setToAddMultiple : function(v0, m0, v1, m1) {
            this.x = v0.x * m0 + v1.x * m1;
            this.y = v0.y * m0 + v1.y * m1;
            this.z = v0.z * m0 + v1.z * m1;
        },

        /**
         * @method setToDifference
         * @param {Vector} v0
         * @param {Vector} v1
         */
        setToDifference : function(v0, v1) {
            this.x = v0.x - v1.x;
            this.y = v0.y - v1.y;
            this.z = v0.z - v1.z;
        },

        /**
         * @method setTo
         * @param x
         * @param y
         * @param z
         */
        setTo : function(x, y, z) {
            // Just in case this was passed a vector
            if (x.x !== undefined) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
                if (this.z === undefined)
                    this.z = 0;

            } else {
                this.x = x;
                this.y = y;
                if (z !== undefined)
                    this.z = z;
            }
            if (!this.isValid())
                throw new Error(this.invalidToString() + " is not a valid vector");

        },

        /**
         * @method setScreenPosition
         * @param g
         */
        setScreenPosition : function(g) {
            if (this.screenPos === undefined)
                this.screenPos = new Vector();

            this.screenPos.setTo(g.screenX(this.x, this.y), g.screenY(this.x, this.y));
        },

        /**
         * @method magnitude
         */
        magnitude : function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },

        /**
         * @method normalize
         */
        normalize : function() {
            this.div(this.magnitude());
        },

        /**
         * @method constrainMagnitude
         * @param min
         * @param max
         */
        constrainMagnitude : function(min, max) {
            var d = this.magnitude();
            if (d !== 0) {
                var d2 = utilities.constrain(d, min, max);
                this.mult(d2 / d);
            }
        },

        /**
         * @method getDistanceTo
         * @param {Vector} p
         */
        getDistanceTo : function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            var dz = this.z - p.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },

        /**
         * @method getDistanceToIgnoreZ
         * @param {Vector} p
         */
        getDistanceToIgnoreZ : function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;

            return Math.sqrt(dx * dx + dy * dy);
        },

        /**
         * @method getAngleTo
         * @param {Vector} p
         */
        getAngleTo : function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            //var dz = this.z - p.z;
            return Math.atan2(dy, dx);
        },

        //===========================================================
        //===========================================================
        // Complex geometry

        /**
         * @method dot
         * @param {Vector} v
         */
        dot : function(v) {
            return v.x * this.x + v.y * this.y + v.z * this.z;
        },

        /**
         * @method getAngleBetween
         * @param {Vector} v
         */
        getAngleBetween : function(v) {
            return Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
        },

        //===========================================================
        //===========================================================
        // Add and sub and mult and div functions

        /**
         * @method add
         * @param {Vector} v
         */
        add : function(v) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        },

        /**
         * @method sub
         * @param {Vector} v
         */
        sub : function(v) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        },

        /**
         * @method mult
         * @param {Number} m
         */
        mult : function(m) {
            this.x *= m;
            this.y *= m;
            this.z *= m;
        },

        /**
         * @method div
         * @param {Number} m
         */
        div : function(m) {
            this.x /= m;
            this.y /= m;
            this.z /= m;
        },

        /**
         * @method getOffsetTo
         * @param {Vector} v
         */
        getOffsetTo : function(v) {
            return new Vector(v.x - this.x, v.y - this.y, v.z - this.z);
        },

        /**
         * @method getAngle
         */
        getAngle : function() {
            return Math.atan2(this.y, this.x);
        },

        /**
         * @method rotate
         * @param theta
         */
        rotate : function(theta) {
            var cs = Math.cos(theta);
            var sn = Math.sin(theta);
            var x = this.x * cs - this.y * sn;
            var y = this.x * sn + this.y * cs;
            this.x = x;
            this.y = y;
        },

        /**
         * Lerp a vector!
         * @method lerp
         * @param {Vector} otherVector
         * @param percent
         */
        lerp : function(otherVector, percent) {
            var lerpVect = new Vector(utilities.lerp(this.x, otherVector.x, percent), utilities.lerp(this.y, otherVector.y, percent), utilities.lerp(this.z, otherVector.z, percent));
            return lerpVect;
        },

        /**
         * @method isValid
         */
        isValid : function() {
            return (!isNaN(this.x) && !isNaN(this.y) && !isNaN(this.z) ) && this.x !== undefined && this.y !== undefined && this.z !== undefined;
        },

        /**
         * method translateTo
         * @param g
         */
        translateTo : function(g) {
            g.translate(this.x, this.y);
        },

        /**
         * method bezier
         * @param g
         * @param c0
         * @param c1
         */
        bezier : function(g, c0, c1) {
            g.bezierVertex(c0.x, c0.y, c1.x, c1.y, this.x, this.y);
        },

        /**
         * method bezierTo
         * @param g
         * @param c0
         * @param c1
         * @param p
         */
        bezierTo : function(g, c0, c1, p) {
            g.bezier(this.x, this.y, c0.x, c0.y, c1.x, c1.y, p.x, p.y);
        },

        /**
         * method bezierWithRelativeControlPoints
         * @param g
         * @param p
         * @param c0
         * @param c1
         */
        bezierWithRelativeControlPoints : function(g, p, c0, c1) {
            // "x" and "y" were not defined, so I added "this." in front. Hopefully that's the intended action (April)
            g.bezierVertex(p.x + c0.x, p.y + c0.y, this.x + c1.x, this.y + c1.y, this.x, this.y);
        },

        /**
         * @method vertex
         * @param g
         */
        vertex : function(g) {
            g.vertex(this.x, this.y);
        },

        /**
         * @method offsetVertex
         * @param g
         * @param offset
         * @param m
         */
        offsetVertex : function(g, offset, m) {
            if (m === undefined)
                m = 1;
            g.vertex(this.x + offset.x * m, this.y + offset.y * m);
        },

        /**
         * @method drawCircle
         * @param g
         * @param radius
         */
        drawCircle : function(g, radius) {
            g.ellipse(this.x, this.y, radius, radius);
        },

        /**
         * @method drawLineTo
         * @param g
         * @param {Vector} v
         */
        drawLineTo : function(g, v) {
            g.line(this.x, this.y, v.x, v.y);
        },

        /**
         * @method drawLerpedLineTo
         * @param g
         * @param {Vector} v
         * @param startLerp
         * @param endLerp
         */
        drawLerpedLineTo : function(g, v, startLerp, endLerp) {
            var dx = v.x - this.y;
            var dy = v.y - this.y;

            g.line(this.x + dx * startLerp, this.y + dy * startLerp, this.x + dx * endLerp, this.y + dy * endLerp);
        },

        /**
         * @method drawAngle
         * @param g
         * @param {Vector} v
         * @param {Number} m
         */
        drawArrow : function(g, v, m) {
            g.line(this.x, this.y, v.x * m + this.x, v.y * m + this.y);
        },

        /**
         * @method drawAngle
         * @param g
         * @param r
         * @param theta
         */
        drawAngle : function(g, r, theta) {
            g.line(this.x, this.y, r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y);
        },

        /**
         * @method drawAngleBall
         * @param g
         * @param r
         * @param theta
         * @param radius
         */
        drawAngleBall : function(g, r, theta, radius) {
            g.ellipse(r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y, radius, radius);
        },

        /**
         * @method drawArc
         * @param g
         * @param r
         * @param theta0
         * @param theta1
         */
        drawArc : function(g, r, theta0, theta1) {
            var range = theta1 - theta0;
            var segments = Math.ceil(range / .2);
            for (var i = 0; i < segments + 1; i++) {
                var theta = theta0 + range * (i / segments);
                g.vertex(this.x + r * Math.cos(theta), this.y + r * Math.sin(theta));
            }
        },

        /**
         * @method drawText
         * @param g
         * @param s
         * @param xOffset
         * @param yOffset
         */
        drawText : function(g, s, xOffset, yOffset) {
            g.text(s, this.x + xOffset, this.y + yOffset);
        },

        /**
         * @method toThreeVector
         * @return {THREE.Vector3}
         */
        toThreeVector : function() {
            return new THREE.Vector3(this.x, this.y, this.z);
        },

        /**
         * @method toSVG
         */
        toSVG : function() {
            return Math.round(this.x) + " " + Math.round(this.y);
        },

        /**
         * @method toB2D
         */
        toB2D : function() {
            return new Box2D.b2Vec2(this.x, -this.y);
        },

        /**
         * @method toString
         * @param {Number} [precision=2]
         */
        toString : function(precision) {
            if (precision === undefined)
                precision = 2;

            return "(" + this.x.toFixed(precision) + ", " + this.y.toFixed(precision) + ", " + this.z.toFixed(precision) + ")";
        },

        /**
         * @method invalidToString
         */
        invalidToString : function() {

            return "(" + this.x + ", " + this.y + ", " + this.z + ")";
        },
    });

    // Class functions
    Vector.sub = function(a, b) {
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
    };

    Vector.dot = function(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    };

    Vector.polar = function(r, theta) {
        return new Vector(r * Math.cos(theta), r * Math.sin(theta));
    };

    Vector.angleBetween = function(a, b) {
        return Vector.dot(a, b) / (a.magnitude() * b.magnitude());
    };

    Vector.addMultiples = function(u, m, v, n) {
        var p = new Vector();
        p.addMultiple(u, m);
        p.addMultiple(v, n);
        return p;
    };

    Vector.average = function(array) { Vector
        avg = new Vector();
        $.each(array, function(index, v) {
            avg.add(v);
        });
        avg.div(array.length);
        return avg;
    };
    return Vector;

});
