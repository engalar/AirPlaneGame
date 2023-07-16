import { _decorator, Component, Node, Collider,  ITriggerEvent} from 'cc';
const { ccclass, property } = _decorator;

const OUTOFFRANGE = 11;

@ccclass('bullet')
export class bullet extends Component {
    private m_bullet_speed = 0;
    private m_is_enemy_bullet = false;

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
        // 设置每帧子弹的位置
        const pos = this.node.position;

        let move_length = pos.z;
        if(this.m_is_enemy_bullet) {    // 敌机子弹            
            move_length += this.m_bullet_speed * deltaTime;    
        } else {                        // 玩家子弹            
            move_length -= this.m_bullet_speed * deltaTime;            
        }
        this.node.setPosition(pos.x, pos.y, move_length);

        // 销毁子弹
        if (Math.abs(move_length) > OUTOFFRANGE) {
            this.node.destroy();           
        }
    }

    set_bullet_speed(speed: number, is_enemy_bullet: boolean) {
        this.m_bullet_speed = speed;
        this.m_is_enemy_bullet = is_enemy_bullet;
    }

    private on_trigger_enter(event: ITriggerEvent){
        console.log('子弹销毁');
        this.node.destroy();    // 子弹只要发生碰撞后，就直接销毁
    }
}