import { BaseCanvas } from './basecanvas';
import { CanvasElement } from './canvaselement';
import { BaseTabBuilderElement, ChordTabBuilderElement, TabBuilderElement } from './tabbuilderelement';

export class TabBuilder extends BaseCanvas{

    public tablinesHorizontalStart: number;
    public tablinesVerticalStart: number;

    public tablineSpace: number;
    public tablineLength: number;
    public tablineWidth: number;

    public offset: number;

    public tabBuilderElements: Array<BaseTabBuilderElement>;
    public selectedTabBuilderElement: BaseTabBuilderElement;

    public FONT_SIZE: number;
    public ELEMENT_SIZE: number;
    public ELEMENT_SPACE: number;

    private numberOfTabRows: number;

    readonly NUMBER_OF_TABLINES = 6;
    readonly MAX_ELEMENTS_PER_ROW = 59; // TODO calculate this

    constructor(canvas: HTMLCanvasElement, heightAdj: number, widthAdj: number, containerDiv: HTMLDivElement = null, overlayCanvas: HTMLCanvasElement = null ) {
        super(canvas, heightAdj, widthAdj, containerDiv, overlayCanvas);
        
        this.tablinesHorizontalStart = 50 * this.widthScaleFactor;
        this.tablinesVerticalStart = 20 * this.heightScaleFactor;

        this.tablineSpace = 12 * this.heightScaleFactor;
        this.tablineLength = 1200 * this.widthScaleFactor;
        this.tablineWidth = 0.5 * this.widthScaleFactor;

        this.ELEMENT_SPACE = 10 * this.widthScaleFactor;

        this.FONT_SIZE = 10 * (this.widthScaleFactor + this.heightScaleFactor) / 2;
        this.ELEMENT_SIZE = 8 * (this.widthScaleFactor + this.heightScaleFactor) / 2;

        this.offset = this.tablinesVerticalStart + this.NUMBER_OF_TABLINES * this.tablineSpace; 

        this.tabBuilderElements = new Array<TabBuilderElement>();
        this.selectedTabBuilderElement = null;

        this.numberOfTabRows = 1;
    }

    private addTablines() {
        let tabLineRow = this.numberOfTabRows - 1;
        for (let i = 0; i < this.NUMBER_OF_TABLINES; i++) {
            this.drawRectangle(this.tablinesHorizontalStart, this.tablinesVerticalStart + i * this.tablineSpace + tabLineRow * this.offset, "#000", this.tablineLength, this.tablineWidth);
        }
        this.numberOfTabRows += 1;
    }

    private createTabBuilderElement(elementNo: number, tabline: number, elementText: string = null): TabBuilderElement {
        let horizontalCount = elementNo < this.MAX_ELEMENTS_PER_ROW ? elementNo : elementNo % this.MAX_ELEMENTS_PER_ROW + 1;
        let left = horizontalCount * this.ELEMENT_SPACE * 2 + this.tablinesHorizontalStart - 0.25 * this.ELEMENT_SIZE;
        let top = (tabline - 1) * this.tablineSpace + this.tablinesVerticalStart + Math.floor(elementNo / this.MAX_ELEMENTS_PER_ROW) * this.offset - 0.5 * this.ELEMENT_SIZE;
        let size = 1.5 * this.ELEMENT_SIZE;

        let textLeftAdj = 0.75 * this.ELEMENT_SIZE;
        let textTopAdj = this.ELEMENT_SIZE;

        return new TabBuilderElement(this, elementNo, left, top, size, size, tabline, elementText, textLeftAdj, textTopAdj, this.FONT_SIZE);
    }

    private createChordTabBuilderElement(elementNo: number,  children: Array<TabBuilderElement>): ChordTabBuilderElement {
        let horizontalCount = elementNo < this.MAX_ELEMENTS_PER_ROW ? elementNo : elementNo % this.MAX_ELEMENTS_PER_ROW + 1;
        let left = horizontalCount * this.ELEMENT_SPACE * 2 + this.tablinesHorizontalStart - 0.25 * this.ELEMENT_SIZE;
        let top = this.tablinesVerticalStart + Math.floor(elementNo / this.MAX_ELEMENTS_PER_ROW) * this.offset - 0.5 * this.ELEMENT_SIZE;
        let size = 1.5 * this.ELEMENT_SIZE;
        return new ChordTabBuilderElement(this, elementNo, left, top, size * this.NUMBER_OF_TABLINES, size, children);
    }

