import {BaseCanvas} from './basecanvas';

export class GuitarNeck extends BaseCanvas {
    private STRING_START: number;
    private NECK_START: number;

    private FRET_WIDTH: number;
    private FRET_LENGTH: number;
    private FRET_START: number;
    private FRET_SPACE: number;

    private STRING_WIDTH: number;
    private STRING_SPACE: number;
    private STRING_LENGTH: number;

    private FRET_MARKER_RADIUS: number;
    private NOTE_RADIUS: number;

    private SINGLE_MARKER_TOP: number;
    private FIRST_DOUBLE_MARKER_TOP: number;
    private SECOND_DOUBLE_MARKER_TOP: number;

    private FONT_SIZE: number;

    private NUMBER_OF_STRINGS = 6;
    private NUMBER_OF_FRETS = 24;
    private FRETS_WITH_SINGLE_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
    private FRETS_WITH_DOUBLE_MARKERS = [12, 24];

    readonly FRET_MARKER_COLOUR = "green";
    readonly NOTEMARKER_COLOUR = "red";
    readonly PRIMARY_NOTEMARKER_COLOR = "blue";

    readonly FLAT_SYMBOL = String.fromCharCode(9837);

    readonly STRING_NOTES = [ 'E_LOW', 'A', 'D', 'G', 'B', 'E_HIGH' ];
    readonly ALL_NOTES = [ 'A', 'B' + this.FLAT_SYMBOL, 'B', 'C', 'C#', 'D', 'E' + this.FLAT_SYMBOL, 'E', 'F', 'F#', 'G', 'G#' ];
    readonly MAP_STRINGS_TO_STRINGNUMBER: {[index: string]: number} = {
        E_LOW: 6, A: 5, D: 4, G: 3, B: 2, E_HIGH: 1
    };

    constructor(canvas: HTMLCanvasElement, heightAdj: number, widthAdj: number) {
        super(canvas, heightAdj, widthAdj);

        this.STRING_START = 20 * this.heightScaleFactor;
        this.NECK_START = 50 * this.widthScaleFactor;

        this.FRET_WIDTH = 5 * this.widthScaleFactor;
        this.FRET_LENGTH = 275 * this.heightScaleFactor;
        this.FRET_START = 10 * this.widthScaleFactor;
        this.FRET_SPACE = 50 * this.widthScaleFactor;

        this.STRING_WIDTH = 5 * this.widthScaleFactor;
        this.STRING_SPACE = 50 * this.heightScaleFactor;
        this.STRING_LENGTH = 1200 * this.widthScaleFactor;

        this.FRET_MARKER_RADIUS = 5 * this.widthScaleFactor;
        this.NOTE_RADIUS = 15 * this.widthScaleFactor;

        this.FONT_SIZE = 14 * (this.widthScaleFactor + this.heightScaleFactor) / 2;

        this.SINGLE_MARKER_TOP = this.STRING_START + 2.5 * this.STRING_SPACE; // halfway between 4th and 3rd strings
        this.FIRST_DOUBLE_MARKER_TOP = this.STRING_START + 1.5 * this.STRING_SPACE; // halfway between 5th and 4th strings
        this.SECOND_DOUBLE_MARKER_TOP = this.STRING_START + 3.5 * this.STRING_SPACE; // halfway between 3rd and 2nd strings
    }

    private addTextToNeck(text: string, left: number, top: number, fillStyle: string = "white") {
        let ctx = this.canvas.getContext("2d");
        let fontSizeStr = this.FONT_SIZE + "";
        ctx.font = fontSizeStr + "pt Calibri";
        ctx.fillStyle = fillStyle;
        ctx.textAlign = 'center';
        ctx.fillText(text, left, top);
    }

    private drawStringsOnNeck() {
        for (let i = 0; i < this.NUMBER_OF_STRINGS; i++) {
            this.drawRectangle(this.NECK_START, this.STRING_START + i * this.STRING_SPACE, '#ddd', this.STRING_LENGTH, this.STRING_WIDTH);
        }
    }

    private drawFretsOnNeck() {
        for (let i = 0; i <= this.NUMBER_OF_FRETS; i++) {
            this.drawRectangle((i + 1) * this.FRET_SPACE, this.FRET_START, "#000", this.FRET_WIDTH, this.FRET_LENGTH);
        }
    }

    private getFretMarkerLeft(fretNo: number) {
        return this.NECK_START + (fretNo - 0.5) * this.FRET_SPACE;
    }

    private drawSingleFretMarker(fretNo: number) {
        this.drawCircleOnNeck(this.FRET_MARKER_RADIUS, this.FRET_MARKER_COLOUR, this.getFretMarkerLeft(fretNo), this.SINGLE_MARKER_TOP);
    }

    private drawDoubleFretMarker(fretNo: number) {
        this.drawCircleOnNeck(this.FRET_MARKER_RADIUS, this.FRET_MARKER_COLOUR, this.getFretMarkerLeft(fretNo), this.FIRST_DOUBLE_MARKER_TOP);
        this.drawCircleOnNeck(this.FRET_MARKER_RADIUS, this.FRET_MARKER_COLOUR, this.getFretMarkerLeft(fretNo), this.SECOND_DOUBLE_MARKER_TOP);
    }

