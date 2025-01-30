import { _decorator, BoxCollider, Component, instantiate, math, Node, Prefab, sp, Vec3, macro, Label, Animation } from 'cc';
import { bullet } from '../bullet/bullet';
import { constant } from './constant';
import { enemy_plane } from '../plane/enemy_plane';
import { bullet_prop } from '../bullet/bullet_prop';
import { self_plane } from '../plane/self_plane';
import { audio_manager } from './audio_manager';
import { pool_manager } from './pool_manager';
const { ccclass, property } = _decorator;

@ccclass('game_manager')
export class game_manager extends Component {
    // 界面控制变量 ////////////////////////////////////////////////////////////////////////// 
    // 飞机
    @property(self_plane)
    public player_plane: self_plane = null;

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
    @property(Prefab)
    public enemy_explode: Prefab = null;

    // 道具
    @property(Prefab)
    public bullet_prop_H: Prefab = null;
    @property(Prefab)
    public bullet_prop_S: Prefab = null;
    @property(Prefab)
    public bullet_prop_M: Prefab = null;
    @property
    public bullet_prop_speed = 4.0;

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

    // UI界面
    @property(Node)
    public gameing_UI: Node = null;
    @property(Node)
    public game_over_UI: Node = null;
    @property(Label)
    public gameing_score_UI: Label = null;
    @property(Label)
    public game_over_score_UI: Label = null;
    @property(Animation)
    public overAnim: Animation = null;

    // 音频
    @property(audio_manager)
    public audio_mg: audio_manager = null;

    ///////////////////////////////////////////////////////////////////////////////////

    // 公有变量 //////////////////////////////////////////////////////////////////////////   
    private m_is_game_start = false;         // 当前游戏是否开始
    ///////////////////////////////////////////////////////////////////////////////////

    // 私有变量 //////////////////////////////////////////////////////////////////////////
    private m_current_shooting_time = 0;    // 当前射击时间
    private m_is_shooting = false;          // 是否射击    
    private m_curr_create_enemy_time = 0;   // 当前敌机创建时间
    private m_level_interval = constant.level.LEVEL1;  // 敌机组合类型状态
    private m_bullet_prop_type = constant.bullet_prop_type.BULLET_I;    // 子弹道具类型
    private m_score = 0;                    // 玩家得分
    ///////////////////////////////////////////////////////////////////////////////////


    // 流程相关接口 //////////////////////////////////////////////////////////////////////
    start() {
        this.init();
    }

    private init() {
        this.m_current_shooting_time = this.shoot_time;
        this.m_is_shooting = false;
        this.m_curr_create_enemy_time = 0;
        this.m_level_interval = constant.level.LEVEL1;
        this.m_bullet_prop_type = constant.bullet_prop_type.BULLET_I;
        this.m_score = 0;
        this.player_plane.node.setPosition(0, 3, 9);    // 设置玩家飞机的初始位置 

        this.setupParentMessageListener();
        this.sendMessageToParent({ type: "gameReady" });
    }

    // 设置父级消息监听器
    private setupParentMessageListener() {
        window.addEventListener("message", (event: MessageEvent) => {
            // 安全验证：检查消息来源是否符合预期
            // if (event.origin !== "https://your-parent-domain.com") return;

            const data = event.data;
            console.log("收到父级消息:", data);

            switch (data.type) {
                case "startGame":
                    this.game_start();
                    break;

                case "resetGame":
                    this.game_start();
                    break;

                case "gameOver":
                    this.game_over();
                    break;

                default:
                    console.warn("未知消息类型:", data.type);
            }
        });
    }

    // 向父级发送消息
    private sendMessageToParent(message: any) {
        if (window.parent) {
            window.parent.postMessage(message, "*"); // 生产环境应指定具体 origin
        }
    }

    // 示例：更新分数并通知父级
    private updateScore() {
        this.sendMessageToParent({
            type: "scoreUpdate",
            score: this.m_score
        });
    }

    update(deltaTime: number) {
        if (!this.m_is_game_start) return;

        if (this.player_plane.m_is_die) {
            this.game_over();
            return;
        }

        this.is_create_bullet(deltaTime);   // 创建子弹判断
        this.create_enemy_plane(deltaTime); // 创建敌机
    }
    ///////////////////////////////////////////////////////////////////////////////////

    // 场景调度相关接口 //////////////////////////////////////////////////////////////////
    public is_game_start() {
        return this.m_is_game_start;
    }

    public game_start() {
        this.m_is_game_start = true;
        this.init();
        this.player_plane.init();                       // 重置玩家飞机状态
        this.change_plane_mode();                       // 关卡设置
        this.change_bullet_prope();                     // 道具设置        
        this.gameing_score_UI.string = this.m_score.toString();
        this.overAnim.play();
    }

