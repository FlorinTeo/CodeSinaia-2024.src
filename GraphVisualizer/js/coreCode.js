import { repaint } from "./main.js";

export class CoreCode {

    #hConsoleBtnRunStep; // Run/Step html button
    #nextStep // synchronization lambda linking promise with resolve

    constructor () {
        this.#hConsoleBtnRunStep = null;
    }

    async run(hConsoleBtnRunStep) {
        if (this.#hConsoleBtnRunStep == null) {
            this.#hConsoleBtnRunStep = hConsoleBtnRunStep;
            this.#hConsoleBtnRunStep.src = "res/btnStep.png";
            await this.myCustomCode();
        } else {
            this.#nextStep();
        }
        repaint();
    }

    async step() {
        if (this.#hConsoleBtnRunStep != null) {
            const promise = new Promise((resolve) => { this.#nextStep = resolve; });
            await promise;
        }
    }

    done() {
        if (this.#hConsoleBtnRunStep != null) {
            this.#hConsoleBtnRunStep.src = "res/btnRun.png";
            this.#hConsoleBtnRunStep = null;
        }
    }
    
    async myCustomCode() {
        alert('myCustomCode?');
    }
}
