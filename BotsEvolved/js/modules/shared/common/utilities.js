/**
 * @author Kate Compton
 */

define([], function() {

    /**
     * @class Utilities
     */
    var utilities = {
        // put noise in here too?

        /**
         * @attribute words
         */
        words : {
            /**
             * @property words.animals
             */
            animals : "amoeba mongoose capybara kangaroo boa nematode sheep quail goat agouti zebra giraffe rhino skunk dolphin whale duck bullfrog okapi sloth monkey orangutan grizzly moose elk dikdik ibis stork robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum".split(" "),
            /**
             * @property worlds.moods
             */
            moods : "angry bemused elated skeptical morose gleeful curious sleepy hopeful ashamed alert energetic exhausted giddy grateful groggy grumpy irate jealous jubilant lethargic sated lonely relaxed restless surprised tired thankful".split(" "),
            /**
             * @property words.colors
             */
            colors : "ivory white silver ecru scarlet red burgundy ruby crimson carnelian pink rose grey pewter charcoal slate onyx black mahogany brown green emerald blue sapphire turquoise aquamarine teal gold yellow carnation orange lavender purple magenta lilac ebony amethyst garnet".split(" "),
            /**
             * @method words.getRandomPhrase
             */
            getRandomPhrase : function() {
                return utilities.getRandom(utilities.words.moods) + " " + utilities.getRandom(utilities.words.colors) + " " + utilities.getRandom(utilities.words.animals);
            }
        },

        capitaliseFirstLetter : function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        /**
         * @method arrayToString
         * @param array
         */
        arrayToString : function(array) {
            var s = "";
            $.each(array, function(index, obj) {
                if (index !== 0)
                    s += ", ";
                s += obj;
            });
            return s;
        },

        inSquareBrackets : function(s) {
            return "[" + s + "]";
        },

        /**
         * @method inSquareBrackets
         * @param s
         * @return Returns the input string with brackets around out.
         */
        inSquareBrackets : function(s) {
            return "[" + s + "]";
        },

        /**
         * @method getSpacer
         * @param count
         * @return Returns a string of spaces count long
         */
        getSpacer : function(count) {
            var s = "";
            for (var i = 0; i < count; i++) {
                s += " "
            }
        },

        /**
         * @method sCurve
         * @param v
         * @param iterations
         */
        sCurve : function(v, iterations) {
            if (iterations === undefined)
                iterations = 1;
            for (var i = 0; i < iterations; i++) {
                var v2 = .5 - .5 * Math.cos(v * Math.PI);
                v = v2;
            }
            return v;
        },

        /**
         * @method within
         * @param val
         * @param min
         * @param max
         * @return {Boolean} Returns whether val is between min and max
         */
        within : function(val, min, max) {
            return (val >= min) && (val <= max);
        },

        /**
         * The weight is determined by the function getWeight(index, item, list)
         * @method getWeightedRandomIndex
         * @param array
         */
        // Inefficient, fix someday
        getWeightedRandomIndex : function(array) {
            if(array === undefined) {
                throw new Error("Array undefined");
            }
            var totalWeight = 0;
            var length = array.length;
            //var length = array.length;

            for (var i = 0; i < length; i++) {

                totalWeight += array[i];
            };

            var target = Math.random() * totalWeight;
            var cumWeight = 0;

            for (var i = 0; i < length; i++) {
                cumWeight += array[i];

                if (target <= cumWeight) {
                    return i;
                }

            };

        },

        /**
         * Get a random element from an Array
         * @method getRandom
         * @param array
         */
        getRandom : function(array) {
            return array[Math.floor(Math.random() * array.length)];
        },

        getRandomIndex : function(array) {
            return Math.floor(Math.random() * Math.round(array.length - 1));
        },
        getRandomKey : function(obj) {
            return this.getRandom(Object.keys(obj));
        },

        /**
         * Get a random index from an Array
         * @method getRandomIndex
         * @param array
         */
        getRandomIndex : function(array) {
            return Math.floor(Math.random() * Math.round(array.length - 1));
        },

        /**
         * Get a random key from an Object
         * @method getRandomKey
         * @param obj
         */
        getRandomKey : function(obj) {
            return this.getRandom(Object.keys(obj));
        },

        /**
         * Returns val if it is within upper and lower.
         * Returns the bound if val passes outside
         * @method constrain
         * @param val
         * @param lowerBound
         * @param upperBound
         */
        constrain : function(val, lowerBound, upperBound) {
            if (Math.max(val, upperBound) === val)
                return upperBound;
            if (Math.min(val, lowerBound) === val)
                return lowerBound;
            return val;
        },

        /**
         * @method lerp
         * @param start
         * @param end
         * @param percent
         */
        lerp : function(start, end, percent) {
            return (start + percent * (end - start));
        },

        /**
         * @method lerpAngles
         * @param start
         * @param end
         * @param percent
         */
        lerpAngles : function(start, end, pct) {
            var dTheta = end - start;
        },

        /**
         * Return a random, possibly between two numbers
         * @method random
         */
        random : function() {
            if (arguments.length === 0)
                return Math.random();
            if (arguments.length === 1)
                return Math.random() * arguments[i];
            if (arguments.length === 2)
                return Math.random() * (arguments[1] - arguments[0]) + arguments[0];

            return Math.random();
        },

        /**
         * @method roundNumber
         * @param num
         * @param [places]
         */
        roundNumber : function(num, places) {
            // default 2 decimal places
            if (places === undefined) {
                return parseFloat(Math.round(num * 100) / 100).toFixed(2);
            } else {
                return parseFloat(Math.round(num * 100) / 100).toFixed(places);
            }
        },

        /**
         * @method angleBetween
         * @param a
         * @param b
         */
        angleBetween : function(a, b) {
            var dTheta = b - a;
            dTheta = ((dTheta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            if (dTheta > Math.PI)
                dTheta -= Math.PI * 2;
            return dTheta;
        },
    };

    return utilities;
});
