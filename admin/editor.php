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

        //p_save_metadata($id, $meta);
        
    }
    
    function recurseTree($var){
      //$out = '<li>';
      foreach($var as $k => $v){
        $out .= '<li>'.$k;
        if(is_array($v)){
          $out .= '<ul>'.$this->recurseTree($v).'</ul>';
        }
        $out .= '</li>';
      }  
      return $out; //.'</li>';
    }


    function html() {
        $cache = false;
        $id = 'start';
        $meta = p_read_metadata($id, $cache);
        echo '<div id="metaTree">';
        echo '<ul>'.$this->recurseTree($meta).'</ul>';
        echo '</div>';
        echo '<div id="event_result"></div>';
        print_r($meta);
    }

}

// vim:ts=4:sw=4:et:enc=utf-8:
