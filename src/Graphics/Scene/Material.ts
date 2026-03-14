import Color from "../Common/Color";
export default class Material {
    /**
     * 알베도 (Albedo) 색상
     * - 알베도는 물체가 빛을 반사하는 정도를 나타내는 계수로, RGB 색상으로 표현됨
     * - 알베도가 (255, 255, 255)인 경우 물체가 빛을 완전히 반사하여 원래의 색상을 그대로 보여줌
     * - 알베도가 (128, 128, 128)인 경우 물체가 빛을 절반만 반사하여 원래 색상의 절반 밝기로 보임
     * - 알베도가 (0, 0, 0)인 경우 물체가 빛을 전혀 반사하지 않고 완전히 검은색으로 보임
     * - 알베도는 물체의 재질 특성에 따라 달라질 수 있으며, 일반적으로 낮은 값이 사용되어 물체가 너무 밝아지는 것을 방지
     *
     * @type {Color}
     */
    albedo: Color = new Color(255, 255, 255); // RGB 색상으로 알베도 표현 (기본값은 흰색)

    /**
     * 주변광 반응 계수
     */
    ambientStrength: number = 1.0;

    /**
     * 난반사 반응 계수
     */
    diffuseStrength: number = 1.0;

    /**
     * 정반사 반응 계수
     */
    specularStrength: number = 0.35;

    /**
     * 정반사 지수 (Shininess)
     */
    shininess: number = 16.0;

    /**
     * 자체 발광 계수
     */
    emissionStrength: number = 0.0;

    /**
     * Creates an instance of Material.
     *
     * @constructor
     * @param {Color} albedo 알베도 (Albedo) 색상
     * @param {number} ambientStrength 주변광 반응 계수
     * @param {number} diffuseStrength 난반사 반응 계수
     * @param {number} specularStrength 정반사 반응 계수
     * @param {number} shininess 정반사 지수 (Shininess)
     * @param {number} emissionStrength 자체 발광 계수
     */
    constructor(
        albedo: Color = new Color(255, 255, 255),
        ambientStrength: number = 1.0,
        diffuseStrength: number = 1.0,
        specularStrength: number = 0.35,
        shininess: number = 16.0,
        emissionStrength: number = 0.0,
    ) {
        this.setValues(
            albedo,
            ambientStrength,
            diffuseStrength,
            specularStrength,
            shininess,
            emissionStrength,
        );
    }

    /**
     * 재질의 속성 값 설정
     *
     * @param {Color} albedo 알베도 (Albedo) 색상
     * @param {number} ambientStrength 주변광 반응 계수
     * @param {number} diffuseStrength 난반사 반응 계수
     * @param {number} specularStrength 정반사 반응 계수
     * @param {number} shininess 정반사 지수 (Shininess)
     * @param {number} emissionStrength 자체 발광 계수
     * @return {void}
     */
    setValues(
        albedo: Color,
        ambientStrength: number,
        diffuseStrength: number,
        specularStrength: number,
        shininess: number,
        emissionStrength: number = 0.0,
    ): void {
        this.albedo = albedo;
        this.ambientStrength = Math.max(0, ambientStrength);
        this.diffuseStrength = Math.max(0, diffuseStrength);
        this.specularStrength = Math.max(0, specularStrength);
        this.shininess = Math.max(1, shininess);
        this.emissionStrength = Math.max(0, emissionStrength);
    }
}
