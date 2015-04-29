/* DOKUWIKI:include_once jstree.js */

jQuery(function()
{   

    var selectedPageId = null;
    var selectedNode = null;
    var selectedNodeValue = null;
    
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
    
    jQuery('#metaTree').on('changed.jstree', function (e, data) {
      var i, j, r;
      if(data.selected.length != 1)
        return;
      var node = data.instance.get_node(data.selected[0]);
      if(!data.instance.is_leaf(node))
        return;
      r = data.instance.get_path(data.selected[0]);
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
    // create the instance
    .jstree({
      core : {
        multiple: false
      },
      plugins: ["wholerow"]
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

