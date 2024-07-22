let hTextInput = document.getElementById("textInput");
let hDivOutput = document.getElementById("divOutput");
let hBtnRun = document.getElementById("btnRun");
let hBtnApp = document.getElementById("btnRun");
let hBtnClear = document.getElementById("btnClear");
let hBtnTrans = document.getElementById("btnTrans");
let hBtnPrim = document.getElementById("btnPrim");

hBtnApp.addEventListener('click', (event) => {
    var crtOutput = hDivOutput.innerHTML;
    var crtInput = hTextInput.value;
    var crtInput = hTextInput.value.replaceAll('\n','<br>');
    if (crtOutput !== '') {
        hDivOutput.innerHTML = `${crtOutput}<br>${crtInput}`;
        hDivOutput.innerHTML = `${crtOutput}\n${crtInput}`;
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
hBtnTrans.addEventListener('click', (event) => {
    hDivOutput.innerHTML=hTextInput.value.replaceAll('\n','<br>');
    hTextInput.value='';
});
hBtnPrim.addEventListener('click',(event)=> {
    let n=hTextInput.value;
    let ok=1;
    if(n<2) hDivOutput.innerHTML="Compus";
    else {for (let i=2; i*i<=n&&ok==1; i++) {
            if(n%i==0) ok=0;
    }
    if(ok==1) hDivOutput.innerHTML="Prim";
    else hDivOutput.innerHTML="Compus";}
}
);