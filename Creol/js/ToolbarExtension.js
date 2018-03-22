// Content for 'ToolbarExtension.js'

function ToolbarExtension(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
}

ToolbarExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ToolbarExtension.prototype.constructor = ToolbarExtension;

Autodesk.Viewing.theExtensionManager.registerExtension('ToolbarExtension', ToolbarExtension);

ToolbarExtension.prototype.load = function () {

    if (this.viewer.toolbar) {
        // Toolbar is already available, create the UI
        this.createUI();
    } else {
        // Toolbar hasn't been created yet, wait until we get notification of its creation
        this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
        this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    }

    return true;
};

ToolbarExtension.prototype.onToolbarCreated = function () {
    this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    this.onToolbarCreatedBinded = null;
    this.createUI();
};

ToolbarExtension.prototype.createUI = function () {
    // alert('TODO: Create Toolbar!');

    var viewer = this.viewer;

    // Button 1
    var button1 = new Autodesk.Viewing.UI.Button('my-export-data-button');
    button1.onClick = function (e) {
        var instanceTree = viewer.model.getData().instanceTree;
        var allDbIds = Object.keys(instanceTree.nodeAccess.dbIdToIndex);
        console.log(allDbIds);
        download('test.json', allDbIds);

        //for (var i = 0; i < allDbIds.length; i++) {
        //console.log(viewer.getProperties(allDbIds[0]))
        //viewer.model.getProperties([allDbIds[0]], function (props) { console.log(props) } )
        //console.log(viewer.getProperties([allDbIds[0]]))
        console.log("true");

    };

    // Icon 1
    var className = 'glyphicon-cloud-upload';
    button1.icon.className = className;

    button1.addClass('my-export-data-button');
    button1.setToolTip('Export Creol Data');
    //button1.setIcon(className);
    button1.icon.classList.add('myicon');

    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-view-toolbar');
    this.subToolbar.addControl(button1);

    viewer.toolbar.addControl(this.subToolbar);
};

ToolbarExtension.prototype.unload = function () {
    this.viewer.toolbar.removeControl(this.subToolbar);
    return true;
};

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}