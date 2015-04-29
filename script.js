/* DOKUWIKI:include_once jstree.js */

jQuery(function()
{   

    var selectedPageId = null;
    var selectedNode = null;
    var selectedNodePath = null;
    var selectedNodeValue = null;
    
    jqModalManager.init();
    
    jQuery('#event_save').click(function() {
      var newVal = jQuery('#event_value').val()
      jQuery.post(
        DOKU_BASE + 'lib/exe/ajax.php',
        {
          call: 'plugin_metaeditor',
          q: 'setMetaValue',
          r: selectedPageId,
          opts: {
            key : selectedNode,
            oldval : selectedNodeValue,
            newval : newVal
          }        
        },
        function(data) {
          jqModalManager.msg = data[1];
          jqModalManager.showInfoDialog();
          selectedNodeValue = newVal;
        }
      );
    
    });
    
    function refreshMetaTree() {
      jQuery.post(
          DOKU_BASE + 'lib/exe/ajax.php',
          {
            call: 'plugin_metaeditor', 
            q: 'getMeta',
            r: selectedPageId
          },
          function(data) {
            jQuery('#event_path').html('');
            jQuery('#event_value').val('...');
            selectedNodePath = null;
            selectedNodeValue = null;
            selectedNode = null;
            jQuery('#metaTree').jstree(true).settings.core.data = data;
            jQuery('#metaTree').jstree(true).refresh();
          }
        );
    
    }
    
    
    function customMenu(node) {
    // The default set of all items
    var items = {
        /*renameItem: { // The "rename" menu item
            label: "Rename",
            action: function () {
              alert('rename called');
            }
        },*/
        deleteItem: { // The "delete" menu item
            label: "Delete",
            action: function () {
              jqModalManager.data =
              {
                call : 'plugin_metaeditor',
                q: 'deleteMetaValue',
                r: selectedPageId,
                opts: {
                   key: selectedNodePath,
                   oldval: selectedNodeValue
                }
              }
              jqModalManager.msg = "Do you really want to delete the selected node?";
              jqModalManager.completeCb = function(data) {
                  jqModalManager.msg = data[1];
                  jqModalManager.showInfoDialog();
                  refreshMetaTree();              
              }
              jqModalManager.showConfirmDialog();
            }
        },
        createFolderItem: { // The "Create folder" menu item
            label: "Create Folder",
            action: function (data) {
              var tree = jQuery("#metaTree").jstree(true);
              var nodePath = tree.get_path(node);
              if(node.li_attr['data-type'] == 'file')
              {
                var id = tree.get_parent(node);
                var parentNode = tree.get_node(id);
                nodePath = tree.get_path(parentNode);
              }
              jqModalManager.data = 
              {
                call : 'plugin_metaeditor',
                q: 'createMetaArray',
                r: selectedPageId,
                opts: {
                  key : nodePath,
                  newval: null
                }
              }
              jqModalManager.msg = "Create new folder";
              jqModalManager.completeCb = function(data) {
                jqModalManager.msg = data[1];
                jqModalManager.showInfoDialog();
                refreshMetaTree();
              }
              jqModalManager.createValue = false;
              jqModalManager.showCreateDialog();
            }
        },
        createItem: { // The "Create" menu item
            label: "Create Property",
            action: function () {
              var tree = jQuery("#metaTree").jstree(true);
              var nodePath = tree.get_path(node);
              if(node.li_attr['data-type'] == 'file')
              {
                var id = tree.get_parent(node);
                var parentNode = tree.get_node(id);
                nodePath = tree.get_path(parentNode);
              }
              jqModalManager.data = 
              {
                call : 'plugin_metaeditor',
                q: 'createMetaValue',
                r: selectedPageId,
                opts: {
                  key : nodePath,
                  newkey: null,
                  newval: null
                }
              }
              jqModalManager.msg = "Create new item";
              jqModalManager.completeCb = function(data) {
                jqModalManager.msg = data[1];
                jqModalManager.showInfoDialog();
                refreshMetaTree();
              }
              jqModalManager.createValue = true;
              jqModalManager.showCreateDialog();
            }
        }
      };

    return items;
    }
    
    jQuery('#metaTree').on('changed.jstree', function (e, data) {
      var i, j, r;
      if(data.selected.length != 1)
        return;
      var node = data.instance.get_node(data.selected[0]);
      r = data.instance.get_path(data.selected[0]);
      selectedNodePath = r;
      if(node.li_attr['data-type'] == 'folder')
        return;
      //if(!data.instance.is_leaf(node))
      //  return;
      selectedNode = r;
      jQuery.post(
        DOKU_BASE + 'lib/exe/ajax.php',
        {
          call: 'plugin_metaeditor', 
          q: 'getMetaValue',
          r: selectedPageId,
          opts: {
            key: r
          }
        },
        function(data) {
          jQuery('#event_path').html(selectedNode.join(':'));
          jQuery('#event_value').val(data);
          selectedNodeValue = data;
        }
      );

    })
    // create the instance
    .jstree({
      core : {
        multiple: false,
      },
      plugins: ["wholerow", "contextmenu"],
      contextmenu: { items: customMenu }
    });


    jQuery('#fileTree').on('changed.jstree', function (e, data) {
      var i, j, r;
      if(data.selected.length != 1)
        return;
      var node = data.instance.get_node(data.selected[0]);
      if(!data.instance.is_leaf(node))
        return;
      r = node.text;
      selectedPageId = r;      
      jQuery.post(
        DOKU_BASE + 'lib/exe/ajax.php',
        {
          call: 'plugin_metaeditor', 
          q: 'getMeta',
          r: r
        },
        function(data) {
          jQuery('#metaTree').jstree(true).settings.core.data = data;
          jQuery('#metaTree').jstree(true).refresh();
        }
      );
      
    })
    // create the instance
    .jstree({
      core : {
        multiple: false
      },
      plugins: ["wholerow"]
    
    });
    
    
});