    public addTabElement(elementNo: number, tabline: number, elementText: string = null) {
        let tabBuilderElement = this.createTabBuilderElement(elementNo, tabline, elementText);
        tabBuilderElement.draw();
        if (this.getFirstEmptyElementIndex() != -1) {
            this.tabBuilderElements[this.getFirstEmptyElementIndex()] = tabBuilderElement;
        } else {
            this.tabBuilderElements.push(tabBuilderElement);
        }
    }

    public addChordTabElement(elementNo: number, tabline: number, elementText: string = null) {
        let tabBuilderElement = this.createTabBuilderElement(elementNo, tabline, elementText);

        let chordTabBuilderElement = null;
        if (this.findTabElementById(elementNo) != null) {
            chordTabBuilderElement = this.findTabElementById(elementNo) as ChordTabBuilderElement;
            chordTabBuilderElement.children.push(tabBuilderElement);
        } else {
            chordTabBuilderElement = this.createChordTabBuilderElement(elementNo, [tabBuilderElement])
            if (this.getFirstEmptyElementIndex() != -1) {
                this.tabBuilderElements[this.getFirstEmptyElementIndex()] = chordTabBuilderElement;
            } else {
                this.tabBuilderElements.push(chordTabBuilderElement);
            }
        }
        chordTabBuilderElement.draw();
    }

    protected findTabElementById(elementId: number): BaseTabBuilderElement {
        for (let i = 0; i < this.tabBuilderElements.length; i++) {
            if (this.tabBuilderElements[i] != null) {
                if (elementId == this.tabBuilderElements[i].elementNumber) {
                    console.log("found tab element " + i);
                    console.log("el " + i + " has x pos " + this.tabBuilderElements[i].xPosition + " has y pos " + this.tabBuilderElements[i].yPosition);
                    return this.tabBuilderElements[i];
                }
            }
        }
        return null;
    }

    public redrawTabElements() {
        this.clearOverlayCanvas();
        for (let i = 0; i < this.tabBuilderElements.length; i++) {
            if (this.tabBuilderElements[i] != null) {
                this.tabBuilderElements[i].draw();
            }
        }
    }

    public selectTabElement(elementId: number) {
        let element = this.findTabElementById(elementId);
        if (element != null) {
            this.selectedTabBuilderElement = element;
            this.redrawTabElements();
            element.drawSelectionRectangle();
        }
    }

    public deletedSelectedTabElement() {
        if (this.selectedTabBuilderElement != null) {
            let indicesToRemove = [];
            for (let i = 0; i < this.tabBuilderElements.length; i++) {
                if (this.tabBuilderElements[i].elementNumber == this.selectedTabBuilderElement.elementNumber) {
                    indicesToRemove.push(i);
                }
            }
            if (indicesToRemove.length > 0) {
                for (let j = indicesToRemove[indicesToRemove.length - 1] + 1; j < this.tabBuilderElements.length; j++) {
                    this.tabBuilderElements[j].leftTranslate();
                }

                for (let i = indicesToRemove.length - 1; i >= 0; i--) {
                    this.tabBuilderElements.splice(indicesToRemove[i], 1);
                }
            }
        }
        this.redrawTabElements();
    }

    public insertTabElement() {
        if (this.selectedTabBuilderElement != null) {
            let indexToRemove = this.selectedTabBuilderElement.elementNumber;
            this.tabBuilderElements.splice(indexToRemove-1, 0, null);
            for (let j = indexToRemove; j < this.tabBuilderElements.length; j++) {
                this.tabBuilderElements[j].rightTranslate();
            }
        }
        this.redrawTabElements();
    }

    public getMostRecentElementId() {
        return this.tabBuilderElements[this.tabBuilderElements.length - 1].elementNumber;
    }

    public getFirstEmptyElementIndex(): number {
        for (let i = 0; i < this.tabBuilderElements.length; i++) {
            if (this.tabBuilderElements[i] == null) {
                return i;
            }
        }
        return -1
    }

    public nextElementId(): number {
        if (this.getFirstEmptyElementIndex() != -1) {
            return this.getFirstEmptyElementIndex();
        }
        return this.tabBuilderElements[this.tabBuilderElements.length - 1].elementNumber;
    }

    public getMostRecentElement(): BaseTabBuilderElement {
        if (this.tabBuilderElements.length) {
            return this.tabBuilderElements[this.tabBuilderElements.length - 1];
        }
        return null;
    }

    public createTablines() {
        this.addTablines();
    }
}