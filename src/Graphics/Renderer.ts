import BufferSet from "./Scene/Buffers/BufferSet";
import Vector3 from "./Math/Vector3";
import Vector4 from "./Math/Vector4";
import Camera from "./Scene/Camera";
import Frustum from "./Scene/Frustum";
import RenderObject from "./Scene/RenderObject";
import Matrix4x4 from "./Math/Matrix4x4";
import MathUtil from "./Math/Util";
import Plane from "./Math/Plane";
import Point from "./Geometry/Point";
import Color from "./Common/Color";
import Vector2 from "./Math/Vector2";
import Triangle from "./Geometry/Triangle";

export default class Renderer {
    /**
     * 이미지 width
     *
     * @private
     * @type {number}
     */
    private _width: number = 0;

    /**
     * 이미지 height
     *
     * @private
     * @type {number}
     */
    private _height: number = 0;

    /**
     * 카메라
     *
     * @type {Camera}
     */
    camera: Camera;

    /**
     * 버퍼
     *
     * @type {BufferSet}
     */
    bufferSet: BufferSet;

    /**
     * Creates an instance of Renderer.
     *
     * @constructor
     * @param {number} width           이미지 width
     * @param {number} height          이미지 height
     * @param {number} sampleLevel     샘플링 레벨 (예: 0, 1, 2, 4)
     */
    constructor(width: number, height: number, sampleLevel: number = 2) {
        this._width = width;
        this._height = height;

        // 카메라 초기화
        this.camera = new Camera(
            new Vector3(0, 0, 5),
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0),
            new Frustum(60.0, width / height, 0.1, 1000.0),
        );

