import Alpine from "alpinejs";
import Pipeline from "./Pipeline";
import ImageCanvas from "./ImageCanvas";
import Vector3 from "./Graphics/Math/Vector3";
import Color from "./Graphics/Common/Color";
import { type SampleRenderObjectType } from "./Pipeline";
import { type ShadingType } from "./Graphics/Renderer";
import "./style.css";

window.Alpine = Alpine;

type Vec3 = { x: number; y: number; z: number };
type Color3 = { r: number; g: number; b: number };
type Buffers = "framebuffer" | "depthbuffer";
type Frustum = {
    fov: number;
    aspect: number;
    near: number;
    far: number;
};

type ParamsStore = {
    buffer: Buffers;
    model: {
        model: SampleRenderObjectType;
        useTexture: boolean;
        texture: boolean;
        translation: Vec3;
        rotation: Vec3;
        scale: Vec3;
    };
    camera: {
        eye: Vec3;
        at: Vec3;
        up: Vec3;
        frustum: Frustum;
    };
    light: {
        direction: Vec3;
        color: Color3; // (60, 140, 220)
        shading: ShadingType;
    };

    // 모델 로드
    loadObject: () => Promise<void>;

    // 텍스처 매핑 사용 여부
    enableTexture(): boolean;

    // 렌더링 파라미터 적용 및 렌더링 업데이트
    apply: () => Promise<void>;
};

/**
 * 애플리케이션 부트스트랩 함수
 *
 * - 초기 카메라 설정
 * - 렌더링 파이프라인 업데이트 및 렌더링
 * - FrameBuffer의 픽셀 데이터를 HTML5 Canvas로 복사하여 화면에 출력
 *
 * @param {string} canvasId  렌더링할 HTML5 Canvas 요소의 ID
 * @param {number} width     Viewport Width
 * @param {number} height    Viewport Height
 * @return {Promise<void>}   비동기 작업 완료를 나타내는 Promise
 */
