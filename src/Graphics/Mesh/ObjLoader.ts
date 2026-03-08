import Vector2 from "../Math/Vector2";
import Vector3 from "../Math/Vector3";
import Vertex from "./Vertex";
import Mesh from "./Mesh";

export default class ObjLoader {
    /**
     * OBJ 파일 로드
     *
     * @static
     * @param {string} url      OBJ 파일 URL
     * @returns {Promise<Mesh>} 로드된 Mesh 객체
     */
    static async load(url: string): Promise<Mesh> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `Failed to load OBJ: ${response.status} ${response.statusText}`,
            );
        }

        const text = await response.text();

        return ObjLoader.fromString(text);
    }

    /**
     * OBJ 문자열을 Mesh로 파싱
     *
     * @static
     * @param {string} text   OBJ 문자열
     * @returns {Mesh}        생성된 Mesh 객체
     * @throws {Error}        OBJ 파싱 실패 시 예외 발생
     */
    private static fromString(text: string): Mesh {
        const positions: Vector3[] = [];
        const uvs: Vector2[] = [];
        const normals: Vector3[] = [];

        const vertices: Vertex[] = new Array<Vertex>();
        const indices: number[][] = new Array<number[]>();
        const vertexMap = new Map<string, number>();

        const lines = text.split(/\r?\n/);
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith("#")) {
                continue;
            }

            const parts = line.split(/\s+/);
            const tag = parts[0];

            if (tag === "v" && parts.length >= 4) {
                positions.push(ObjLoader.processVertex(line));
                continue;
            }

            if (tag === "vt" && parts.length >= 3) {
                uvs.push(ObjLoader.processUv(line));
                continue;
            }

            if (tag === "vn" && parts.length >= 4) {
                normals.push(ObjLoader.processNormal(line));
                continue;
            }

            if (tag === "f") {
                const faceVertexIndices = [];
                for (let i = 1; i < parts.length; i++) {
                    const token = parts[i];
                    if (!token) {
                        continue;
                    }

                    let mappedIndex = vertexMap.get(token);
                    if (mappedIndex === undefined) {
                        const [vText, vtText, vnText] = token.split("/");

                        const vIndex = ObjLoader.processObjIndex(
                            vText,
                            positions.length,
                        );
                        if (vIndex < 0 || vIndex >= positions.length) {
                            continue;
                        }

                        const vtIndex = ObjLoader.processObjIndex(
                            vtText,
                            uvs.length,
                        );
                        const vnIndex = ObjLoader.processObjIndex(
                            vnText,
                            normals.length,
                        );

                        const position = positions[vIndex];
                        const normal =
                            vnIndex >= 0 && vnIndex < normals.length
                                ? normals[vnIndex]
                                : new Vector3(0, 0, 0);
                        const uv =
                            vtIndex >= 0 && vtIndex < uvs.length
                                ? uvs[vtIndex]
                                : new Vector2(0, 0);

                        vertices.push(new Vertex(position, normal, uv));

                        mappedIndex = vertices.length - 1;

                        vertexMap.set(token, mappedIndex);
                    }

                    faceVertexIndices.push(mappedIndex);
                }

                for (let i = 1; i < faceVertexIndices.length - 1; i++) {
                    indices.push([
                        faceVertexIndices[0],
                        faceVertexIndices[i],
                        faceVertexIndices[i + 1],
                    ]);
                }
            }
        }

        // 법선 정보가 없는 경우, 면의 법선을 계산하여 정점에 누적한 후 평균화
        if (normals.length === 0) {
            const vertexFaceMap = new Map();
            for (let i = 0; i < indices.length; i++) {
                const [i0, i1, i2] = indices[i];
                [i0, i1, i2].forEach((idx) => {
                    if (!vertexFaceMap.has(idx)) {
                        vertexFaceMap.set(idx, []);
                    }
                    vertexFaceMap.get(idx).push(i);
                });
            }

            for (const [vertexIdx, faceIndices] of vertexFaceMap) {
                let accumulatedNormal = new Vector3(0, 0, 0);
                for (const faceIdx of faceIndices) {
                    const [i0, i1, i2] = indices[faceIdx];
                    const v0 = vertices[i0].position;
                    const v1 = vertices[i1].position;
                    const v2 = vertices[i2].position;

                    const edge1 = v1.subtract(v0);
                    const edge2 = v2.subtract(v0);
                    const faceNormal = edge1.cross(edge2).normalize();
                    accumulatedNormal = accumulatedNormal.add(faceNormal);
                }
                vertices[vertexIdx].normal = accumulatedNormal.normalize();
            }
        }

        return new Mesh(vertices, indices);
    }

    /**
     * 정점 위치 파싱
     *
     * @param {string} line   "v x y z" 형식의 문자열
     * @returns {Vector3}     파싱된 위치 벡터 Vector3 객체
     */
    private static processVertex(line: string): Vector3 {
        const parts = line.trim().split(/\s+/);
        return new Vector3(
            Number(parts[1]),
            Number(parts[2]),
            Number(parts[3]),
        );
    }

    /**
     * UV 좌표 파싱
     *
     * @param {string} line   "vt u v" 형식의 문자열 (w가 존재할 경우 무시)
     * @returns {Vector2}     파싱된 UV 좌표 Vector2 객체
     */
    private static processUv(line: string): Vector2 {
        const parts = line.trim().split(/\s+/);
        return new Vector2(Number(parts[1]), Number(parts[2]));
    }

    /**
     * 법선 벡터 파싱
     *
     * @param {string} line   "vn x y z" 형식의 문자열
     * @returns {Vector3}     파싱된 법선 벡터 Vector3 객체
     */
    private static processNormal(line: string): Vector3 {
        const parts = line.trim().split(/\s+/);
        return new Vector3(
            Number(parts[1]),
            Number(parts[2]),
            Number(parts[3]),
        );
    }

    /**
     * OBJ 인덱스를 0-based 인덱스로 변환
     *
     * @static
     * @param {string} rawIndex      OBJ 원본 인덱스
     * @param {number} currentCount  현재 배열 길이
     * @returns {number}             0-based 인덱스, 실패 시 -1
     */
    private static processObjIndex(
        rawIndex: string | undefined,
        currentCount: number,
    ): number {
        if (!rawIndex) {
            return -1;
        }

        const index = Number(rawIndex);
        if (Number.isNaN(index) || index === 0) {
            return -1;
        }

        if (index > 0) {
            return index - 1;
        }

        // OBJ는 음수 인덱스(뒤에서부터 참조)도 허용하므로,
        // 음수면 currentCount + index로 계산
        return currentCount + index;
    }
}
