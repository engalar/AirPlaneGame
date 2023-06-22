import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('moving_scene_bg')
export class moving_scene_bg extends Component {
    @property(Node)
    bg01: Node = null;

    @property(Node)
    bg02: Node = null;

    private m_bg_speed = 3;
    private m_bg_moving_range = 22;     // 图片高度为22

    start() {
        this._init();
    }

    update(deltaTime: number) {
        this.moving_background(deltaTime);
    }

    private _init() {
        this.bg01.setPosition(0, 0, 0);
        this.bg02.setPosition(0, 0, -this.m_bg_moving_range);
    }

    private moving_background(deltaTime: number) {
        this.bg01.setPosition(0, 0, this.bg01.position.z + this.m_bg_speed * deltaTime);
        this.bg02.setPosition(0, 0, this.bg02.position.z + this.m_bg_speed * deltaTime);
        console.log(this.bg01.position.z);
        console.log(this.bg02.position.z);

        if (this.bg01.position.z > this.m_bg_moving_range) {
            this.bg01.setPosition(0, 0, this.bg02.position.z - this.m_bg_moving_range);
        } else if (this.bg02.position.z > this.m_bg_moving_range) {
            this.bg02.setPosition(0, 0, this.bg01.position.z - this.m_bg_moving_range);
        }
    }
}