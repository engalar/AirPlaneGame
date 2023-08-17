import { _decorator, Component, Node, Collider,  ITriggerEvent} from 'cc';
import { constant } from '../framework/constant';
import { pool_manager } from '../framework/pool_manager';
const { ccclass, property } = _decorator;

const OUTOFFRANGE_Z = 11;
const OUTOFFRANGE_x = 6;

@ccclass('bullet')
export class bullet extends Component {
    private m_bullet_speed = 0;
    private m_is_enemy_bullet = false;
    private m_dirction = constant.bullet_dirction.MIDLE;
    private m_init_x_pos = 0;
    private m_x_range = 0.6;

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
            move_z += Math.abs(this.m_bullet_speed * deltaTime);
        } else {
            // 玩家子弹            
            move_z -= Math.abs(this.m_bullet_speed * deltaTime);            

            if(this.m_dirction === constant.bullet_dirction.LEFT) {
                move_x -= Math.abs(this.m_bullet_speed * deltaTime * 0.2);
            } else if(this.m_dirction === constant.bullet_dirction.RIGHT) {
                move_x += Math.abs(this.m_bullet_speed * deltaTime * 0.2);
            } else if(this.m_dirction === constant.bullet_dirction.ROTATION_L) {
                if(move_x < this.m_init_x_pos || move_x > this.m_init_x_pos + this.m_x_range)
                {
                    this.m_bullet_speed *= -1;
                }
                move_x += this.m_bullet_speed * deltaTime * 0.2;
            } else if(this.m_dirction === constant.bullet_dirction.ROTATION_R) {
                if(move_x < this.m_init_x_pos - this.m_x_range || move_x > this.m_init_x_pos)
                {
                    this.m_bullet_speed *= -1;
                }
                move_x += this.m_bullet_speed * deltaTime * 0.2;
            } else {
                // nothing
            }
        }
        
        this.node.setPosition(move_x, pos.y, move_z);

        // 销毁子弹
        if (Math.abs(move_z) > OUTOFFRANGE_Z || Math.abs(move_x) > OUTOFFRANGE_x) {
            pool_manager.instance().putNode(this.node);
        }
    }

    set_bullet_dirction(dir = constant.bullet_dirction.MIDLE){
        this.m_dirction = dir;
    }

    set_bullet_speed(speed: number, is_enemy_bullet: boolean) {
        this.m_bullet_speed = speed;
        this.m_is_enemy_bullet = is_enemy_bullet;
    }

    set_init_x_pos(x: number) {
        this.m_init_x_pos = x;
    }

    private on_trigger_enter(event: ITriggerEvent){
        pool_manager.instance().putNode(this.node);
    }
}