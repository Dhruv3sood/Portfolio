(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */

  var toggle = document.querySelector('[data-theme-toggle]');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
  }

  function syncToggle() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
      syncToggle();
    });
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', syncToggle);
    syncToggle();
  }

  /* ---------- Time graph ----------
     Built from every element carrying data-start / data-end (YYYY-MM, or
     "present") and data-lane, so the chart always matches the page content. */

  var chart = document.querySelector('[data-timegraph]');
  var sources = Array.prototype.slice.call(document.querySelectorAll('[data-start][data-lane]'));
  if (!chart || !sources.length) return;

  var LANES = ['Work', 'Research', 'Education'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DURATION = 2600;
  var HINT = 'Select a bar for details';

  var now = new Date();
  var axisStart = new Date(2023, 6, 1);
  var axisEnd = new Date(Math.max(now.getFullYear() + 1, 2027), 0, 1);
  var span = axisEnd - axisStart;

  function clamp(v, lo, hi) {
    return Math.min(Math.max(v, lo), hi);
  }

  function pos(date) {
    return clamp((date - axisStart) / span, 0, 1);
  }

  // "2025-08" → first day of that month, or of the next month when it closes a range.
  function parseMonth(value, closing) {
    var parts = value.split('-');
    return new Date(+parts[0], +parts[1] - 1 + (closing ? 1 : 0), 1);
  }

  function fmt(date) {
    return MONTHS[date.getMonth()] + ' ' + date.getFullYear();
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  var items = sources.map(function (source) {
    var current = source.dataset.end === 'present';
    var start = parseMonth(source.dataset.start, false);
    var end = current ? now : parseMonth(source.dataset.end, true);
    var range = fmt(start) + ' – ' + (current ? 'Present' : fmt(parseMonth(source.dataset.end, false)));
    return {
      id: source.id,
      lane: source.dataset.lane,
      label: source.dataset.label,
      full: source.dataset.labelFull,
      summary: [source.dataset.labelFull || source.dataset.label, source.dataset.role, range, source.dataset.note].filter(Boolean).join(' · '),
      start: start,
      current: current,
      clipped: start < axisStart,
      x0: pos(start),
      x1: pos(end)
    };
  });

  /* Build */

  var body = el('div', 'tg-body');
  var grid = el('div', 'tg-grid');
  var cursor = el('div', 'tg-cursor');
  var playhead = el('div', 'tg-playhead');
  var chip = el('div', 'tg-chip');
  grid.setAttribute('aria-hidden', 'true');
  cursor.setAttribute('aria-hidden', 'true');
  cursor.appendChild(playhead);
  cursor.appendChild(chip);
  body.appendChild(grid);

  for (var year = axisStart.getFullYear(); year < axisEnd.getFullYear(); year++) {
    for (var quarter = 0; quarter < 4; quarter++) {
      var tickDate = new Date(year, quarter * 3, 1);
      if (tickDate < axisStart) continue;
      var tick = el('div', quarter === 0 ? 'tg-tick is-year' : 'tg-tick');
      tick.style.left = pos(tickDate) * 100 + '%';
      grid.appendChild(tick);
      if (quarter === 0) {
        var yearLabel = el('div', 'tg-year', String(year));
        yearLabel.style.left = tick.style.left;
        grid.appendChild(yearLabel);
      }
    }
  }

  var foot = el('div', 'tg-foot');
  var readout = el('span', 'tg-readout', HINT);
  var replay = el('button', 'tg-replay', 'Replay');
  replay.type = 'button';
  foot.appendChild(readout);
  foot.appendChild(replay);

  var lanes = [];

  LANES.forEach(function (name) {
    var laneItems = items.filter(function (item) {
      return item.lane === name;
    });
    if (!laneItems.length) return;
    // Current roles are placed first, so they claim the top rows.
    laneItems.sort(function (a, b) {
      return b.current - a.current || a.x0 - b.x0;
    });

    var lane = el('div', 'tg-lane');
    var track = el('div', 'tg-track');
    lane.appendChild(el('span', 'tg-lane-name', name));
    lane.appendChild(track);

    laneItems.forEach(function (item) {
      var link = el('a', 'tg-item');
      link.href = '#' + item.id;
      link.setAttribute('aria-label', item.summary);
      link.style.left = item.x0 * 100 + '%';
      link.style.width = (item.x1 - item.x0) * 100 + '%';
      if (item.current) link.classList.add('is-current');
      if (item.clipped) link.classList.add('is-clipped');

      var label = el('span', 'tg-label');
      var name = el('span', 'tg-name', item.label);
      label.appendChild(name);
      if (item.clipped) label.appendChild(el('span', 'tg-note', 'since ' + fmt(item.start)));
      link.appendChild(label);
      link.appendChild(el('span', 'tg-fill'));

      function show() {
        readout.textContent = item.summary;
      }
      function hide() {
        readout.textContent = HINT;
      }
      link.addEventListener('mouseenter', show);
      link.addEventListener('focus', show);
      link.addEventListener('mouseleave', hide);
      link.addEventListener('blur', hide);

      item.node = link;
      item.labelNode = label;
      item.nameNode = name;
      track.appendChild(link);
    });

    lanes.push({ items: laneItems, track: track });
    body.appendChild(lane);
  });

  body.appendChild(cursor);
  chart.appendChild(body);
  chart.appendChild(foot);
  chart.setAttribute('role', 'group');
  chart.setAttribute('aria-label', 'Career timeline from ' + fmt(axisStart) + ' to now');

  /* Layout: each item takes the first row where its bar and label are clear of
     its neighbours. A label sits at the bar's start, or ends at the bar's end
     when it would otherwise cross the "now" line. Items with a longer full name
     use it when it costs no extra row, or whenever the chart is wide. */

  var GAP = 8;
  var tNow = pos(now);

  function place(item, text, width) {
    item.nameNode.textContent = text;
    var left = item.x0 * width;
    var right = item.x1 * width;
    var labelWidth = item.labelNode.offsetWidth;
    var limit = item.current ? right : tNow * width - GAP;
    var fitsAtStart = left + labelWidth <= limit;
    var fitsAtEnd = right - labelWidth >= 0;
    var atEnd = !fitsAtStart && fitsAtEnd;
    return {
      text: text,
      fits: fitsAtStart || fitsAtEnd,
      atEnd: atEnd,
      from: atEnd ? Math.min(left, right - labelWidth) : left,
      to: atEnd ? right : Math.max(right, left + labelWidth)
    };
  }

  function freeRow(rows, spot) {
    var row = 0;
    while (rows[row] && rows[row].some(function (other) {
      return other.from < spot.to + GAP && spot.from < other.to + GAP;
    })) row++;
    return row;
  }

  function layout() {
    var width = cursor.clientWidth;
    var roomy = width >= 600;
    lanes.forEach(function (lane) {
      var rows = [];
      lane.items.forEach(function (item) {
        var spot = place(item, item.label, width);
        var row = freeRow(rows, spot);
        if (item.full) {
          var fullSpot = place(item, item.full, width);
          var fullRow = freeRow(rows, fullSpot);
          if (fullSpot.fits && (fullRow === row || roomy)) {
            spot = fullSpot;
            row = fullRow;
          }
        }
        item.nameNode.textContent = spot.text;
        item.node.classList.toggle('is-end', spot.atEnd);
        item.node.style.setProperty('--row', row);
        (rows[row] = rows[row] || []).push(spot);
      });
      lane.track.style.setProperty('--rows', rows.length);
    });
  }

  /* Animation: the playhead sweeps from the axis start to today and bars fill as it passes. */

  var progress = 0;
  var frame = null;

  function render(t) {
    progress = t;
    playhead.style.setProperty('--t', t);
    items.forEach(function (item) {
      var length = item.x1 - item.x0;
      item.node.style.setProperty('--p', length > 0 ? clamp((t - item.x0) / length, 0, 1) : 0);
      item.node.classList.toggle('is-on', t > item.x0 || (item.clipped && t > 0));
    });
    chip.textContent = t >= tNow ? 'Now' : fmt(new Date(axisStart.getTime() + t * span));
    var plotWidth = cursor.clientWidth;
    var chipWidth = chip.offsetWidth;
    chip.style.transform = 'translateX(' + clamp(t * plotWidth - chipWidth / 2, 0, plotWidth - chipWidth) + 'px)';
  }

  function finish() {
    render(tNow);
    chart.classList.add('is-done');
  }

  function play() {
    if (frame) cancelAnimationFrame(frame);
    chart.classList.remove('is-done');
    var began = null;
    function step(time) {
      if (began === null) began = time;
      var u = clamp((time - began) / DURATION, 0, 1);
      var eased = 0.5 - Math.cos(Math.PI * u) / 2;
      if (u < 1) {
        render(eased * tNow);
        frame = requestAnimationFrame(step);
      } else {
        frame = null;
        finish();
      }
    }
    frame = requestAnimationFrame(step);
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  layout();
  if (reducedMotion || !('IntersectionObserver' in window)) {
    finish();
    replay.hidden = true;
  } else {
    render(0);
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        play();
      }
    }, { threshold: 0.4 });
    observer.observe(chart);
  }

  replay.addEventListener('click', play);

  window.addEventListener('resize', function () {
    layout();
    if (!frame) render(progress);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      layout();
      if (!frame) render(progress);
    });
  }
})();
