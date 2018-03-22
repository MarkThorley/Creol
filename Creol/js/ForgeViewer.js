var viewerApp;

Autodesk.Viewing.UI.PropertyPanel.prototype.onPropertyClick = onPropertyClick

function launchViewer(urn) {
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken
    };
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Initializer(options, function onInitialized() {
        viewerApp = new Autodesk.Viewing.ViewingApplication('forgeViewer');
        var config = {
            extensions: ["Autodesk.InViewerSearch", "Autodesk.Viewing.ZoomWindow", "MyAwesomeExtension", "EventsTutorial", "ToolbarExtension"],
            inViewerSearchConfig : {
                uiEnabled: true,
                clientId: "adsk.forge.default",
                sessionId: "F969EB70-242F-11E6-BDF4-0800200C9A66",
                loadedModelTab: {
                    enabled: true,  // If false, the tab is hidden.
                    displayName: 'This View',
                    pageSize: 50
                },
                relatedItemsTab:{
                    enabled: true,  // If false, the tab is hidden.
                    displayName: 'This Item',
                    pageSize: 20
                }
            }

        };
        viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, config);
        viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

    });
}

function onDocumentLoadSuccess(doc) {
    // We could still make use of Document.getSubItemsWithProperties()
    // However, when using a ViewingApplication, we have access to the **bubble** attribute,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    var viewables = viewerApp.bubble.search({ 'type': 'geometry' });
    console.log(viewables);
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }
    // Choose any of the avialble viewables
    viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer, item) {
    // item loaded, any custom action?

    //Add menu buttons
    viewer.registerContextMenuCallback('MyExtensionName', function (menu, status) {
        //console.log(menu, status);
        if (status.hasSelected) {
            menu.push({
                title: 'Override color of selected element',
                target: function () {
                    const selSet = viewerApp.myCurrentViewer.getSelection();
                    viewerApp.myCurrentViewer.clearSelection();

                    const color = new THREE.Vector4(255 / 255, 0, 0, 1);
                    for (let i = 0; i < selSet.length; i++) {
                        viewerApp.myCurrentViewer.setThemingColor(selSet[i], color);
                    }
                },
            },
            {
                title: 'Clear selection and reset display',
                target: function () {
                    viewerApp.myCurrentViewer.clearSelection();
                    viewerApp.myCurrentViewer.clearThemingColors();
                    viewerApp.myCurrentViewer.showAll();
                    }
            });
        } else {
            menu.push({
                title: 'Reset colors',
                target: function () {
                    viewerApp.myCurrentViewer.clearThemingColors();
                    }
            },
            {
                title: 'Reset all display',
                target: function () {
                    viewerApp.myCurrentViewer.clearThemingColors();
                    viewerApp.myCurrentViewer.showAll();
                }
            }
            );
        }
    });
    //change direction of the zoom so its normal
    viewerApp.myCurrentViewer.setReverseZoomDirection(true);
}

function onItemLoadFail(errorCode) {
    console.error('onItemLoadFail() - errorCode:' + errorCode);
}

function getForgeToken(callback) {
    jQuery.ajax({
        url: '/api/forge/oauth/token',
        success: function (res) {
            callback(res.access_token, res.expires_in)
        }
    });
}

function getSubset(dbIds, name, value, callback) {
    //console.log("getSubset, dbIds.length before = " + dbIds.length)
    viewerApp.myCurrentViewer.model.getBulkProperties(dbIds, {
        propFilter: [name],
        ignoreHidden: true
    }, function (data) {
        var newDbIds = []
        for (var key in data) {
            var item = data[key]
            if (item.properties[0].displayValue === value) {
                newDbIds.push(item.dbId)
            }
        }
        //console.log("getSubset, dbIds.length after = " + newDbIds.length)
        callback(newDbIds)
    }, function (error) { })
}

function onPropertyClick(property, event) {
    //console.log(property.name + " = " + property.value)
    viewerApp.myCurrentViewer.search('"' + property.value + '"', function (dbIds) {
        const color = new THREE.Vector4( 255 / 255, 0, 0, 1 );
        getSubset(dbIds, property.name, property.value, function (dbIds) {
            for (let i = 0; i < dbIds.length; i++) {
                viewerApp.myCurrentViewer.setThemingColor(dbIds[i], color)
            };
            getSubset(dbIds, property.name, property.value, function (dbIds) {
                viewerApp.myCurrentViewer.isolate(dbIds)
            });

            var leafs;
            getAllLeafComponents(viewerApp.myCurrentViewer, function (dbIds) {
                console.log('Found ' + dbIds.length + ' leaf nodes');
                leafs = dbIds;
            })
            var finalDbIds = []
            for (var i = 0; i < dbIds.length; i++) {
                if (leafs.includes(dbIds[i])){
                    finalDbIds.push(dbIds[i])
                }
            }
            getSubset(dbIds, property.name, property.value, function (dbIds) {
                viewerApp.myCurrentViewer.select(finalDbIds, Autodesk.Viewing.SelectionMode.REGULAR);
            })
        })
    }, function (error) { }, [property.attributeName])
}

function getAllLeafComponents(viewer, callback) {
    var cbCount = 0; // count pending callbacks
    var components = []; // store the results
    var tree; // the instance tree

    function getLeafComponentsRec(parent) {
        cbCount++;
        if (tree.getChildCount(parent) != 0) {
            tree.enumNodeChildren(parent, function (children) {
                getLeafComponentsRec(children);
            }, false);
        } else {
            components.push(parent);
        }
        if (--cbCount == 0) callback(components);
    }
    viewer.getObjectTree(function (objectTree) {
        tree = objectTree;
        var allLeafComponents = getLeafComponentsRec(tree.getRootId());
    });
}
