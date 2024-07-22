let hTextInput = document.getElementById("textInput");
let hDivOutput = document.getElementById("divOutput");
let hBtnRun = document.getElementById("btnRun");
let hBtnClear = document.getElementById("btnClear");

hBtnRun.addEventListener('click', (event) => {
    var crtOutput = hDivOutput.innerHTML;
    var crtInput = hTextInput.value;
    if (crtOutput !== '') {
        hDivOutput.innerHTML = `${crtOutput}<br>${crtInput}`;
    } else {
        hDivOutput.innerHTML = crtInput;
    }
    let scriptMatch = crtInput.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
        try {
            eval(scriptMatch[1]);
        } catch (e) {
            console.error("Eroare", e);
        }
    }
});

hBtnClear.addEventListener('click', (event) => {
    hDivOutput.innerHTML = '';
});
