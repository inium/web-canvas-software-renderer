import BufferSet from "./Scene/Buffers/BufferSet";
import Vector3 from "./Math/Vector3";
import Vector4 from "./Math/Vector4";
import Camera from "./Scene/Camera";
import RenderObject from "./Scene/RenderObject";
import Matrix4x4 from "./Math/Matrix4x4";
import MathUtil from "./Math/Util";
import Plane from "./Math/Plane";
import Point from "./Geometry/Point";
import Color from "./Common/Color";
import Vector2 from "./Math/Vector2";
import Triangle from "./Geometry/Triangle";
import Light from "./Scene/Light";
import Material from "./Scene/Material";

/**
 * 셰이딩 타입 (phong, gouraud, flat)
 * - flat: 삼각형 단위로 조명 계산 (가장 단순하지만 가장 덜 사실적)
 * - gouraud: 정점 단위로 조명 계산 후 보간 (중간 정도의 사실감과 계산량)
 * - phong: 픽셀 단위로 조명 계산 (가장 사실적이지만 계산량 많음)
 */
export type ShadingType = "phong" | "gouraud" | "flat";

/**
 * PointSet 타입 정의
 * - p: 화면 좌표계에서의 위치 (Point 객체)
 * - vp: view space에서의 위치 (Vector3, 래스터라이제이션 단계에서 보간하여 픽셀 단위로 조명 계산할 때 사용)
 * - vn: view space에서의 법선 벡터 (Vector3, 래스터라이제이션 단계에서 보간하여 픽셀 단위로 조명 계산할 때 사용)
 * - intensity: 조명 계산 결과로 나온 밝기 (0-1 사이의 값)
 */
type PointSet = {
    p: Point;
    vp: Vector3;
    vn: Vector3;
    intensity: number;
};

/**
 * ClipVertex 타입 정의
 * - clip: 클립 공간 좌표 (Vector4, x, y, z, w)
 * - vp: view space에서의 위치 (Vector3, 래스터라이제이션 단계에서 보간하여 픽셀 단위로 조명 계산할 때 사용)
 * - vn: view space에서의 법선 벡터 (Vector3, 래스터라이제이션 단계에서 보간하여 픽셀 단위로 조명 계산할 때 사용)
 * - intensity: 조명 계산 결과로 나온 밝기 (0-1 사이의 값)
 */
type ClipVertex = {
    clip: Vector4;
    vp: Vector3;
    vn: Vector3;
    intensity: number;
};

/**
 * ShadingSet 타입 정의
 * - viewMatrix: 모델뷰 행렬 (Matrix4x4, 조명 계산에 필요한 뷰 공간으로의 변환 정보)
 * - light: 광원 정보 (Light 객체, 조명 계산에 필요한 광원 방향과 색상 정보)
 * - material: 재질 정보 (Material 객체, 조명 계산에 필요한 재질 특성 정보)
 */
