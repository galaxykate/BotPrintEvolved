var prefix = "modules/shared/graphs/";

define([prefix + "edge", prefix + "graph", prefix + "path", prefix + "svgLoader"], function(Edge, Graph, Path, SVG) {
    Graph.Path = Path;

    Graph.makeRectangle = function(center, w, h) {
        var path = new Path();
        var r = Math.sqrt(2);

        for (var i = 0; i < 4; i++) {
            var theta = (i + .5) * Math.PI / 2;
            path.addEdgeTo(new Vector(r * w * Math.cos(theta), r * h * Math.sin(theta)));
        }
        path.close();
        path.finish();
        return path;
    };

    Graph.createFlutedCircle = function(settings) {
        var path = new Path();

        var dTheta = Math.PI / settings.sides;
        var last;
        var lastTheta;
        var lastR = 0;

        for (var i = 0; i < settings.sides * 2 + 1; i++) {
            var theta = dTheta * i;
            var r = settings.radius * (1 - settings.fluteDepth);
            var handleR = settings.lowerWidth * r * Math.sin(dTheta / 2);

            if (i % 2 === 1) {
                r = settings.radius * (1 + settings.fluteDepth);
                handleR = settings.upperWidth * r * Math.sin(dTheta / 2);
            }

            var pt;

            if (i < settings.sides * 2) {
                var pt = Vector.polar(r, theta);
                path.addPoint(pt);
            } else {
                pt = path.nodes[0];
            }

            if (last !== undefined) {
                var e = new Edge(last, pt);

                e.setHandles(lastR, handleR, lastTheta + Math.PI / 2 + settings.peakTilt, theta + Math.PI / 2 + settings.peakTilt);
                path.edges.push(e);
            }

            last = pt;
            lastTheta = theta;
            lastR = handleR;
        }

        path.closed = true;
        return this;
    };

    _.extend(Graph, SVG);
    return Graph;

});
