/* DOKUWIKI:include_once jstree.js */

jQuery(function()
{   

    var selectedPageId = null;
    var selectedNode = null;
    
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
          jQuery('#event_result').html(data);
        }
      );

    })
    // create the instance
    .jstree({
      core : {
        multiple: false
      }
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
      }
    
    });
    
    
});

