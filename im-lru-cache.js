/**
 * IN MEMORY CACHE - Implemented using LRU (Last Recent Used) algorithm
 * @author : Trinh Trung Anh
 * @date: 28/10/2013
 */

(function($, win) {

	//Only keep 5 items inside the cache, prevent memory leaks
	var CAPACITY = 5;

	var InMemoryCache = function() {

		var cache = {},
			size = 0,
			lruHash = {},
			freshEnd = null,
			staleEnd = null;

		var refresh = function(entry) {
			if (entry != freshEnd) {
				if (!staleEnd) {
					staleEnd = entry;
				} else if (staleEnd == entry) {
					staleEnd = entry.n;
				}

				link(entry.n, entry.p);
				link(entry, freshEnd);

				freshEnd = entry;
				freshEnd.n = null;
			}
		}

		/**
		 * Link between two entries in the LRU Linked List
		 */
		var link = function(nextEntry, prevEntry) {
			if (nextEntry != prevEntry) {
				if (nextEntry) nextEntry.p = prevEntry;
				if (prevEntry) prevEntry.n = nextEntry;
			}
		}

		return {

			/**
			 * set item to cache
			 * @param [String] key    the key
			 * @param [Object] value  the value
			 * @param [Boolean] extend false: replace value, true: extend the value
			 */
			set : function(key, value, extend) {

				var lruEntry = lruHash[key] || (lruHash[key] = {key: key});
				refresh(lruEntry);

				if (!value) return;

				if (!(key in cache)) size ++;

				if (extend) {
					cache[key] = $.extend(this.get(key) || {}, value);
				} else {
					cache[key]  = value;
				}

				if (size > CAPACITY) {
					this.remove(staleEnd.key);
				}

				return value;
			},

			/**
			 * Get the key from cache.
			 * Put it to the Top of LRU linked list
			 */
			get : function(key) {
				var lruEntry = lruHash[key];

				if (!lruEntry) return;

				refresh(lruEntry);

				return cache[key];
			},

			/**
			 * remove the key from cache, update LRU Linked list
			 */
			remove : function(key) {

				var lruEntry = lruHash[key];

				if (!lruEntry) return;

				//Update the last & the first one
				if (lruEntry == freshEnd) freshEnd = lruEntry.p;
				if (lruEntry == staleEnd) staleEnd = lruEntry.n;

				delete lruHash[key];
				delete cache[key];

				size --;
			},

			flush : function() {
				cache = {};
				size = 0;
				lruHash = {};
				freshEnd = staleEnd = null;
			},

			info : function() {
				return {
					capacity: CAPACITY,
					size: size
				}
			},

			getAll: function() {
				return cache;
			}
		}
	}

	$.InMemoryCache = new InMemoryCache;

})(jQuery, window);