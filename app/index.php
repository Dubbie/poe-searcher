<?php
  // Ninjon!
  // - Grab leagues from GGG
  // -- We only want the currently active leagues, so we add the main type to the query
  $ggg_league_api = 'http://api.pathofexile.com/leagues';
  $leagues = json_decode(file_get_contents($ggg_league_api . '?type=main&compact=1'), true);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ninjon!</title>
  <link rel="stylesheet" type="text/css" href="css/master.css">
</head>
<body>
  <main id="main">
    <div class="jumbo">
      <h1 class="title">Ninjon!</h1>
      <p class="subtitle">Fast like a real ninja. Sometimes.</p>
    </div>
    <form id="search-form" class="control">
      <p class="control">
        <label for="looking-for" class="label">Item name</label>
        <input type="text" id="looking-for" class="input" name="looking-for" placeholder="Item's name goes here...">
      </p>
      <div class="control">
        <label for="league" class="label">League</label>
        <span class="select">
          <select name="league" id="league">
          <?php foreach($leagues as $league): ?>
            <option value="<?= $league['id']; ?>" <?= $league['id'] === 'Legacy' ? 'selected="selected"' : '' ?>><?= $league['id']; ?></option>
          <?php endforeach; ?>
          </select>
        </span>
      </div>
      <div class="form-group">
        <button id="search-btn" class="btn is-primary" type="submit">Search</button>
        <a href="./" class="btn">Reset</a>
      </div>
    </form>
    <hr>
    <p id="results-label" class="label">
      <span id="count">0</span> items found this session.
    </p>
    <div id="results" class="brodeal-container is-hidden">
      <!-- Bring the $$$ -->
    </div>

    <!-- To the top -->
    <a href="#main" id="top-btn" class="is-hidden">To the top</a>
  </main>
  <footer id="footer">
    <p>2017</p>
  </footer>

  <!-- FontAwesome -->
  <script src="https://use.fontawesome.com/2e1e27e45d.js" async></script>
  <!-- WebfontLoader -->
  <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js"></script>
  <script>
    WebFont.load({
      google: {
        families: ['Open Sans:300,400,700']
      }
    });
  </script>
  <script src="./js/mess.js"></script>
</body>
</html>
