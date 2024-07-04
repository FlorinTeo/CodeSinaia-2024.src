export class ConsoleDialog {

    #hConsoleDialog;
    #hConsoleClose;
    #hConsoleText;
    #hConsoleBtnClear;
    #lambdaOnClose;

    constructor(graphics) {
        this.#lambdaOnClose = null;
        this.#hConsoleDialog = document.getElementById('hConsoleDialog');
        this.#hConsoleClose = document.getElementById('hConsoleClose');
        this.#hConsoleText = document.getElementById('hConsoleText');
        this.#hConsoleBtnClear = document.getElementById('hConsoleBtnClear');
        this.#hConsoleBtnClear.addEventListener('click', () => { this.onBtnClearClick(); });
        this.#hConsoleClose.addEventListener('click', () => { this.onBtnCloseClick(); });
    }

    addCloseListener(lambdaOnClose) {
        this.#lambdaOnClose = lambdaOnClose;
    }

    show(graph) {
        this.#hConsoleDialog.style.display="block";
        this.#hConsoleDialog.focus();
    }

    onBtnCloseClick(event = null) {
        if (this.#lambdaOnClose != null) {
            this.#lambdaOnClose(event);
        }
        this.#hConsoleDialog.style.display="none";
    }

    onBtnClearClick(event = null) {
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
