/**
 * Global window extensions for injected data
 */
interface Window {
	// Main solar monitor data object containing all entries
	SOLAR_MONITOR_DATA?: Record<string, EntryData>;

	// Dashboard data used by chart rendering components
	SOLAR_DASHBOARD_DATA?: {
		meterData: MeterData;
		solarBridgeData: SolarBridgeData;
		individualInverters: InverterData[];
		chartData: ChartDataEntry[];
		deltaEnergyViews: DeltaEnergyViews;
	};

	// Flag to prevent duplicate processing
	DASHBOARD_DATA_PROCESSED?: boolean;

	// Raw chart data for the data viewer
	RAW_CHART_DATA?: ChartDataEntry[];

	// Raw API response data
	RAW_DATA?: unknown;
}

/**
 * Entry data structure representing a single monitoring data point
 */
interface EntryData {
	meter: {
		lifetimeE: number;
		lifetimeP: number;
		totalPfac: number;
	};
	inverters: InverterEntryData[];
	pvs: PvsData | null;
}

/**
 * PVS (Photovoltaic System) data structure
 */
interface PvsData {
	STATE: string;
	SERIAL: string;
	MODEL: string;
	HWVER: string;
	SWVER: string;
	dl_err_count: number;
	dl_untransmitted: number;
	dl_uptime: number;
	dl_mem_used: number;
	dl_cpu_load: number;
	dl_flash_avail: number;
}

/**
 * Inverter data structure for a single inverter
 */
interface InverterEntryData {
	lifetimeE: number;
	lifetimeP: number;
	tempHeatsink: number;
}

/**
 * Meter data structure for charts
 */
interface MeterData {
	labels: number[];
	lifetimeEnergy: number[];
	currentPower: number[];
	deltaEnergy: number[];
	powerFactor: number[];
}

/**
 * Solar bridge data structure for charts
 */
interface SolarBridgeData {
	labels: number[];
	lifetimeEnergy: number[];
	currentPower: number[];
	avgTemp: (number | null)[];
}

/**
 * Inverter data structure for charts
 */
interface InverterData {
	id: number;
	lifetimeEnergy: number[];
	currentPower: number[];
	temperature: (number | null)[];
}

/**
 * Chart data entry structure
 */
interface ChartDataEntry {
	timestamp: number;
	meter: {
		lifetimeE: number;
		lifetimeP: number;
		totalPfac: number;
	};
	inverters: InverterEntryData[];
	pvs: PvsData | null;
}

/**
 * Delta energy views structure
 */
interface DeltaEnergyViews {
	last30: {
		timestamps: number[];
		deltaEnergy: number[];
	};
	monthly: {
		periods: string[];
		timestamps: number[];
		deltaEnergy: number[];
	};
	daily: {
		periods: string[];
		timestamps: number[];
		deltaEnergy: number[];
	};
	yearly: {
		periods: string[];
		timestamps: number[];
		deltaEnergy: number[];
	};
}