        // 버퍼 초기화
        this.bufferSet = new BufferSet(width, height, sampleLevel);
    }

    /**
     * 렌더링 초기화 (버퍼 초기화)
     *
     * @param {number} r       Red 값 (0-255, 기본값: 255)
     * @param {number} g       Green 값 (0-255, 기본값: 255)
     * @param {number} b       Blue 값 (0-255, 기본값: 255)
     * @param {number} a       Alpha 값 (0-255, 기본값: 255)
     */
    clear(r: number, g: number, b: number, a: number = 255): void {
        this.bufferSet?.clear(r, g, b, a);
    }

    /**
     * 렌더링 함수
     *
     * @param {RenderObject} renderObject 렌더링할 객체
     */
    render(renderObject: RenderObject) {
        const modelMatrix = renderObject.modelMatrix();
        const viewMatrix = this.camera?.viewMatrix() || Matrix4x4.identity();
        const projectionMatrix =
            this.camera?.projectionMatrix() || Matrix4x4.identity();

        const modelView = viewMatrix.multiply(modelMatrix);
        const mvp = projectionMatrix.multiply(modelView);

        const triangles: Triangle[] = [];

        for (const face of renderObject.mesh.indices) {
            // 각 삼각형의 정점 정보 가져오기
            const v0 = renderObject.mesh.vertices[face[0]];
            const v1 = renderObject.mesh.vertices[face[1]];
            const v2 = renderObject.mesh.vertices[face[2]];

            const view0 = this.transformPoint(modelView, v0.position);
            const view1 = this.transformPoint(modelView, v1.position);
            const view2 = this.transformPoint(modelView, v2.position);

            // Back-face Culling
            // 보이는 면만 렌더링하기 위해 삼각형이 카메라를 향하는지 여부 판단
            if (
                !this.isFrontFace(
                    new Vector3(view0.x, view0.y, view0.z),
                    new Vector3(view1.x, view1.y, view1.z),
                    new Vector3(view2.x, view2.y, view2.z),
                )
            ) {
                continue;
            }

            const clip0 = this.transformPoint(mvp, v0.position);
            const clip1 = this.transformPoint(mvp, v1.position);
            const clip2 = this.transformPoint(mvp, v2.position);

            const clipped = this.clipTriangle([clip0, clip1, clip2]);

            // 클리핑된 삼각형이 화면에 보이는 경우에만 래스터화 진행
            if (clipped.length < 3) {
                continue;
            }

            for (let i = 1; i < clipped.length - 1; i++) {
                const c = [clipped[0], clipped[i], clipped[i + 1]];

                // Perspective Divide (Clip Space -> NDC)
                const ndc = c.map((v) => this.clipSpaceToNDC(v));

                // Viewport Transform (NDC -> Viewport)
                const screen = ndc.map((v) => this.ndcToViewport(v));

                triangles.push(
                    new Triangle(
                        new Point(
                            new Vector2(screen[0].x, screen[0].y),
                            ndc[0].z,
                            new Color(255, 0, 0),
                        ),
                        new Point(
                            new Vector2(screen[1].x, screen[1].y),
                            ndc[1].z,
                            new Color(0, 255, 0),
                        ),
                        new Point(
                            new Vector2(screen[2].x, screen[2].y),
                            ndc[2].z,
                            new Color(0, 0, 255),
                        ),
                    ),
                );
            }
        }

        // Rasterization
        // - 삼각형의 바운딩 박스 계산
        // - 바운딩 박스 내의 픽셀에 대해 삼각형 내부 여부 판단 (Barycentric Coordinates)
        // - 내부 픽셀에 대해 깊이 버퍼 테스트 및 색상 버퍼 업데이트
        for (const t of triangles) {
            this.renderTriangle(t);
        }
    }

    /**
     * 삼각형 래스터라이제이션 함수
     *
     * @private
     * @param {Triangle} t 래스터라이제이션할 삼각형
     */
    private renderTriangle(t: Triangle): void {
        // calculate bounding box of the triangle
        const bbox = MathUtil.boundingBox2D([
            t.p0.position.toObject(),
            t.p1.position.toObject(),
            t.p2.position.toObject(),
        ]);

        bbox.minX = Math.max(Math.floor(bbox.minX), 0);
        bbox.maxX = Math.min(Math.ceil(bbox.maxX), this.width - 1);
        bbox.minY = Math.max(Math.floor(bbox.minY), 0);
        bbox.maxY = Math.min(Math.ceil(bbox.maxY), this.height - 1);

        // 면적이 거의 0이면 래스터라이제이션 하지 않음 (degenerate triangle)
        const area = t.barycentricArea();
        if (Math.abs(area) < 1e-8) {
            return;
        }

        // area가 양수면 반시계(CCW) 방향, 음수면 시계(CW) 방향 (top-left rule양식 적용)
        const edgeEpsilon = 1e-6;
        const isTopLeft = area > 0;
        const sampleLevel = this.bufferSet.sampleLevel;

        for (let y = bbox.minY; y <= bbox.maxY; y++) {
            for (let x = bbox.minX; x <= bbox.maxX; x++) {
                this.sampleMsaa(
                    x,
                    y,
                    t,
                    area,
                    isTopLeft,
                    sampleLevel,
                    edgeEpsilon,
                );
            }
        }
    }

    /**
     * MSAA 샘플링 함수
     *
     * @private
     * @param {number} x           픽셀 x 좌표
     * @param {number} y           픽셀 y 좌표
     * @param {Triangle} t         삼각형 정보
     * @param {number} area        삼각형의 면적 - area가 양수면 반시계(CCW) 방향, 음수면 시계(CW) 방향 (top-left rule양식 적용)
     * @param {boolean} isTopLeft  삼각형의 방향 (반시계: true, 시계: false)
     * @param {number} sampleLevel MSAA 샘플링 레벨
     * @param {number} edgeEpsilon 엣지 근처에서의 수치적 안정성을 위한 작은 값 (기본값: 1e-6)
     * @return {void}
     */
    private sampleMsaa(
        x: number,
        y: number,
        t: Triangle,
        area: number,
        isTopLeft: boolean,
        sampleLevel: number,
        edgeEpsilon: number = 1e-6,
    ): void {
        let sampleCount = 0;

        for (let sy = 0; sy < sampleLevel; sy++) {
            for (let sx = 0; sx < sampleLevel; sx++) {
                const sampleX = x + (sx + 0.5) / sampleLevel;
                const sampleY = y + (sy + 0.5) / sampleLevel;

                const p = new Point(new Vector2(sampleX, sampleY));
                const w0 = new Triangle(t.p1, t.p2, p).barycentricArea();
                const w1 = new Triangle(t.p2, t.p0, p).barycentricArea();
                const w2 = new Triangle(t.p0, t.p1, p).barycentricArea();

                const isInside =
                    (isTopLeft &&
                        w0 >= -edgeEpsilon &&
                        w1 >= -edgeEpsilon &&
                        w2 >= -edgeEpsilon) ||
                    (!isTopLeft &&
                        w0 <= edgeEpsilon &&
                        w1 <= edgeEpsilon &&
                        w2 <= edgeEpsilon);

                if (isInside) {
                    const a = w0 / area;
                    const b = w1 / area;
                    const c = w2 / area;
                    const depth =
                        a * t.p0.depth + b * t.p1.depth + c * t.p2.depth;

                    const currentDepth =
                        this.bufferSet?.depthBuffer.getPixel(x, y, sx, sy) ??
                        Number.POSITIVE_INFINITY;

                    if (depth < currentDepth) {
                        this.bufferSet?.depthBuffer?.setPixel(
                            x,
                            y,
                            sx,
                            sy,
                            depth,
                        );

                        const color = t.getColorAtBarycentric(a, b, c);
                        this.bufferSet?.colorBuffer?.setPixel(
                            x,
                            y,
                            sx,
                            sy,
                            color.r,
                            color.g,
                            color.b,
                            color.a,
                        );

                        sampleCount++;
                    }
                }
            }
        }

        if (sampleCount > 0) {
            const color = new Color(0, 0, 0, 0);

            for (let sy = 0; sy < sampleLevel; sy++) {
                for (let sx = 0; sx < sampleLevel; sx++) {
                    const c =
                        this.bufferSet?.colorBuffer?.getPixel(x, y, sx, sy) ??
                        new Color(0, 0, 0, 0);

                    color.r += c.r;
                    color.g += c.g;
                    color.b += c.b;
                    color.a += c.a;
                }
            }

            const totalSamples = sampleLevel * sampleLevel;
            color.r = Math.round(color.r / totalSamples);
            color.g = Math.round(color.g / totalSamples);
            color.b = Math.round(color.b / totalSamples);
            color.a = Math.round(color.a / totalSamples);

            this.bufferSet?.frameBuffer?.setPixel(
                x,
                y,
                color.r,
                color.g,
                color.b,
                color.a,
            );
        }
    }

    /**
     * 행렬과 3D 점을 곱하여 4D 점으로 변환
     *
     * @private
     * @param {Matrix4x4} matrix    4x4 변환 행렬
     * @param {Vector3} point       3D 점 (x, y, z)
     * @returns {Vector4}           변환된 4D 점 (x, y, z, w)
     */
    private transformPoint(matrix: Matrix4x4, point: Vector3): Vector4 {
        const [x, y, z, w] = matrix.multiplyVector(point);

        return new Vector4(x, y, z, w);
    }

    /**
     * 삼각형이 카메라를 향하는지 여부 판단 (Back-face Culling)
     *
     * @private
     * @param {Vector3} v0 삼각형의 첫 번째 정점
     * @param {Vector3} v1 삼각형의 두 번째 정점
     * @param {Vector3} v2 삼각형의 세 번째 정점
     * @returns {boolean} 삼각형이 카메라를 향하는 경우 true, 그렇지 않은 경우 false
     */
    private isFrontFace(v0: Vector3, v1: Vector3, v2: Vector3): boolean {
        const edge1 = v1.subtract(v0);
        const edge2 = v2.subtract(v0);
        const normal = edge1.cross(edge2);

        const viewDir = this.camera?.eye.subtract(v0) || new Vector3(0, 0, 0);

        return normal.dot(viewDir) < 0;
    }

    /**
     * 삼각형을 클리핑하는 함수
     * - Sutherland-Hodgman 클리핑 알고리즘
     * - 입력된 삼각형의 정점이 클리핑 평면에 대해 모두 안쪽에 있으면 그대로 반환
     * - 일부 정점이 평면 밖에 있으면 교차점을 계산하여 새로운 정점 배열을 반환 (최대 6개)
     * - 클리핑 평면은 뷰 프러스텀의 6개 평면 (왼쪽, 오른쪽, 위, 아래, 앞, 뒤)으로 구성됨
     * - 클리핑된 정점은 여전히 Clip Space 좌표계에 있음 (w 좌표는 그대로 유지)
     * - 클리핑된 정점은 이후에 Perspective Divide와 Viewport Transform을 거쳐 화면 좌표로 변환됨
     *
     * @private
     * @param {Vector4[]} vertices  클리핑할 삼각형의 정점 배열 (4D 벡터)
     * @returns {Vector4[]}         클리핑된 정점 배열 (최대 6개)
     */
    private clipTriangle(vertices: Vector4[]): Vector4[] {
        const planes: Plane[] = [
            new Plane(1, 0, 0, 1), // x >= -w
            new Plane(-1, 0, 0, 1), // x <= w
            new Plane(0, 1, 0, 1), // y >= -w
            new Plane(0, -1, 0, 1), // y <= w
            new Plane(0, 0, 1, 1), // z >= -w
            new Plane(0, 0, -1, 1), // z <= w
        ];

        let output: Vector4[] = vertices;
        for (const plane of planes) {
            const input = output;
            output = [];

            if (input.length === 0) {
                break;
            }

            for (let i = 0; i < input.length; i++) {
                const s = input[i];
                const e = input[(i + 1) % input.length];
                const fs = plane.distanceToPoint(s);
                const fe = plane.distanceToPoint(e);
                const sInside = fs >= 0;
                const eInside = fe >= 0;

                // S inside, E inside: e만 추가
                // S inside, E outside: 교차점만 추가
                // S outside, E inside: 교차점 + e 추가
                // S outside, E outside는 아무 것도 추가 안 함
                if (sInside && eInside) {
                    output.push(e);
                } else if (sInside && !eInside) {
                    const t = fs / (fs - fe);
                    output.push(
                        new Vector4(
                            MathUtil.lerp(s.x, e.x, t),
                            MathUtil.lerp(s.y, e.y, t),
                            MathUtil.lerp(s.z, e.z, t),
                            MathUtil.lerp(s.w, e.w, t),
                        ),
                    );
                } else if (!sInside && eInside) {
                    const t = fs / (fs - fe);
                    output.push(
                        new Vector4(
                            MathUtil.lerp(s.x, e.x, t),
                            MathUtil.lerp(s.y, e.y, t),
                            MathUtil.lerp(s.z, e.z, t),
                            MathUtil.lerp(s.w, e.w, t),
                        ),
                    );
                    output.push(e);
                }
            }
        }

        return output;
    }

    /**
     * 클립 공간 좌표를 NDC로 변환하는 함수
     *
     * @private
     * @param {Vector4} vertex 클립 공간 좌표 (x, y, z, w)
     * @returns {Vector3} NDC 좌표 (x/w, y/w, z/w)
     */
    private clipSpaceToNDC(vertex: Vector4): Vector3 {
        return new Vector3(
            vertex.x / vertex.w,
            vertex.y / vertex.w,
            vertex.z / vertex.w,
        );
    }

    /**
     * NDC 좌표를 뷰포트 좌표로 변환하는 함수
     *
     * @private
     * @param {Vector3} ndc NDC 좌표 (x, y, z)
     * @returns {Vector3} 뷰포트 좌표 (x, y, z)
     */
    private ndcToViewport(ndc: Vector3): Vector3 {
        // (ndc.x + 1) * 0.5 * this.width,
        // (1 - (ndc.y + 1) * 0.5) * this.height,
        // ndc.z,

        return new Vector3(
            (ndc.x * 0.5 + 0.5) * (this.width - 1),
            (1 - (ndc.y * 0.5 + 0.5)) * (this.height - 1),
            ndc.z * 0.5 + 0.5,
        );
    }

    /**
     * buffer width 반환
     *
     * @readonly
     * @type {number}
     */
    get width(): number {
        return this._width;
    }

    /**
     * buffer height 반환
     *
     * @readonly
     * @type {number}
     */
    get height(): number {
        return this._height;
    }
}
