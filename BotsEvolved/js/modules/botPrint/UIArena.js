/**
 * @author Afshin Mobramaein
 */

define(["ui", "common", "./physics/arena", "./botApp"], function(ui, common, Arena, botApp) {
	/**
	 * @class UIArena
	 * @extends Class
	 */
	var UIArena = Class.extend({

		init : function() {
			var UIArena = this;
			//This creates a new Arena
			this.arena = new Arena("rectangle");
			//This controls the select arena drop down with JQuery.
			$("#select_arena").click(function() {
				var arenatype = $("#arena_type_chooser").val();
				if (arenatype == "custom") {
					UIArena.loadNewArena(arenatype, $("#complexity").val(), $("#density").val());
				} else {
					UIArena.loadNewArena(arenatype, 0, 0);
				}

			});
			//This controls the custom arena complexity slider with JQuery.
			$("#slider_arena_complexity").slider({
				range : "max",
				min : 3,
				max : 20,
				value : 3,
				slide : function(event, ui) {
					$("#complexity").val(ui.value);
				}
			});
			$("#complexity").val($("#slider_arena_complexity").slider("value"));
			//This controls the custom arena density slider with JQuery.
			$("#slider_arena_density").slider({
				range : "max",
				min : 1,
				max : 10,
				value : 2,
				slide : function(event, ui) {
					$("#density").val(ui.value);
				}
			});
			$("#density").val($("#slider_arena_density").slider("value"));
			//Add draggable if possible?
		},

		/**
		 * @method loadNewArena
		 */
		loadNewArena : function(shape, sides, density) {
			console.log("Load new arena " + shape + " sides=" + sides + " density=" + density);
			//deletes current bots in the arena. We might want to change this.
			app.arena.reset();
			app.arena = new Arena(shape, sides, density);
			//This adds brand new bots. Need to change to current bots.
			app.setPopulation(app.population);
			//throw("I just set the population?");
			app.currentBot = app.population.bots[0];
		},
	});
	return UIArena;
});
