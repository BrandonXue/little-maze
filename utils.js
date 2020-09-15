/**
 * Brandon Xue, Ernesto Hoogkkirk, Ryan Martinez
 * 
 * This file contains utility functions and structures.
 * 
 * The Enums allow for human-readable numeric values to be used,
 * and are compatible with bit-masking.
 */

/* DirectionEnum allows us to signify vertcal or horizontal orientation in
   a more human readable format. If it is ever needed to choose both vertical
   AND horizontal, a bitwise OR can be used to combine them. */
const DirectionEnum = {"vertical":2, "horizontal":1}
Object.freeze(DirectionEnum)
      
/* WallEnum allows for easy bit manipulation. We store walls in a "bit field"
    so they can be set and unset using bitwise operations */
const WallEnum = {
    "left": 8,
    "right": 4,
    "top": 2,
    "bot": 1,
    "bottom": 1
}
Object.freeze(WallEnum)

/**
 * PRNG random integer within a range.
 * @param {Number} min Minimum integer value that can be returned
 * @param {Number} max Maximum integer value that can be returned
 */
function rand_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

class DisjointSet {
    constructor(starting_sets) {
        if (starting_sets < 256) { // 2^8
            this.sets = new Uint8Array(starting_sets);
        } else if (starting_sets < 65536) { // 2^16
            this.sets = new Uint16Array(starting_sets);
        } else if (starting_sets < 4294967296) { // 2^32
            this.sets = new Uint32Array(starting_sets);
        } else {
            this.sets = new Array(starting_sets);
        }
        this.num_sets = starting_sets;

        for (let i = 0; i < this.sets.length; ++i) {
            this.sets[i] = 0;
        }
    }

    get_update_root(set_index) {
        //console.log(set_index);
        if (this.sets[set_index] == 0) // The current node is the root of its tree
            return set_index;

        // Else, sets[set_index] will hold the index of its parent
        // Recursively find the root, updating each node in the path
        let root = this.get_update_root(this.sets[set_index]);
        this.sets[set_index] = root;
        return root; // Finally return root
    }

    try_join_trees(index1, index2) {
        let root1 = this.get_update_root(index1);
        let root2 = this.get_update_root(index2);
        // If both nodes are already part of the same tree, return false
        if (root1 == root2)
            return false;
        // Else, make tree 2's root point to tree 1's root
        this.sets[root2] = root1;
        this.num_sets -= 1; // Decrement total number of sets
        return true;
    }
}