var jqModalManager = {
    jqConfirmModal : null,
    jqCreateModal : null,
    jqInfoModal : null,
    completeCb : null,
    data : null,
    msg : null,
    createValue: false,
    
    
    init : function()
    {
      
    },
    
    showCreateDialog : function() {
       jqModalManager.jqCreateModal = jQuery(document.createElement('div'))
       .dialog({
           autoOpen: false,
           draggable: true,
           title: "Create",
           resizable: true,
           buttons: {
               Create: function() {
                 if(jqModalManager.createValue)
                 {
                   jqModalManager.data.opts.newkey = jQuery("#metaeditor__createInput").val();
                   jqModalManager.data.opts.newval = jQuery("#metaeditor__createValue").val();
                 }
                 else
                 {
                   jqModalManager.data.opts.newval = jQuery("#metaeditor__createInput").val();                 
                 }
                 jQuery.post(
                   DOKU_BASE + 'lib/exe/ajax.php',
                   jqModalManager.data,
                   function(data) {
                     jqModalManager.completeCb(data);
                   }
                 );
                 jqModalManager.hideCreateDialog();
               },
               Cancel: function() {
                 jqModalManager.hideCreateDialog();
               }
           }
       })
       .html(
            '<div>' + jqModalManager.msg + '</div>' + 
            '<div>Name <input type="text" id="metaeditor__createInput"></div>' +
            (jqModalManager.createValue ? '<div>Value <input type="text" id="metaeditor__createValue"></div>' : '')
            )
       .parent()
       .attr('id','metaeditor__create')
       .show()
       .appendTo('.dokuwiki:first');
       
       jQuery('#metaeditor__createInput').focus();
       
        // attach event handlers
        jQuery('#metaeditor__create .ui-dialog-titlebar-close').click(function(){
          jqModalManager.hideCreateDialog();
        });    
    
    
    },
    
    showInfoDialog : function() {
       jqModalManager.jqInfoModal = jQuery(document.createElement('div'))
       .dialog({
           autoOpen: false,
           draggable: true,
           title: "Info",
           resizable: true,         
           buttons: {
               OK: function() {
                 jqModalManager.hideInfoDialog();
               }
           }
       })
       .html(
            '<div>' + jqModalManager.msg + '</div>'
            )
       .parent()
       .attr('id','metaeditor__info')
       .show()
       .appendTo('.dokuwiki:first');
       
           // attach event handlers
        jQuery('#metaeditor__info .ui-dialog-titlebar-close').click(function(){
          jqModalManager.hideInfoDialog();
        });
    },   
    
    showConfirmDialog : function() {
       jqModalManager.jqConfirmModal = jQuery(document.createElement('div'))
       .dialog({
           autoOpen: false,
           draggable: true,
           title: "Confirmation",
           resizable: true,
           buttons: {
               Yes: function() {
                 jQuery.post(
                   DOKU_BASE + 'lib/exe/ajax.php',
                   jqModalManager.data,
                   function(data) {
                     jqModalManager.completeCb(data);
                   }
                 );
                 jqModalManager.hideConfirmDialog();
               },
               Cancel: function() {
                 jqModalManager.hideConfirmDialog();
               }
           }
       })
       .html(
            '<div>' + jqModalManager.msg + '</div>'
            )
       .parent()
       .attr('id','metaeditor__confirm')
       .show()
       .appendTo('.dokuwiki:first');
       
           // attach event handlers
        jQuery('#metaeditor__confirm .ui-dialog-titlebar-close').click(function(){
          jqModalManager.hideConfirmDialog();
        });
    },
    
    hideConfirmDialog : function() {
        jqModalManager.jqConfirmModal.empty();
        jqModalManager.jqConfirmModal.remove();
        jqModalManager.jqConfirmModal = null;
    },
    
    hideCreateDialog : function() {
        jqModalManager.jqCreateModal.empty();
        jqModalManager.jqCreateModal.remove();
        jqModalManager.jqCreateModal = null;
    },
    
    hideInfoDialog : function() {
        jqModalManager.jqInfoModal.empty();
        jqModalManager.jqInfoModal.remove();
        jqModalManager.jqInfoModal = null;
    }
    

}

