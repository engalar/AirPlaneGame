import { _decorator, AudioSource, Collider, Component, ITriggerEvent, Node } from 'cc';
import { constant } from '../framework/constant';
const { ccclass, property } = _decorator;

@ccclass('self_plane')
export class self_plane extends Component {
    @property(Node)
    public expode: Node = null;
    @property(Node)
    public bloodface: Node = null;
    @property(Node)
    public blood: Node = null;

    public m_is_die = false;

    private m_life_limit = 15;
    private m_current_life = 0;
    private m_audio_source:AudioSource = null;

    start() {
        this.m_audio_source = this.getComponent(AudioSource);
    }

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

    public init() {
        this.m_current_life = this.m_life_limit;
        this.m_is_die = false;
        this.expode.active = false;
        this.bloodface.setScale(1, 1 ,1);
    }

    private on_trigger_enter(event: ITriggerEvent) {
        // 检测与飞机碰撞的物体类型
        const collision_group = event.otherCollider.getGroup();
        if (collision_group === constant.collision_type.ENEMY_PLANE
            || collision_group === constant.collision_type.ENEMY_BULLET) {
            
            // 激活血条节点
            if(this.m_current_life === this.m_life_limit) {
                this.blood.active = true;
            }
            
            // 扣血
            --this.m_current_life;
            this.bloodface.setScale(this.m_current_life / this.m_life_limit, 1 ,1);
            
            // 销毁飞机
            if(0 >= this.m_current_life) {
                this.m_is_die = true;
                this.m_audio_source.play();
                this.expode.active = true;
                this.blood.active = false;
            }
        }
    }
}