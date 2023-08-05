import { _decorator, Component, Node, Collider, ITriggerEvent, log } from 'cc';
import { game_manager } from '../framework/game_manager';
import { constant } from '../framework/constant';
const { ccclass, property } = _decorator;

@ccclass('bullet_prop')
export class bullet_prop extends Component {
    private m_prop_speed = 0.3;
    private m_prop_x_speed = 0.3;
    private m_gm: game_manager = null;

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

    update(deltaTime: number) {
        const pos = this.node.position;
        if(pos.x >= 4){
            this.m_prop_x_speed = -this.m_prop_speed;

        } else if(pos.x <= -4)
        {
            this.m_prop_x_speed = this.m_prop_speed;
        }

        const pos_x = pos.x + this.m_prop_x_speed * deltaTime;
        const pos_z =  pos.z + this.m_prop_speed * deltaTime;
        this.node.setPosition(pos_x, pos.y, pos_z);

        if(pos_z > 50) {
            this.node.destroy();
        }
    }

    bind_game_manager(gm: game_manager) {
        this.m_gm = gm;
    }

    set_speed(speed: number){
        this.m_prop_speed = speed;
    }

    private on_trigger_enter(event: ITriggerEvent){
        // 根据道具的名称，来修改gm中的道具类型
        const name = event.selfCollider.node.name;
        if(name === "bulletH") {
            this.m_gm.change_bullet_type(constant.bullet_prop_type.BULLET_H);
        } else if(name === "bulletS") {
            this.m_gm.change_bullet_type(constant.bullet_prop_type.BULLET_S);
        } else {
            this.m_gm.change_bullet_type(constant.bullet_prop_type.BULLET_M);
        }

        this.node.destroy();    // 道具碰撞完后销毁
        console.log(name + "道具销毁");
    }
}


