/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_CONTACT_API_URL?: string;
	readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

type TurnstileRenderOptions = {
	sitekey: string;
	callback?: (token: string) => void;
	"expired-callback"?: () => void;
	"error-callback"?: () => void;
};

type TurnstileApi = {
	render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
	reset: (widgetId?: string) => void;
};

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

export {};
