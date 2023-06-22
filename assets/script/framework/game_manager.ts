import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { bullet } from '../bullet/bullet';
const { ccclass, property } = _decorator;

@ccclass('game_manager')
export class game_manager extends Component {
    
    // 飞机
    @property(Node)
    public player_plane: Node = null;

    // 子弹
    @property(Prefab)
    public bullet01: Prefab = null;
    @property(Prefab)
    public bullet02: Prefab = null;
    @property(Prefab)
    public bullet03: Prefab = null;
    @property(Prefab)
    public bullet04: Prefab = null;
    @property(Prefab)
    public bullet05: Prefab = null;
    
    // 子弹的管理节点
    @property(Node)
    public bullet_root = null;

    // 射击的周期
    @property
    public shoot_time = 0.3; 

    @property
    public bullet_speed = 2.0;

    private m_current_shooting_time = 0;
    private m_is_shooting = false;

    start() {
        this.init();
    }

    update(deltaTime: number) {
        this.m_current_shooting_time += deltaTime;
        if(this.m_is_shooting 
            && this.m_current_shooting_time > this.shoot_time){
                this.creat_bullet();
                this.m_current_shooting_time = 0;
        }
    }

    public is_shooting(value: boolean){
        this.m_is_shooting = value;
    }    

    private creat_bullet() {
        const blt = instantiate(this.bullet01);         // 实例子弹对象
        blt.setParent(this.bullet_root);                // 将子弹对象挂在到场景中
        const pos = this.player_plane.position;         // 获取当前飞机的位置
        blt.setPosition(pos.x, pos.y, pos.z - 1.0);     // 子弹生成的位置
        const bullet_comp = blt.getComponent(bullet);   // 获取子弹的componet
        bullet_comp.bullet_speed = this.bullet_speed;   // 设置子弹的速度
    }

    private init(){
        this.m_current_shooting_time = this.shoot_time;
        this.player_plane.setPosition(0.0, 1.0, 9.0);
    }
}