    private drawFretMarkersOnNeck() {
        for (let i = 0; i < this.FRETS_WITH_SINGLE_MARKERS.length; i++) {
            this.drawSingleFretMarker(this.FRETS_WITH_SINGLE_MARKERS[i])
        }

        for (let i = 0; i < this.FRETS_WITH_DOUBLE_MARKERS.length; i++) {
            this.drawDoubleFretMarker(this.FRETS_WITH_DOUBLE_MARKERS[i])
        }
    }

    public drawNoteOnString(fret: number, gtrString: number, noteName: string = null, isRoot: boolean = false) {
        let colour = isRoot ? this.PRIMARY_NOTEMARKER_COLOR : this.NOTEMARKER_COLOUR;
        let left = (fret + 0.33) * this.FRET_SPACE + this.FRET_START;
        let top = (gtrString - 1) * this.STRING_SPACE + this.STRING_START;
        this.drawCircleOnNeck(this.NOTE_RADIUS, colour, left, top);
        if (noteName) {
            this.addTextToNeck(noteName, left, top + 3);
        }
    }

    private orderNotesForStartingNote(startingNote: string): string[] {
        if (startingNote == 'E_LOW' || startingNote == 'E_HIGH') { // TODO: move this check
            startingNote = 'E';
        }
        let reorderedNotes = [...this.ALL_NOTES];
        return [...reorderedNotes.splice(this.ALL_NOTES.indexOf(startingNote)), ...reorderedNotes];
    }

    private drawNotesForString(stringName: string, notes: string[], rootNote: string) {
        let stringNumber = this.MAP_STRINGS_TO_STRINGNUMBER[stringName];
        let notesForString = this.orderNotesForStartingNote(stringName);
        for (let i = 0; i <= this.NUMBER_OF_FRETS; i++) {
            let j = i % 12;
            if (notes.indexOf(notesForString[j]) > -1){
                this.drawNoteOnString(i, stringNumber, notesForString[j], notesForString[j] == rootNote);
            }
        }
    }

    private drawNoteOnFret(stringName: string, fretNumber: number, transientNote=false) {
        let stringNumber = this.MAP_STRINGS_TO_STRINGNUMBER[stringName];
        let notesForString = this.orderNotesForStartingNote(stringName);
        this.drawNoteOnString(fretNumber, stringNumber, notesForString[fretNumber % 12]);
        if (transientNote) {
            setTimeout(function(obj: GuitarNeck){obj.createGuitarNeck()}, 300, this);
        }
    }

    private notesFromScaleInterval(keyName: string, intervals: string): string[] {
        let allNotes: string[] = this.orderNotesForStartingNote(keyName);
        let intervalValues: number[] = intervals.split(',').map(x => parseInt(x));
        let scaleNotes: string[] = [];
        for (let i = 0; i < allNotes.length; i++) {
            if (intervalValues.indexOf(i) > -1) {
                scaleNotes.push(allNotes[i]);
            }
        }
        return scaleNotes;
    }

    private detectStringClicked(yClick: number): string {
        if (yClick <= this.STRING_START + this.STRING_WIDTH)
            return this.STRING_NOTES[this.STRING_NOTES.length - 1];
        if (yClick >= this.STRING_START + (this.NUMBER_OF_STRINGS - 1) * this.STRING_SPACE)
            return this.STRING_NOTES[0];
        let stringVal = Math.round((yClick - this.STRING_START - this.STRING_WIDTH) / this.STRING_SPACE);
        return this.STRING_NOTES[this.STRING_NOTES.length - stringVal - 1];
    }

    private fretClicked(xClick: number): number {
        if (xClick < this.NECK_START + this.FRET_WIDTH)
            return 0;
        if (xClick >= this.NECK_START + (this.NUMBER_OF_FRETS - 1) * this.FRET_SPACE)
            return this.NUMBER_OF_FRETS;
        return Math.floor((xClick - this.NECK_START - this.FRET_WIDTH) / this.FRET_SPACE) + 1;
    }

    public detectFretboardClick(xClick: number, yClick: number): [string, number] {
        this.drawNoteOnFret(this.detectStringClicked(yClick), this.fretClicked(xClick), true);
        return [ this.detectStringClicked(yClick), this.fretClicked(xClick) ];
    }

    public stringNumberFromName(stringName: string): number {
        return this.MAP_STRINGS_TO_STRINGNUMBER[stringName];
    }

    public createGuitarNeck() {
        this.clearCanvas();
        this.drawFretsOnNeck();
        this.drawStringsOnNeck();
        this.drawFretMarkersOnNeck();
    }

    public addNotesToNeck(selectedKey: string, scaleInterval: string) {
        for(let i = 0; i < this.STRING_NOTES.length; i++){
            this.drawNotesForString(this.STRING_NOTES[i], this.notesFromScaleInterval(selectedKey, scaleInterval), selectedKey);
        }
    }
}