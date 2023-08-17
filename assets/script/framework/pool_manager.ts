import { _decorator, Component, Node, Prefab, NodePool, instantiate, log } from 'cc';
const { ccclass, property } = _decorator;

interface IDictPool {
    [name: string]: NodePool;
}

@ccclass('pool_manager')
export class pool_manager {

    // 实例化自身对象
    private static m_instance: pool_manager;
    public static instance() {
        if(!this.m_instance)  this.m_instance = new pool_manager;
        return this.m_instance;
    }

    private m_dict_pool: IDictPool = {};    

    public getNode(prefab: Prefab, parent: Node) {
        let name = prefab.data.name;
        let node: Node = null;
        const pool = this.m_dict_pool[name];
        if(pool && pool.size() > 0) {
            node = pool.get();
        } else {
            node = instantiate(prefab);
        }

        node.parent = parent;
        node.active = true;
        return node;
    }

    public putNode(node: Node) {
        let name = node.name;
        if(!this.m_dict_pool[name]) 
            this.m_dict_pool[name] = new NodePool();

        this.m_dict_pool[name].put(node);
    }

}


