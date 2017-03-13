<?php
  // API v0.2
  // - Author: Mihó Dániel
  // ----
  // - Configuration
  $ggg_api   = 'http://api.pathofexile.com/public-stash-tabs';
  $ninja_api = 'http://api.poe.ninja/api/data/getstats';
  $socket_hash = [
    'S' => 'R',
    'D' => 'G',
    'I' => 'B',
    'G' => 'W'
  ];

  // - QueryStrings
  $next_id   = isset($_GET['next-id']) ? $_GET['next-id'] : null;
  $item_name = isset($_GET['looking-for']) ? $_GET['looking-for'] : null;
  $league    = isset($_GET['league']) ? $_GET['league'] : 'Legacy';

  // - Other variables
  $found     = [];
  $patt      = '/\~(b\/o|price|c\/o)\s*((?:\d+)*(?:(?:\.|,)\d+)?)\s*([A-Za-z]+)\s*.*$/';

  // - This is actually not needed the way it's set up
  $output    = [
    'success' => false,
  ];

  // -- Get the newest ID if no id specified
  if ($next_id === null) {
    $ninja = json_decode(file_get_contents($ninja_api));

    // Overwrite the new ID
    $new_id = $ninja->nextChangeId;
  }

  // I've used fopen instead of file_get_contents because I tought I was smart.
  // This is totally useless because GGG gives you back all the JSON in 1 line.
  // But I've set it up this way so deal with it.
  // ----
  //
  // ¯\_(ツ)_/¯ Good luck, fren.

  $fp = fopen($ggg_api . '?id=' . $new_id, 'r');
  while (!feof($fp)) {

    $line = fgets($fp);
    $json = json_decode($line, true);

    foreach ($json['stashes'] as $stash) {
      // Filtering out the trash
      // - Check if the stash is public
      // - Then if the item is in the correct League
      // - Then the item name
      // - If all correct, add to found array
      if ($stash['public'] === true) {
        foreach ($stash['items'] as $item) {
          if ($item['league'] == $league) {
            if (
              strpos(
                strtolower($item['name']),
                strtolower($item_name)
              ) !== false
            ) {
              // Make changes to the JSON to make more sense...
              // - Create full name for the item without the localisation
              $item['longName'] = preg_replace(
                '/\<[a-zA-Z<:>]*\>/i',
                '',
                $item['name']
              ) . ' ' . $item['typeLine'];
              // - Create empty price array
              $item['price'] = [];

              // Add extra details because GGG can't
              $extra = [
                'ingameName'  => $stash['lastCharacterName'],
                'accountName' => $stash['accountName'],
                'stash'       => $stash['stash'],
                'timeStamp'   => date('H:i'),
              ];

              // ---- Sockets ----
              if ($item['sockets']) {
                $links         = [];
                $tmp           = [];
                $last_group    = 0;
                $cur_link_size = 0;
                $max_link_size = 0;

                for ($i=0; $i < count($item['sockets']); $i++) {
                  $socket = $item['sockets'][$i];

                  if ($socket['group'] === $last_group) {
                    $tmp[] = $socket_hash[ $socket['attr'] ];
                    $cur_link_size++;
                  } else {
                    $links[] = $tmp; // Add link group to links
                    $tmp = [ $socket_hash[ $socket['attr'] ] ];       // Reset link group

                    if ($cur_link_size > $max_link_size) {
                      $max_link_size = $cur_link_size;
                    }

                    $last_group = $socket['group'];
                    $cur_link_size = 0;
                  }
                }

                // Edgecase
                if (!empty($tmp)) {
                  $links[] = $tmp;

                  if (count($tmp) > $max_link_size) {
                    $max_link_size = count($tmp);
                  }
                }

                $extra['links'] = $links;
                $extra['maxLinkSize'] = $max_link_size;
              }

              // ---- Price ----
              // - If there is a price in the note, then set that
              // - Otherwise, if there is a price in the stashName, then set that
              $price_to_match = isset($item['note']) ? $item['note'] : $stash['stash'];

              // Match it against the pattern
              // - If matched then fill the price info
              // - Else just add the type to be offer
              preg_match($patt, $price_to_match, $match);
              if ($match) {
                $item['price']['type']     = strtolower($match[1]);
                $item['price']['amount']   = $match[2];
                $item['price']['currency'] = strtolower($match[3]);
              } else {
                $item['price']['type']     = 'Offer';
              }

              // Append stuff to the results
              $item['extra'] = $extra;
              $found[] = $item;
            };
          } // Correct league if
        } // Foreach Item
      } // Stash public if
    } // Foreach Stash

    // Output
    $output = [
      'nextChangeId' => $json['next_change_id'],
      'stashCount'   => count($json['stashes']),
      'found'        => $found,
      'success'      => true,
      // 'stashes'      => $json['stashes'], // For debugging purposes only
    ];

    echo json_encode($output);
  }
?>
