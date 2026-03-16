import Renderer from "./Graphics/Renderer";
import type { ShadingType } from "./Graphics/Renderer";
import Camera from "./Graphics/Scene/Camera";
import Frustum from "./Graphics/Scene/Frustum";
import Light from "./Graphics/Scene/Light";
import Vector3 from "./Graphics/Math/Vector3";
import Color from "./Graphics/Common/Color";
import RenderObject from "./Graphics/Scene/RenderObject";
import ObjLoader from "./Graphics/Mesh/ObjLoader";

/**
 * 렌더링 샘플 오브젝트 타입
 */
export type SampleRenderObjectType = "tiger" | "teapot" | "windmill" | "bunny";

export default class Pipeline {
    /**
     * 렌더러 인스턴스
     *
     * @private
     * @type {Renderer}
     */
    private _renderer: Renderer;

    /**
     * 광원 인스턴스
     *
     * @private
     * @type {Light}
     */
    private _light: Light;

    /**
     * 카메라 인스턴스
     *
     * @private
     * @type {Camera}
     */
    private _camera: Camera;

    /**
     * 렌더링할 객체 유형
     * - "tiger": 타이거 모델
     *
     * @private
     * @type {SampleRenderObjectType}
     */
    private _renderObjectType: SampleRenderObjectType;

    /**
     * 렌더링할 객체 인스턴스
     *
     * @private
     * @type {RenderObject}
     */
    private _renderObject: RenderObject | null;

    /**
     * Creates an instance of Pipeline.
     *
     * @constructor
     * @param {number} [width=1024]     Viewport Width
     * @param {number} [height=768]     Viewport Height
     */
    constructor(width: number = 1024, height: number = 768) {
        this._renderer = new Renderer(width, height);
        this._renderer.shadingType = "phong";

        this._light = new Light(new Vector3(1, 1, 1), new Color(255, 255, 255));

        this._camera = new Camera(
            new Vector3(0, 0, 5), // eye
            new Vector3(0, 0, 0), // at
            new Frustum(60, width / height, 0.1, 100), // frustum
        );

        this._renderObjectType = "tiger";

        this._renderObject = null;
    }

    /**
     * 렌더링할 객체 유형 설정
     *
     * @param {SampleRenderObjectType} object 렌더링할 객체 유형
     * @return {Promise<void>}
     */
    async setRenderObject(object: SampleRenderObjectType): Promise<void> {
        switch (object) {
            case "tiger":
                await this.loadTigerRenderObject();
                break;

            case "teapot":
                await this.loadTeapotRenderObject();
                break;

            case "windmill":
                await this.loadWindmillRenderObject();
                break;

            case "bunny":
                await this.loadBunnyRenderObject();
                break;

            default:
                console.warn(`Unknown render object type: ${object}`);
        }
    }

    /**
     * 광원 설정
     *
     * @param {Vector3} direction 광원 방향 벡터
     * @param {Color} color 광원 색상
     * @return {void}
     */
    setLight(direction: Vector3, color: Color): void {
        this._light.direction = direction;
        this._light.color = color;
    }

    /**
     * 셰이딩 유형 설정
     * - flat: 면 단위로 조명 계산 (가장 단순하지만 앨리어싱이 심함)
     * - gouraud: 정점 단위로 조명 계산 (부드러운 조명 효과)
     * - phong: 픽셀 단위로 조명 계산 (가장 현실적인 조명 효과)
     *
     * @param {ShadingType} shadingType 셰이딩 유형
     * @return {void}
     */
    setShadingType(shadingType: ShadingType): void {
        this._renderer.shadingType = shadingType;
    }

    /**
     * 카메라 설정
     *
     * @param {Vector3} eye 카메라 위치 벡터
     * @param {Vector3} at 카메라가 바라보는 지점 벡터
     * @return {void}
     */
    setCamera(eye: Vector3, at: Vector3): void {
        this._camera.setValues(eye, at);
    }

    /**
     * 카메라의 프러스텀 정보 설정
     *
     * @param {number} fov 시야각 (Field of View)
     * @param {number} aspect 종횡비 (Aspect Ratio)
     * @param {number} near 근평면 거리 (Near Plane Distance)
     * @param {number} far 원평면 거리 (Far Plane Distance)
     * @return {void}
     */
    setFrustum(fov: number, aspect: number, near: number, far: number): void {
        this._camera.frustum.setValues(fov, aspect, near, far);
    }

