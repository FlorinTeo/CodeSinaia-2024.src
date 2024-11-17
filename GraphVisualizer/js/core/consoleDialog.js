export class ConsoleDialog {

    #hConsoleDialog;
    #hConsoleClose;
    #hConsoleText;
    #hConsoleBtnClear;
    #hConsoleBtnRunStep;
    #hConsoleBtnResize;
    #lambdaOnClose;
    #width;
    #code;

    #selection;

    constructor(code) {
        this.#code = code;
        this.#lambdaOnClose = null;
        this.#hConsoleDialog = document.getElementById('hConsoleDialog');
        this.#hConsoleClose = document.getElementById('hConsoleClose');
        this.#hConsoleText = document.getElementById('hConsoleText');
        this.#hConsoleBtnClear = document.getElementById('hConsoleBtnClear');
        this.#hConsoleBtnRunStep = document.getElementById('hConsoleBtnRun');
        this.#hConsoleBtnResize = document.getElementById('hConsoleBtnResize');

        this.#hConsoleDialog.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        this.#hConsoleDialog.addEventListener('mouseup', (event) => {
            event.preventDefault();
        });

        this.#selection = "";

        this.#hConsoleClose.addEventListener('click', () => { this.onBtnCloseClick(); });
        this.#hConsoleBtnResize.addEventListener('click', () => { this.onBtnResize(); });
        this.#hConsoleBtnClear.addEventListener('click', () => { this.onBtnClearClick(); });
        this.#hConsoleBtnRunStep.addEventListener('click', () => { this.onBtnRunStepClick(); })
        this.#hConsoleText.addEventListener('selectionchange', () => {
            let iStart = this.#hConsoleText.selectionStart;
            let iEnd = this.#hConsoleText.selectionEnd;
            if (iStart < iEnd) {
                this.#selection = this.#hConsoleText.value.substring(iStart, iEnd);
            } else if (this.#selection != '') {
                this.#selection = '';
            }
        });

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

    getSelection() {
        return this.#selection.trim();
    }

    outln(message) {
        this.out(message, "\n");
    }

    out(message, delim) {
        var crtText = this.#hConsoleText.value;
        if (message != null) {
            crtText += message;            
        }
        if (delim != null) {
            crtText += delim;
        }
        this.#hConsoleText.value = crtText;
        this.#hConsoleText.scrollTop = this.#hConsoleText.scrollHeight;
    }

    clear() {
        this.#hConsoleText.value="";
    }
}
