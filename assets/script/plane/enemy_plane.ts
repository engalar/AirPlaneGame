import { _decorator, Component, Node } from 'cc';
import { constant } from './constant';
const { ccclass, property } = _decorator;

const OUTOFFRANGE = 11;

@ccclass('enemy_plane')
export class enemy_plane extends Component {
    private enemy_speed = 0;

    //public enemy_type = constant.enemy_type.TYPE1;  // 敌机类型

    start() {

    }

    update(deltaTime: number) {
        // 设置敌机的运动轨迹
        const pos = this.node.position;
        const move_pos = this.enemy_speed * deltaTime
        this.node.setPosition(pos.x, pos.y, pos.z + move_pos);
       
        // 敌机超出屏幕，销毁对象
        if(move_pos > OUTOFFRANGE){
            this.node.destroy();
        }
    }

    set_speed(speed: number){
        this.enemy_speed = speed;
    }
}


