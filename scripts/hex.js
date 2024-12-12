String.prototype.toBase64 = function () {
	return btoa(unescape(encodeURIComponent(this))); // Encode en Base64
};

// Prototype pour décoder une chaîne Base64
String.prototype.fromBase64 = function () {
	return decodeURIComponent(escape(atob(this))); // Decode depuis Base64
};
