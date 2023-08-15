import { _decorator, Component, Node, Input, EventTouch } from 'cc';
import { game_manager } from '../framework/game_manager';
const { ccclass, property } = _decorator;

@ccclass('ui_main')
export class ui_main extends Component {
    @property
    public plane_speed = 2;

    @property(Node)
    public player_plane: Node = null;

    @property(game_manager)
    public game_manager_ptr: game_manager = null;
    
    @property(Node)
    public gameStartUI: Node = null;
    @property(Node)
    public gameingUI: Node = null;
    @property(Node)
    public gameoverUI: Node = null;

    start() {
        this.node.on(Input.EventType.TOUCH_START, this.touch_start, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.touch_move, this);
        this.node.on(Input.EventType.TOUCH_END, this.touch_end, this);

        this.gameStartUI.active = true;
    }
    
    update(deltaTime: number) {
        
    }
    
    // UI界面场景调度相关接口 ///////////////////////////////////////////////////
    public return_gameing() {
        this.gameoverUI.active = false;
        this.gameingUI.active = true;
        this.game_manager_ptr.return_gameing();
    }

    public return_game_start() {
        this.gameoverUI.active = false;
        this.gameStartUI.active = true;
    }
    ///////////////////////////////////////////////////////////////////////////


    // 玩家飞机 移动\子弹发射 相关接口 ///////////////////////////////////////////
    touch_start(event: EventTouch){
        if(this.game_manager_ptr.is_game_start()){
            this.game_manager_ptr.is_shooting(true);// 游戏开始后为射击子弹
        } else {
            this.gameStartUI.active = false;        // 游戏未开始时为结束起始UI 激活开始游戏UI
            this.gameingUI.active = true;            
            this.game_manager_ptr.game_start();
        }
    }
   
    touch_move(event: EventTouch){
        if(!this.game_manager_ptr.is_game_start()) return;
        
        const delta = event.getDelta();
        let pos = this.player_plane.position;
        this.player_plane.setPosition(
            pos.x + 0.01 * this.plane_speed * delta.x, 
            pos.y, 
            pos.z - 0.01 *this.plane_speed * delta.y);        
    }

    touch_end(event: EventTouch){
        if(!this.game_manager_ptr.is_game_start()) return;
        this.game_manager_ptr.is_shooting(false);
    }
    ////////////////////////////////////////////////////////////////////////
}