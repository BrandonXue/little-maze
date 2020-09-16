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

/**
 * Produces a variable that falls on a normal distribution.
 * See: https://en.wikipedia.org/wiki/Box–Muller_transform
 */
function box_muller_unbounded() {
    let u1 = 0, u2 = 0;
    // First make the interval (0, 1) insead of [0, 1)
    while (u1 == 0)
        u1 = Math.random();
    while (u2 == 0)
        u2 = Math.random();
    // Use the formula as seen
    return Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
}

/**
 * Returns an integer that is almost normally distributed.
 * The ends of the distribution are intentionally excluded so the range
 * is more uniform than a true normal distribution.
 */
function box_muller_random() {
    // First get a random number between [-0.5, 0.5)
    let n = box_muller_unbounded() / 4; // hits the sweet spot
    while  (n >= 0.5 || n < -0.5)         // makes extremes not too rare
        n = box_muller_unbounded() / 4;

    n += 0.5; // Now make it [0, 1)
    return n;
}

/**
 * Returns an integer that is almost normally distributed.
 * The level of "normality" can be heightened with the centering factor.
 * A centering factor higher than 10 gives a very normal distribution.
 * A centering factor of 1 produces a much flatter curve.
 * @param {Number} centering_factor Adjust how tightly normal the distribution is.
 *      Must be greater than 0.
 */
function box_muller_random2(centering_factor) {
    // First get a random number between [-0.5, 0.5)
    let n = box_muller_unbounded() / centering_factor; // hits the sweet spot
    while  (n >= 0.5 || n < -0.5)         // makes extremes not too rare
        n = box_muller_unbounded() / centering_factor;

    n += 0.5; // Now make it [0, 1)
    return n;
}

/**
 * Slightly normal random number using 2 iterations
 * (Central limit theorem)
 */
function clt_random() {
    return (random() + random()) / 2;
}

/**
 * Slightly divergent random number using 2 iterations
 */
function divergent_random() {
    let n =(random() + random()) / 2;
    if (n > 0.5)
        return 1.5-n;
    return 0.5-n;
}

/**
 * Returns a random int within the range favoring the extremities.
 * @param {Number} min Integer minimum return value.
 * @param {Number} max Integer maximum return value.
 */
function divergent_int(min, max) {
    return floor(divergent_random() * (max - min + 1)) + min;
}


/**
 * Returns an integer that falls within the given range.
 * Somewhat resembles a normal distribution but extreme values are made more common.
 * @param {Number} min Integer minimum value to be returned
 * @param {Number} max Integer maximum value to be returned
 */
function box_muller_int(min, max) {
    let n = box_muller_random(); // n in [0, 1)
    n *= (max - min + 1);
    n = floor(n);
    n += min;
    return n;
}

/**
 * A Disjoint Set data structure specifically for checking
 * for intersection and merging sets.
 */
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
        const root = this.get_update_root(this.sets[set_index]);
        this.sets[set_index] = root;
        return root; // Finally return root
    }

    try_join_trees(index1, index2) {
        const root1 = this.get_update_root(index1);
        const root2 = this.get_update_root(index2);
        // If both nodes are already part of the same tree, return false
        if (root1 == root2)
            return false;
        // Else, make tree 2's root point to tree 1's root
        this.sets[root2] = root1;
        this.num_sets -= 1; // Decrement total number of sets
        return true;
    }
}

/**
 * A HashSet specifically for numeric items from [0, num_elem)
 */
class HashSet {
    constructor(num_elem) {
        // We only need one bit per item, so the size can be 1/8th of total_capacity
        this.set = new Uint8Array(num_elem/8);
    }

    /**
     * Insert an integer into this set
     * @param {Number} i Integer, must be betwee [0, max capacity)
     */
    insert(i) {
        const index_in_arr = floor(i / 8);
        const bit_offset = i % 8;
        this.set[index_in_arr] |= (0b1 << bit_offset);
    }

    /**
     * Check if a number is in the set
     * @param {Number} i Integer, must be betwee [0, max capacity)
     */
    contains(i) {
        const index_in_arr = floor(i / 8);
        const bit_offset = i % 8;
        return ( this.set[index_in_arr] & (0b1 << bit_offset) ) == (0b1 << bit_offset);
    }

    /**
     * Remove an element from the set
     * @param {Number} i Integer, must be betwee [0, max capacity)
     */
    remove(i) {
        const index_in_arr = floor(i / 8);
        const bit_offset = i % 8;
        this.set[index_in_arr] &= ~(0b1 << bit_offset);
    }
}