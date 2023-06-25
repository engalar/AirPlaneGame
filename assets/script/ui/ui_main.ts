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
    
    start() {
        this.node.on(Input.EventType.TOUCH_START, this.touch_start, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.touch_move, this);
        this.node.on(Input.EventType.TOUCH_END, this.touch_end, this);           
    }
    
    update(deltaTime: number) {
        
    }
     
    touch_start(event: EventTouch){
        this.game_manager_ptr.is_shooting(true);
    }
   
    touch_move(event: EventTouch){
        const delta = event.getDelta();
        let pos = this.player_plane.position;
        this.player_plane.setPosition(
            pos.x + 0.01 * this.plane_speed * delta.x, 
            pos.y, 
            pos.z - 0.01 *this.plane_speed * delta.y);
    }

    touch_end(event: EventTouch){
        this.game_manager_ptr.is_shooting(false);
    }
}