    public return_gameing() {
        this.game_start();
    }

    public game_over() {
        this.m_is_game_start = false;
        this.gameing_UI.active = false;
        this.game_over_UI.active = true;
        this.game_over_score_UI.string = this.m_score.toString();
        this.init();
        this.unschedule(this.create_bullet_prop_changed);   // 取消道具产生的回调
        this.unschedule(this.call_back_level_changed);      // 取消关卡的回调
        this.destroy_all_obj();
    }

    public destroy_all_obj() {
        let length = this.node.children.length;
        for (let i = length - 1; i >= 0; --i)
            pool_manager.instance().putNode(this.node.children[i]);

        length = this.bullet_root;
        for (let i = length - 1; i >= 0; --i)
            pool_manager.instance().putNode(this.bullet_root.children[i]);

    }
    /////////////////////////////////////////////////////////////////////////////////////

    // 音效相关接口 ///////////////////////////////////////////////////////////////////
    public play_audio_Effect(name: string, vol = 1.0) {
        this.audio_mg.play(name, vol);
    }

    /////////////////////////////////////////////////////////////////////////////////////

    // 玩家子弹相关接口 ///////////////////////////////////////////////////////////////////
    // 根据时间间隔实例化子弹对象
    public is_create_bullet(deltaTime: number) {
        this.m_current_shooting_time += deltaTime;
        if (!this.m_is_shooting || this.m_current_shooting_time <= this.shoot_time) return;
        if (this.m_bullet_prop_type === constant.bullet_prop_type.BULLET_H) {
            this.create_self_bullet_H();
            this.play_audio_Effect("bullet1", 0.3);
        }
        else if (this.m_bullet_prop_type === constant.bullet_prop_type.BULLET_S) {
            this.create_self_bullet_S();
            this.play_audio_Effect("bullet1", 0.3);
        }
        else if (this.m_bullet_prop_type === constant.bullet_prop_type.BULLET_M) {
            this.create_self_bullet_M();
            this.play_audio_Effect("bullet1", 0.3);
        }
        else {
            this.create_self_bullet_init();
            this.play_audio_Effect("bullet2", 0.3);
        }
        this.m_current_shooting_time = 0;
    }

    // 设置此时是否应该射击
    public is_shooting(value: boolean) {
        this.m_is_shooting = value;
    }

    // 实例化子弹对象
    private create_bullet_detail(Bullet: Prefab, offset: number, dir = constant.bullet_dirction.MIDLE) {
        const pos = this.player_plane.node.position;                    // 获取当前飞机的位置
        const blt = pool_manager.instance().getNode(Bullet, this.bullet_root);  // 实例子弹对象
        blt.setPosition(pos.x + offset, pos.y, pos.z - 1.0);            // 子弹生成的位置
        const bullet_comp = blt.getComponent(bullet);                   // 获取子弹的componet
        bullet_comp.set_bullet_dirction(dir);

        if (dir === constant.bullet_dirction.ROTATION_R)
            bullet_comp.set_bullet_speed(this.player_bullet_speed, false);
        else
            bullet_comp.set_bullet_speed(-this.player_bullet_speed, false);

        bullet_comp.set_init_x_pos(pos.x + offset);
    }

    private create_self_bullet_init() {
        this.create_bullet_detail(this.bullet01, 0.0);
    }

    private create_self_bullet_M() {
        this.create_bullet_detail(this.bullet05, 0.0);  // 中
        this.create_bullet_detail(this.bullet05, -0.6, constant.bullet_dirction.LEFT);  // 左
        this.create_bullet_detail(this.bullet05, 0.6, constant.bullet_dirction.RIGHT);  // 右
    }

    private create_self_bullet_H() {
        this.create_bullet_detail(this.bullet01, -0.6); // 左
        this.create_bullet_detail(this.bullet01, 0.6);  // 右
    }

    private create_self_bullet_S() {
        this.create_bullet_detail(this.bullet03, -0.6, constant.bullet_dirction.ROTATION_L);   // 旋转
        this.create_bullet_detail(this.bullet03, 0.6, constant.bullet_dirction.ROTATION_R);   // 旋转
    }
    ///////////////////////////////////////////////////////////////////////////////////


    // 道具相关接口 /////////////////////////////////////////////////////////////////////
    // 子弹道具类型修改
    public change_bullet_type(type: number) {
        this.m_bullet_prop_type = type;
    }

    // 使用定时器来触发回调产生道具
    private change_bullet_prope() {
        this.schedule(this.create_bullet_prop_changed, 10, macro.REPEAT_FOREVER);    // 10秒一次回调，进3次
    }

