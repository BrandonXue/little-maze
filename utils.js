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