    /**
     * 객체 변환 설정
     *
     * @param {Vector3} translation 객체의 위치 (Translation)
     * @param {Vector3} rotation 객체의 회전 (Rotation)
     * @param {Vector3} scale 객체의 크기 (Scale)
     * @return {void}
     */
    setRenderObjectTransformation(
        translation: Vector3,
        rotation: Vector3,
        scale: Vector3,
    ): void {
        if (this._renderObject) {
            this._renderObject.transformation.translation = translation;
            this._renderObject.transformation.rotation = rotation;
            this._renderObject.transformation.scale = scale;
        }
    }

    /**
     * 렌더링 업데이트
     *
     * @param {number} r 배경색 R 값 (0-255)
     * @param {number} g 배경색 G 값 (0-255)
     * @param {number} b 배경색 B 값 (0-255)
     * @return {void}
     */
    update(r: number = 245, g: number = 245, b: number = 245): void {
        this._renderer.clear(r, g, b);
    }

    /**
     * 렌더링 실행
     *
     * @return {Promise<void>}
     */
    async render(): Promise<void> {
        if (this._renderObject) {
            this._renderer.render(
                this._renderObject,
                this._camera,
                this._light,
            );
        }
    }

    /**
     * 타이거 모델을 로드하여 RenderObject로 반환하는 비동기 함수
     *
     * @private
     * @return {Promise<void>} 비동기 작업 완료를 나타내는 Promise
     */
    private async loadTigerRenderObject(): Promise<void> {
        const path: string = "../public/models/tiger/tiger.obj";

        const mesh = await ObjLoader.load(path);

        this._renderObject = null;

        this._renderObject = new RenderObject(mesh);
    }

    /**
     * 티팟 모델을 로드하여 RenderObject로 반환하는 비동기 함수
     *
     * @private
     * @return {Promise<void>} 비동기 작업 완료를 나타내는 Promise
     */
    private async loadTeapotRenderObject(): Promise<void> {
        const path: string = "../public/models/teapot/teapot.obj";

        const mesh = await ObjLoader.load(path);

        this._renderObject = null;

        this._renderObject = new RenderObject(mesh);
    }

    /**
     * 풍차(Windmill) 모델을 로드하여 RenderObject로 반환하는 비동기 함수
     *
     * @private
     * @return {Promise<void>} 비동기 작업 완료를 나타내는 Promise
     */
    private async loadWindmillRenderObject(): Promise<void> {
        const path: string = "../public/models/windmill/windmill.obj";

        const mesh = await ObjLoader.load(path);

        this._renderObject = null;

        this._renderObject = new RenderObject(mesh);
    }

    /**
     * 토끼(Bunny) 모델을 로드하여 RenderObject로 반환하는 비동기 함수
     *
     * @private
     * @return {Promise<void>} 비동기 작업 완료를 나타내는 Promise
     */
    private async loadBunnyRenderObject(): Promise<void> {
        const path: string = "../public/models/bunny/bunny.obj";

        const mesh = await ObjLoader.load(path);

        this._renderObject = null;

        this._renderObject = new RenderObject(mesh);
    }

    /**
     * Renderer 인스턴스 반환
     *
     * @return {Renderer} Renderer 인스턴스
     */
    get renderer(): Renderer {
        return this._renderer;
    }

    /**
     * 광원 정보 반환
     *
     * @return {Light} 광원 정보
     */
    get light(): Light {
        return this._light;
    }

    /**
     * 셰이딩 유형 반환
     *
     * @return {ShadingType} 셰이딩 유형
     */
    get shadingType(): ShadingType {
        return this._renderer.shadingType;
    }

    /**
     * 카메라 정보 반환
     *
     * @return {Camera} 카메라 정보
     */
    get camera(): Camera {
        return this._camera;
    }

    /**
     * 렌더링할 객체 유형 반환
     *
     * @return {SampleRenderObjectType} 렌더링할 객체 유형
     */
    get renderObjectType(): SampleRenderObjectType {
        return this._renderObjectType;
    }

    /**
     * 렌더링할 객체 반환
     *
     * @return {RenderObject | null} 렌더링할 객체
     */
    get renderObject(): RenderObject | null {
        return this._renderObject;
    }
}
