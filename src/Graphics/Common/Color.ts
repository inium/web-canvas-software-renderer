export default class Color {
    /**
     * Red 값 (0-255)
     *
     * @type {number}
     */
    r: number;

    /**
     * Green 값 (0-255)
     *
     * @type {number}
     */
    g: number;

    /**
     * Blue 값 (0-255)
     *
     * @type {number}
     */
    b: number;

    /**
     * Alpha 값 (0-255)
     *
     * @type {number}
     */
    a: number;

    /**
     * Constructor
     *
     * @constructor
     * @param {number} r       Red 값 (0-255)
     * @param {number} g       Green 값 (0-255)
     * @param {number} b       Blue 값 (0-255)
     * @param {number} [a=255] Alpha 값 (0-255)
     */
    constructor(r: number, g: number, b: number, a: number = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
