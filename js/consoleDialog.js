export class ConsoleDialog {

    constructor(graphics) {
        this.lambdaOnClose = null;
        this.hConsoleDialog = document.getElementById('hConsoleDialog');
        this.hConsoleTitleBar = document.getElementById('hConsoleTitleBar');
        this.hConsoleClose = document.getElementById('hConsoleClose');
        this.hConsoleClose.addEventListener('click', () => { this.onBtnCloseClick(); });
    }

    addCloseListener(lambdaOnClose) {
        this.lambdaOnClose = lambdaOnClose;
    }

    show(graph) {
        this.hConsoleDialog.style.display="block";
        this.hConsoleDialog.focus();
    }

    onBtnCloseClick(event = null) {
        if (this.lambdaOnClose != null) {
            this.lambdaOnClose(event);
        }
        this.hConsoleDialog.style.display="none";
    }
}
