// Dashboard timestamp formats
export const TIMESTAMP_LABELS = {
	AS_OF: "As of: ",
	PREVIOUS: "Previous: ",
	LATEST: "(Latest)",
	SELECT_ENTRY: "Select an entry...",
	FAILED_TO_LOAD: "Failed to load entries",
	ERROR_LOADING_RAW: "Error loading raw data: ",
};

// Units and measurements
export const UNITS = {
	KWH: " kWh",
	KW: " kW",
	DEGREES_CELSIUS: "°C",
	HOURS: " hours",
	MB: " MB",
	ZERO_HOURS: "0 hours",
	ZERO_MB: "0.0 MB",
};

// System information labels
export const SYSTEM_LABELS = {
	STATE: "N/A",
	MODEL: "N/A",
	HWVER: "N/A",
	SWVER: "N/A",
	ERROR_COUNT: "0",
	UNTRANSMITTED: "0",
	CPU_LOAD: "N/A",
	TEMPERATURE: "N/A",
};

// Chart labels and titles
export const CHART_LABELS = {
	TIME: "Time",
	POWER: "Power (kW)",
	TEMPERATURE: "Temperature (°C)",
	REAL_POWER: "Real Power (kW)",
	POWER_FACTOR: "Power Factor",
	POWER_OUTPUT: "Power Output (kW)",
	AVG_TEMPERATURE: "Average Temperature (°C)",
	NET_ENERGY_CHANGE: "Net Energy Change (kWh)",
};

// Chart tooltip descriptions
export const CHART_TOOLTIPS = {
	LAST_30: "Last 30 readings: Energy change between consecutive measurements",
	DAILY: "Hourly view: Energy change aggregated by hour for current day",
	MONTHLY: "Daily view: Energy change aggregated by day for current month",
	YEARLY: "Monthly view: Energy change aggregated by month for current year",
	NET_ENERGY: "Shows change in net energy over time",
	INDIVIDUAL_POWER: "Individual solar panel power output",
	INDIVIDUAL_TEMP: "Inverter heatsink temperature",
};

// JSON syntax highlighting patterns
export const JSON_HIGHLIGHTING = {
	KEY_PATTERN: /(".*?")(\s*:\s*)/g,
	KEY_REPLACEMENT:
		'<span class="json-key">$1</span><span class="json-punctuation">$2</span>',
	STRING_PATTERN: /:\s*(".*?")/g,
	STRING_REPLACEMENT: ': <span class="json-string">$1</span>',
	NUMBER_PATTERN: /:\s*(-?\d+\.?\d*)/g,
	NUMBER_REPLACEMENT: ': <span class="json-number">$1</span>',
	BOOLEAN_PATTERN: /:\s*(true|false)/g,
	BOOLEAN_REPLACEMENT: ': <span class="json-boolean">$1</span>',
	NULL_PATTERN: /:\s*(null)/g,
	NULL_REPLACEMENT: ': <span class="json-null">$1</span>',
	PUNCTUATION_PATTERN: /([{}[\]\],])/g,
	PUNCTUATION_REPLACEMENT: '<span class="json-punctuation">$1</span>',
};

// Date formatting options
export const DATE_FORMAT_OPTIONS = {
	year: "numeric",
	month: "short",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	timeZoneName: "short",
};

// Error messages
export const ERROR_MESSAGES = {
	FETCH_RAW_DATA: "Failed to fetch raw data",
	LOAD_ENTRIES: "Failed to load entries",
	LOAD_RAW_DATA: "Failed to load raw data",
};

// Display states
export const DISPLAY_STATES = {
	BLOCK: "block",
	NONE: "none",
};

// Colors for UI elements
export const UI_COLORS = {
	SUCCESS: "#10b981",
	ERROR: "#ef4444",
};
