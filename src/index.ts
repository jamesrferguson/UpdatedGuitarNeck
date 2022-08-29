import {GuitarNeck} from './guitarneck';
import {TabBuilder} from './tabbuilder';
import {TabBuilderManager} from './tabbuildermanager';

enum TAB_BUILDER_STATE {
    SINGLE, CHORD
}

let GUITARNECK_HEIGHT_ADJ = 300;
let GUITARNECK_WIDTH_ADJ = 1300;

let TABBUILDER_HEIGHT_ADJ = 300;
let TABBUILDER_WIDTH_ADJ = 1300;

let singleNoteRadioButton = <HTMLInputElement> document.getElementById("singleNoteRadio");
let chordRadioButton = <HTMLInputElement> document.getElementById("chordRadio");

let tabBuilderContainer = <HTMLDivElement> document.getElementById("tabBuilderContainer");

let guitarNeckCanvas = <HTMLCanvasElement> document.getElementById("guitarNeckCanvas");
let scaleKeySelector = <HTMLSelectElement> document.getElementById("keySelector");
let scaleTypeSelector = <HTMLSelectElement> document.getElementById("scaleTypeSelector");
let btnGenerateScale = <HTMLButtonElement> document.getElementById("btnGenerateScale");
let btnDrawTab = <HTMLButtonElement> document.getElementById("drawTabBtn");
let btnLoadTab = <HTMLButtonElement>document.getElementById("loadTabBtn");
let btnDeleteTab = <HTMLButtonElement>document.getElementById("deleteTabBtn");
let btnSelectTab = <HTMLButtonElement>document.getElementById("insertTabBtn");
let btnAddTabLine = <HTMLButtonElement>document.getElementById("addTabLineBtn");

let slideRadioBtn = <HTMLInputElement>document.getElementById("slideRadio")
let bendRadioBtn = <HTMLInputElement>document.getElementById("bendRadio")
let hammerOnRadioBtn = <HTMLInputElement>document.getElementById("hammerOnRadio")
let pullOffRadioBtn = <HTMLInputElement>document.getElementById("pullOffRadio")
let drawSymbolButton = <HTMLButtonElement>document.getElementById("drawSymbolBtn");

let intervalForScaleType: {[index: string]: string} = {
    major: '0,2,4,5,7,9,11', minor: '0,2,3,5,7,8,10', pentatonic: '0,3,5,7,10',
    harmonicMinor: '0,2,3,5,7,8,11'
};

function toggleChordMode() {
    chordMode = chordRadioButton.checked;
    btnDrawTab.disabled = !chordMode;

    drawSymbolButton.disabled = chordMode;
    slideRadioBtn.disabled = chordMode;
    hammerOnRadioBtn.disabled = chordMode;
    pullOffRadioBtn.disabled = chordMode;
    bendRadioBtn.disabled = chordMode;

    btnDeleteTab.disabled = chordMode;
    tabBuilderManager.toggleChordMode();
}

let chordMode: boolean = false;
singleNoteRadioButton.onclick = toggleChordMode;
chordRadioButton.onclick = toggleChordMode;

btnDrawTab.onclick = function() {
    tabBuilderManager.draw();
    singleNoteRadioButton.checked = true;
    chordRadioButton.checked = false;
    toggleChordMode();
};

let guitarNeck = new GuitarNeck(guitarNeckCanvas, GUITARNECK_HEIGHT_ADJ, GUITARNECK_WIDTH_ADJ);
guitarNeck.createGuitarNeck();

let tabBuilderCanvas = <HTMLCanvasElement> document.getElementById("tabBuilderCanvas");
let notesCanvas = <HTMLCanvasElement> document.getElementById("notesCanvas");
let tabBuilder = new TabBuilder(tabBuilderCanvas, TABBUILDER_HEIGHT_ADJ, TABBUILDER_WIDTH_ADJ, tabBuilderContainer, notesCanvas);
tabBuilder.createTablines();

let tabBuilderManager = new TabBuilderManager(tabBuilder);

function updateGuitarNeck() {
    let selectedKey: string = scaleKeySelector.value;
    let selectedScaleType: string = scaleTypeSelector.value;
    guitarNeck.createGuitarNeck();
    guitarNeck.addNotesToNeck(selectedKey, intervalForScaleType[selectedScaleType]);
}

function guitarNeckCanvasClick(e: MouseEvent) {
    let rect = guitarNeckCanvas.getBoundingClientRect();
    let xClick = (e.clientX - rect.left) / rect.width * guitarNeckCanvas.width;
    let yClick = (e.clientY - rect.top) / rect.height * guitarNeckCanvas.height;
    let neckClickParams = guitarNeck.detectFretboardClick(xClick, yClick);
    tabBuilderManager.updateDrawbleElements(guitarNeck.stringNumberFromName(neckClickParams[0]), neckClickParams[1].toString());
    tabBuilderManager.draw();
}

let tabJSON: { [index: number]: [string, string, string, string, string, string] } = {};
tabJSON[0] = ["1", null, null, null, null, null];
tabJSON[1] = [null, "2", null, null, null, null];
tabJSON[2] = [null, null, "3", null, null, null];
tabJSON[3] = [null, null, "3", "4", null, null];
tabJSON[4] = [null, null, "3", null, null, null];

function loadTabFromJSON() {
    tabBuilderManager.setTablines(tabJSON);
    tabBuilderManager.drawAllTablines();
}

btnGenerateScale.addEventListener("click", (e: Event) => updateGuitarNeck());
btnLoadTab.addEventListener("click", (e: Event) => loadTabFromJSON());

guitarNeckCanvas.onclick = guitarNeckCanvasClick;

notesCanvas.addEventListener("click", (e: MouseEvent) => findTabBuilderElement(e));

function findTabBuilderElement(e: MouseEvent) {
    let rect = notesCanvas.getBoundingClientRect();
    let xClick = (e.clientX - rect.left) / rect.width * notesCanvas.width;
    let yClick = (e.clientY - rect.top) / rect.height * notesCanvas.height;
    tabBuilderManager.findTabBuilderElement(xClick, yClick);
}

btnDeleteTab.addEventListener("click", (e: MouseEvent) => deleteTabBuilderElement(e));
btnSelectTab.addEventListener("click", (e: MouseEvent) => insertTabBuilderElelment(e));

function deleteTabBuilderElement(e: MouseEvent) {
    findTabBuilderElement(e);
    tabBuilderManager.deleteTabBuilderElement();
}

function insertTabBuilderElelment(e: MouseEvent) {
    findTabBuilderElement(e);
    tabBuilderManager.insertTabBuilderElement();
}

let currentSymbolText = "";

slideRadioBtn.addEventListener("click", (e: MouseEvent) => updateCurrentSymbolText("s"));
bendRadioBtn.addEventListener("click", (e: MouseEvent) => updateCurrentSymbolText("b"));
hammerOnRadioBtn.addEventListener("click", (e: MouseEvent) => updateCurrentSymbolText("h"));
pullOffRadioBtn.addEventListener("click", (e: MouseEvent) => updateCurrentSymbolText("p"));

drawSymbolButton.addEventListener("click", (e: MouseEvent) => drawSymbol());

function updateCurrentSymbolText(symbol: string){
    currentSymbolText = symbol;
}

function drawSymbol() {
    tabBuilderManager.drawSymbol( currentSymbolText );
}

btnAddTabLine.addEventListener("click", (e: MouseEvent) => tabBuilderManager.addNewTabline());