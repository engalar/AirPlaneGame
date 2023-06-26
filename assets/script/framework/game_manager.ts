import { _decorator, Component, instantiate, math, Node, Prefab, sp } from 'cc';
import { bullet } from '../bullet/bullet';
import { constant } from '../plane/constant';
import { enemy_plane } from '../plane/enemy_plane';
const { ccclass, property } = _decorator;

@ccclass('game_manager')
export class game_manager extends Component {
    
    // 飞机
    @property(Node)
    public player_plane: Node = null;

    // 敌机
    @property(Prefab)
    public enemy_plane01: Prefab = null;
    @property(Prefab)
    public enemy_plane02: Prefab = null;
    @property
    public create_enemy_time = 1.0;   // 创建敌机的周期
    @property
    public enemy01_speed = 6.0;
    @property
    public enemy02_speed = 5.0;

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

    // 子弹速度
    @property
    public bullet_speed = 2.0;

    private m_current_shooting_time = 0;    // 当前射击时间
    private m_is_shooting = false;          // 是否射击    
    private m_curr_create_enemy_time = 0;   // 当前敌机创建时间
    private m_combination_interval = constant.enemy_combination.PLAN1;  // 敌机组合类型状态

    start() {
        this.init();
    }

    private init(){
        this.m_current_shooting_time = this.shoot_time;
        this.player_plane.setPosition(0.0, 1.0, 9.0);
        this.changePlaneMode();
    }

    update(deltaTime: number) {

        // 创建子弹判断
        this.m_current_shooting_time += deltaTime;
        if(this.m_is_shooting 
            && this.m_current_shooting_time > this.shoot_time){
                this.creat_bullet();
                this.m_current_shooting_time = 0;
        }

        // 敌机组合类型判断
        this.m_curr_create_enemy_time += deltaTime;
        if(this.m_combination_interval === constant.enemy_combination.PLAN1
            && this.m_curr_create_enemy_time > this.create_enemy_time) {
            this.creat_plan1_enemy_plane();
            this.m_curr_create_enemy_time = 0;
        } else if(this.m_combination_interval === constant.enemy_combination.PLAN2) {
            // ... ...
        }
        else {
            // ... ...
        }
    }

    // 子弹相关接口 ///////////////////////////////////////////////////////////////////
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
    ///////////////////////////////////////////////////////////////////////////////////

    // 敌机相关接口 ////////////////////////////////////////////////////////////////////
    private changePlaneMode(){
        this.schedule(this.call_back_mode_changed, 10, 3);    // 10秒一次回调，进3次
    }

    private call_back_mode_changed(){
        this.m_combination_interval++;
    }

    private creat_plan1_enemy_plane() {
        // 随机创建敌机类型
        const type = math.randomRangeInt(1, 3);
        let prefab: Prefab = null;
        let speed = 0;
        if(type === constant.enemy_type.TYPE1){
            prefab = this.enemy_plane01;
            speed = this.enemy01_speed;
        }
        else {
            prefab = this.enemy_plane02;
            speed = this.enemy02_speed;
        }

        // 实例化敌机对象
        const enemy = instantiate(prefab);
        enemy.setParent(this.node);
        const enemy_comp = enemy.getComponent(enemy_plane);
        enemy_comp.set_speed(speed);

        // 设置敌机的初始位置
        const random_pos = math.randomRangeInt(-4, 5);
        enemy.setPosition(random_pos, 0.0, -11);    // x轴位置随机，z轴位置为背景顶部
    }
    ////////////////////////////////////////////////////////////////////////////////////
}