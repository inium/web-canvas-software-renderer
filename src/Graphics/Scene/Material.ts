export default class Material {
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
     * @param {number} ambientStrength 주변광 반응 계수
     * @param {number} diffuseStrength 난반사 반응 계수
     * @param {number} specularStrength 정반사 반응 계수
     * @param {number} shininess 정반사 지수 (Shininess)
     * @param {number} emissionStrength 자체 발광 계수
     */
    constructor(
        ambientStrength: number = 1.0,
        diffuseStrength: number = 1.0,
        specularStrength: number = 0.35,
        shininess: number = 16.0,
        emissionStrength: number = 0.0,
    ) {
        this.setValues(
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
     * @param {number} ambientStrength 주변광 반응 계수
     * @param {number} diffuseStrength 난반사 반응 계수
     * @param {number} specularStrength 정반사 반응 계수
     * @param {number} shininess 정반사 지수 (Shininess)
     * @param {number} emissionStrength 자체 발광 계수
     * @return {void}
     */
    setValues(
        ambientStrength: number,
        diffuseStrength: number,
        specularStrength: number,
        shininess: number,
        emissionStrength: number = 0.0,
    ): void {
        this.ambientStrength = Math.max(0, ambientStrength);
        this.diffuseStrength = Math.max(0, diffuseStrength);
        this.specularStrength = Math.max(0, specularStrength);
        this.shininess = Math.max(1, shininess);
        this.emissionStrength = Math.max(0, emissionStrength);
    }
}
