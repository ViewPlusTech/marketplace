// Global variables

export {};

import { InMarketplaceAppElement } from '../in-marketplace-app';

declare global {
	interface Window {
		app: InMarketplaceAppElement;
	}
}
