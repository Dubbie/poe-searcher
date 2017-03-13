var site = (function(){
  var holder     = document.getElementById('test');
  var lookingFor = document.getElementById('looking-for');
  var league     = document.getElementById('league');
  var results    = document.getElementById('results');
  var searchBtn  = document.getElementById('search-btn');
  var count      = document.getElementById('count');
  var topBtn     = document.getElementById('top-btn');

  // Non-DOM
  var nextId   = '';
  var allItems = [];

  function init() {
    bindUIActions();
  }

  function bindUIActions() {
    var form = document.getElementById('search-form');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Kicking it off
      getData();
    });

    // Scroll to top
    window.addEventListener('scroll', function (e) {
      var scrollTop =
        document.body.scrollTop ||
        document.documentElement.scrollTop;

      if (scrollTop > window.innerHeight) {
        if (topBtn.classList.contains('is-hidden')) {
          topBtn.classList.remove('is-hidden');
        }
      } else {
        if (!topBtn.classList.contains('is-hidden')) {
          topBtn.classList.add('is-hidden');
        }
      }
    });
  }

  function getData() {
    // Create the query string
    var qs = '?looking-for=' + lookingFor.value;

    // - Add the next id
    // - Add the league
    qs += nextId.length > 0 ? '&id=' + nextId : '';
    qs += '&league=' + league.options[league.selectedIndex].value;

    // If input is given, start search
    if (lookingFor.value.length > 0) {
      // Set the button to be disabled...
      searchBtn.setAttribute('disabled', 'disabled');
      searchBtn.textContent = 'Searching';

      // Start getting data
      // - CHANGE FETCH SOON BECAUSE YOU CAN'T ABORT THE THREAD............
      // - NICE WORK DUD
      req = fetch('api/fetch_v2.php' + qs)
        .then(function(response) {
          return response.json();
        }).then(function(response) {
          nextId = response.nextChangeId || '';

          // Start to grab the next chunk of data
          getData();

          // In the meantime
          // - Create the timestamp when new data was received
          showNew(response.found);
          updateCount();
      });
    } else {
      alert('Fill in the item name');
    }
  }

  function updateCount() {
    count.textContent = allItems.length;

    if (allItems.length > 0 && results.classList.contains('is-hidden')) {
      results.classList.remove('is-hidden');
    }
  }

  function showNew(items) {
    // Go through the new items
    items.forEach(function (item) {
      // Check if the item ID matches to any in the array
      // - ELTE Lineáris Keresés... LOL
      var found = false;
      var i     = 0;
      while (!found && i < allItems.length) {
        found = allItems[i].id === item.id;

        if (found) {
          // Check if the price changed or something
          console.log('Item was already in the array. (uuid: ' + item.id + ')');

          // Show the changes on the site
          allItems[i].element.classList.add('is-disabled'); // - Disable the old element
          var newItem = drawItem(item);      // - Create the new item element
          if (results.children.length > 0) { // - Add it to the site
            results.insertBefore(newItem, results.childNodes[0]);
          } else {
            results.appendChild(newItem);
          }
          item.element = newItem;            // - Add it to the item
          allItems[i] = item;                // - Replace item in the array

          break;
        }

        i++; // DON'T FORGET TO INCREMENT, haHAA
      }

      // New item confirmed
      if (found === false) {
        var newItem = drawItem(item);      // - Create the new item element
        if (results.children.length > 0) { // - Add it to the site
          results.insertBefore(newItem, results.childNodes[0]);
        } else {
          results.appendChild(newItem);
        }
        item.element = newItem;            // - Add it to the item
        allItems.push(item);               // - Add item to array
      }
    });
  }

  function drawItem(item) {
    if (item.sockets.length > 0) {
      // Create quick link demonstration
      var links = '';
      var sockets = document.createElement('div');
      sockets.classList.add('sockets');
      sockets.style.position = 'absolute';

      var socketsInner = document.createElement('div');
      socketsInner.classList.add('sockets-inner');
      socketsInner.style.position = 'relative';
      socketsInner.style.width = '94px';

      // Go through link groups
      var k = 0;
      for (var i = 0; i < item.extra.links.length; i++) {
        if (i > 0) {
          links += ' ';
        }

        // Go through each socket in the link group
        for (var j = 0; j < item.extra.links[i].length; j++) {
          if (j > 0) {
            links += '-';

            var sl = document.createElement('div');
            sl.classList.add('socketLink', 'socketLink' + (k - 1));
            socketsInner.appendChild(sl);
          }

          links += item.extra.links[i][j];

          var s = document.createElement('div');
          s.classList.add('socket', 'socket' + item.extra.links[i][j]);

          if (k == 2 || k == 3) {
            s.classList.add('socketRight');
          }

          socketsInner.appendChild(s);

          k++;
        }
      }

      // Add socketsInner to sockets
      sockets.appendChild(socketsInner);
    }

    // Item block
    var block = document.createElement('div');
    block.classList.add('brodeal');

    var picContainer = document.createElement('div');
    picContainer.classList.add('pic-container');

    var pic = document.createElement('img');
    pic.src = item.icon;

    // Add the picture to the container
    // Add the sockets ¯\_(ツ)_/¯
    picContainer.appendChild(pic);
    if (item.sockets.length > 0) {
      picContainer.appendChild(sockets);
    }

    var details = document.createElement('div');
    details.classList.add('details');

    var name = document.createElement('h2');
    name.textContent = item.name.replace(/\<[a-zA-Z<:>]*\>/i, '') + ' ' + item.typeLine;
    name.classList.add('name');
    details.appendChild(name);

    var itemLevel = document.createElement('div');
    itemLevel.classList.add('ilvl');

    var reqLvl = document.createElement('span');
    reqLvl.innerHTML = 'Level: <b>' + item.requirements[0].values[0][0] + '</b>, ilvl: <b>' + item.ilvl + '</b>';

    if (item.sockets.length > 0) {
      reqLvl.innerHTML += ', Links: <b>' + item.extra.maxLinkSize + 'L' + item.sockets.length + 'S</b>';
      reqLvl.innerHTML += ', Socket Details: <b>' + links + '</b>';
    }

    itemLevel.appendChild(reqLvl);
    details.appendChild(itemLevel);

    // Show Corrupted
    if (item.corrupted === true) {
      var corruptedContainer = document.createElement('div');
      corruptedContainer.classList.add('has-text-centered');

      var corrupted = document.createElement('span');
      corrupted.classList.add('tag', 'is-danger');
      corrupted.textContent = 'Corrupted';

      corruptedContainer.appendChild(corrupted);

      picContainer.appendChild(corruptedContainer);
    }

    // Show Enchantment
    if (item.enchantMods && item.enchantMods.length > 0) {
      var enchantMods = document.createElement('ul');
      enchantMods.classList.add('enchant-mods');

      item.enchantMods.forEach(function (mod) {
        var tmp = document.createElement('li');
        tmp.innerHTML = mod + '<span class="tag is-special-butterfly">Enchanted</span>';
        enchantMods.appendChild(tmp);
      });

      // Add Explicit mods to details
      details.appendChild(enchantMods);
    }

    // Show the item's mods, if it's identified
    if (item.identified === true) {
      // - Implicit, if it has
      if (item.implicitMods && item.implicitMods.length > 0) {
        var implicitMods = document.createElement('ul');
        implicitMods.classList.add('implicit-mods');

        item.implicitMods.forEach(function (mod) {
          var tmp = document.createElement('li');
          tmp.textContent = mod;
          implicitMods.appendChild(tmp);
        });

        // Add Explicit mods to details
        details.appendChild(implicitMods);
      }
      // - Explicit, if it has
      if (item.explicitMods && item.explicitMods.length > 0) {
        var explicitMods = document.createElement('ul');
        explicitMods.classList.add('explicit-mods');

        item.explicitMods.forEach(function (mod) {
          var tmp = document.createElement('li');
          tmp.textContent = mod;
          explicitMods.appendChild(tmp);
        });

        // Add Explicit mods to details
        details.appendChild(explicitMods);
      }
    } else {
      // Show the unidentified text
      var unid = document.createElement('span');
      unid.classList.add('unid');
      unid.textContent = 'Unidentified';

      // Add unid to details
      details.appendChild(unid);
    }

    // Add the price line
    var propList = document.createElement('ul');
    propList.classList.add('prop-list');

    // Check if price is set
    if (item.price.amount) {
      var priceAmount = document.createElement('li');
      priceAmount.innerHTML = '<span class="price-amount"><span class="currency currency-' + item.price.currency + '">' + item.price.amount + '×' + '</span></span>';
      propList.appendChild(priceAmount);
    }

    // Add the IGN
    var charName = document.createElement('li');
    charName.innerHTML = '<span class="icon is-small"><i class="fa fa-user"></i></span> ' + item.extra.ingameName;
    charName.classList.add('account-name');
    propList.appendChild(charName);

    // Add whisper button
    var wbContainer = document.createElement('li');
    var whisperBtn = document.createElement('button');
    whisperBtn.classList.add('btn', 'is-whisper');
    whisperBtn.setAttribute('type', 'button');
    whisperBtn.textContent = 'Whisper';
    whisperBtn.addEventListener('click', function () {
      // Create a popup with premade text
      var txt = '@' + item.extra.ingameName + ' Hey, I would like to buy your ' + item.longName;

      if (item.price.amount) {
        txt += ' for ' + item.price.amount + ' ' + item.price.currency;
      }

      txt += ' in ' + item.league + ' (Stash: ' + item.extra.stash + ', Position: Left ' + item.x + ', top ' + item.y + ')';

      prompt('Ethical popup so your clipboard does not get overwritten.', txt);
    });
    wbContainer.appendChild(whisperBtn);
    propList.appendChild(wbContainer);

    // Time
    var timeStamp = document.createElement('li');
    timeStamp.textContent = item.extra.timeStamp;
    timeStamp.classList.add('timestamp');
    propList.appendChild(timeStamp);

    // Add proplist to details
    details.appendChild(propList);

    block.appendChild(picContainer);
    block.appendChild(details);

    return block;
  }

  init();
})();
