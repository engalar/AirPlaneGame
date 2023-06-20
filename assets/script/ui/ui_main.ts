import { _decorator, Component, Node, Input, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ui_main')
export class ui_main extends Component {
    @property
    public plane_speed = 4;

    @property(Node)
    public player_plane: Node = null;

    start() {
        this.node.on(Input.EventType.TOUCH_MOVE, this.touch_move, this);
    }

    update(deltaTime: number) {
        
    }

    touch_move(event: EventTouch){
        const delta = event.getDelta();
        let pos = this.player_plane.position;
        this.player_plane.setPosition(
            pos.x + 0.01 * this.plane_speed * delta.x, 
            pos.y, 
            pos.z - 0.01 *this.plane_speed * delta.y);
    }
}