async function bootstrap(
    canvasId: string,
    width: number,
    height: number,
): Promise<void> {
    const pipeline = new Pipeline(width, height);

    const render = async (
        useTexture: boolean = false,
        buffer: Buffers = "framebuffer",
    ): Promise<void> => {
        pipeline.update();
        await pipeline.render(useTexture);

        // render to canvas
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const imageCanvas = new ImageCanvas(canvas, width, height);
        const ctx = imageCanvas.getContext();

        // FrameBuffer의 픽셀 데이터를 HTML5 Canvas로 복사하여 화면에 출력
        ctx?.putImageData(
            buffer === "framebuffer"
                ? (pipeline.renderer.bufferSet.frameBuffer?.getImageData() ??
                      new ImageData(width, height))
                : (pipeline.renderer.bufferSet.depthBuffer?.getImageData() ??
                      new ImageData(width, height)),
            0,
            0,
        );
    };

    const paramStore: ParamsStore = {
        buffer: "framebuffer" as Buffers,
        model: {
            model: "tiger" as SampleRenderObjectType,
            useTexture: true,
            texture: true,
            translation: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
        },
        camera: {
            eye: { x: 0, y: 0, z: 50 },
            at: { x: 0, y: 0, z: 0 },
            up: { x: 0, y: 1, z: 0 },
            frustum: { fov: 60, aspect: width / height, near: 0.1, far: 1000 },
        },
        light: {
            direction: { x: 1, y: 1, z: 20 },
            color: { r: 255, g: 255, b: 255 }, // color: { r: 60, g: 140, b: 220 },
            shading: "gouraud" as ShadingType,
        },

        enableTexture(): boolean {
            return this.model.useTexture && this.buffer === "framebuffer";
        },

        /**
         * 모델 로드
         *
         * - 선택된 모델 유형에 따라 렌더링 객체 로드
         *
         * @return {Promise<void>} 비동기 작업 완료를 나타내는 Promise
         */
        async loadObject(): Promise<void> {
            await pipeline.setRenderObject(this.model.model);

            switch (this.model.model) {
                // 호랑이 모델
                case "tiger":
                    // Load 시 기본 모델 Transformation 설정
                    this.model.translation = { x: 0, y: 0, z: 0 };
                    this.model.rotation = { x: 0, y: -90, z: 0 };
                    // this.model.rotation = { x: 0, y: 0, z: 0 };
                    this.model.scale = { x: 0.1, y: 0.1, z: 0.1 };

                    // 텍스처 사용 여부 설정
                    this.model.useTexture = true;

                    // 기본 Camera 설정
                    this.camera.eye = { x: 0, y: 0, z: 50 };
                    this.camera.at = { x: 0, y: 0, z: 0 };
                    break;

                // 토끼 모델 (Bunny)
                case "bunny":
                    // Load 시 기본 모델 Transformation 설정
                    this.model.translation = { x: 0, y: 0, z: 0 };
                    this.model.rotation = { x: 0, y: 0, z: 0 };
                    this.model.scale = { x: 0.1, y: 0.1, z: 0.1 };

                    this.model.useTexture = true;

                    // 기본 Camera 설정
                    this.camera.eye = { x: 0, y: 0, z: 70 };
                    this.camera.at = { x: 0, y: 0, z: 0 };
                    break;

                // 부처 모델 (Buddha)
                case "buddha":
                    // Load 시 기본 모델 Transformation 설정
                    this.model.translation = { x: 0, y: 0, z: 0 };
                    this.model.rotation = { x: -90, y: 0, z: 0 };
                    this.model.scale = { x: 0.1, y: 0.1, z: 0.1 };

                    // Utah Teapot 모델은 텍스처가 없으므로 텍스처 사용 비활성화
                    this.model.useTexture = true;

                    // 기본 Camera 설정
                    this.camera.eye = { x: 0, y: -1, z: 60 };
                    this.camera.at = { x: 0, y: -1, z: 0 };
                    break;

                // 얼룩말 모델 (Zebra)
                case "zebra":
                    // Load 시 기본 모델 Transformation 설정
                    this.model.translation = { x: 0, y: 0, z: 0 };
                    this.model.rotation = { x: -90, y: 90, z: 0 };
                    this.model.scale = { x: 0.1, y: 0.1, z: 0.1 };

                    // Utah Teapot 모델은 텍스처가 없으므로 텍스처 사용 비활성화
                    this.model.useTexture = true;

                    // 기본 Camera 설정
                    this.camera.eye = { x: 0, y: 2, z: 50 };
                    this.camera.at = { x: 0, y: 2, z: 0 };
                    break;

                // 찻주전자 모델 (Stanford University에서 제공하는 "Utah Teapot" 모델)
                case "teapot":
                    // Load 시 기본 모델 Transformation 설정
                    this.model.translation = { x: 0, y: 0, z: 0 };
                    this.model.rotation = { x: 0, y: 0, z: 0 };
                    this.model.scale = { x: 1, y: 1, z: 1 };

                    // Utah Teapot 모델은 텍스처가 없으므로 텍스처 사용 비활성화
                    this.model.useTexture = false;

                    // 기본 Camera 설정
                    this.camera.eye = { x: 0, y: 2, z: 6 };
                    this.camera.at = { x: 0, y: 2, z: 0 };
                    break;

                default:
                    break;
            }

            pipeline.setRenderObjectTransformation(
                new Vector3(
                    this.model.translation.x,
                    this.model.translation.y,
                    this.model.translation.z,
                ),
                new Vector3(
                    this.model.rotation.x,
                    this.model.rotation.y,
                    this.model.rotation.z,
                ),
                new Vector3(
                    this.model.scale.x,
                    this.model.scale.y,
                    this.model.scale.z,
                ),
            );

            await this.apply();
        },

        /**
         * 렌더링 파라미터 적용
         *
         * - 카메라 위치 및 방향 업데이트
         * - 프러스텀 정보 업데이트
         * - 조명 정보 업데이트
         * - 렌더링 업데이트 및 실행
         *
         * @return {Promise<void>} 비동기 작업 완료를 나타내는 Promise
         */
        async apply(): Promise<void> {
            const model = this.model;
            const camera = this.camera;
            const light = this.light;

            // 렌더링 객체의 변환 정보 업데이트
            const pos = model.translation;
            const rot = model.rotation;
            const scale = model.scale;
            pipeline.setRenderObjectTransformation(
                new Vector3(pos.x, pos.y, pos.z),
                new Vector3(rot.x, rot.y, rot.z),
                new Vector3(scale.x, scale.y, scale.z),
            );

            // 카메라 업데이트 (eye, at / up은 자동 계산)
            pipeline.setCamera(
                new Vector3(camera.eye.x, camera.eye.y, camera.eye.z), // eye
                new Vector3(camera.at.x, camera.at.y, camera.at.z), // at
            );

            // 카메라 up 벡터는 자동계산
            const up = pipeline.camera.up;
            this.camera.up.x = up.x;
            this.camera.up.y = up.y;
            this.camera.up.z = up.z;

            // 프러스텀 업데이트
            const f = pipeline.camera.frustum;
            pipeline.setFrustum(f.fov, f.aspect, f.near, f.far);

            // 조명 정보 업데이트
            const lightDir = light.direction;

            pipeline.setLight(
                new Vector3(lightDir.x, lightDir.y, lightDir.z),
                new Color(light.color.r, light.color.g, light.color.b),
            );

            // 셰이딩 유형 업데이트
            pipeline.setShadingType(light.shading);

            await render(
                this.model.texture && this.enableTexture(),
                this.buffer,
            );
        },
    };

    Alpine.store("params", paramStore);

    await (Alpine.store("params") as ParamsStore).loadObject();
    Alpine.start();
}

const width = 1024;
const height = 768;

await bootstrap("canvas", width, height);
