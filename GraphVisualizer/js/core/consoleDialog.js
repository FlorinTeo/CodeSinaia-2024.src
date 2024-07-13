export class ConsoleDialog {

    #hConsoleDialog;
    #hConsoleClose;
    #hConsoleText;
    #hConsoleBtnClear;
    #hConsoleBtnRunStep;
    #hConsoleBtnResize;
    #lambdaOnClose;
    #width;
    #code


    constructor(code) {
        this.#code = code;
        this.#lambdaOnClose = null;
        this.#hConsoleDialog = document.getElementById('hConsoleDialog');
        this.#hConsoleClose = document.getElementById('hConsoleClose');
        this.#hConsoleText = document.getElementById('hConsoleText');
        this.#hConsoleBtnClear = document.getElementById('hConsoleBtnClear');
        this.#hConsoleBtnRunStep = document.getElementById('hConsoleBtnRun');
        this.#hConsoleBtnResize = document.getElementById('hConsoleBtnResize');

        this.#hConsoleClose.addEventListener('click', () => { this.onBtnCloseClick(); });
        this.#hConsoleBtnResize.addEventListener('click', () => { this.onBtnResize(); });
        this.#hConsoleBtnClear.addEventListener('click', () => { this.onBtnClearClick(); });
        this.#hConsoleBtnRunStep.addEventListener('click', () => { this.onBtnRunStepClick(); })

        this.#width = 32;
    }

    addCloseListener(lambdaOnClose) {
        this.#lambdaOnClose = lambdaOnClose;
    }

    show() {
        this.#hConsoleDialog.style.display="block";
        this.#hConsoleDialog.focus();
        this.#hConsoleDialog.style.left = `${100-this.#width}%`;
        this.#hConsoleDialog.style.width = `calc(${this.#width}% - 2px)`;
    }

    onBtnCloseClick(event = null) {
        if (this.#lambdaOnClose != null) {
            this.#lambdaOnClose(event);
        }
        this.#hConsoleDialog.style.display="none";
    }

    onBtnResize(event = null) {
        this.#width = Math.max(32, (this.#width + 8) % 72);
        this.show();
    }
    async onBtnRunStepClick(event = null) {
        await this.#code.execute(this.#hConsoleBtnRunStep);
    }

    onBtnClearClick(event = null) {
        this.#code.done();
        this.clear();
    }

    out(message) {
        var crtText = this.#hConsoleText.value;
        if (crtText != "") {
            crtText += "\n";
        }
        crtText += message;
        this.#hConsoleText.value = crtText;
        this.#hConsoleText.scrollTop = this.#hConsoleText.scrollHeight;
    }

    clear() {
        this.#hConsoleText.value="";
    }
}
