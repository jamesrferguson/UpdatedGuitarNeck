import { BaseCanvas } from './basecanvas';

export abstract class CanvasElement {

    protected canvas: BaseCanvas;
    public elementNumber: number;
    public xPosition: number;
    public yPosition: number;
    public height: number;
    public width: number;
    public children: Array<CanvasElement>;

    constructor(canvas: BaseCanvas, elementNumber: number, xPosition: number = 0, yPosition: number = 0, height: number = 0, width: number = 0) {
        this.canvas = canvas;
        this.elementNumber = elementNumber;
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.height = height;
        this.width = width;
        this.children = [];
    }

    abstract draw(): void;
}