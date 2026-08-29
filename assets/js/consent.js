// Pehtheme Hugo cookie consent manager (Google Consent Mode v2, relaxed mode)
// - Relaxed: tracking/ads scripts load on page open but only send basic info
//   (storage defaults to "denied") until the user makes a choice.
// - Accept  -> all storage types granted.
// - Decline -> keeps the defaults (denied).
// - Custom  -> per-category checkboxes saved via "Save preferences".
// - A "Cookie settings" trigger (any [data-consent-open] element, e.g. in the
//   footer) reopens the banner so the user can review/change their choice.
(function () {
	"use strict";

	var KEY = "pehtheme-consent";
	var BANNER_ID = "consent-banner";

	var DEFAULTS = {
		analytics_storage: "denied",
		ad_storage: "denied",
		personalization_storage: "denied",
		functionality_storage: "denied",
		ad_user_data: "denied",
		ad_personalization: "denied"
	};
	var ALL_GRANTED = {};
	Object.keys(DEFAULTS).forEach(function (k) { ALL_GRANTED[k] = "granted"; });

	/* Scoped stylesheet so the banner renders correctly even with the
	   precompiled Tailwind CSS (which may not cover these classes). */
	var styleEl = document.createElement("style");
	styleEl.textContent = [
		"#consent-banner[hidden]{display:none!important}",
		"#consent-banner{position:fixed;left:0;right:0;z-index:9999;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:.875rem;line-height:1.5;color:#18181b}",
		"#consent-banner[data-position='top']{top:0}",
		"#consent-banner[data-position='bottom']{bottom:0}",
		"#consent-banner .consent-overlay{display:none}",
		"#consent-banner[data-position='modal'] .consent-overlay{display:block;position:fixed;inset:0;background:rgba(24,24,27,.5)}",
		"#consent-banner[data-position='modal'] .consent-panel{position:relative;margin:10vh auto 0;max-width:32rem;max-height:80vh;overflow:auto;box-shadow:0 20px 40px rgba(0,0,0,.25)}",
		"#consent-banner[data-position='top'],#consent-banner[data-position='bottom']{display:flex;justify-content:center;padding:1rem;background:rgba(255,255,255,.98);box-shadow:0 -4px 20px rgba(0,0,0,.08)}",
		"#consent-banner[data-position='top']{box-shadow:0 4px 20px rgba(0,0,0,.08)}",
		"#consent-banner .consent-panel{background:#fff;border-radius:1rem;max-width:36rem;width:100%;padding:1.25rem;box-sizing:border-box}",
		"#consent-banner .consent-title{margin:0 0 .5rem;font-size:1rem;font-weight:700}",
		"#consent-banner .consent-message{margin:0 0 1rem;color:#52525b}",
		"#consent-banner .consent-message a{color:#2563eb;text-decoration:underline}",
		"#consent-banner .consent-actions{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}",
		"#consent-banner .consent-btn{cursor:pointer;border:1px solid #e4e4e7;background:#fff;color:#18181b;border-radius:9999px;padding:.45rem 1.1rem;font-size:.875rem;line-height:1.4;transition:background-color .15s}",
		"#consent-banner .consent-btn:hover{background:#f4f4f5}",
		"#consent-banner .consent-btn-primary{background:#2563eb;border-color:#2563eb;color:#fff}",
		"#consent-banner .consent-btn-primary:hover{background:#1d4ed8}",
		"#consent-banner .consent-btn-link{border-color:transparent;background:transparent;text-decoration:underline;color:#52525b}",
		"#consent-banner .consent-btn-link:hover{background:transparent;color:#18181b}",
		"#consent-banner .consent-settings{margin-top:1rem;border-top:1px solid #f4f4f5;padding-top:1rem}",
		"#consent-banner .consent-settings label{display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;cursor:pointer}",
		"#consent-banner .consent-settings input{accent-color:#2563eb}",
		"#consent-banner .consent-settings .consent-btn{margin-top:.5rem}"
	].join("\n");
	document.head.appendChild(styleEl);

	function getStored() {
		try {
			var record = JSON.parse(localStorage.getItem(KEY));
			return record && record.choices ? record.choices : null;
		} catch (e) { return null; }
	}

	function setStored(state) {
		try {
			localStorage.setItem(KEY, JSON.stringify({ updated: Date.now(), choices: state }));
		} catch (e) { /* storage unavailable; keep in-memory behaviour */ }
	}

	function pushConsent(mode, state) {
		window.dataLayer = window.dataLayer || [];
		function gtag() { window.dataLayer.push(arguments); }
		gtag("consent", mode, state);
		if (typeof window.gtag === "function") {
			try { window.gtag("consent", mode, state); } catch (e) { /* noop */ }
		}
	}

	/* Re-send the GA4 config after an explicit opt-in. The page_view that
	   fired while analytics_storage was denied carried no client_id (cookieless
	   ping); plain gtag.js — unlike GTM — does not resend it automatically. */
	function pushConfig() {
		var id = window.PEHTHEME_GA_ID;
		if (!id) return;
		window.dataLayer = window.dataLayer || [];
		function gtag() { window.dataLayer.push(arguments); }
		gtag("config", id);
		if (typeof window.gtag === "function") {
			try { window.gtag("config", id); } catch (e) { /* noop */ }
		}
	}

	function syncCheckboxes(banner, state) {
		var inputs = banner.querySelectorAll("input[data-consent-cat]");
		inputs.forEach(function (input) {
			input.checked = !state || state[input.getAttribute("data-consent-cat")] === "granted";
		});
	}

	function closeBanner(banner) {
		banner.hidden = true;
		document.body.classList.remove("consent-modal-open");
	}

	function openBanner(banner) {
		var stored = getStored();
		syncCheckboxes(banner, stored);
		banner.hidden = false;
		if (banner.getAttribute("data-position") === "modal") {
			document.body.classList.add("consent-modal-open");
		}
	}

	function saveChoices(banner, state) {
		setStored(state);
		pushConsent("update", state);
		if (state.analytics_storage === "granted") {
			pushConfig();
		}
		closeBanner(banner);
	}

	function init() {
		var banner = document.getElementById(BANNER_ID);
		if (!banner) return;

		var accept = banner.querySelector("[data-consent='accept']");
		var decline = banner.querySelector("[data-consent='decline']");
		var save = banner.querySelector("[data-consent='save']");
		var toggle = banner.querySelector("[data-consent='toggle-settings']");
		var settings = banner.querySelector(".consent-settings");
		var inputs = banner.querySelectorAll("input[data-consent-cat]");

		if (accept) accept.addEventListener("click", function () { saveChoices(banner, ALL_GRANTED); });
		if (decline) decline.addEventListener("click", function () { saveChoices(banner, DEFAULTS); });
		if (save) save.addEventListener("click", function () {
			var state = {};
			inputs.forEach(function (input) {
				state[input.getAttribute("data-consent-cat")] = input.checked ? "granted" : "denied";
			});
			saveChoices(banner, state);
		});
		if (toggle && settings) toggle.addEventListener("click", function () {
			settings.hidden = !settings.hidden;
		});

		// Already decided -> apply stored choice quietly (relaxed mode).
		var stored = getStored();
		if (stored) {
			pushConsent("update", stored);
			return;
		}
		// First visit -> keep the consent defaults (denied) and show the banner.
		openBanner(banner);
	}

	// Any element with [data-consent-open] (e.g. footer "Cookie settings") reopens the banner.
	document.addEventListener("click", function (e) {
		var trigger = e.target.closest("[data-consent-open]");
		if (!trigger) return;
		e.preventDefault();
		var banner = document.getElementById(BANNER_ID);
		if (banner) openBanner(banner);
	});

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
