let loaded = false;
let currentMenuSubtitleButton = null;

function init() {
	const menuSubtitleContainers = document.querySelectorAll('.menu-subtitle');
	const menuSubtitleButtons = [];

	menuSubtitleContainers.forEach((container) => {
		const to = container.getAttribute('to');
		const menuSubtitleButton = document.querySelector(
			`.menu-subtitle-btn[to="${to}"]`,
		);

		if (menuSubtitleButton) {
			menuSubtitleButtons.push(menuSubtitleButton);

			menuSubtitleButton.addEventListener('click', () => {
				// Prevent interaction if not loaded
				if (!loaded) return;

				// Deactivate all containers and buttons
				menuSubtitleContainers.forEach((otherContainer) => {
					otherContainer.removeAttribute('active');
				});
				menuSubtitleButtons.forEach((otherButton) => {
					otherButton.removeAttribute('active');
				});

				// Toggle current button and container state
				if (currentMenuSubtitleButton === menuSubtitleButton) {
					currentMenuSubtitleButton = null; // Reset active button
					return;
				}

				currentMenuSubtitleButton = menuSubtitleButton;

				// Activate current button and container
				container.setAttribute('active', '');
				menuSubtitleButton.setAttribute('active', '');
			});
		}
	});

	loaded = true; // Mark as loaded
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
