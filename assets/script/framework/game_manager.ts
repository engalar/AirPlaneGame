import { _decorator, BoxCollider, Component, instantiate, math, Node, Prefab, sp, Vec3 } from 'cc';
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
    public player_bullet_speed = 5;
    @property
    public enemy_bullet_speed = 7;

    private m_current_shooting_time = 0;    // 当前射击时间
    private m_is_shooting = false;          // 是否射击    
    private m_curr_create_enemy_time = 0;   // 当前敌机创建时间
    private m_level_interval = constant.level.LEVEL1;  // 敌机组合类型状态

    start() {
        this.init();
    }

    private init() {
        this.m_current_shooting_time = this.shoot_time;
        this.player_plane.setPosition(0, 0, 9);
        this.change_plane_mode();
    }

    update(deltaTime: number) {
        this.is_create_bullet(deltaTime);   // 创建子弹判断
        this.create_enemy_plane(deltaTime); // 创建敌机
    }


    // 玩家子弹相关接口 ///////////////////////////////////////////////////////////////////
    // 根据时间间隔实例化子弹对象
    public is_create_bullet(deltaTime: number) {
        this.m_current_shooting_time += deltaTime;
        if (!this.m_is_shooting || this.m_current_shooting_time <= this.shoot_time) return;
        this.create_self_bullet();
        this.m_current_shooting_time = 0;
    }

    // 设置此时是否应该射击
    public is_shooting(value: boolean) {
        this.m_is_shooting = value;
    }

    // 实例化子弹对象
    private create_self_bullet() {
        const blt = instantiate(this.bullet01);         // 实例子弹对象
        blt.setParent(this.bullet_root);                // 将子弹对象挂在到场景中
        const pos = this.player_plane.position;         // 获取当前飞机的位置
        blt.setPosition(pos.x, pos.y, pos.z - 1.0);     // 子弹生成的位置
        const bullet_comp = blt.getComponent(bullet);   // 获取子弹的componet
        bullet_comp.set_bullet_speed(this.player_bullet_speed, false);   // 设置子弹的速度

        const collision_comp = blt.getComponent(BoxCollider);
        collision_comp.setGroup(constant.collision_type.SELF_BULLET);
        collision_comp.setMask(constant.collision_type.ENEMY_PLANE);
        collision_comp.addMask(constant.collision_type.ENEMY_BULLET);
    }
    ///////////////////////////////////////////////////////////////////////////////////


    // 敌机子弹相关接口 ///////////////////////////////////////////////////////////////////
    // 实例化敌机子弹对象
    public create_enemy_bullet(target_pos: Vec3) {        
        const blt = instantiate(this.bullet01);         // 实例子弹对象 
        blt.setParent(this.bullet_root);                // 将子弹对象挂在到场景中
        blt.setPosition(target_pos.x, target_pos.y, target_pos.z + 1.0);     // 子弹生成的位置
        const bullet_comp = blt.getComponent(bullet);   // 获取子弹的componet
        bullet_comp.set_bullet_speed(this.enemy_bullet_speed, true);   // 设置子弹的速度

        const collision_comp = blt.getComponent(BoxCollider);
        collision_comp.setGroup(constant.collision_type.ENEMY_BULLET);
        collision_comp.setMask(constant.collision_type.SELF_PLANE);
        collision_comp.addMask(constant.collision_type.SELF_BULLET);
    }
    ///////////////////////////////////////////////////////////////////////////////////


    // 关卡相关接口 ////////////////////////////////////////////////////////////////////    
    // 使用定时器来触发回调调整关卡数
    private change_plane_mode() {
        this.schedule(this.call_back_level_changed, 10, 3);    // 10秒一次回调，进3次
    }

    // 设置关卡数
    private call_back_level_changed() {
        if(this.m_level_interval === constant.level.LEVEL3) return;
        this.m_level_interval++;
    }
    ///////////////////////////////////////////////////////////////////////////////////


    // 敌机相关接口 ////////////////////////////////////////////////////////////////////    
    // 创建敌机
    private create_enemy_plane(deltaTime: number) {
        this.m_curr_create_enemy_time += deltaTime;
        if (this.m_level_interval === constant.level.LEVEL1
            && this.m_curr_create_enemy_time > this.create_enemy_time) {
            this.create_combination1();
            this.m_curr_create_enemy_time = 0;
        }
        else if (this.m_level_interval === constant.level.LEVEL2
            && this.m_curr_create_enemy_time > this.create_enemy_time * 0.8) {
            const combination = math.randomRangeInt(1, 3); // 随机出现2种敌机组合            
            if (combination === constant.enemy_combination.PLAN1)
                this.create_combination1();
            else
                this.create_combination2();
            this.m_curr_create_enemy_time = 0;
        }
        else if (this.m_level_interval === constant.level.LEVEL3
            && this.m_curr_create_enemy_time > this.create_enemy_time * 0.6) {
            const combination = math.randomRangeInt(1, 4); // 随机出现3种敌机组合
            if (combination === constant.enemy_combination.PLAN1)
                this.create_combination1();
            else if (combination === constant.enemy_combination.PLAN2)
                this.create_combination2();
            else
                this.create_combination3();
            this.m_curr_create_enemy_time = 0;
        }
        else {
            // nothing
        }
    }

    // 敌机组合1（两种类型的敌机随机出现一架）
    private create_combination1() {
        // 随机创建敌机类型
        const type = math.randomRangeInt(1, 3);
        let prefab: Prefab = null;
        let speed = 0;
        if (type === constant.enemy_type.TYPE1) {
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
        enemy_comp.set_speed(this, speed, true);    // 单价敌机发射子弹

        // 设置敌机的初始位置
        const random_pos = math.randomRangeInt(-4, 5);
        enemy.setPosition(random_pos, 0, -11);    // x轴位置随机，z轴位置为背景顶部
    }

    // 敌机组合2（两种类型的敌机随机出现一字型队列）
    private create_combination2() {
        const enemyArray = new Array<Node>(5);
        for (let i = 0; i < enemyArray.length; ++i) {
            enemyArray[i] = instantiate(this.enemy_plane01);    // 默认第一种敌机
            const element = enemyArray[i];
            element.setParent(this.node);
            element.setPosition(-4 + i * 2, 0, -11);
            const element_comp = element.getComponent(enemy_plane);
            element_comp.set_speed(this, this.enemy01_speed, false);    // 多架敌机组合不发射子弹
        }
    }

    // 敌机组合3（两种类型的敌机随机出现V字型队列）
    private create_combination3() {
        const enemyArray = new Array<Node>(5);
        const pos = [
            -4, 0, -15,
            -2, 0, -13,
            0, 0, -11,
            2, 0, -13,
            4, 0, -15,
        ];

        for (let i = 0; i < enemyArray.length; ++i) {
            enemyArray[i] = instantiate(this.enemy_plane02);    // 默认第二种敌机
            const element = enemyArray[i];
            element.setParent(this.node);
            const strat_index = i * 3;
            element.setPosition(pos[strat_index], pos[strat_index + 1], pos[strat_index + 2]);
            const element_comp = element.getComponent(enemy_plane);
            element_comp.set_speed(this, this.enemy02_speed, false);    // 多架敌机组合不发射子弹
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////
}