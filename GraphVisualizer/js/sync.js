import { console } from './main.js'

export class Sync {

    #tracing; // booloean tracking if during tracing or not
    #nextStep // synchronization lambda linking promise with resolve

    constructor () {
        this.#tracing = false;
    }

    async run() {
        if (!this.#tracing) {
            await this.myCustomCode();
        } else {
            this.#nextStep();
        }
    }

    async step() {
        this.#tracing = true;
        const promise = new Promise((resolve) => {
            this.#nextStep = resolve;
        });

        // Wait for the promise to resolve
        await promise;
    }

    done() {
        this.#tracing = false;
    }
    
    async myCustomCode() {
        console.out('Running your custom code 1!');
        await this.step();
        console.out('Running your custom code 2!');
        await this.step();
        console.out('Running your custom code final!');
        this.done();
    }
}
