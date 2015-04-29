<?php
/**
 * DokuWiki Plugin metaeditor (Admin Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

// must be run within Dokuwiki
if (!defined('DOKU_INC')) die();
require_once(DOKU_PLUGIN.'admin.php');

class admin_plugin_metaeditor_editor extends DokuWiki_Admin_Plugin {

    /**
     * Constructor. Load helper plugin
     */
    function admin_plugin_metaeditor_editor(){
        
    }

    function getMenuSort() { return 501; }
    function forAdminOnly() { return true; }

    function getMenuText($language) {
        return "Simple Persistent Meta Data Editor";
    }

    function handle() {
        if(!is_array($_REQUEST['d']) || !checkSecurityToken()) return;
        
    }
    
    function recurseTree($ns) {
        global $conf;
        $out = '';
        $list = array();
        $opts = array(
            'depth' => 1,
            'listfiles' => true,
            'listdirs'  => true,
            'pagesonly' => true,
            'firsthead' => true,
            'sneakyacl' => $conf['sneaky_index'],
        );
        search($list,$conf['datadir'],'search_universal',$opts,$ns);
        foreach($list as $item)
        {
          if($item['type'] == 'f' || $item['type'] == 'd')
          {
            if($item['type'] == 'd')
            {
              $out .= '<li>'.$item['id'];
              $out .= '<ul>'.$this->recurseTree(str_replace(':', '/', $item['id'])).'</ul>';
            }
            else
            {
              $out .= '<li data-jstree=\'{"icon":"'.DOKU_URL.'/lib/images/page.png"}\'>'.$item['id'];
            }
            $out .= '</li>';
          }
        }
        return $out;
    }

    function html() {

        echo '<table>';
        echo '<tr>';
        echo '<td><div id="fileTree">';
        echo '<ul>'.$this->recurseTree('/').'</ul>';
        echo '</div></td>';
        echo '<td><div id="metaTree"></div></td>';
        echo '<td><div id="event_path"></div><br><div id="event_result">';
        echo '<input type="text" id="event_value" value="..."><br>';
        echo '<input type="submit" id="event_save" value="Save">';
        echo '</div></td>';
    }

}

// vim:ts=4:sw=4:et:enc=utf-8:
