import { _decorator, Component, Node, Collider,  ITriggerEvent} from 'cc';
import { constant } from '../framework/constant';
const { ccclass, property } = _decorator;

const OUTOFFRANGE_Z = 11;
const OUTOFFRANGE_x = 4;

@ccclass('bullet')
export class bullet extends Component {
    private m_bullet_speed = 0;
    private m_is_enemy_bullet = false;
    private m_dirction = constant.bullet_dirction.MIDLE;

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

        let move_z = pos.z;
        let move_x = pos.x;
        if(this.m_is_enemy_bullet) {
            // 敌机子弹            
            move_z += this.m_bullet_speed * deltaTime;    
        } else {
            // 玩家子弹            
            move_z -= this.m_bullet_speed * deltaTime;
            if(this.m_dirction === constant.bullet_dirction.LEFT) {
                move_x -= this.m_bullet_speed * deltaTime * 0.2;
            } else if(this.m_dirction === constant.bullet_dirction.RIGHT) {
                move_x += this.m_bullet_speed * deltaTime * 0.2;
            } else {
                // nothing
            }
        }
        
        this.node.setPosition(move_x, pos.y, move_z);

        // 销毁子弹
        if (Math.abs(move_z) > OUTOFFRANGE_Z || Math.abs(move_x) > OUTOFFRANGE_x) {
            this.node.destroy();
        }
    }

    set_bullet_dirction(dir = constant.bullet_dirction.MIDLE){
        this.m_dirction = dir;
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