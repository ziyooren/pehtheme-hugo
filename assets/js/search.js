// Pehtheme Hugo search
// Lightweight client-side search over the Hugo-generated index.json feed.
// Supports multiple search forms per page (header bar + /search/ page):
// any element with class "pehtheme-search-form" is wired up, using its
// "pehtheme-search-input" child and the sibling "pehtheme-search-results"
// container. No third-party dependencies. Degrades gracefully when the
// feed is missing.
(function () {
	"use strict";

	var FORM_SELECTOR = ".pehtheme-search-form";
	var INPUT_SELECTOR = ".pehtheme-search-input";
	var RESULTS_SELECTOR = ".pehtheme-search-results";
	var MAX_RESULTS = 10;
	var DEBOUNCE_MS = 250;

	var indexPromise = null;

	/* Inject a small scoped stylesheet so the results UI renders correctly
	   even when the precompiled Tailwind CSS does not cover the classes used
	   here (the theme ships a prebuilt main.css). */
	var styleEl = document.createElement("style");
	styleEl.textContent = [
		"." + RESULTS_SELECTOR.slice(1) + " { margin-top: .75rem; border: 1px solid #e4e4e7; border-radius: 1rem; background: #ffffff; overflow: hidden; }",
		"." + RESULTS_SELECTOR.slice(1) + " .search-result { display: block; padding: .875rem 1.25rem; text-decoration: none; border-bottom: 1px solid #f4f4f5; }",
		"." + RESULTS_SELECTOR.slice(1) + " .search-result:last-child { border-bottom: 0; }",
		"." + RESULTS_SELECTOR.slice(1) + " .search-result:hover { background: #eff6ff; }",
		"." + RESULTS_SELECTOR.slice(1) + " .search-result mark { background: #bfdbfe; border-radius: .25rem; padding: 0 .125rem; }",
		"." + RESULTS_SELECTOR.slice(1) + " .search-result-title { font-weight: 700; font-size: 1rem; color: #18181b; line-height: 1.4; }",
		"." + RESULTS_SELECTOR.slice(1) + " .search-result-meta { margin-top: .25rem; font-size: .8125rem; color: #71717a; }",
		"." + RESULTS_SELECTOR.slice(1) + " .search-result-desc { margin-top: .25rem; font-size: .875rem; color: #52525b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }",
		"." + RESULTS_SELECTOR.slice(1) + " .search-status { padding: 1rem 1.25rem; color: #71717a; font-size: .875rem; }"
	].join("\n");
	document.head.appendChild(styleEl);

	function escapeHtml(str) {
		return String(str).replace(/[&<>"']/g, function (c) {
			return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
		});
	}

	function escapeRegExp(str) {
		return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	function loadIndex(url) {
		if (!indexPromise) {
			indexPromise = fetch(url).then(function (res) {
				if (!res.ok) throw new Error("HTTP " + res.status);
				return res.json();
			});
		}
		return indexPromise;
	}

	function searchIndex(items, query) {
		var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
		if (!terms.length) return [];
		return items.filter(function (item) {
			var hay = [
				item.title,
				item.description,
				item.summary,
				(item.tags || []).join(" "),
				(item.categories || []).join(" ")
			].join(" ").toLowerCase();
			return terms.every(function (t) { return hay.indexOf(t) !== -1; });
		});
	}

	function highlight(text, terms) {
		var out = escapeHtml(text);
		terms.forEach(function (t) {
			out = out.replace(new RegExp("(" + escapeRegExp(t) + ")", "gi"), "<mark>$1</mark>");
		});
		return out;
	}

	function renderResults(container, results, terms) {
		if (!results.length) {
			container.innerHTML = '<div class="search-status">No results found for "' + escapeHtml(terms.join(" ")) + '".</div>';
			container.hidden = false;
			return;
		}

		var html = "";
		results.slice(0, MAX_RESULTS).forEach(function (item) {
			var tags = (item.tags || []).slice(0, 3).map(function (t) { return highlight(t, terms); }).join(" · ");
			var meta = [];
			if (item.date) meta.push(item.date);
			if (tags) meta.push(tags);
			html +=
				'<a class="search-result" href="' + escapeHtml(item.permalink) + '">' +
				'<span class="search-result-title">' + highlight(item.title, terms) + "</span>" +
				(meta.length ? '<div class="search-result-meta">' + meta.join(" &nbsp;·&nbsp; ") + "</div>" : "") +
				(item.description ? '<div class="search-result-desc">' + highlight(item.description, terms) + "</div>" : "") +
				"</a>";
		});
		if (results.length > MAX_RESULTS) {
			html += '<div class="search-status">Showing ' + MAX_RESULTS + " of " + results.length + " results.</div>";
		}
		container.innerHTML = html;
		container.hidden = false;
	}

	function runSearch(form, input, container) {
		var trimmed = input.value.trim();
		if (!trimmed) {
			container.innerHTML = "";
			container.hidden = true;
			return;
		}

		var indexUrl = form.getAttribute("data-index");
		if (!indexUrl) {
			container.innerHTML = '<div class="search-status">Search is not configured.</div>';
			container.hidden = false;
			return;
		}

		var terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
		loadIndex(indexUrl).then(function (items) {
			renderResults(container, searchIndex(items, trimmed), terms);
		}).catch(function () {
			container.innerHTML =
				'<div class="search-status">Search is unavailable. Make sure the home page outputs JSON: add <code>[outputs]</code> with <code>home = ["HTML", "RSS", "JSON"]</code> to your site config.</div>';
			container.hidden = false;
		});
	}

	function init() {
		document.querySelectorAll(FORM_SELECTOR).forEach(function (form) {
			var input = form.querySelector(INPUT_SELECTOR);
			var container = form.parentNode.querySelector(RESULTS_SELECTOR);
			if (!input || !container) return;

			form.addEventListener("submit", function (e) {
				e.preventDefault();
				runSearch(form, input, container);
			});

			var timer = null;
			input.addEventListener("input", function () {
				clearTimeout(timer);
				timer = setTimeout(function () { runSearch(form, input, container); }, DEBOUNCE_MS);
			});

			input.addEventListener("keydown", function (e) {
				if (e.key === "Escape") {
					input.value = "";
					runSearch(form, input, container);
					input.blur();
				}
			});
		});

		// Focus the header input when the search bar is expanded via the toggle.
		document.querySelectorAll('.toggle-button[data-target="search-bar"]').forEach(function (btn) {
			btn.addEventListener("click", function () {
				var bar = document.getElementById("search-bar");
				var input = bar && bar.querySelector(INPUT_SELECTOR);
				if (bar && bar.classList.contains("open") && input) {
					input.focus();
				}
			});
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
