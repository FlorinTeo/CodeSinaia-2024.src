import { ContextMenu } from "./contextMenu.js";

export class ConsoleDialog {

    #hConsoleDialog;
    #hConsoleClose;
    #hConsoleText;
    #hConsoleBtnRunStep;
    #hConsoleBtnResize;
    #ctxMenuConsole;
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
        this.#hConsoleBtnRunStep = document.getElementById('hConsoleBtnRun');
        this.#hConsoleBtnResize = document.getElementById('hConsoleBtnResize');
        this.#selection = "";

        this.setupCtxMenuConsole();

        this.#hConsoleDialog.addEventListener('mouseup', (event) => { event.preventDefault(); });
        this.#hConsoleClose.addEventListener('click', () => { this.onBtnCloseClick(); });
        this.#hConsoleBtnResize.addEventListener('click', () => { this.onBtnResize(); });
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

    setupCtxMenuConsole() {
        this.#ctxMenuConsole = new ContextMenu("hCtxMenuConsole");

        this.#hConsoleDialog.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.#ctxMenuConsole.setVisible(new Map([
                ['hCtxMenuConsole_Copy', navigator.clipboard && (this.#selection.length > 0)],
                ['hCtxMenuConsole_Paste', navigator.clipboard],
                ['hCtxMenuConsole_Clear', this.#hConsoleText.value.length > 0],
            ]));
            this.#ctxMenuConsole.setInput('hCtxMenuConsole_Trace', this.#code.tracing);
            this.#ctxMenuConsole.show(event.pageX - 10, event.pageY - 10, () => { });
        });

        this.#hConsoleDialog.addEventListener('mousedown', (event) => {
            if (this.#ctxMenuConsole.isShown) {
                this.#ctxMenuConsole.onClose();
            }
        });

        this.#ctxMenuConsole.addContextMenuListener('hCtxMenuConsole_Trace', (_, value) => { this.onCtxMenuTrace(); });

        this.#ctxMenuConsole.addContextMenuListener('hCtxMenuConsole_Copy', (_, value) => { this.onCtxMenuCopy(); });
        this.#ctxMenuConsole.addContextMenuListener('hCtxMenuConsole_Paste', (_, value) => { this.onCtxMenuPaste(); });
        this.#ctxMenuConsole.addContextMenuListener('hCtxMenuConsole_Clear', (_, value) => { this.onCtxMenuClear(); });
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

    // #region: Context Menu Handlers
    onCtxMenuTrace() {
        this.#code.tracing = this.#ctxMenuConsole.getInput('hCtxMenuConsole_Trace');
    }

    onCtxMenuPaste() {
        navigator.clipboard.readText().then( text => {
            if (text.length > 0) {
                let pos = this.#hConsoleText.selectionStart;
                let newText = this.#hConsoleText.value.slice(0, pos)
                            + text
                            + this.#hConsoleText.value.slice(pos);
                this.#hConsoleText.value = newText;
                this.#hConsoleText.focus();
                this.#hConsoleText.setSelectionRange(pos, pos + text.length);
            }
        });
    }

    onCtxMenuCopy() {
        navigator.clipboard.writeText(this.#selection);
    }

    onCtxMenuClear() {
        this.#code.done();
        this.clear();
    }
    // #endregion: Context Menu Handlers

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
