
export class Sync {
    /*
    tracing - booloean tracking if during tracing or not
    nextStep - synchronization lambda linking promise with resolve
    */
    constructor () {
        this.tracing = false;
    }

    async step() {
        this.tracing = true;
        const promise = new Promise((resolve) => {
            this.nextStep = resolve;
        });

        // Wait for the promise to resolve
        await promise;
    }

    done() {
        this.tracing = false;
    }
}