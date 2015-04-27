/* DOKUWIKI:include_once jstree.js */

jQuery(function()
{      
    jQuery('#metaTree').on('changed.jstree', function (e, data) {
      var i, j, r = [];
      for(i = 0, j = data.selected.length; i < j; i++) {
        r.push(data.instance.get_node(data.selected[i]).text);
      }
      jQuery('#event_result').html('Selected: ' + r.join(', '));
    })
    // create the instance
    .jstree({
      core : {
        multiple: false
      }
    
    });
});

