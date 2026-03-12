import Vector3 from "../Math/Vector3";
import Color from "../Common/Color";

export default class Light {
    /**
     * 광원의 주변광 계수 (Ambient Coefficient)
     * - 주변광은 모든 방향에서 균일하게 퍼지는 빛으로, 물체의 기본 색상을 결정하는 데 사용
     * - 주변광 계수는 0에서 1 사이의 값으로 표현되며, 0이면 주변광이 없고, 1이면 최대 주변광이 적용
     * - 예를 들어, 주변광 계수가 0.1이면 물체의 색상이 주변광에 의해 10% 밝아지며, 나머지 90%는 다른 조명 요소(예: 확산광, 반사광)에 의해 결정됨
     * - 주변광 계수는 광원의 밝기와 물체의 재질 특성에 따라 달라질 수 있으며, 일반적으로 낮은 값이 사용되어 물체가 너무 밝아지는 것을 방지
     *
     * @type {number}
     */
    ambientIntensity: number = 0.1;

    /**
     * 광원의 확산광 계수 (Diffuse Coefficient)
     * - 확산광은 광원이 물체에 직접적으로 닿아 물체의 표면에서 퍼지는 빛으로, 물체의 색상과 밝기에 큰 영향을 미침
     * - 확산광 계수는 0에서 1 사이의 값으로 표현되며, 0이면 확산광이 없고, 1이면 최대 확산광이 적용
     * - 예를 들어, 확산광 계수가 0.8이면 광원에서 물체로 직접 닿는 빛이 물체의 색상을 80% 밝게 만들며, 나머지 20%는 다른 조명 요소(예: 주변광, 방출광)에 의해 결정됨
     * - 확산광 계수는 광원의 밝기와 물체의 재질 특성에 따라 달라질 수 있으며, 일반적으로 높은 값이 사용되어 물체가 충분히 밝아지는 것을 보장
     *
     * @type {number}
     */
    diffuseIntensity: number = 0.8;

    /**
     * 광원의 반사광 계수 (Specular Coefficient)
     * - 반사광은 광원이 물체에 닿아 물체의 표면에서 반사되는 빛으로, 물체의 광택과 하이라이트에 영향을 미침
     * - 반사광 계수는 0에서 1 사이의 값으로 표현되며, 0이면 반사광이 없고, 1이면 최대 반사광이 적용
     * - 예를 들어, 반사광 계수가 0.5이면 광원에서 물체로 직접 닿는 빛이 물체의 색상을 50% 밝게 만들며, 나머지 50%는 다른 조명 요소(예: 주변광, 확산광)에 의해 결정됨
     * - 반사광 계수는 광원의 밝기와 물체의 재질 특성에 따라 달라질 수 있으며, 일반적으로 중간 값이 사용되어 물체가 너무 밝아지는 것을 방지하면서도 충분한 광택을 표현할 수 있도록 함
     *
     * @type {number}
     */
    specularIntensity: number = 0.5;

    /**
     * 광원의 방출광 계수 (Emission Coefficient)
     * - 방출광은 광원 자체에서 방출되는 빛으로, 물체의 색상에 직접적인 영향을 미침
     * - 방출광 계수는 0에서 1 사이의 값으로 표현되며, 0이면 방출광이 없고, 1이면 최대 방출광이 적용
     * - 예를 들어, 방출광 계수가 0.5이면 광원에서 방출되는 빛이 물체의 색상을 50% 밝게 만들며, 나머지 50%는 다른 조명 요소(예: 주변광, 확산광)에 의해 결정됨
     * - 방출광 계수는 광원의 밝기와 물체의 재질 특성에 따라 달라질 수 있으며, 일반적으로 낮은 값이 사용되어 물체가 너무 밝아지는 것을 방지
     * - 방출광은 특히 광원 자체가 빛을 발하는 경우(예: 전구, 불꽃)나, 물체가 자체적으로 빛을 내는 경우(예: 네온사인, 발광체)에서 중요한 역할을 함
     *
     * @type {number}
     */
    emissionIntensity: number = 0.0;

    /**
     * 광원의 방향 벡터
     *
     * @type {Vector3}
     */
    direction: Vector3 = new Vector3(0, -1, 0); // 기본값: 아래 방향

    /**
     * 광원의 색상 벡터 (RGB)
     *
     * @type {Color}
     */
    color: Color = new Color(1, 1, 1); // 기본값: 흰색 (RGB: 255, 255, 255)

    /**
     * Creates an instance of Light.
     *
     * @constructor
     * @param {Vector3} direction 광원의 방향 벡터
     * @param {Color} color 광원의 색상 벡터 (RGB)
     * @param {number} [ambientIntensity=0.1] 광원의 주변광 계수 (0-1, 기본값: 0.1)
     * @param {number} [diffuseIntensity=0.8] 광원의 확산광 계수 (0-1, 기본값: 0.8)
     * @param {number} [specularIntensity=0.5] 광원의 반사광 계수 (0-1, 기본값: 0.5)
     * @param {number} [emissionIntensity=0.0] 광원의 방출광 계수 (0-1, 기본값: 0.0)
     */
    constructor(
        direction: Vector3,
        color: Color,
        ambientIntensity: number = 0.1,
        diffuseIntensity: number = 0.8,
        specularIntensity: number = 0.5,
        emissionIntensity: number = 0.0,
    ) {
        this.setValues(
            direction,
            color,
            ambientIntensity,
            diffuseIntensity,
            specularIntensity,
            emissionIntensity,
        );
    }

    /**
     * 광원의 방향, 색상, 주변광 계수, 확산광 계수, 반사광 계수, 방출광 계수 설정
     *
     * @param {Vector3} direction 광원의 방향 벡터
     * @param {Color} color 광원의 색상 벡터 (RGB)
     * @param {number} ambientIntensity 광원의 주변광 계수 (0-1)
     * @param {number} diffuseIntensity 광원의 확산광 계수 (0-1)
     * @param {number} specularIntensity 광원의 반사광 계수 (0-1)
     * @param {number} emissionIntensity 광원의 방출광 계수 (0-1)
     * @return {void}
     */
    setValues(
        direction: Vector3,
        color: Color,
        ambientIntensity: number,
        diffuseIntensity: number,
        specularIntensity: number,
        emissionIntensity: number,
    ): void {
        this.direction = direction;
        this.color = color;
        this.ambientIntensity = Math.max(0.0, Math.min(1.0, ambientIntensity));
        this.diffuseIntensity = Math.max(0.0, Math.min(1.0, diffuseIntensity));
        this.specularIntensity = Math.max(
            0.0,
            Math.min(1.0, specularIntensity),
        );
        this.emissionIntensity = Math.max(
            0.0,
            Math.min(1.0, emissionIntensity),
        );
    }
}
