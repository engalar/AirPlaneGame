import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

const OUTOFFRANGE = -11;

@ccclass('bullet')
export class bullet extends Component {
    
    public bullet_speed = 0;

    start() {

    }

    update(deltaTime: number) {
        const pos = this.node.position;
        const move_length = pos.z - this.bullet_speed * deltaTime;
        this.node.setPosition(pos.x, pos.y, move_length);

        if(move_length < OUTOFFRANGE) {
            this.node.destroy();
            console.log("子弹被销毁");
        }
    }
}