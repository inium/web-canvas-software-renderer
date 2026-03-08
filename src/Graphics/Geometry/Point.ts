import Vector2 from "../Math/Vector2";
import Color from "../Common/Color";

export default class Point {
    /**
     * 삼각형의 2D 위치 정보 (화면 좌표계)
     *
     * @type {Vector2}
     */
    position: Vector2;

    /**
     * 삼각형의 깊이 정보 (Z-Buffer에서 사용)
     *
     * @type {number}
     */
    depth: number;

    /**
     * 삼각형의 색상 정보 (RGBA)
     *
     * @type {Color}
     */
    color: Color;

    /**
     * Constructor
     *
     * @constructor
     * @param {Vector2} position                        삼각형의 2D 위치 정보 (화면 좌표계)
     * @param {number} [depth=0]                        삼각형의 깊이 정보 (Z-Buffer에서 사용, 기본값은 0)
     * @param {Color} [color=new Color(0, 0, 0, 255)]   삼각형의 색상 정보 (RGBA, 기본값은 검정색)
     */
    constructor(
        position: Vector2,
        depth: number = 0,
        color: Color = new Color(0, 0, 0, 255),
    ) {
        this.position = position;
        this.depth = depth;
        this.color = color;
    }
}
