(() => {
	function registerServiceWorker() {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((_registration) =>
					console.log("Service Worker registered successfully"),
				)
				.catch((error) =>
					console.error("Service Worker registration failed:", error),
				);
		}
	}

	class DarkModeManager {
		constructor() {
			this.toggle = document.getElementById("dark-mode-toggle");
			this.sunIcon = document.querySelector(".sun-icon");
			this.moonIcon = document.querySelector(".moon-icon");
			this.init();
		}

		init() {
			const savedTheme = localStorage.getItem("theme");
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			const isDarkMode = savedTheme === "dark" || (!savedTheme && prefersDark);

			this.updateTheme(isDarkMode);

			if (this.toggle) {
				this.toggle.addEventListener("click", () => {
					const currentTheme =
						document.documentElement.getAttribute("data-theme");
					this.updateTheme(currentTheme !== "dark");
				});
			}
		}

		updateTheme(dark) {
			if (dark) {
				document.documentElement.setAttribute("data-theme", "dark");
				if (this.sunIcon) this.sunIcon.style.display = "none";
				if (this.moonIcon) this.moonIcon.style.display = "block";
				localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.setAttribute("data-theme", "light");
				if (this.sunIcon) this.sunIcon.style.display = "block";
				if (this.moonIcon) this.moonIcon.style.display = "none";
				localStorage.setItem("theme", "light");
			}
		}
	}

	class PWAManager {
		constructor() {
			this.deferredPrompt = null;
			this.installButton = document.getElementById("install-button");
			this.init();
		}

		init() {
			window.addEventListener("beforeinstallprompt", (e) => {
				e.preventDefault();
				this.deferredPrompt = e;

				if (this.installButton) {
					this.installButton.style.display = "block";
					this.installButton.addEventListener("click", () => this.install());
				}
			});
		}

		async install() {
			if (!this.deferredPrompt) return;

			this.deferredPrompt.prompt();
			const choiceResult = await this.deferredPrompt.userChoice;

			if (choiceResult.outcome === "accepted") {
				console.log("PWA install accepted by user");
			}

			this.deferredPrompt = null;
			if (this.installButton) {
				this.installButton.style.display = "none";
			}
		}
	}

	function initApp() {
		// Register service worker
		registerServiceWorker();

		// Initialize managers
		new DarkModeManager();
		new PWAManager();
	}

	// Initialize when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initApp);
	} else {
		initApp();
	}
})();
