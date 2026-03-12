import Vector2 from "../Math/Vector2";
import Color from "../Common/Color";

export default class Point {
    /**
     * 정점의 2D 위치 정보 (화면 좌표계)
     *
     * @type {Vector2}
     */
    position: Vector2;

    /**
     * 정점의 깊이 정보 (Z-Buffer에서 사용)
     *
     * @type {number}
     */
    depth: number;

    /**
     * 정점의 색상 정보 (RGBA)
     *
     * @type {Color}
     */
    color: Color;

    /**
     * 정점의 밝기 정보 (0.0 ~ 1.0)
     *
     * @type {number}
     */
    intensity: number;

    /**
     * Constructor
     *
     * @constructor
     * @param {Vector2} position                        정점의 2D 위치 정보 (화면 좌표계)
     * @param {number} [depth=0]                        정점의 깊이 정보 (Z-Buffer에서 사용, 기본값은 0)
     * @param {Color} [color=new Color(0, 0, 0, 255)]   정점의 색상 정보 (RGBA, 기본값은 검정색)
     * @param {number} [intensity=1.0]                  정점의 밝기 정보 (0.0 ~ 1.0, 기본값은 1.0)
     */
    constructor(
        position: Vector2,
        depth: number = 0,
        color: Color = new Color(0, 0, 0, 255),
        intensity: number = 1.0,
    ) {
        this.position = position;
        this.depth = depth;
        this.color = color;
        this.intensity = Math.min(1.0, intensity);
    }
}
