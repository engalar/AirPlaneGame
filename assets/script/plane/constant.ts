import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class constant {
    // 敌机类型
    public static enemy_type = {
        TYPE1: 1,
        TYPE2: 2,
    };

    // 敌机组合
    public static enemy_combination = {
        PLAN1: 1,
        PLAN2: 2,
        PLAN3: 3,
    };

    // 关卡
    public static level = {
        LEVEL1: 1,
        LEVEL2: 2,
        LEVEL3: 3,
    }

    // 碰撞类型
    public static collision_type = {
        SELF_PLANE: 1 << 1,
        ENEMY_PLANE: 1 << 2,
        SELF_BULLET: 1 << 3,
        ENEMY_BULLET: 1 << 4,
    }
}