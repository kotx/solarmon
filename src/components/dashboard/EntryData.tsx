import type { FC } from "hono/jsx";
import {} from "hono/jsx";

interface MeterData {
  lifetimeE?: number | string;
  lifetimeP?: number | string;
  totalPfac?: number | string;
}

interface PvsData {
  STATE?: string;
  MODEL?: string;
  HWVER?: string;
  SWVER?: string;
  dl_err_count?: number | string;
  dl_untransmitted?: number | string;
  dl_uptime?: number | string;
  dl_mem_used?: number | string;
  dl_flash_avail?: number | string;
  dl_cpu_load?: string;
}

interface InverterData {
  tempHeatsink?: number | string;
  lifetimeE?: number | string;
  lifetimeP?: number | string;
}

interface ChartDataEntry {
  timestamp: number;
  meter: MeterData;
  pvs?: PvsData;
  inverters: InverterData[];
}

interface StatCardsProps {
  _chartData: ChartDataEntry[];
  _powerGenDiff?: {
    change: number;
    previous: number;
  };
}

interface SystemInfoProps {
  _chartData: ChartDataEntry[];
}

interface RawDataViewerProps {
  _chartData: ChartDataEntry[];
}

export const SystemInfo: FC<SystemInfoProps> = ({ _chartData }) => {
  return (
    <div
      class="system-info-section"
      id="system-info-section"
      style="display: none;"
    >
      <h3 class="system-info-title">System Information</h3>
      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;"
        class="system-info-grid"
      >
        <div class="system-info-card">
          <div class="system-info-card-title">System Status</div>
          <div class="system-info-card-content">
            <div>
              <strong>State:</strong> <span id="system-state">N/A</span>
            </div>
            <div>
              <strong>Model:</strong> <span id="system-model">N/A</span>
            </div>
          </div>
        </div>
        <div class="system-info-card">
          <div class="system-info-card-title">Hardware & Software</div>
          <div class="system-info-card-content">
            <div>
              <strong>Hardware Version:</strong>{" "}
              <span id="system-hwver">N/A</span>
            </div>
            <div>
              <strong>Software Version:</strong>{" "}
              <span id="system-swver">N/A</span>
            </div>
          </div>
        </div>
        <div class="system-info-card">
          <div class="system-info-card-title">System Health</div>
          <div class="system-info-card-content">
            <div>
              <strong>Error Count:</strong>{" "}
              <span id="system-error-count">N/A</span>
            </div>
            <div>
              <strong>Untransmitted:</strong>{" "}
              <span id="system-untransmitted">N/A</span>
            </div>
            <div>
              <strong>Uptime:</strong> <span id="system-uptime">N/A</span>
            </div>
          </div>
        </div>
        <div class="system-info-card">
          <div class="system-info-card-title">System Resources</div>
          <div class="system-info-card-content">
            <div>
              <strong>Memory Used:</strong> <span id="system-memory">N/A</span>
            </div>
            <div>
              <strong>Flash Available:</strong>{" "}
              <span id="system-flash">N/A</span>
            </div>
            <div>
              <strong>CPU Load:</strong> <span id="system-cpu">N/A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatCards: FC<StatCardsProps> = ({
  _chartData,
  _powerGenDiff,
}) => {
  return (
    <div class="stats">
      <div class="stat-card" id="power-gen-change-card" style="display: none;">
        <div class="stat-value" id="power-gen-change-value">
          +0.00 kWh
        </div>
        <div class="stat-label">
          <div class="tooltip">
            Power Generation Change (day)
            <span class="info-icon">i</span>
            <span class="tooltiptext">
              This is computed as the current reading value of Total Net Energy
              minus the value from 24 hour ago.
            </span>
          </div>
        </div>
        <div class="dashboard-subtitle" id="power-gen-change-subtitle">
          Since yesterday
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="total-net-energy-value">
          0.00 kWh
        </div>
        <div class="stat-label">
          <div class="tooltip">
            Total Net Energy
            <span class="info-icon">i</span>
            <span class="tooltiptext">
              Lifetime net energy production measured in kilowatt-hours (kWh).
              This represents the total amount of energy your solar system has
              generated since installation, minus any energy consumed from the
              grid. A positive value indicates net energy production.
            </span>
          </div>
        </div>
        <div class="dashboard-subtitle" id="total-net-energy-subtitle">
          Previous: 0.00 kWh
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="current-power-value">
          0.000 kW
        </div>
        <div class="stat-label">
          <div class="tooltip">
            Current Real Power
            <span class="info-icon">i</span>
            <span class="tooltiptext">
              Current real power measurement in kilowatts (kW) at time of
              reading. Real power is the useful power converted into work. A
              negative value means power is flowing back to the grid (excess
              solar generation), while positive means drawing from the grid.
            </span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="power-factor-value">
          0.000
        </div>
        <div class="stat-label">
          <div class="tooltip">
            Power Factor
            <span class="info-icon">i</span>
            <span class="tooltiptext">
              Power factor measures how effectively your system uses electricity
              (ratio of real power to apparent power). Values range from 0 to 1,
              with higher values indicating more efficient power usage. Negative
              values can occur when generating power back to the grid.
            </span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="avg-temperature-value">
          N/A
        </div>
        <div class="stat-label">
          <div class="tooltip">
            Avg Temperature
            <span class="info-icon">i</span>
            <span class="tooltiptext">
              Average temperature of inverter heatsinks in degrees Celsius. The
              heatsink dissipates heat generated during operation. Monitoring
              temperature is crucial for optimal performance and preventing
              overheating.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EntrySelector: FC<RawDataViewerProps> = ({ _chartData }) => {
  return (
    <div class="entry-selector-section">
      <div class="form-group">
        <label for="timestamp-select">Select Entry:</label>
        <select id="timestamp-select">
          <option value="">Loading entries...</option>
        </select>
      </div>
      <p
        class="dashboard-description"
        style="margin-top: 10px; font-size: 13px;"
      >
        Select any entry to update the system info and stat cards above, or view
        its raw JSON data below.
      </p>
    </div>
  );
};

// Raw Data Viewer Component (now accordion style)
export const RawDataViewer: FC<RawDataViewerProps> = ({ _chartData }) => {
  return (
    <div class="raw-data-accordion">
      <details class="raw-data-details">
        <summary class="raw-data-summary">
          <span class="raw-data-title">📄 Raw Data Viewer</span>
        </summary>
        <div class="raw-data-content">
          <div id="raw-data-display" style={{ display: "none" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <a
                id="raw-json-link"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                class="raw-json-link"
                style={{
                  background: "#333",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  textDecoration: "none",
                }}
              >
                📄 Open Raw JSON
              </a>
            </div>
            <div class="json-display" id="json-content"></div>
          </div>
          <div
            id="raw-data-placeholder"
            style={{ padding: "20px", textAlign: "center" }}
          >
            Select an entry above to view its raw JSON data
          </div>
        </div>
      </details>
    </div>
  );
};

// Data Initialization Component
export const DataUpdateScript: FC<{
  chartData: ChartDataEntry[];
  meterData: MeterData;
  solarBridgeData: SolarBridgeData;
  individualInverters: InverterData[];
  deltaEnergyViews: DeltaEnergyViews;
}> = ({
  chartData,
  meterData,
  solarBridgeData,
  individualInverters,
  deltaEnergyViews,
}) => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        window.dashboardData = {
          chartData: ${JSON.stringify(chartData)},
          meterData: ${JSON.stringify(meterData)},
          solarBridgeData: ${JSON.stringify(solarBridgeData)},
          individualInverters: ${JSON.stringify(individualInverters)},
          deltaEnergyViews: ${JSON.stringify(deltaEnergyViews)}
        };

        if (window.dashboardManager) {
          window.dashboardManager.setData(window.dashboardData);
        }
        `,
      }}
    />
  );
};
