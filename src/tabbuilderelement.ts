import { TabBuilder } from './tabbuilder';
import { CanvasElement } from './canvaselement';
import { TabBuilderManager } from './tabbuildermanager';

export abstract class BaseTabBuilderElement extends CanvasElement {

    public builder: TabBuilder;
    public tabline: number;

    constructor(canvas: TabBuilder, elNumber: number = 0, xPos: number = 0, yPos: number = 0, height: number = 0, width: number = 0) {
        super(canvas, elNumber, xPos, yPos, height, width);
        this.builder = canvas as TabBuilder;
    }

    public abstract getElementsArray(): [string, string, string, string, string, string];
    public abstract leftTranslate(): void;
    public abstract rightTranslate(): void;
    public abstract drawSelectionRectangle(): void;

    protected setPosition(): void {
        let horizontalCount = this.elementNumber < this.builder.MAX_ELEMENTS_PER_ROW ? this.elementNumber : this.elementNumber % this.builder.MAX_ELEMENTS_PER_ROW + 1;
        let left = horizontalCount * this.builder.ELEMENT_SPACE * 2 + this.builder.tablinesHorizontalStart - 0.25 * this.builder.ELEMENT_SIZE;
        let top = (this.tabline - 1) * this.builder.tablineSpace + this.builder.tablinesVerticalStart + Math.floor(this.elementNumber / this.builder.MAX_ELEMENTS_PER_ROW) * this.builder.offset - 0.5 * this.builder.ELEMENT_SIZE;
        this.xPosition = left;
        this.yPosition = top;
    }

}

export class TabBuilderElement extends BaseTabBuilderElement {

    protected xTextAdj: number;
    protected yTextAdj: number;
    protected fontSize: number;

    public elementText: string;
    public tabline: number;


    constructor(
        canvas: TabBuilder, elNumber: number, xPos: number = 0,
        yPos: number = 0, height: number = 0, width: number = 0,
        tabline: number = 0, elementText: string = "", xTextAdj: number = 0,
        yTextAdj: number = 0, fontSize: number = 0
    ) {
        super(canvas, elNumber, xPos, yPos, height, width);
        this.tabline = tabline;
        this.elementText = elementText;
        this.xTextAdj = xTextAdj;
        this.yTextAdj = yTextAdj;
        this.fontSize = fontSize;
    }

    draw() {
        this.canvas.drawRectangle(this.xPosition, this.yPosition, '#fff', this.width, this.height, true, true);
        this.canvas.addText(this.elementText, this.xPosition + this.xTextAdj, this.yPosition + this.yTextAdj, this.fontSize, "black");
    }

    public leftTranslate(): void {
        this.elementNumber = this.elementNumber - 1;
        this.setPosition();
    }

    public rightTranslate(): void {
        this.elementNumber = this.elementNumber + 1;
        this.setPosition();
    }

    public getElementsArray(): [string, string, string, string, string, string] {
        let stringNo = this.tabline;
        let fretNo = this.elementText;
        let tablines: [string, string, string, string, string, string] = [null, null, null, null, null, null];
        tablines[stringNo - 1] = fretNo;
        return tablines;
    }

    public drawSelectionRectangle(): void {
        this.builder.clearRect(this.xPosition, this.yPosition, this.width, this.height);
        this.builder.redrawTabElements();
        this.builder.drawRectangle(this.xPosition, this.yPosition - (this.tabline - 1) * this.builder.tablineSpace, "blue", this.width,
            (this.builder.tablineWidth + this.builder.tablineSpace) * this.builder.NUMBER_OF_TABLINES, false, true, 0.2);
    }
}

export class ChordTabBuilderElement extends BaseTabBuilderElement {

    xPosition: number;
    yPosition: number;
    elementNumber: number;
    public tabBuilderElements: Array<TabBuilderElement>;

    constructor(canvas: TabBuilder, elNo: number, left: number, top: number, height: number, width: number, tabBuilderElements: Array<TabBuilderElement>) {
        super(canvas, elNo, left, top );
        this.children = tabBuilderElements;
        this.tabBuilderElements = tabBuilderElements as Array<TabBuilderElement>;
        this.tabline = 0;
        this.height = height;
        this.width = width;
    }

    draw() {
        if (this.tabBuilderElements.length > 0) {
            for (let i = 0; i < this.tabBuilderElements.length; i++) {
                if (this.tabBuilderElements[i] != null) {
                    this.tabBuilderElements[i].draw();
                }
            }
            this.updateTabline();
        }
    }

    private updateTabline() {
        if (this.tabBuilderElements.length > 0) {
            let tablineTotal =  0;
            for (let i = 0; i < this.tabBuilderElements.length; i++) {
                tablineTotal = tablineTotal + this.tabBuilderElements[i].tabline;
            }
            this.tabline =  this.medianTabline();
        }
    }

    private medianTabline(): number {
        if (this.tabBuilderElements.length == 0) return 0;

        let tabLines = [];
        for (let i = 0; i < this.tabBuilderElements.length; i++) {
            tabLines.push( this.tabBuilderElements[i].tabline );
        }

        tabLines.sort( function( x, y ){ return x - y; } );

        let half = Math.floor( tabLines.length / 2 );

        if (tabLines.length % 2) return tabLines[half];

        return Math.floor(( tabLines[half - 1] + tabLines[half] ) / 2);
    }

    public leftTranslate(): void {
        this.elementNumber = this.elementNumber - 1;
        this.setPosition();
        for (let i = 0; i < this.tabBuilderElements.length; i++) {
            this.tabBuilderElements[i].leftTranslate();
        }
    }

    public rightTranslate(): void {
        this.elementNumber = this.elementNumber + 1;
        this.setPosition();
        for (let i = 0; i < this.tabBuilderElements.length; i++) {
            this.tabBuilderElements[i].rightTranslate();
        }
    }

    public getElementsArray(): [string, string, string, string, string, string] {
        let elementsArray: [string, string, string, string, string, string] = [null, null, null, null, null, null];
        if (this.tabBuilderElements != null) {
            for (let i = 0; i < this.tabBuilderElements.length; i++) {
                elementsArray[this.tabBuilderElements[i].tabline - 1] = this.tabBuilderElements[i].elementText;
            }
        }
        return elementsArray;
    }

    public drawSelectionRectangle(): void {
        let xPos = this.tabBuilderElements[0].xPosition;
        let yPos = this.builder.tablinesVerticalStart + Math.floor(this.elementNumber / this.builder.MAX_ELEMENTS_PER_ROW) * this.builder.offset - 0.5 * this.builder.ELEMENT_SIZE;
        let width = this.tabBuilderElements[0].width;
        let height = this.tabBuilderElements[0].height * this.builder.NUMBER_OF_TABLINES;
        this.builder.clearRect(xPos, yPos, width, height);
        this.builder.redrawTabElements();
        this.builder.drawRectangle(xPos, yPos, "blue", width, height, false, true, 0.2);
    }
}