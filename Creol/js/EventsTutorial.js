// Content for 'EventsTutorial.js'

function EventsTutorial(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
}

EventsTutorial.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
EventsTutorial.prototype.constructor = EventsTutorial;

Autodesk.Viewing.theExtensionManager.registerExtension('EventsTutorial', EventsTutorial);

// Event handler for Autodesk.Viewing.SELECTION_CHANGED_EVENT
EventsTutorial.prototype.onSelectionEvent = function (event) {
    var currSelectionCount = this.viewer.getSelectionCount();
    //var currSelection = this.viewer.getSelection();
    var domElem = document.getElementById('MySelectionValue');
    domElem.innerText = currSelectionCount;
};

EventsTutorial.prototype.load = function () {
    this.onSelectionBinded = this.onSelectionEvent.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionBinded);
    return true;
};

EventsTutorial.prototype.unload = function () {
    this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionBinded);
    this.onSelectionBinded = null;
    return true;
};