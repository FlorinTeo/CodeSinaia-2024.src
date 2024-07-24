document.addEventListener('DOMContentLoaded', () => {
    const draggable = document.getElementById('draggableContainer');
    const menu = document.getElementById('hCtxMenuConsole');
    let isDragging = false;
    let startX;
    
    draggable.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX; // Capture the initial X position
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const dragDistance = e.clientX - startX; // Calculate drag distance
        if (dragDistance < -50) { // Trigger menu if dragged left by more than 50px
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
});
