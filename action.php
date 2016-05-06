<?php
/**
 * DokuWiki Plugin metaeditor (Action Component)
 *
 * Simple Meta Data Editor, heavily AJAX/jQuery based. 
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
  function register(Doku_Event_Handler $controller) {
    $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handle_ajax_call_unknown');    
  }
  
  function handle_ajax_call_unknown($event, $param) {
    if($event->data != 'plugin_metaeditor') return;
    
    $event->preventDefault();
    $event->stopPropagation();
    global $INPUT;
    
    $action = trim($INPUT->post->str('q'));
    $pageid = trim($INPUT->post->str('r'));
    $opts = $INPUT->post->arr('opts');
    $data = array();
    $useJson = true;
    
    if(!checkSecurityToken())
    {
        echo "CSRF Attack.";
        return;
    }
    
    $perm = auth_quickaclcheck($pageid);
    if($perm == AUTH_ADMIN)
    {
        switch($action)
        {
          case 'getMeta':
            $data = $this->getMetaForPage($pageid);
            break;
          case 'getMetaValue':
            $useJson = false;
            $data = $this->getMetaValueForPage($pageid, $opts['key']);
            break;
          case 'setMetaValue':
            $data = $this->setMetaValueForPage($pageid, $opts['key'], $opts['oldval'], $opts['newval']);
            break;
          case 'deleteMetaValue':
            $data = $this->deleteMetaValueForPage($pageid, $opts['key']);
            break;
          case 'createMetaArray':
            $data = $this->createMetaArrayForPage($pageid, $opts['key'], $opts['newval']);
            break;
          case 'createMetaValue':
            $data = $this->createMetaValueForPage($pageid, $opts['key'], $opts['newkey'], $opts['newval']);
            break;
        }
    }
    else
    {
      $data = array(false, "You are not an admin");
    }
    
    
    if($useJson)
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
  
  function createMetaArrayForPage($pageid, $key, $newval)
  {
    $cache = false;
    $meta = p_read_metadata($pageid, $cache);
    $m = &$meta;
    foreach($key as $k)
    {
      $m = &$m[$k];
    }
    $m[$newval] = array();
    if(p_save_metadata($pageid, $meta))
        return array(true, "Successfully saved: $newval");
    else
      return array(false, "Error saving value: $newval");  
  }
  
  function createMetaValueForPage($pageid, $key, $newkey, $newval)
  {
    $cache = false;
    $meta = p_read_metadata($pageid, $cache);
    $m = &$meta;
    foreach($key as $k)
    {
      $m = &$m[$k];
    }
    $m[$newkey] = $newval;
    if(p_save_metadata($pageid, $meta))
        return array(true, "Successfully saved: $newval");
    else
      return array(false, "Error saving value: $newval"); 
  }
  
  function setMetaValueForPage($pageid, $key, $oldval, $newval)
  {
    $cache = false;
    $meta = p_read_metadata($pageid, $cache);
    $m = &$meta;
    foreach($key as $k)
      $m = &$m[$k];
    if($m == $oldval)
    {
      $m = $newval;
      if(p_save_metadata($pageid, $meta))
        return array(true, "Successfully saved: $newval");
      else
        return array(false, "Error saving value: $newval");
    }
    else
    {
      return array(false, "Key has changed in the meantime, expected $oldval but got $m. Nothing was saved!");
    }
  
  }
  
  function deleteMetaValueForPage($pageid, $key)
  {
    $cache = false;
    $meta = p_read_metadata($pageid, $cache);
    $m = &$meta;
    for($i=0;$i<count($key);$i++)
    {
      if($i == count($key)-1)
        unset($m[$key[$i]]);
      else
        $m = &$m[$key[$i]];
    }
    if(p_save_metadata($pageid, $meta))
      return array(true, "Successfully deleted key: " . join(':', $key));
    else
      return array(false, "Error deleting key: " . join(':', $key));
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
        $a['li_attr'] = array('data-type' => 'folder');
      }
      else
      {
        $a['li_attr'] = array('data-type' => 'file');
        $a['icon'] = DOKU_URL."/lib/images/page.png";
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
