export function addToGuestCart(productId: string) {
	let cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
	if (!cart.includes(productId)) {
		cart.push(productId);
		localStorage.setItem('guestCart', JSON.stringify(cart));
	}
}

export function getGuestCart(): string[] {
	return JSON.parse(localStorage.getItem('guestCart') || '[]');
}

export function clearGuestCart() {
	localStorage.removeItem('guestCart');
}
