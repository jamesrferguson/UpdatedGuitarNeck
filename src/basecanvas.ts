export abstract class BaseCanvas {
    protected canvas: HTMLCanvasElement;
    protected heightScaleFactor: number;
    protected widthScaleFactor: number;

    protected heightAdj: number;
    protected widthAdj: number;

    protected overlayCanvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement, heightAdj: number, widthAdj: number, containerDiv: HTMLDivElement = null, overlayCanvas: HTMLCanvasElement = null) {
        this.canvas = canvas;
        this.heightAdj = heightAdj;
        this.widthAdj = widthAdj;

        this.heightScaleFactor = (containerDiv != null ? containerDiv.offsetHeight : this.canvas.height) / this.heightAdj;
        this.widthScaleFactor = (containerDiv != null ? containerDiv.offsetWidth : this.canvas.width) / this.widthAdj;

        this.overlayCanvas = overlayCanvas;
    }

    public clearCanvas() {
        let ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public clearOverlayCanvas() {
        if (this.overlayCanvas != null) {
            let ctx = this.overlayCanvas.getContext("2d");
            ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        }
    }

    public drawRectangle(left: number, top: number, fillStyle: string, width: number, height: number, clearRect: boolean = false, useOverlay: boolean = false, alpha: number = 1.0) {
        let ctx = useOverlay ? this.overlayCanvas.getContext("2d") : this.canvas.getContext("2d");
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fillStyle;
        if (clearRect) {
            ctx.clearRect(left, top, width, height);
        }
        ctx.fillRect(left, top, width, height);
    }

    public drawCircleOnNeck(radius: number, fillStyle: string, left: number, top: number, useOverlay: boolean = false) {
        let ctx = useOverlay ? this.overlayCanvas.getContext("2d") : this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(left, top, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.stroke();
    }

    public addText(text: string, left: number, top: number, fontSize: number, fillStyle: string = "white", fontType: string = "Calibri", textAlign: CanvasTextAlign = 'center') {
        let ctx = this.overlayCanvas.getContext("2d");
        ctx.fillStyle = fillStyle;
        let fontSizeStr = fontSize + "";
        ctx.font = fontSizeStr + `pt ${fontType}`;
        ctx.textAlign = textAlign;
        ctx.fillText(text, left, top);
    }

    public clearRect(left: number, top: number, width: number, height: number) {
        let ctx = this.overlayCanvas.getContext("2d");
        ctx.clearRect(left, top, width, height);
    }
}