export let nextStep;
export let tracing = false;

export async function step() {
    tracing = true;
    const promise = new Promise((resolve) => {
        nextStep = resolve;
    });

    // Wait for the promise to resolve
    await promise;
}

export function done() {
    tracing = false;
}
