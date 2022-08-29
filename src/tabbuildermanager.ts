import {TabBuilder} from './tabbuilder';
import { BaseTabBuilderElement } from './tabbuilderelement';

export class TabBuilderManager {
    private currentTabBuilderElement: number;
    private tabBuilder: TabBuilder;
    private currentDrawableElements: [string, string, string, string, string, string];

    private tablines: {[index: number]: [string, string, string, string, string, string]}  = {};

    public chordMode: boolean = false;

    constructor(tabBuilder: TabBuilder, currentElement: number = 1) {
        this.tabBuilder = tabBuilder;
        this.currentTabBuilderElement = currentElement;
        this.currentDrawableElements = [null, null, null, null, null, null];
    }

    public setTablines(tablines: { [index: number]: [string, string, string, string, string, string] }) {
        this.tablines = tablines;
    }

    public updateDrawbleElements(stringNumber: number, fretValue: string) {
        this.currentDrawableElements[stringNumber - 1] = fretValue;
        this.tablines[this.currentTabBuilderElement] = this.currentDrawableElements;
    }

    public toggleChordMode() {
        if (this.chordMode) {
            this.currentDrawableElements = [null, null, null, null, null, null];
            this.currentTabBuilderElement = this.tabBuilder.nextElementId() + 1;
        }
        this.chordMode = !this.chordMode;
    }

    private drawChord() {
        let elements = this.tablines[this.currentTabBuilderElement];
        for (let j = 0; j < elements.length; j++) {
            if (elements[j] != null) {
                this.tabBuilder.addChordTabElement(this.currentTabBuilderElement, j + 1, elements[j]);
            }
        }
    }

    private drawSingleNote() {
        let elements = this.tablines[this.currentTabBuilderElement];
        for (let j = 0; j < elements.length; j++) {
            if (elements[j] != null) {
                this.tabBuilder.addTabElement(this.currentTabBuilderElement, j + 1, elements[j]);
            }
        }
        this.currentDrawableElements = [null, null, null, null, null, null];
        this.currentTabBuilderElement = this.tabBuilder.nextElementId() + 1;
    }

    public draw() {
        if (this.chordMode) {
            this.drawChord();
        } else {
            this.drawSingleNote();
        }
    }

    public drawSymbol( symbolText: string) {
        if (this.tabBuilder.getMostRecentElement() !== null) {
            let el = this.tabBuilder.getMostRecentElement();
            this.updateDrawbleElements(el.tabline, symbolText);
            this.drawSingleNote();
        }
    }

    public drawAllTablines() {
        for (let tabElementNumber in this.tablines) {
            let elements = this.tablines[+tabElementNumber];
            for (let j = 0; j < elements.length; j++) {
                if (elements[j] != null) {
                    this.tabBuilder.addTabElement(+tabElementNumber, j + 1, elements[j]);
                }
            }
            this.currentTabBuilderElement = this.tabBuilder.nextElementId() + 1;
        }
    }

    public findTabBuilderElement(xPosition: number, yPosition: number) {
        //Finds a tab builder element from a xPosition and yPosition on the canvas. Update the selected item property on the tabbuilder.
        for (let i = 0; i < this.tabBuilder.tabBuilderElements.length; i++) {
            if (this.tabBuilder.tabBuilderElements[i] != null) {
                let element = this.tabBuilder.tabBuilderElements[i];
                console.log("x clicked " + xPosition + "y clicked " + yPosition);
                if (xPosition >= element.xPosition && xPosition <= element.xPosition + element.width && yPosition >= element.yPosition && yPosition <= element.yPosition + element.height) {
                    console.log("Clicked element: " + element.elementNumber);
                    this.tabBuilder.selectTabElement(element.elementNumber);
                }
            }
        }
        console.log(this.tablines);
        console.log(this.tabBuilder.tabBuilderElements)
    }

    private updateTabLinesFromDeletedElement(el: BaseTabBuilderElement) {
        let elNo = el.elementNumber;
        for (let i = elNo-1; i < this.tabBuilder.tabBuilderElements.length; i++) {
            delete this.tablines[i+1];
        }
        this.tabBuilder.deletedSelectedTabElement();
        for (let i = elNo-1; i < this.tabBuilder.tabBuilderElements.length; i++) {
            this.tablines[i+1] = this.tabBuilder.tabBuilderElements[i].getElementsArray();
        }
    }

    private updateLinesFromInsertElement(el: BaseTabBuilderElement) {
        let elNo = el.elementNumber;
        for (let i = elNo; i < this.tabBuilder.tabBuilderElements.length; i++) {
            delete this.tablines[i];
        }
        this.tablines[elNo] = [null, null, null, null, null, null];
        this.tabBuilder.insertTabElement();
        for (let i = elNo; i < this.tabBuilder.tabBuilderElements.length; i++) {
            this.tablines[i + 1] = this.tabBuilder.tabBuilderElements[i].getElementsArray();
        }
    }

    public deleteTabBuilderElement() {
        if (this.tabBuilder.selectedTabBuilderElement != null) {
            this.currentTabBuilderElement = this.tabBuilder.selectedTabBuilderElement.elementNumber;

            this.updateTabLinesFromDeletedElement(this.tabBuilder.selectedTabBuilderElement);

            this.tabBuilder.redrawTabElements();
            this.currentTabBuilderElement = this.tabBuilder.nextElementId() + 1;
        }
        console.log(this.tablines);
    }

    public insertTabBuilderElement() {
        if (this.tabBuilder.selectedTabBuilderElement != null) {
            this.currentTabBuilderElement = this.tabBuilder.selectedTabBuilderElement.elementNumber;

            this.updateLinesFromInsertElement(this.tabBuilder.selectedTabBuilderElement);

            this.tabBuilder.redrawTabElements();
            this.currentTabBuilderElement = this.tabBuilder.nextElementId() + 1;
        }
    }

    public addNewTabline() {
        this.tabBuilder.createTablines();
    }
}