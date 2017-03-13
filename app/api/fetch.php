<?php
  // - API v0.1
  // -- Helper function
  function load_file($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);

    $data = curl_exec($ch);
    curl_close($ch);

    return $data;
  }

  // -- Check if a last ID exists, create def vars
  $found = [];
  $next_id = isset($_GET['next-id']) ? $_GET['next-id'] : null;
  $stashes = null;
  $item_name = isset($_GET['looking-for']) ? $_GET['looking-for'] : null;
  $response = [
    'success' => false,
  ];

  // -- Get the newest ID if no id specified
  if ($next_id === null) {
    $ninja = json_decode(load_file('http://api.poe.ninja/api/data/getstats'));

    $new_id = $ninja->nextChangeId;
  }

  // -- Poll GGG... don't call the cop ty <3
  $data = json_decode(load_file('http://api.pathofexile.com/public-stash-tabs?id=' . $new_id), true);

  // -- Go through stash tabs
  foreach ($data['stashes'] as $stash) {
    if ($stash['public'] === true) {
      foreach ($stash['items'] as $item) {
        // If item names are correct, be happy
        if (
          strpos(
            strtolower($item['name']),
            strtolower($item_name)
          ) !== false
        ) {
          $extra = [
            'accountName' => $stash['accountName'],
            'stash' => $stash['stash']
          ];

          $item['extra'] = $extra;

          $found[] = $item;
        };
      }
    }
  }

  // -- Add stashes to response
  $output = [
    'next_change_id' => $data['next_change_id'],
    'found' => $found,
  ];
  $data['found'] = $found;
  $response['data'] = $output;
  // $response['data'] = $data;
  $response['success'] = true;

  echo json_encode($response);
?>
