import { repaint } from "../main.js";

export class CoreCode {

    #hConsoleBtnRunStep; // Run/Step html button
    #nextStep // synchronization lambda linking promise with resolve

    constructor () {
        this.#hConsoleBtnRunStep = null;
    }

    async execute(hConsoleBtnRunStep) {
        if (this.#hConsoleBtnRunStep == null) {
            this.#hConsoleBtnRunStep = hConsoleBtnRunStep;
            this.#hConsoleBtnRunStep.src = "res/btnStep.png";
            this.runWrapper();
        } else {
            this.#nextStep();
        }
    }

    async step() {
        if (this.#hConsoleBtnRunStep != null) {
            repaint();
            const promise = new Promise((resolve) => { this.#nextStep = resolve; });
            await promise;
        }
    }

    async runWrapper() {
        await this.run();
        this.done();
    }

    done() {
        if (this.#hConsoleBtnRunStep != null) {
            repaint();
            this.#hConsoleBtnRunStep.src = "res/btnRun.png";
            this.#hConsoleBtnRunStep = null;
        }
    }
    
    async run() {
        alert('##Error##: Attempting to run no-op CoreCode.');
    }
}
