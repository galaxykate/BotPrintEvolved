/**
 * @author Kate Compton
 * Modified from https://github.com/kripken/box2d.js/
 */
define(["jQuery", "box2D", "common"], function(JQUERY, Box2D, common) {
	
	//throwing a debug drawing element in global scope because I really don't see how else to get information here.
	var debugContext = document.getElementById("debug_canvas").getContext('2d');
	debugContext.fillStyle = 'rgb(255,255,0)';

	//gotta turn this into a helper object in order to ge the whole thing to behave.
	 function drawAxes (ctx) {
			ctx.strokeStyle = 'rgb(192,0,0)';
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(1, 0);
			ctx.stroke();
			ctx.strokeStyle = 'rgb(0,192,0)';
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, 1);
			ctx.stroke();
	};
	
	function setColorFromDebugDrawCallback(color) {
		var col = Box2D.wrapPointer(color, Box2D.b2Color);
		var red = (col.get_r() * 255) | 0;
		var green = (col.get_g() * 255) | 0;
		var blue = (col.get_b() * 255) | 0;
		var colStr = red + "," + green + "," + blue;
		debugContext.fillStyle = "rgba(" + colStr + ",0.5)";
		debugContext.strokeStyle = "rgb(" + colStr + ")";
	};

	function drawSegment(vert1, vert2) {
		var vert1V = Box2D.wrapPointer(vert1, Box2D.b2Vec2);
		var vert2V = Box2D.wrapPointer(vert2, Box2D.b2Vec2);
		debugContext.beginPath();
		debugContext.moveTo(vert1V.get_x(), vert1V.get_y());
		debugContext.lineTo(vert2V.get_x(), vert2V.get_y());
		debugContext.stroke();
	};

	function drawPolygon(vertices, vertexCount, fill) {
		debugContext.beginPath();
		for ( tmpI = 0; tmpI < vertexCount; tmpI++) {
			var vert = Box2D.wrapPointer(vertices + (tmpI * 8), Box2D.b2Vec2);
			if (tmpI == 0)
				debugContext.moveTo(vert.get_x(), vert.get_y());
			else
				debugContext.lineTo(vert.get_x(), vert.get_y());
		}
		debugContext.closePath();
		if (fill)
			debugContext.fill();
		debugContext.stroke();
	};

	function drawCircle(center, radius, axis, fill) {
		var centerV = Box2D.wrapPointer(center, Box2D.b2Vec2);
		var axisV = Box2D.wrapPointer(axis, Box2D.b2Vec2);

		debugContext.beginPath();
		debugContext.arc(centerV.get_x(), centerV.get_y(), radius, 0, 2 * Math.PI, false);
		if (fill)
			debugContext.fill();
		debugContext.stroke();

		if (fill) {
			//render axis marker
			var vert2V = copyVec2(centerV);
			vert2V.op_add(scaledVec2(axisV, radius));
			debugContext.beginPath();
			debugContext.moveTo(centerV.get_x(), centerV.get_y());
			debugContext.lineTo(vert2V.get_x(), vert2V.get_y());
			debugContext.stroke();
		}
	};

	function drawTransform(transform) {
		var trans = Box2D.wrapPointer(transform, Box2D.b2Transform);
		var pos = trans.get_p();
		var rot = trans.get_q();

		debugContext.save();
		debugContext.translate(pos.get_x(), pos.get_y());
		debugContext.scale(0.5, 0.5);
		debugContext.rotate(rot.GetAngle());
		debugContext.lineWidth *= 2;
		drawAxes(debugContext);
		debugContext.restore();
	};

	var debugDraw = Class.extend({
		init : function() {

		},

		getCanvasDebugDraw : function() {
			var debugDraw = new Box2D.b2Draw();

			Box2D.customizeVTable(debugDraw, [{
				original : Box2D.b2Draw.prototype.DrawSegment,
				replacement : function(ths, vert1, vert2, color) {
					setColorFromDebugDrawCallback(color);
					drawSegment(vert1, vert2);
				}
			}]);

			Box2D.customizeVTable(debugDraw, [{
				original : Box2D.b2Draw.prototype.DrawPolygon,
				replacement : function(ths, vertices, vertexCount, color) {
					setColorFromDebugDrawCallback(color);
					drawPolygon(vertices, vertexCount, false);
				}
			}]);

			Box2D.customizeVTable(debugDraw, [{
				original : Box2D.b2Draw.prototype.DrawSolidPolygon,
				replacement : function(ths, vertices, vertexCount, color) {
					setColorFromDebugDrawCallback(color);
					drawPolygon(vertices, vertexCount, true);
				}
			}]);

			Box2D.customizeVTable(debugDraw, [{
				original : Box2D.b2Draw.prototype.DrawCircle,
				replacement : function(ths, center, radius, color) {
					setColorFromDebugDrawCallback(color);
					var dummyAxis = b2Vec2(0, 0);
					drawCircle(center, radius, dummyAxis, false);
				}
			}]);

			Box2D.customizeVTable(debugDraw, [{
				original : Box2D.b2Draw.prototype.DrawSolidCircle,
				replacement : function(ths, center, radius, axis, color) {
					setColorFromDebugDrawCallback(color);
					drawCircle(center, radius, axis, true);
				}
			}]);

			Box2D.customizeVTable(debugDraw, [{
				original : Box2D.b2Draw.prototype.DrawTransform,
				replacement : function(ths, transform) {
					drawTransform(transform);
				}
			}]);

			return debugDraw;
		}
	});
	return debugDraw;
});
