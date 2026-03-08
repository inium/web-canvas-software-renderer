import Vertex from "./Vertex";

/**
 * 메쉬 데이터 정보
 *
 * @export
 * @class Mesh
 * @typedef {Mesh}
 */
export default class Mesh {
    /**
     * 정점 배열
     *
     * @type {Vertex[]}
     */
    vertices: Vertex[];

    /**
     * 삼각형 인덱스 배열
     *
     * @type {number[][]}
     */
    indices: number[][];

    // /**
    //  * 텍스처 이미지
    //  *
    //  * @type {HTMLImageElement | null}
    //  */
    // textureImage: HTMLImageElement | null = null;

    /**
     * Creates an instance of Mesh.
     *
     * @constructor
     * @param {Vertex[]} vertices   정점 배열
     * @param {number[][]} indices  삼각형 인덱스 배열
     */
    constructor(vertices: Vertex[] = [], indices: number[][] = []) {
        this.vertices = vertices;
        this.indices = indices;
    }

    // loadTexture(image: HTMLImageElement) {
    //     this.textureImage = image;
    // }
}
