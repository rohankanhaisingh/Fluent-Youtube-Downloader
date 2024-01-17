export type RequestedControlEvent = "maximize" | "minimize" | "close";
export type ApplicationWindowTheme = "windows_fluent_dark" | "windows_fluent_light";
export type ApplicationSettingsStatus = "failed" | "ok";
export type YTDLPInitializationState = "ok" | "failed";
export type ConversionPipelineState = "ok" | "failed" | "installation-succeed";
export type YTDLPInitializationFailReason = "executable-not-found" | "execution-directory-not-found";
export type ConvertQuality = "highest" | "lowest" | "highest-video" | "lowest-video" | "highest-audio" | "lowest-audio" | "highest-audio-video" | "lowest-audio-video";
export type PromptResult = "ok" | "failed";

export enum YTDLPInstallationPromptButton {
	Yes,
	No
}

export interface Resolution {
	readonly width: number;
	readonly height: number;
}

export interface ReadSettingsFail {
	readonly reason: string;
	readonly error: Error;
	readonly status: ApplicationSettingsStatus;
}

export interface ApplicationDisplaySettings {
	readonly theme: ApplicationWindowTheme;
	readonly darkMode: boolean;
}

export interface ApplicationWindowSettings {
	readonly resolution: Resolution;
	readonly display: ApplicationDisplaySettings;
}

export interface ApplicationPathSettings {
	readonly appDataPath: string | null;
	readonly downloadPath: string | null;
	readonly ffmpegPath: string | null;
}

export interface ApplicationServerSettings {
	readonly port: number;
	readonly extensionPassword: string | null;
}

export interface ApplicationBehaviorSettings {
	readonly autoStart: boolean;
	readonly systemTray: boolean;
	readonly startOptions: string | null;
}

export interface ApplicationSettings {
	readonly window: ApplicationWindowSettings;
	readonly path: ApplicationPathSettings;
	readonly server: ApplicationServerSettings;
	readonly status: ApplicationSettingsStatus;
	readonly behavior: ApplicationBehaviorSettings;
}

export interface YTDLPInitializationResponse {
	readonly state: YTDLPInitializationState;
	readonly message?: string;
	readonly reason?: YTDLPInitializationFailReason;
}

export interface StreamConversionProgress {
	readonly frames: number;
	readonly currentFps: number;
	readonly currentKbps: number;
	readonly targetSize: number;
	readonly timemark: string;
}

export interface ConversionPipeline {
	readonly state: ConversionPipelineState;
	readonly reason?: string;
}

export interface StreamOutputExtractionEvent {
	readonly percentage: number;
	readonly isDone: boolean;
	readonly downloadSpeed: number;
	readonly fileDestinations?: string[];
}

export interface StreamConvesionEvents {
	onError?: (err: Error, hasAborted: boolean) => void;
	onProgress?: (progress: StreamConversionProgress) => void;
	onEnd?: () => void;
	onAbort?: (reason: string, hasAborted: boolean) => void;
}

export interface HistoryItem {
	readonly videoUrl: string | null;
	readonly requestId: string | null;
	readonly fileName: string | null;
	readonly fileSize: number | null;
	readonly fileLocation: string | null;
	readonly timestamp: number | null;
	readonly thumbnailUrl: string | null;
}

export interface ExtensionConnection {
	readonly from: string;
	readonly userAgent: string;
	readonly protocol: string;
	readonly timestamp: number;
	readonly serverUrl: string;
	readonly serverPassword: string | null;
}

export interface ExtensionConversionPostBody {
	readonly from: string;
	readonly userAgent: string;
	readonly protocol: string;
	readonly timestamp: number;
	readonly videoUrl: string;
	readonly videoQuality: ConvertQuality;
	readonly requestId: string;
}

export interface ResolvedVideoInfo {
	readonly videoTitle: string;
	readonly videoThumbnail: string;
}

// Typings specifically made for SocketIO events.
export namespace SocketIOEvents {

	export interface PostSettingItem {
		key: string;
		value: string | null | boolean;
	}

	export interface ChangeSettings {
		readonly settings: PostSettingItem[];
		readonly from: string;
		readonly userAgent: string;
	}
}