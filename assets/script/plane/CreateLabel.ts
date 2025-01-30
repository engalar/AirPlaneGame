import { _decorator, Component, Label, Node, Vec3, Color, find, Camera, UITransform, Layers } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CreateLabel')
export class CreateLabel extends Component {
    // 增加 offset 参数，用于调整 UI 标签的位置偏移
    @property(Vec3)
    public offset: Vec3 = new Vec3(0, 0, 0);

    // 用于存储 Label 节点和相机引用
    private labelNode: Node | null = null;
    private mainCamera: Camera | null = null;
    private uiCamera: Camera | null = null;

    // 用于缓存坐标转换的临时变量
    private tempScreenPos: Vec3 = new Vec3();
    private tempWorldPos: Vec3 = new Vec3();

    start() {
        // 获取 Canvas/PlanLabels 节点
        const planLabelsNode = find('Canvas/PlanLabels');
        if (!planLabelsNode) {
            console.error('Canvas/PlanLabels node not found!');
            return;
        }

        // 获取主相机节点
        const mainCameraNode = find('main_camera');
        if (!mainCameraNode) {
            console.error('main_camera node not found!');
            return;
        }

        // 获取主相机组件
        this.mainCamera = mainCameraNode.getComponent(Camera);
        if (!this.mainCamera) {
            console.error('Camera component not found on main_camera node!');
            return;
        }

        // 获取UI相机节点
        const uiCameraNode = find('Canvas/Camera');
        if (!uiCameraNode) {
            console.error('Canvas/Camera node not found!');
            return;
        }

        // 获取UI相机组件
        this.uiCamera = uiCameraNode.getComponent(Camera);
        if (!this.uiCamera) {
            console.error('Camera component not found on Canvas/Camera node!');
            return;
        }

        // 创建 Label 节点
        this.labelNode = new Node('Label');
        this.labelNode.layer = Layers.Enum.UI_2D | Layers.Enum.IGNORE_RAYCAST;
        const labelComponent = this.labelNode.addComponent(Label);

        // 设置 Label 属性
        labelComponent.string = 'Hello, Cocos!';
        labelComponent.fontSize = 60;
        labelComponent.color = Color.BLUE;
        labelComponent.lineHeight = 40;
        labelComponent.horizontalAlign = Label.HorizontalAlign.CENTER;
        labelComponent.verticalAlign = Label.VerticalAlign.CENTER;

        // 添加至UI节点
        planLabelsNode.addChild(this.labelNode);

        // 设置锚点（可选）
        const uiTransform = this.labelNode.getComponent(UITransform);

        uiTransform.anchorX = 0.5;
        uiTransform.anchorY = 0.5;

    }

    update() {
        // 如果 Label 节点或相机未初始化，直接返回
        if (!this.labelNode || !this.mainCamera || !this.uiCamera) {
            return;
        }

        // 获取3D节点的世界坐标
        const worldPos = this.node.getChildByName('LabelRef').getWorldPosition(this.tempWorldPos);

        // 将3D世界坐标转换为主相机的屏幕坐标
        this.mainCamera.worldToScreen(worldPos, this.tempScreenPos);

        // 检查目标是否在相机前方（z > 0）
        if (this.tempScreenPos.z <= 0) {
            this.labelNode.active = false;
            return;
        }
        this.labelNode.active = true;

        // 将屏幕坐标转换为UI相机的世界坐标
        const uiWorldPos = this.uiCamera.screenToWorld(this.tempScreenPos, this.tempWorldPos);

        // 将UI相机的世界坐标转换为UI节点的本地坐标
        const parent = this.labelNode.parent;
        if (parent) {
            const uiLocalPos = parent.getComponent(UITransform)!.convertToNodeSpaceAR(uiWorldPos);
            this.labelNode.setPosition(uiLocalPos.add(this.offset));
        } else {
            this.labelNode.setPosition(uiWorldPos);
        }
    }

    protected onEnable(): void {
        super.onEnable?.();
        if (this.labelNode) {
            this.labelNode.active = true;
        }
    }

    protected onDisable(): void {
        super.onDisable?.();
        if (this.labelNode) {
            this.labelNode.active = false;
        }
    }

    onDestroy() {
        // 销毁 Label 节点
        if (this.labelNode && this.labelNode.isValid) {
            this.labelNode.destroy();
            this.labelNode = null; // 清理引用
        }
        return super.destroy();
    }
}