    // 创建道具
    private create_bullet_prop_changed() {
        // 随机选择道具类型
        const random_prop = math.randomRangeInt(1, 4);
        let prefeb: Prefab = null;
        if (random_prop === constant.bullet_prop_type.BULLET_H) {
            prefeb = this.bullet_prop_H;
        } else if (random_prop === constant.bullet_prop_type.BULLET_S) {
            prefeb = this.bullet_prop_S;
        } else {
            prefeb = this.bullet_prop_M;
        }

        // 实例化道具
        const prop = pool_manager.instance().getNode(prefeb, this.node);
        prop.setPosition(4, 3, -11);
        const prop_comp = prop.getComponent(bullet_prop);
        prop_comp.bind_game_manager(this);
        prop_comp.set_speed(this.bullet_prop_speed);
    }

    public add_score() {
        ++this.m_score;
        this.gameing_score_UI.string = this.m_score.toString();
        this.updateScore();
    }
    ///////////////////////////////////////////////////////////////////////////////////


    // 敌机子弹相关接口 ///////////////////////////////////////////////////////////////////
    // 实例化敌机子弹对象
    public create_enemy_bullet(target_pos: Vec3) {
        const blt = pool_manager.instance().getNode(this.bullet02, this.bullet_root);
        blt.setPosition(target_pos.x, target_pos.y, target_pos.z + 1.0);    // 子弹生成的位置
        const bullet_comp = blt.getComponent(bullet);                       // 获取子弹的componet
        bullet_comp.set_bullet_speed(this.enemy_bullet_speed, true);        // 设置子弹的速度

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
        if (this.m_level_interval === constant.level.LEVEL3) return;
        this.m_level_interval++;
    }
    ///////////////////////////////////////////////////////////////////////////////////


    // 敌机相关接口 ////////////////////////////////////////////////////////////////////    
    // 敌机爆炸特效
    public build_enemy_explode(pos: Vec3) {
        const enemy_explode = pool_manager.instance().getNode(this.enemy_explode, this.node);
        enemy_explode.setPosition(pos);
    }

    // 创建敌机
    private create_enemy_plane(deltaTime: number) {
        this.m_curr_create_enemy_time += deltaTime;
        if (this.m_level_interval === constant.level.LEVEL1
            && this.m_curr_create_enemy_time > this.create_enemy_time * 3.0) {
            this.create_combination1();
            this.m_curr_create_enemy_time = 0;
        }
        else if (this.m_level_interval === constant.level.LEVEL2
            && this.m_curr_create_enemy_time > this.create_enemy_time * 2.0) {
            const combination = math.randomRangeInt(1, 3); // 随机出现2种敌机组合            
            if (combination === constant.enemy_combination.PLAN1)
                this.create_combination1();
            else
                this.create_combination2();
            this.m_curr_create_enemy_time = 0;
        }
        else if (this.m_level_interval === constant.level.LEVEL3
            && this.m_curr_create_enemy_time > this.create_enemy_time * 1.0) {
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
        const enemy = pool_manager.instance().getNode(prefab, this.node);
        const enemy_comp = enemy.getComponent(enemy_plane);
        enemy_comp.set_speed(this, speed, true);    // 单价敌机发射子弹

        // 设置敌机的初始位置
        const random_pos = math.randomRangeInt(-4, 5);
        enemy.setPosition(random_pos, 3, -11);    // x轴位置随机，z轴位置为背景顶部
    }

    // 敌机组合2（两种类型的敌机随机出现一字型队列）
    private create_combination2() {
        const enemyArray = new Array<Node>(5);
        for (let i = 0; i < enemyArray.length; ++i) {
            enemyArray[i] = pool_manager.instance().getNode(this.enemy_plane01, this.node);    // 默认第一种敌机
            const element = enemyArray[i];
            element.setPosition(-4 + i * 2, 3, -11);
            const element_comp = element.getComponent(enemy_plane);
            element_comp.set_speed(this, this.enemy01_speed, false);    // 多架敌机组合不发射子弹
        }
    }

    // 敌机组合3（两种类型的敌机随机出现V字型队列）
    private create_combination3() {
        const enemyArray = new Array<Node>(5);
        const pos = [
            -4, 3, -15,
            -2, 3, -13,
            0, 3, -11,
            2, 3, -13,
            4, 3, -15,
        ];

        for (let i = 0; i < enemyArray.length; ++i) {
            enemyArray[i] = pool_manager.instance().getNode(this.enemy_plane02, this.node);    // 默认第二种敌机
            const element = enemyArray[i];
            const strat_index = i * 3;
            element.setPosition(pos[strat_index], pos[strat_index + 1], pos[strat_index + 2]);
            const element_comp = element.getComponent(enemy_plane);
            element_comp.set_speed(this, this.enemy02_speed, false);    // 多架敌机组合不发射子弹
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////
}