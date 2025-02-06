import { _decorator, Component, Label, Node, Vec3, Color, find, Camera, UITransform, Layers } from 'cc';
const { ccclass, property } = _decorator;

// 预定义一组美观的颜色（可自行扩展）
const NICE_COLORS = [
    new Color(255, 87, 87),    // 亮红色
    new Color(255, 193, 7),    // 琥珀色
    new Color(76, 175, 80),    // 绿色
    new Color(33, 150, 243),   // 蓝色
    new Color(156, 39, 176),   // 紫色
    new Color(0, 188, 212),    // 青色
    new Color(255, 152, 0),    // 橙色
    new Color(233, 30, 99)     // 粉红色
];

function randomWord(): string {
    const words = ["Go", "Make", "It", "情人节快乐！"];
    return words[Math.floor(Math.random() * words.length)];
}

function randomColor(): Color {
    return NICE_COLORS[Math.floor(Math.random() * NICE_COLORS.length)];
}

@ccclass('CreateLabel')
export class CreateLabel extends Component {
    @property(Vec3)
    public offset: Vec3 = new Vec3(0, 0, 0);

    // 新增插值平滑系数（0-1之间，值越小越平滑）
    @property({ range: [0.01, 1] })
    public smoothFactor: number = 0.2;

    private labelNode: Node | null = null;
    private mainCamera: Camera | null = null;
    private uiCamera: Camera | null = null;
    private tempScreenPos: Vec3 = new Vec3();
    private tempWorldPos: Vec3 = new Vec3();
    private targetPos: Vec3 = new Vec3();  // 新增目标位置缓存

    start() {
        const planLabelsNode = find('Canvas/PlanLabels');
        if (!planLabelsNode) return;

        [this.mainCamera, this.uiCamera] = this.getCameras();
        if (!this.mainCamera || !this.uiCamera) return;

        this.createLabel(planLabelsNode);
    }

    private getCameras(): [Camera | null, Camera | null] {
        return [
            find('main_camera')?.getComponent(Camera),
            find('Canvas/Camera')?.getComponent(Camera)
        ];
    }

    private createLabel(parent: Node) {
        this.labelNode = new Node('Label');
        this.labelNode.layer = Layers.Enum.UI_2D | Layers.Enum.IGNORE_RAYCAST;

        const label = this.labelNode.addComponent(Label);
        const uiTransform = this.labelNode.addComponent(UITransform);

        // 设置文字属性
        label.string = randomWord();
        label.fontSize = 40;
        label.color = randomColor();  // 使用随机颜色
        label.lineHeight = 30;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;

        // 设置锚点
        uiTransform.anchorX = 0.5;
        uiTransform.anchorY = 0.5;

        parent.addChild(this.labelNode);
    }

    update() {
        if (!this.isComponentsValid()) return;

        const worldPos = this.getReferencePosition();
        this.updateLabelVisibility(worldPos);
        this.updateLabelPosition(worldPos);
    }

    private isComponentsValid(): boolean {
        return !!this.labelNode && !!this.mainCamera && !!this.uiCamera;
    }

    private getReferencePosition(): Vec3 {
        return this.node.getChildByName('LabelRef')!.getWorldPosition(this.tempWorldPos);
    }

    private updateLabelVisibility(worldPos: Vec3) {
        this.mainCamera!.worldToScreen(worldPos, this.tempScreenPos);
        this.labelNode!.active = this.tempScreenPos.z > 0;
    }

    private updateLabelPosition(worldPos: Vec3) {
        if (!this.labelNode!.active) return;

        // 坐标转换流程
        const screenPos = this.tempScreenPos;
        const uiWorldPos = this.uiCamera!.screenToWorld(screenPos, this.tempWorldPos);
        const parent = this.labelNode!.parent!;

        // 计算目标位置
        const targetPos = parent.getComponent(UITransform)!
            .convertToNodeSpaceAR(uiWorldPos)
            .add(this.offset);

        // 使用插值平滑移动
        // const currentPos = this.labelNode!.position;
        // Vec3.lerp(currentPos, currentPos, targetPos, this.smoothFactor);
        // this.labelNode!.setPosition(currentPos);

        this.labelNode!.setPosition(targetPos);
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