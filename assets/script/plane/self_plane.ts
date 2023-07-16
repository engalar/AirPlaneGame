import { _decorator, Collider, Component, ITriggerEvent, Node } from 'cc';
import { constant } from './constant';
const { ccclass, property } = _decorator;

@ccclass('self_plane')
export class self_plane extends Component {

    onEnable() {
        // 监听碰撞
        const collider = this.getComponent(Collider);
        collider.on('onTriggerEnter', this.on_trigger_enter, this); // 碰撞触发
    }

    onDisable() {
        // 取消对碰撞的监听
        const collider = this.getComponent(Collider);
        collider.off('onTriggerEnter', this.on_trigger_enter, this);
    }

    private on_trigger_enter(event: ITriggerEvent) {
        // 检测与飞机碰撞的物体类型
        const collision_group = event.otherCollider.getGroup();
        if (collision_group === constant.collision_type.ENEMY_PLANE
            || collision_group === constant.collision_type.ENEMY_BULLET) {
            console.log('掉血');
        }
    }
}