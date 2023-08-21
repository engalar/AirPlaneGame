import { _decorator, Component, Node, Pool } from 'cc';
import { pool_manager } from '../framework/pool_manager';
const { ccclass, property } = _decorator;

@ccclass('enemy_explode')
export class enemy_explode extends Component {
    onEnable() {
        this.scheduleOnce(this.call_back, 1);
    }

    private call_back() {
        pool_manager.instance().putNode(this.node);
    }
}


