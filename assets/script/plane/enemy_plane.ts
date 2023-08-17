import { _decorator, Component, Node, Collider, ITriggerEvent} from 'cc';
import { constant } from '../framework/constant';
import { game_manager } from '../framework/game_manager';
import { pool_manager } from '../framework/pool_manager';
const { ccclass, property } = _decorator;

const OUTOFFRANGE = 11;

@ccclass('enemy_plane')
export class enemy_plane extends Component {
    @property
    public create_bullet_time = 0.5;    // 子弹创建周期

    private m_enemy_speed = 0;
    private m_is_need_bullet = false;
    private m_game_manager: game_manager = null;
    private m_current_bullet_time = 0;

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
        // 设置敌机的运动轨迹
        const pos = this.node.position;
        const move_pos = pos.z + this.m_enemy_speed * deltaTime;
        this.node.setPosition(pos.x, pos.y, move_pos);

        // 创建敌机子弹
        if (this.m_is_need_bullet) {
            this.m_current_bullet_time += deltaTime;
            if (this.m_current_bullet_time > this.create_bullet_time) {
                this.m_current_bullet_time = 0;
                this.m_game_manager.create_enemy_bullet(this.node.position);
            }
        }

        // 敌机超出屏幕，销毁对象
        if (move_pos > OUTOFFRANGE) {
            pool_manager.instance().putNode(this.node);
        }
    }

    set_speed(gm: game_manager, speed: number, need_bullet: boolean) {
        this.m_game_manager = gm;
        this.m_enemy_speed = speed;
        this.m_is_need_bullet = need_bullet;
    }

    private on_trigger_enter(event: ITriggerEvent) {
        // 检测与飞机碰撞的物体类型
        const collision_group = event.otherCollider.getGroup();
        if (collision_group === constant.collision_type.SELF_PLANE
            || collision_group === constant.collision_type.SELF_BULLET) {            
            pool_manager.instance().putNode(this.node);
            this.m_game_manager.add_score();
            this.m_game_manager.play_audio_Effect("enemy");
        }
    }
}