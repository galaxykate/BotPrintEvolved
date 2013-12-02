/**
 * @author Kate Compton
 */

var utilities = {};
var prefix = "modules/common/";
define('common', ["inheritance", "noise", prefix + "transform", prefix + "region", prefix + "vector",  prefix + "tree", prefix + "edge", prefix + "rect", prefix + "map", prefix + "kcolor", prefix + "timespan", prefix + "utilities", prefix + "range", "jQueryUI", "underscore"], 
function(Inheritance, _Noise, _Transform, _Region, _Vector, _Tree, _Edge, _Rect, _Map, _KColor, _TimeSpan, _utilities, _Range, JQUERY, _) {
    var common = {
        Vector : _Vector,

        Edge : _Edge,
        Tree : _Tree,
        Region : _Region,
        KColor : _KColor,
        Map : _Map,
        TimeSpan : _TimeSpan,
        Range : _Range,
        Rect : _Rect,
        Transform : _Transform,

    }

    utilities = _utilities;
    utilities.noiseObj = new _Noise();
    utilities.noise = function() {
        // use the correct number of args
        switch(arguments.length) {
            case 1:
                return utilities.noiseObj.noise2D(arguments[0], 1000);
                break;
            case 2:
                return utilities.noiseObj.noise2D(arguments[0], arguments[1]);
                break;
            case 3:
                return utilities.noiseObj.noise3D(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                return utilities.noiseObj.noise4D(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
            default:
                console.log("Attempting to use Noise with " + arguments.length + " arguments: not supported!");
                return 0;
                break;
        }
    };

    // renormalized to between [0, 1]
    utilities.unitNoise = function() {
        return utilities.noise.apply(undefined, arguments) * .5 + .5;
    };

    // test noise

    utilities = _utilities;

    console.log("utilities = " + utilities);
    return common;
});
