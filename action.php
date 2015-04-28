<?php
/**
 * DokuWiki Plugin metaeditor (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Böhler <dev@aboehler.at>
 */


// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();

class action_plugin_metaeditor extends DokuWiki_Action_Plugin { 
  
  // Load the helper plugin
  public function action_plugin_metaeditor() {
        
  }
   
  // Register our hooks 
  function register(&$controller) {
    $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handle_ajax_call_unknown');    
  }
  
  function handle_ajax_call_unknown($event, $param) {
    if($event->data != 'plugin_metaeditor') return;
    
    $event->preventDefault();
    $event->stopPropagation();
    global $INPUT;
    //global $auth; // FIXME: Add auth check for admin user here
    
    $action = trim($INPUT->post->str('q'));
    $pageid = trim($INPUT->post->str('r'));
    $key = $INPUT->post->arr('k');
    $data = array();
    $json = false;
    
    switch($action)
    {
      case 'getMeta':
        $data = $this->getMetaForPage($pageid);
        $json = true;
        break;
      case 'getMetaValue':
        $data = $this->getMetaValueForPage($pageid, $key);
        break;
    
    }
    
    //$data = $_SERVER['REMOTE_USER'];
    
    
    if($json)
    {
      //json library of DokuWiki
      require_once DOKU_INC . 'inc/JSON.php';
      $json = new JSON();
 
      //set content type
      header('Content-Type: application/json');
      echo $json->encode($data);
    }
    else
    {
      echo $data;
    }
  }
  
  function parseMetaTree($meta)
  {
    $out = array();
    foreach($meta as $k => $v)
    {
      $a = array();
      $a['text'] = $k;
      if(is_array($v))
      {
        $a['children'] = $this->parseMetaTree($v);
      }
      $out[] = $a;
    }
    return $out;
  }
  
  function getMetaForPage($pageid)
  {
    $cache = false;
    $meta = p_read_metadata($pageid, $cache);
    $out = $this->parseMetaTree($meta);
    return $out;
  }
  
  function getMetaValueForPage($pageid, $key)
  {
    $cache = false;
    $meta = p_read_metadata($pageid, $cache);
    foreach($key as $k)
    {
      $meta = $meta[$k];
    }
    return $meta;
  }
  
  
  
  
}
