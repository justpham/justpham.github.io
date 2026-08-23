// The journey: one stop per entry, in the order lived. A line is drawn
// between each consecutive pair (deduped below so a there-and-back, e.g.
// Corvallis to Austin and back, still only draws one line), so to change
// the connections just reorder this list; to add a stop, insert a new
// entry where it belongs in time. The same place can appear more than
// once — reuse the same `name`/`coords` and it'll still only draw one
// marker there. `name` is also what's shown in the marker's hover
// tooltip (there's no persistent on-map label — see markerStyle below).
// Every stop/line renders in one consistent color — see
// VISITED_COUNTRIES below for the separate visited/not-visited
// distinction (that's about countries, not this personal journey).
// Corvallis (Oregon State, continuously Sep 2021 - Dec 2026) is home base
// between internships, so it reappears as the journey returns there after
// each one — except between two back-to-back internships (Qumulo straight
// into the second AMD stint, then straight into Skydio) with no return
// home in between.
const journey = [
  { name: 'Honolulu, HI', coords: [21.3099, -157.8581] },
  // Portland, Wilsonville (Avocor), and Hillsboro (Intel) are all a short
  // drive apart in the same metro area — merged into one stop rather than
  // three separate markers a few miles apart on the map.
  { name: 'Portland Metro Area, OR', coords: [45.5152, -122.6784] },
  { name: 'Corvallis, OR', coords: [44.5646, -123.2620] },
  { name: 'Portland Metro Area, OR', coords: [45.5152, -122.6784] },
  { name: 'Corvallis, OR', coords: [44.5646, -123.2620] },
  { name: 'Austin, TX', coords: [30.2672, -97.7431] },
  { name: 'Corvallis, OR', coords: [44.5646, -123.2620] },
  { name: 'Seattle, WA', coords: [47.6062, -122.3321] },
  { name: 'Austin, TX', coords: [30.2672, -97.7431] },
  { name: 'San Francisco Bay Area, CA', coords: [37.5630, -122.3255] },
];

// Countries visited (highlighted), by ISO 3166-1 alpha-2 code — everything
// else on the map renders in the plain "not visited" region style. Puerto
// Rico (PR) is its own path in this map data despite being a US territory,
// so it's listed alongside US rather than assumed covered by it.
const VISITED_COUNTRIES = ['VN', 'US', 'CA', 'PR', 'JP', 'GR', 'IT', 'TR'];

// Roughly centers the view on the cluster of stops (weighted toward
// Oregon, since the Portland metro area and Corvallis are both there)
// rather than opening on a whole-world view with the whole journey
// squeezed into one corner. Honolulu still fits in frame at this
// scale/center, off to the southwest of the mainland cluster.
const INITIAL_FOCUS = { coords: [41.5, -105], scale: 3.1 };

// Site palette (see DESIGN.md's Color section) — hardcoded here since
// jsVectorMap sets these as plain SVG attributes, not CSS.
const COLOR_LAVENDER = '#7c5cbf';
const COLOR_LAVENDER_PALE = '#c3b8e8';
const COLOR_LAVENDER_CLASSIC = '#b497d6';
const COLOR_DARKEST = '#22223b';

document.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('career-map');
  if (!mapEl || typeof jsVectorMap === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dedupe stops by name, in first-appearance order, for the marker list.
  const uniqueStops = [...new Map(journey.map((stop) => [stop.name, stop])).values()];
  const markers = uniqueStops.map((stop) => ({ name: stop.name, coords: stop.coords }));

  // One line per undirected pair of consecutive stops — a there-and-back
  // (e.g. Corvallis to Austin, then later Austin back to Corvallis) is the
  // same connection drawn once, not two overlapping lines.
  const lines = [];
  const seenEdges = new Set();
  for (let i = 0; i < journey.length - 1; i++) {
    const from = journey[i];
    const to = journey[i + 1];
    const edgeKey = [from.name, to.name].sort().join(' <-> ');

    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);

    lines.push({ from: from.name, to: to.name });
  }

  const map = new jsVectorMap({
    selector: '#career-map',
    map: 'world',
    zoomButtons: true,
    zoomOnScroll: false,
    zoomAnimate: !reduceMotion,
    zoomMax: 20,
    focusOn: { ...INITIAL_FOCUS, animate: false },
    backgroundColor: 'transparent',
    // "Not visited" is the baseline region look; VISITED_COUNTRIES gets
    // the stronger `selected` fill instead (see `selectedRegions` below —
    // that's what actually applies this state, not a per-region config).
    regionStyle: {
      initial: { fill: COLOR_LAVENDER_PALE, fillOpacity: 0.35, stroke: '#9a8c98', strokeWidth: 0.5 },
      hover: { fillOpacity: 0.55 },
      selected: { fill: COLOR_LAVENDER, fillOpacity: 0.55, stroke: COLOR_LAVENDER_CLASSIC, strokeWidth: 0.75 },
      selectedHover: { fillOpacity: 0.8 },
    },
    selectedRegions: VISITED_COUNTRIES,
    // No persistent on-map label (see `labels` below) — a single fixed
    // color for every marker, since visited/not-visited lives on the
    // country fills instead.
    markerStyle: {
      initial: { fill: COLOR_DARKEST, stroke: '#f2e9e4', strokeWidth: 2, r: 6 },
      hover: { fill: COLOR_LAVENDER, cursor: 'pointer' },
    },
    lineStyle: {
      stroke: COLOR_LAVENDER,
      strokeDasharray: '7 5',
      strokeWidth: 2,
      strokeLinecap: 'round',
      curvature: 0.15,
    },
    markers,
    lines,
  });

  // Not one of jsVectorMap's own controls — a plain button appended next
  // to its +/- zoom buttons (styled to match in css/style.css) that
  // returns to the initial framing.
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'career-map-reset-btn';
  resetBtn.textContent = '↺';
  resetBtn.setAttribute('aria-label', 'Reset map view');
  resetBtn.title = 'Reset map view';
  resetBtn.addEventListener('click', () => {
    if (map._tooltip) map._tooltip.hide();
    map.setFocus({ ...INITIAL_FOCUS, animate: !reduceMotion });
  });
  mapEl.appendChild(resetBtn);

  // Trackpad pinch (and ctrl+wheel) zooms the map; a plain two-finger
  // scroll is left alone so it still scrolls the page. Browsers report a
  // pinch gesture as a wheel event with ctrlKey set — this is the same
  // signal jsVectorMap's own (page-scroll-trapping) zoomOnScroll option
  // would use, applied only to that gesture instead of every scroll.
  mapEl.addEventListener('wheel', (event) => {
    if (!event.ctrlKey) return;
    event.preventDefault();

    if (map._tooltip) {
      map._tooltip.hide();
    }

    const rect = mapEl.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const deltaY = (((event.deltaY || -event.wheelDelta || event.detail) >> 10) || 1) * 75;
    const zoomStep = Math.pow(1 + (map.params.zoomOnScrollSpeed / 1000), -1.5 * deltaY);

    map._setScale(map.scale * zoomStep, offsetX, offsetY);
  }, { passive: false });
});
