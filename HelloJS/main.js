let hTextInput = document.getElementById("textInput");
let hDivOutput = document.getElementById("divOutput");
let hBtnRun = document.getElementById("btnRun");

hBtnRun.addEventListener('click', (event) => {
    var crtOutput = hDivOutput.innerHTML;
    var crtInput = hTextInput.value;
    hDivOutput.textContent = `${crtOutput}\r\n${crtInput}`;
});