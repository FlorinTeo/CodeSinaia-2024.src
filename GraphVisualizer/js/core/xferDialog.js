export class XferDialog {

    /*
    Class members:
        this.lambdaOnClose - lambda method to be called when dialog closes
        this.graphics - the graphics engine
        this.graph - the Graph instance subject to this transfer
        this.hXferDialog - the dialog/div element for the entire dialog
        this.hXferTitleBar - the div element for the titlebar
        this.hXferClose - the input element for the close button
        this.hXferText - the textarea element hosting the entire dialog content
        this.hXferBtnCopy - the input element for the "Copy" button
        this.hXferBtnRefresh - the input element for the "Refresh" button
        this.hXferBtnPaste - the input element for the "Paste" button
        this.hXferBtnIn - the input element for the "Xfer In" button
        this.hXferBtnOut - the input element for the "Xfer Out" button
    */

    constructor(graphics) {
        this.lambdaOnClose = null;
        this.graphics = graphics;
        this.graph = null;
        this.hXferDialog = document.getElementById('hXferDialog');
        this.hXferTitleBar = document.getElementById('hXferTitleBar');
        this.hXferClose = document.getElementById('hXferClose');
        this.hXferText = document.getElementById('hXferText');
        this.hXferBtnCopy = document.getElementById("hXferBtn_Copy");
        this.hXferBtnRefresh = document.getElementById("hXferBtn_Refresh");
        this.hXferBtnPaste = document.getElementById("hXferBtn_Paste");
        this.hXferBtnIn = document.getElementById("hXferBtn_In");
        this.hXferBtnOut = document.getElementById("hXferBtn_Out");

        this.hXferClose.addEventListener('click', () => { this.onBtnCloseClick(); });
        this.hXferBtnCopy.addEventListener('click', () => { this.onBtnCopyClick(); });
        this.hXferBtnRefresh.addEventListener('click', () => { this.onBtnRefreshClick(); });
        this.hXferBtnPaste.addEventListener('click', () => { this.onBtnPasteClick(); });
        this.hXferBtnIn.addEventListener('click', () => { this.onBtnInClick(); });
        this.hXferBtnOut.addEventListener('click', () => { this.onBtnOutClick(); });

        this.hXferDialog.addEventListener('mousedown', (e) => { this.onMouseDown(e); });
        this.hXferDialog.addEventListener('mousemove', (e) => { this.onMouseMove(e); });
        this.hXferDialog.addEventListener('mouseup', (e) => { this.onMouseUp(e); });

        this.isDragging = false;
    }

    addCloseListener(lambdaOnClose) {
        this.lambdaOnClose = lambdaOnClose;
    }

    show(graph) {
        this.hXferBtnCopy.style.display = (navigator.clipboard) ? 'inline' : 'none';
        this.hXferBtnPaste.style.display = (navigator.clipboard) ? 'inline' : 'none';
        this.hXferDialog.showModal();
        this.hXferDialog.focus();
        this.graph = graph;
        this.hXferBtnRefresh.click();
    }

    onBtnCloseClick(event = null) {
        if (this.lambdaOnClose != null) {
            this.lambdaOnClose(event);
        }
        this.hXferDialog.close();
    }

    onBtnCopyClick() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.hXferText.value);
        }
    }

    onBtnRefreshClick() {
        this.hXferText.value = this.graph.toString();
    }

    onBtnPasteClick() {
        if (navigator.clipboard) {
            navigator.clipboard.readText().then( text => {
                this.hXferText.value = text;
            });
        }
    }

    onBtnInClick() {
        if (this.graph.fromString(this.hXferText.value)) {
            this.onBtnCloseClick('in');
        }
    }

    onBtnOutClick() {
        this.hXferBtnCopy.click();
        this.onBtnCloseClick('out');
    }

    onMouseDown(e) {
        if (e.target == this.hXferTitleBar) {
            this.isDragging = true;
            e.preventDefault();
        }
    }

    onMouseMove(e) {
        if (this.isDragging) {
            e.preventDefault();
        }
    }

    onMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            e.preventDefault();
        }
    }
}