type ShadingSet = {
    viewMatrix: Matrix4x4;
    light: Light;
    material: Material;
};

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
     * 샘플링 레벨 (예: 0, 2, 4)
     * - MSAA 샘플링 레벨이 높을수록 앨리어싱이 줄어들지만 계산량이 증가함
     * - 일반적으로 2x 또는 4x가 적절한 균형을 제공함
     *
     * @private
     * @type {number}
     */
    private _sampleLevel: number = 2;

    /**
     * 셰이딩 타입 (phong, gouraud, flat)
     * - flat: 삼각형 단위로 조명 계산 (가장 단순하지만 가장 덜 사실적)
     * - gouraud: 정점 단위로 조명 계산 후 보간 (중간 정도의 사실감과 계산량)
     * - phong: 픽셀 단위로 조명 계산 (가장 사실적이지만 계산량 많음)
     *
     * @type {ShadingType}
     */
    shadingType: ShadingType = "phong";

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
        this._sampleLevel = sampleLevel;

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
     * @param {Camera} camera 렌더링에 사용할 카메라
     * @param {Light} light 렌더링에 사용할 광원
     * @return {void}
     */
    render(renderObject: RenderObject, camera: Camera, light: Light): void {
        const modelMatrix = renderObject.transformation.modelMatrix();
        const viewMatrix = camera.viewMatrix() || Matrix4x4.identity();
        const projectionMatrix =
            camera.projectionMatrix() || Matrix4x4.identity();

        const modelViewMatrix = viewMatrix.multiply(modelMatrix);
        const mvp = projectionMatrix.multiply(modelViewMatrix);

        for (const face of renderObject.mesh.indices) {
            const v0 = renderObject.mesh.vertices[face[0]];
            const v1 = renderObject.mesh.vertices[face[1]];
            const v2 = renderObject.mesh.vertices[face[2]];

            const view0 = this.transformPoint(modelViewMatrix, v0.position);
            const view1 = this.transformPoint(modelViewMatrix, v1.position);
            const view2 = this.transformPoint(modelViewMatrix, v2.position);

            const v0View = new Vector3(view0.x, view0.y, view0.z);
            const v1View = new Vector3(view1.x, view1.y, view1.z);
            const v2View = new Vector3(view2.x, view2.y, view2.z);

            const n0View = this.transformDirection(modelViewMatrix, v0.normal);
            const n1View = this.transformDirection(modelViewMatrix, v1.normal);
            const n2View = this.transformDirection(modelViewMatrix, v2.normal);

            if (!this.isFrontFace(v0View, v1View, v2View)) {
                continue;
            }

            const shadingSet: ShadingSet = {
                viewMatrix,
                light,
                material: renderObject.material,
            };

            const baseColor = this.combineColor(
                renderObject.material.albedo,
                light.color,
            );

            const s0: PointSet = {
                p: new Point(new Vector2(0, 0), 0, baseColor),
                vp: v0View,
                vn: n0View,
                intensity: 1.0,
            };
            const s1: PointSet = {
                p: new Point(new Vector2(0, 0), 0, baseColor),
                vp: v1View,
                vn: n1View,
                intensity: 1.0,
            };
            const s2: PointSet = {
                p: new Point(new Vector2(0, 0), 0, baseColor),
                vp: v2View,
                vn: n2View,
                intensity: 1.0,
            };

            let i0 = 1.0;
            let i1 = 1.0;
            let i2 = 1.0;

            if (this.shadingType === "flat") {
                [i0, i1, i2] = this.flatShading(s0, s1, s2, shadingSet);
            } else if (this.shadingType === "gouraud") {
                [i0, i1, i2] = this.gouraudShading(s0, s1, s2, shadingSet);
            }

            const clip0 = this.transformPoint(mvp, v0.position);
            const clip1 = this.transformPoint(mvp, v1.position);
            const clip2 = this.transformPoint(mvp, v2.position);

            const clipped = this.clipTriangleWithAttributes([
                { clip: clip0, vp: v0View, vn: n0View, intensity: i0 },
                { clip: clip1, vp: v1View, vn: n1View, intensity: i1 },
                { clip: clip2, vp: v2View, vn: n2View, intensity: i2 },
            ]);

            if (clipped.length < 3) {
                continue;
            }

            for (let i = 1; i < clipped.length - 1; i++) {
                const c = [clipped[0], clipped[i], clipped[i + 1]];

                const ndc = c.map((v) => this.clipSpaceToNDC(v.clip));
                const screen = ndc.map((v) => this.ndcToViewport(v));

                const p0: PointSet = {
                    p: new Point(
                        new Vector2(screen[0].x, screen[0].y),
                        ndc[0].z,
                        baseColor,
                    ),
                    vp: c[0].vp,
                    vn: c[0].vn,
                    intensity: c[0].intensity,
                };

                const p1: PointSet = {
                    p: new Point(
                        new Vector2(screen[1].x, screen[1].y),
                        ndc[1].z,
                        baseColor,
                    ),
                    vp: c[1].vp,
                    vn: c[1].vn,
                    intensity: c[1].intensity,
                };

                const p2: PointSet = {
                    p: new Point(
                        new Vector2(screen[2].x, screen[2].y),
                        ndc[2].z,
                        baseColor,
                    ),
                    vp: c[2].vp,
                    vn: c[2].vn,
                    intensity: c[2].intensity,
                };

                this.renderTriangle(p0, p1, p2, shadingSet);
            }
        }
    }

    /**
     * 삼각형 래스터라이제이션 함수
     *
     * @private
     * @param {Triangle} t 래스터라이제이션할 삼각형
     */
    private renderTriangle(
        p0: PointSet,
        p1: PointSet,
        p2: PointSet,
        shadingSet: ShadingSet,
    ): void {
        // calculate bounding box of the triangle
        const bbox = MathUtil.boundingBox2D([
            p0.p.position.toObject(),
            p1.p.position.toObject(),
            p2.p.position.toObject(),
        ]);

        bbox.minX = Math.max(Math.floor(bbox.minX), 0);
        bbox.maxX = Math.min(Math.ceil(bbox.maxX), this.width - 1);
        bbox.minY = Math.max(Math.floor(bbox.minY), 0);
        bbox.maxY = Math.min(Math.ceil(bbox.maxY), this.height - 1);

        // 면적이 거의 0이면 래스터라이제이션 하지 않음 (degenerate triangle)
        const area = new Triangle(p0.p, p1.p, p2.p).barycentricArea();
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
                    p0,
                    p1,
                    p2,
                    shadingSet,
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
     * @param {number} x                픽셀 x 좌표
     * @param {number} y                픽셀 y 좌표
     * @param {PointSet} p0             삼각형의 첫 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {PointSet} p1             삼각형의 두 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {PointSet} p2             삼각형의 세 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {ShadingSet} shadingSet   셰이딩 계산에 필요한 정보 (모델뷰 행렬, 뷰 행렬, 광원 방향, 재질 등)
     * @param {Triangle} t              삼각형 정보
     * @param {number} area             삼각형의 면적 - area가 양수면 반시계(CCW) 방향, 음수면 시계(CW) 방향 (top-left rule양식 적용)
     * @param {boolean} isTopLeft       삼각형의 방향 (반시계: true, 시계: false)
     * @param {number} sampleLevel      MSAA 샘플링 레벨
     * @param {number} edgeEpsilon      엣지 근처에서의 수치적 안정성을 위한 작은 값 (기본값: 1e-6)
     * @return {void}
     */
    private sampleMsaa(
        x: number,
        y: number,
        p0: PointSet,
        p1: PointSet,
        p2: PointSet,
        shadingSet: ShadingSet,
        area: number,
        isTopLeft: boolean,
        sampleLevel: number,
        edgeEpsilon: number = 1e-6,
    ): void {
        const t = new Triangle(p0.p, p1.p, p2.p);
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

                if (!isInside) {
                    continue;
                }

                const a = w0 / area;
                const b = w1 / area;
                const c = w2 / area;
                const depth = a * t.p0.depth + b * t.p1.depth + c * t.p2.depth;

                const intensity =
                    this.shadingType === "phong"
                        ? this.phongShading(a, b, c, p0, p1, p2, shadingSet)
                        : Math.min(
                              1.0,
                              Math.max(
                                  0.0,
                                  a * p0.intensity +
                                      b * p1.intensity +
                                      c * p2.intensity,
                              ),
                          );

                const currentDepth =
                    this.bufferSet.depthBuffer.getPixel(x, y, sx, sy) ??
                    Number.POSITIVE_INFINITY;

                if (depth < currentDepth) {
                    this.bufferSet.depthBuffer.setPixel(x, y, sx, sy, depth);

                    const color = t.getColorAtBarycentric(a, b, c);
                    this.bufferSet.colorBuffer.setPixel(
                        x,
                        y,
                        sx,
                        sy,
                        color.r * intensity,
                        color.g * intensity,
                        color.b * intensity,
                        color.a,
                    );

                    sampleCount++;
                }
            }
        }

        if (sampleCount > 0) {
            let r = 0;
            let g = 0;
            let b = 0;
            let a = 0;

            for (let sy = 0; sy < sampleLevel; sy++) {
                for (let sx = 0; sx < sampleLevel; sx++) {
                    const c =
                        this.bufferSet.colorBuffer.getPixel(x, y, sx, sy) ??
                        new Color(0, 0, 0, 0);

                    r += c.r;
                    g += c.g;
                    b += c.b;
                    a += c.a;
                }
            }

            const totalSamples = sampleLevel * sampleLevel;

            this.bufferSet.frameBuffer.setPixel(
                x,
                y,
                Math.round(r / totalSamples),
                Math.round(g / totalSamples),
                Math.round(b / totalSamples),
                a === 0 ? 255 : Math.round(a / totalSamples),
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
     * 행렬과 3D 벡터를 곱하여 변환된 3D 벡터로 반환 (회전 및 스케일링에 사용, 평행 이동은 무시)
     *
     * @private
     * @param {Matrix4x4} matrix    4x4 변환 행렬
     * @param {Vector3} v           3D 벡터 (x, y, z)
     * @returns {Vector3}           변환된 3D 벡터 (x, y, z)
     */
    private transformDirection(matrix: Matrix4x4, v: Vector3): Vector3 {
        const e = matrix.elements;

        return new Vector3(
            e[0] * v.x + e[1] * v.y + e[2] * v.z,
            e[4] * v.x + e[5] * v.y + e[6] * v.z,
            e[8] * v.x + e[9] * v.y + e[10] * v.z,
        ).normalize();
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

        // view space에서 카메라 위치는 (0,0,0)
        const viewDir = new Vector3(0, 0, 0).subtract(v0);

        // winding 규약에 따라 부호가 반대일 수 있음
        return normal.dot(viewDir) > 0;
    }

    /**
     * 클리핑된 삼각형의 정점에 뷰 공간에서의 위치, 법선, 조명 계산 결과 등 추가 정보를 포함하는 함수
     * - 클리핑된 정점은 여전히 Clip Space 좌표계에 있지만, 래스터라이제이션 단계에서 조명 계산을 위해 뷰 공간에서의 위치와 법선 정보도 함께 보관
     * - 클리핑된 정점의 위치와 법선은 원래 삼각형의 정점에서 보간하여 계산 (클리핑된 정점이 원래 정점과 교차점이므로, 교차점에서의 뷰 공간 위치와 법선을 보간하여 계산)
     * - 조명 계산 결과는 클리핑된 정점에서의 밝기 값으로, 원래 삼각형의 정점에서 보간하여 계산
     *
     * @private
     * @param {ClipVertex[]} vertices  클리핑된 삼각형의 정점 배열 (Clip Space 좌표 + 뷰 공간 위치, 법선, 조명 정보)
     * @returns {ClipVertex[]}         클리핑된 정점 배열 (뷰 공간 위치, 법선, 조명 정보 포함)
     */
    private clipTriangleWithAttributes(vertices: ClipVertex[]): ClipVertex[] {
        const planes: Plane[] = [
            new Plane(1, 0, 0, 1),
            new Plane(-1, 0, 0, 1),
            new Plane(0, 1, 0, 1),
            new Plane(0, -1, 0, 1),
            new Plane(0, 0, 1, 1),
            new Plane(0, 0, -1, 1),
        ];

        let output: ClipVertex[] = vertices;

        for (const plane of planes) {
            const input = output;
            output = [];

            if (input.length === 0) {
                break;
            }

            for (let i = 0; i < input.length; i++) {
                const s = input[i];
                const e = input[(i + 1) % input.length];

                const fs = plane.distanceToPoint(s.clip);
                const fe = plane.distanceToPoint(e.clip);

                const sInside = fs >= 0;
                const eInside = fe >= 0;

                const lerpVertex = (t: number): ClipVertex => ({
                    clip: new Vector4(
                        MathUtil.lerp(s.clip.x, e.clip.x, t),
                        MathUtil.lerp(s.clip.y, e.clip.y, t),
                        MathUtil.lerp(s.clip.z, e.clip.z, t),
                        MathUtil.lerp(s.clip.w, e.clip.w, t),
                    ),
                    vp: new Vector3(
                        MathUtil.lerp(s.vp.x, e.vp.x, t),
                        MathUtil.lerp(s.vp.y, e.vp.y, t),
                        MathUtil.lerp(s.vp.z, e.vp.z, t),
                    ),
                    vn: new Vector3(
                        MathUtil.lerp(s.vn.x, e.vn.x, t),
                        MathUtil.lerp(s.vn.y, e.vn.y, t),
                        MathUtil.lerp(s.vn.z, e.vn.z, t),
                    ).normalize(),
                    intensity: MathUtil.lerp(s.intensity, e.intensity, t),
                });

                if (sInside && eInside) {
                    output.push(e);
                } else if (sInside && !eInside) {
                    output.push(lerpVertex(fs / (fs - fe)));
                } else if (!sInside && eInside) {
                    output.push(lerpVertex(fs / (fs - fe)));
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
        // return new Vector3(
        //     (ndc.x + 1) * 0.5 * this.width,
        //     (1 - (ndc.y + 1) * 0.5) * this.height,
        //     ndc.z,
        // );

        return new Vector3(
            (ndc.x * 0.5 + 0.5) * (this.width - 1),
            (1 - (ndc.y * 0.5 + 0.5)) * (this.height - 1),
            ndc.z * 0.5 + 0.5,
        );
    }

    /**
     * Phong 조명 모델을 이용하여 픽셀의 밝기 계산
     *
     * @private
     * @param {Vector3} normal        픽셀의 법선 벡터 (view space)
     * @param {Vector3} view          픽셀에서 카메라 방향 벡터 (view space)
     * @param {Vector3} lightDirView  픽셀에서 광원 방향 벡터 (view space)
     * @param {Light} light           광원 정보
     * @param {Material} material     재질 정보
     * @returns {number} 픽셀의 밝기 값 (0.0 ~ 1.0)
     */
    private calculateShadingIntensity(
        normal: Vector3,
        view: Vector3,
        lightDirView: Vector3,
        light: Light,
        material: Material,
    ): number {
        const n = normal.normalize();
        const l = lightDirView.normalize();
        const viewDir = view.multiplyScalar(-1).normalize();

        const ndotl = Math.max(0, n.dot(l));
        const reflectDir = n
            .multiplyScalar(2 * ndotl)
            .subtract(l)
            .normalize();

        const ambient = light.ambientIntensity * material.ambientStrength;
        const diffuse =
            ndotl * light.diffuseIntensity * material.diffuseStrength;
        const specular =
            Math.pow(
                Math.max(0.0, reflectDir.dot(viewDir)),
                material.shininess,
            ) *
            light.specularIntensity *
            material.specularStrength;
        const emission = light.emissionIntensity * material.emissionStrength;

        return Math.min(
            1.0,
            Math.max(0.0, ambient + diffuse + specular + emission),
        );
    }

    /**
     * Flat shading
     * - 삼각형의 중심에서 법선과 뷰 방향을 계산하여 픽셀의 밝기 계산
     *
     * @private
     * @param {PointSet} p0                 삼각형의 첫 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {PointSet} p1                 삼각형의 두 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {PointSet} p2                 삼각형의 세 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {ShadingSet} shadingSet       셰이딩 계산에 필요한 정보 (모델뷰 행렬, 뷰 행렬, 광원 방향, 재질 등)
     * @returns {[number, number, number]}  p0, p1, p2 정점에 대한 픽셀의 밝기 값 (0.0 ~ 1.0)
     */
    private flatShading(
        p0: PointSet,
        p1: PointSet,
        p2: PointSet,
        shadingSet: ShadingSet,
    ): [number, number, number] {
        const v0View = new Vector3(p0.vp.x, p0.vp.y, p0.vp.z);
        const v1View = new Vector3(p1.vp.x, p1.vp.y, p1.vp.z);
        const v2View = new Vector3(p2.vp.x, p2.vp.y, p2.vp.z);

        const e1 = new Vector3(
            v1View.x - v0View.x,
            v1View.y - v0View.y,
            v1View.z - v0View.z,
        );
        const e2 = new Vector3(
            v2View.x - v0View.x,
            v2View.y - v0View.y,
            v2View.z - v0View.z,
        );
        const centerNormal = e1.cross(e2).normalize();
        const centerView = new Vector3(
            (v0View.x + v1View.x + v2View.x) / 3,
            (v0View.y + v1View.y + v2View.y) / 3,
            (v0View.z + v1View.z + v2View.z) / 3,
        );

        // 방향광은 viewMatrix로만 변환 (modelView 사용 금지)
        const lightDirView = this.transformDirection(
            shadingSet.viewMatrix,
            shadingSet.light.direction,
        ).normalize();

        const intensity = this.calculateShadingIntensity(
            centerNormal,
            centerView,
            lightDirView,
            shadingSet.light,
            shadingSet.material,
        );

        return [intensity, intensity, intensity];
    }

    /**
     * Gouraud shading
     * - 각 정점에서 법선과 뷰 방향을 계산하여 픽셀의 밝기 계산
     *
     * @private
     * @param {PointSet} p0                 삼각형의 첫 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {PointSet} p1                 삼각형의 두 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {PointSet} p2                 삼각형의 세 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {ShadingSet} shadingSet       셰이딩 계산에 필요한 정보 (모델뷰 행렬, 뷰 행렬, 광원 방향, 재질 등)
     * @returns {[number, number, number]}  p0, p1, p2 정점에 대한 픽셀의 밝기 값 (0.0 ~ 1.0)
     */
    private gouraudShading(
        p0: PointSet,
        p1: PointSet,
        p2: PointSet,
        shadingSet: ShadingSet,
    ): [number, number, number] {
        // Gouraud shading: 각 정점의 normal과 view로 계산하여 intensity 구하기
        const v0View = new Vector3(p0.vp.x, p0.vp.y, p0.vp.z);
        const v1View = new Vector3(p1.vp.x, p1.vp.y, p1.vp.z);
        const v2View = new Vector3(p2.vp.x, p2.vp.y, p2.vp.z);

        const n0View = new Vector3(p0.vn.x, p0.vn.y, p0.vn.z);
        const n1View = new Vector3(p1.vn.x, p1.vn.y, p1.vn.z);
        const n2View = new Vector3(p2.vn.x, p2.vn.y, p2.vn.z);

        // 방향광은 viewMatrix로만 변환 (modelView 사용 금지)
        const lightDirView = this.transformDirection(
            shadingSet.viewMatrix,
            shadingSet.light.direction,
        ).normalize();

        const i0 = this.calculateShadingIntensity(
            n0View,
            new Vector3(v0View.x, v0View.y, v0View.z),
            lightDirView,
            shadingSet.light,
            shadingSet.material,
        );
        const i1 = this.calculateShadingIntensity(
            n1View,
            new Vector3(v1View.x, v1View.y, v1View.z),
            lightDirView,
            shadingSet.light,
            shadingSet.material,
        );
        const i2 = this.calculateShadingIntensity(
            n2View,
            new Vector3(v2View.x, v2View.y, v2View.z),
            lightDirView,
            shadingSet.light,
            shadingSet.material,
        );

        return [i0, i1, i2];
    }

    /**
     * Phong shading
     * - 각 픽셀에서 보간된 법선과 view 방향을 계산하여 픽셀의 밝기 계산
     *
     * @private
     * @param {number} a                삼각형의 첫 번째 정점에 대한 바리센트릭 좌표
     * @param {number} b                삼각형의 두 번째 정점에 대한 바리센트릭 좌표
     * @param {number} c                삼각형의 세 번째 정점에 대한 바리센트릭 좌표
     * @param {PointSet} p0             삼각형의 첫 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {PointSet} p1             삼각형의 두 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {PointSet} p2             삼각형의 세 번째 정점 정보 (화면 좌표, view space 위치, 법선 등)
     * @param {ShadingSet} shadingSet   셰이딩 계산에 필요한 정보 (모델뷰 행렬, 뷰 행렬, 광원 방향, 재질 등)
     * @returns {number} 픽셀의 밝기 값 (0.0 ~ 1.0)
     */
    private phongShading(
        a: number,
        b: number,
        c: number,
        p0: PointSet,
        p1: PointSet,
        p2: PointSet,
        shadingSet: ShadingSet,
    ): number {
        // Phong shading: 각 픽셀에서 법선과 view로 계산하여 intensity 구하기
        const normal = p0.vn
            .multiplyScalar(a)
            .add(p1.vn.multiplyScalar(b))
            .add(p2.vn.multiplyScalar(c))
            .normalize();

        const positionView = p0.vp
            .multiplyScalar(a)
            .add(p1.vp.multiplyScalar(b))
            .add(p2.vp.multiplyScalar(c));

        // 방향광은 viewMatrix로만 변환 (modelView 사용 금지)
        const lightDirView = this.transformDirection(
            shadingSet.viewMatrix,
            shadingSet.light.direction,
        ).normalize();

        return this.calculateShadingIntensity(
            normal,
            positionView,
            lightDirView,
            shadingSet.light,
            shadingSet.material,
        );
    }

    /**
     * 두 색상을 곱하여 새로운 색상을 반환하는 함수 (알베도와 광원 색상 결합 등)
     * - 각 채널별로 (a.r * b.r) / 255 형태로 계산하여 0-255 범위의 색상 값으로 반환
     * - 예를 들어, a가 (255, 0, 0)이고 b가 (255, 255, 255)인 경우 결과는 (255, 0, 0)이 됨 (빨간색이 그대로 유지)
     *
     * @private
     * @param {Color} a 첫 번째 색상
     * @param {Color} b 두 번째 색상
     * @return {Color} 곱해진 결과 색상
     */
    private combineColor(a: Color, b: Color): Color {
        return new Color(
            Math.round((a.r * b.r) / 255),
            Math.round((a.g * b.g) / 255),
            Math.round((a.b * b.b) / 255),
            Math.round((a.a * b.a) / 255),
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

    /**
     * MSAA 샘플링 레벨 반환
     *
     * @readonly
     * @type {number}
     */
    get sampleLevel(): number {
        return this._sampleLevel;
    }
}
