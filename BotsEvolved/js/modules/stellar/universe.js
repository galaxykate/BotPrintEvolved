/**
 * @author Kate Compton
 */

define(["common", "voronoi", "modules/pathing/graph", "./universeObject"], function(common, Voronoi, Graph, UniverseObject) {
    var Universe = Class.extend({
        init : function() {
            var universe = this;
            this.regionCenters = [];
            var count = 12;
            var spacing = 100;

            var wiggle = spacing * .3;
            for (var i = 0; i < count; i++) {
                var x = spacing * (i - count / 2);
                for (var j = 0; j < count; j++) {
                    var y = spacing * (j - count / 2);
                    var p = new common.Vector(x, y);
                    var noiseScale = .005;
                    var theta = utilities.noise(x * noiseScale, y * noiseScale) * 10;
                    p.addPolar(wiggle, theta);
                    this.regionCenters[i + j * count] = p;

                }
            }

            var voronoi = new Voronoi();
            // Calculate regions
            var r = 300;
            var bbox = {
                xl : -r,
                xr : r,
                yt : -r,
                yb : r
            };
            var diagram = voronoi.compute(this.regionCenters, bbox);
            universe.regions = [];

            $.each(diagram.cells, function(index, cell) {
                var region = new common.Region(cell.site);
                universe.regions[cell.site.voronoiId] = region;
                $.each(cell.halfedges, function(index, edge) {
                    var p = new Vector();
                    p.setTo(edge.getStartpoint());

                    region.addPoint(p);
                })
                region.createTriangles();
            });

            universe.paths = [];

            $.each(diagram.edges, function(index, edge) {
                if (edge.rSite !== null) {

                    var region0 = universe.regions[edge.lSite.voronoiId];
                    var region1 = universe.regions[edge.rSite.voronoiId];
                    var path = new common.Edge(region0, region1);
                    path.active = false;
                    if (Math.random() > .5)
                        path.active = true;

                    region0.addPath(path);
                    region1.addPath(path);
                    universe.paths.push(path);

                }

            });

            $.each(universe.regions, function(index, region) {
                region.objects = [];
                if (Math.random() > .7)
                    universe.fillRegion(region);
            });

            universe.regionGraph = new Graph(universe.regions, universe.paths);
        },

        fillRegion : function(region) {
            var count = 2 + Math.floor(Math.random() * 5);
            region.objects = [];

            for (var i = 0; i < count; i++) {
                var r = Math.pow(i, .7) * 8 + 6;
                var theta = Math.pow(i, .7) * 10 + 5 + region.idNumber;
                var p = new UniverseObject(0, 0);
                p.add(region.center);
                p.addPolar(r, theta);

                region.objects.push(p);
            }
        },

        selectRegionAt : function(p) {
            var selected = undefined;
            $.each(this.regions, function(index, region) {
                var triangle = region.getTriangleAt(p, true);
                if (triangle != undefined)
                    selected = triangle;
            });

            if (this.selected && this.selected !== selected)
                this.selected.deselect();

            this.selected = selected;
            if (this.selected)
                this.selected.select();

        },

        update : function(time) {
            this.regionGraph.update(time);
        },

        // Render the universe to some context. Depending on the mode/context, things may render differently
        render : function(context) {
            var g = context.g;

            app.log("Universe opacity:" + context.opacity);
            g.fill(1, 0, 1, .4);
            g.stroke(0);

            var opacity = context.lod.region.opacity;
            if (opacity > 0) {
                this.regionGraph.render(context);
            }

        }
    });

    return Universe;
});
