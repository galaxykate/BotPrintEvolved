/**
 * @author Kate Compton
 */

define([], function() {

    var utilities = {
        // put noise in here too?
        capitaliseFirstLetter : function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        words : {
            syllables : {
                first : "Pr Kr LL Chr Sk Br Sth Ch Dhr Dr Sl Sc Sh Thl Thr Pl Fr Phr Phl Wh B C D F G H J K L M N P Qu R S T V W X Y Z".split(" "),
                middle : "al or yl yr yad ard arv yal il ol ul om um oon un atl ant is ein oin apph osc im in imn ish iel ar an on ol iz oz az ul yan iv urg imns ext ynth out esh ax est oaqu ell oph alph elf ik ess ipp een aff ass aqu ap yb oeb angr ong ar abr ian ion ol ainth oarth earth ixl ang em at od orth ull ingr ell url ur in ill iall".split(" "),
                last : "a ia ea anth en am is i el ios ius ian ean ek on o io ang u".split(" "),
            },
            animals : "amoeba mongoose capybara kangaroo boa nematode sheep quail goat agouti zebra giraffe rhino skunk dolphin whale duck bullfrog okapi sloth monkey orangutan grizzly moose elk dikdik ibis stork robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum".split(" "),
            moods : "angry bemused elated skeptical morose gleeful curious sleepy hopeful ashamed alert energetic exhausted giddy grateful groggy grumpy irate jealous jubilant lethargic sated lonely relaxed restless surprised tired thankful".split(" "),
            colors : "ivory white silver ecru scarlet red burgundy ruby crimson carnelian pink rose grey pewter charcoal slate onyx black mahogany brown green emerald blue sapphire turquoise aquamarine teal gold yellow carnation orange lavender purple magenta lilac ebony amethyst garnet".split(" "),
            getRandomPhrase : function() {
                return utilities.getRandom(utilities.words.moods) + " " + utilities.getRandom(utilities.words.colors) + " " + utilities.getRandom(utilities.words.animals);
            },
            getRandomWord : function() {
                var s = utilities.getRandom(this.syllables.first);
                if (Math.random() < .4)
                    s = utilities.capitaliseFirstLetter(utilities.getRandom(this.syllables.middle));

                var count = Math.floor(Math.random() * 3);
                for (var i = 0; i < count; i++) {
                    var mid = utilities.getRandom(this.syllables.middle);
                    s += mid;

                }
                s += utilities.getRandom(this.syllables.last);

                if (s.length > 6 && Math.random < .8)
                    s = utilities.words.getRandomWord();
                if (s.length > 9 && Math.random < .9)
                    s = utilities.words.getRandomWord();

                if (s.length < 6 && Math.random() < .2)
                    s += "-" + utilities.words.getRandomWord();
                else if (s.length < 6 && Math.random() < .2)
                    s += "'" + utilities.getRandom(this.syllables.last);

                return s;
            }
        },

        arrayToString : function(array) {
            s = "";
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
        getSpacer : function(count) {
            var s = "";
            for (var i = 0; i < count; i++) {
                s += " "
            }
        },
        sCurve : function(v, iterations) {
            if (iterations === undefined)
                iterations = 1;
            for (var i = 0; i < iterations; i++) {
                var v2 = .5 - .5 * Math.cos(v * Math.PI);
                v = v2;
            }
            return v;
        },
        within : function(val, min, max) {
            return (val >= min) && (val <= max);
        },

        // Inefficient, fix someday
        // the weight is determined by the function getWeight(index, item, list)
        getWeightedRandomIndex : function(array) {
            var totalWeight = 0;
            var length = array.length;

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

        // Get a random, from an array
        getRandom : function(array) {
            return array[Math.floor(Math.random() * array.length)];
        },
        getRandomIndex : function(array) {
            return Math.floor(Math.random() * Math.round(array.length - 1));
        },
        getRandomKey : function(obj) {
            return this.getRandom(Object.keys(obj));
        },
        constrain : function(val, lowerBound, upperBound) {
            if (Math.max(val, upperBound) === val)
                return upperBound;
            if (Math.min(val, lowerBound) === val)
                return lowerBound;
            return val;
        },
        lerp : function(start, end, percent) {
            return (start + percent * (end - start));
        },
        lerpAngles : function(start, end, pct) {
            var dTheta = end - start;
        },

        // Rertun a random, possible between two numbers
        random : function() {
            if (arguments.length === 0)
                return Math.random();
            if (arguments.length === 1)
                return Math.random() * arguments[i];
            if (arguments.length === 2)
                return Math.random() * (arguments[1] - arguments[0]) + arguments[0];

            return Math.random();
        },
        roundNumber : function(num, places) {
            // default 2 decimal places
            if (places === undefined) {
                return parseFloat(Math.round(num * 100) / 100).toFixed(2);
            } else {
                return parseFloat(Math.round(num * 100) / 100).toFixed(places);
            }
        },
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
