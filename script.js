/* DOKUWIKI:include_once jstree.js */

jQuery(function()
{   

    var selectedPageId = null;
    var selectedNode = null;
    var selectedNodePath = null;
    var selectedNodeValue = null;
    var jqConfirmModal = null;
    
    jQuery('#event_save').click(function() {
      var newVal = jQuery('#event_value').val()
      jQuery.post(
        DOKU_BASE + 'lib/exe/ajax.php',
        {
          call: 'plugin_metaeditor',
          q: 'setMetaValue',
          r: selectedPageId,
          k: {
            key : selectedNode,
            oldval : selectedNodeValue,
            newval : newVal
          }        
        },
        function(data) {
          alert(data);
        }
      );
    
    });
    
    jqConfirmModal = jQuery(document.createElement('div'))
               .dialog({
                   autoOpen: false,
                   draggable: true,
                   //title: LANG.plugins.signpage.signpage,
                   title: "Confirmation",
                   resizable: true,
                   buttons: {
                       Yes: function() {
                         jQuery.post(
                           DOKU_BASE + 'lib/exe/ajax.php',
                           jqConfirmModal.data,
                           function(data) {
                             alert(data);
                           }
                         );
                         jQuery( this ).parent().hide("scale", {percentage: 0}, 750);
                       },
                       Cancel: function() {
                         jQuery( this ).parent().hide("scale", {percentage: 0}, 750);
                       }
                   }
               })
               .html(
                    '<div>Really proceed with the requested action? It cannot be undone.</div>'
                    )
               .parent()
               .attr('id','metaeditor__confirm')
               .hide()
               .appendTo('.dokuwiki:first');



    // attach event handlers
    jQuery('#metaeditor__confirm .ui-dialog-titlebar-close').click(function(){
      jqConfirmModal.hide("scale", {percentage: 0}, 750);
    });
    
    jQuery('#metaTree').on('changed.jstree', function (e, data) {
      var i, j, r;
      if(data.selected.length != 1)
        return;
      var node = data.instance.get_node(data.selected[0]);
      r = data.instance.get_path(data.selected[0]);
      selectedNodePath = r;
      if(!data.instance.is_leaf(node))
        return;
      selectedNode = r;
      jQuery.post(
        DOKU_BASE + 'lib/exe/ajax.php',
        {
          call: 'plugin_metaeditor', 
          q: 'getMetaValue',
          r: selectedPageId,
          k: r
        },
        function(data) {
          jQuery('#event_path').html(selectedNode.join(':'));
          jQuery('#event_value').val(data);
          selectedNodeValue = data;
        }
      );

    })
    .on('delete_node.jstree', function (e, data) {
    
      jQuery.post(
        DOKU_BASE + 'lib/exe/ajax.php',
        {
          call : 'plugin_metaeditor',
          q: 'deleteMetaValue',
          r: selectedPageId,
          k: {
            key: selectedNodePath,
            oldval: selectedNodeValue
          },
        },
        function(data) {
          alert(data[1]);
          if(!data[0])
          {
            jQuery.post(
              DOKU_BASE + 'lib/exe/ajax.php',
              {
                call: 'plugin_metaeditor', 
                q: 'getMeta',
                r: selectedPageId
              },
              function(data) {
                jQuery('#metaTree').jstree(true).settings.core.data = data;
                jQuery('#metaTree').jstree(true).refresh();
              }
            );
          }
        }
      );
    })
    .on('create_node.jstree', function (e, data) {
      alert('Create Node CB');
    })
    .on('rename_node.jstree', function (e, data) {
      alert('Rename Node CB');
    })
    .on('move_node.jstree', function (e, data) {
      alert('Move Node CB');
    })
    .on('copy_node.jstree', function (e, data) {
      alert('Copy node CB');
    })
    // create the instance
    .jstree({
      core : {
        multiple: false,
        check_callback: function (op, node, par, pos, more) {
          if(op === "delete_node") { return confirm("Are you sure you want to delete?"); }
        }
      },
      plugins: ["wholerow", "contextmenu"]
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

