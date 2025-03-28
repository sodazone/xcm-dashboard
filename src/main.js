import "./style.css";

import { setupSeriesChart } from "./chart.js";
import { setupAssetsGrid } from "./grid/assets.js";
import { setupTimeSelector } from "./time-selector.js";
import { setupCounters } from "./indicators.js";
import { setupChannelsGrid } from "./grid/channels.js";

window.onload = function () {
	setupSeriesChart(document.querySelector("#chart"));
	setupAssetsGrid(document.querySelector("#grid-assets"));
	setupChannelsGrid(document.querySelector("#grid-channels"));
	setupCounters();
	setupTimeSelector(document.querySelector("#select-time"), "daily");
};
