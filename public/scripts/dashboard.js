import {
  DISPLAY_STATES,
  ERROR_MESSAGES,
  JSON_HIGHLIGHTING,
  SYSTEM_LABELS,
  TIMESTAMP_LABELS,
  UI_COLORS,
  UNITS,
} from "./constants.js";

(() => {
  class DashboardManager {
    constructor() {
      this.chartData = [];
      this.meterData = {};
      this.solarBridgeData = {};
      this.individualInverters = [];
      this.deltaEnergyViews = {};
      this.init();
    }

    init() {
      // Initialize when data is available
      if (window.dashboardData) {
        this.setData(window.dashboardData);
      }
    }

    setData(data) {
      this.chartData = data.chartData || [];
      this.meterData = data.meterData || {};
      this.solarBridgeData = data.solarBridgeData || {};
      this.individualInverters = data.individualInverters || [];
      this.deltaEnergyViews = data.deltaEnergyViews || {};

      this.initializeDashboard();
    }

    initializeDashboard() {
      this.updateDashboardTimestamp();
      this.initializeStatCards();
      this.initializeEntrySelector();
      this.initializeRawDataViewer();
    }

    formatTimestamp(unixTimestamp, options = {}) {
      const date = new Date(parseInt(unixTimestamp) * 1000);
      const defaultOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      };
      return date.toLocaleString(undefined, { ...defaultOptions, ...options });
    }

    highlightJSON(json) {
      return json
        .replace(
          JSON_HIGHLIGHTING.KEY_PATTERN,
          JSON_HIGHLIGHTING.KEY_REPLACEMENT,
        )
        .replace(
          JSON_HIGHLIGHTING.STRING_PATTERN,
          JSON_HIGHLIGHTING.STRING_REPLACEMENT,
        )
        .replace(
          JSON_HIGHLIGHTING.NUMBER_PATTERN,
          JSON_HIGHLIGHTING.NUMBER_REPLACEMENT,
        )
        .replace(
          JSON_HIGHLIGHTING.BOOLEAN_PATTERN,
          JSON_HIGHLIGHTING.BOOLEAN_REPLACEMENT,
        )
        .replace(
          JSON_HIGHLIGHTING.NULL_PATTERN,
          JSON_HIGHLIGHTING.NULL_REPLACEMENT,
        )
        .replace(
          JSON_HIGHLIGHTING.PUNCTUATION_PATTERN,
          JSON_HIGHLIGHTING.PUNCTUATION_REPLACEMENT,
        );
    }

    updateDashboardTimestamp() {
      const dashboardTimestamp = document.getElementById("dashboard-timestamp");
      if (this.chartData.length > 0 && dashboardTimestamp) {
        const latestTimestamp =
          this.chartData[this.chartData.length - 1].timestamp;
        dashboardTimestamp.textContent =
          TIMESTAMP_LABELS.AS_OF + this.formatTimestamp(latestTimestamp);
      }
    }

    initializeStatCards() {
      if (this.chartData.length > 0) {
        const latestData = this.chartData[this.chartData.length - 1];
        this.updateStatCards(latestData, latestData.timestamp);
      }
    }

    updateStatCards(data, timestamp) {
      // Add loading state
      document
        .querySelectorAll(".stat-card, .system-info-card")
        .forEach((card) => {
          card.classList.add("updating");
        });

      // Remove loading state after a brief delay
      setTimeout(() => {
        document
          .querySelectorAll(".stat-card, .system-info-card")
          .forEach((card) => {
            card.classList.remove("updating");
          });
      }, 300);

      // Update timestamp
      const dashboardTimestamp = document.getElementById("dashboard-timestamp");
      if (dashboardTimestamp) {
        dashboardTimestamp.textContent =
          TIMESTAMP_LABELS.AS_OF + this.formatTimestamp(timestamp);
      }

      // Update system information
      this.updateSystemInfo(data);

      // Update meter data
      this.updateMeterData(data);

      // Update temperature data
      this.updateTemperatureData(data);

      // Update power generation change
      this.updatePowerGenerationChange(data, timestamp);
    }

    updateSystemInfo(data) {
      const systemInfoSection = document.getElementById("system-info-section");
      if (!systemInfoSection) return;

      if (data.pvs) {
        systemInfoSection.style.display = "block";

        const fields = {
          "system-state": data.pvs.STATE || SYSTEM_LABELS.STATE,
          "system-model": data.pvs.MODEL || SYSTEM_LABELS.MODEL,
          "system-hwver": data.pvs.HWVER || SYSTEM_LABELS.HWVER,
          "system-swver": data.pvs.SWVER || SYSTEM_LABELS.SWVER,
          "system-error-count":
            data.pvs.dl_err_count || SYSTEM_LABELS.ERROR_COUNT,
          "system-untransmitted":
            data.pvs.dl_untransmitted || SYSTEM_LABELS.UNTRANSMITTED,
          "system-uptime": data.pvs.dl_uptime
            ? Math.floor(parseInt(data.pvs.dl_uptime) / 3600) + UNITS.HOURS
            : UNITS.ZERO_HOURS,
          "system-memory": data.pvs.dl_mem_used
            ? (parseInt(data.pvs.dl_mem_used) / 1024).toFixed(1) + UNITS.MB
            : UNITS.ZERO_MB,
          "system-flash": data.pvs.dl_flash_avail
            ? (parseInt(data.pvs.dl_flash_avail) / 1024).toFixed(1) + UNITS.MB
            : UNITS.ZERO_MB,
          "system-cpu": data.pvs.dl_cpu_load || SYSTEM_LABELS.CPU_LOAD,
        };

        Object.entries(fields).forEach(([id, value]) => {
          const element = document.getElementById(id);
          if (element) element.textContent = value;
        });
      } else {
        systemInfoSection.style.display = "none";
      }
    }

    updateMeterData(data) {
      const fields = {
        "total-net-energy-value": {
          value: (Number(data.meter?.lifetimeE) || 0).toFixed(2),
          suffix: UNITS.KWH,
        },
        "current-power-value": {
          value: (Number(data.meter?.lifetimeP) || 0).toFixed(3),
          suffix: UNITS.KW,
        },
        "power-factor-value": {
          value: (Number(data.meter?.totalPfac) || 0).toFixed(3),
          suffix: "",
        },
      };

      Object.entries(fields).forEach(([id, config]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = config.value + config.suffix;
        }
      });
    }

    updateTemperatureData(data) {
      const avgTempValue = document.getElementById("avg-temperature-value");
      if (!avgTempValue) return;

      if (data.inverters && Array.isArray(data.inverters)) {
        const validTemps = data.inverters
          .map((inv) => parseFloat(inv.tempHeatsink))
          .filter((temp) => !Number.isNaN(temp));

        if (validTemps.length > 0) {
          const avgTemp =
            validTemps.reduce((sum, temp) => sum + temp, 0) / validTemps.length;
          avgTempValue.textContent = avgTemp.toFixed(1) + UNITS.DEGREES_CELSIUS;
        } else {
          avgTempValue.textContent = SYSTEM_LABELS.TEMPERATURE;
        }
      } else {
        avgTempValue.textContent = SYSTEM_LABELS.TEMPERATURE;
      }
    }

    updatePowerGenerationChange(data, timestamp) {
      const powerGenChangeCard = document.getElementById(
        "power-gen-change-card",
      );
      const powerGenChangeValue = document.getElementById(
        "power-gen-change-value",
      );
      const totalNetEnergySubtitle = document.getElementById(
        "total-net-energy-subtitle",
      );

      if (
        !powerGenChangeCard ||
        !powerGenChangeValue ||
        !totalNetEnergySubtitle
      )
        return;

      // Find data from 24 hours ago for comparison
      const targetTime = timestamp - 24 * 60 * 60;
      const dayAgoData = this.chartData.find(
        (d) => Math.abs(d.timestamp - targetTime) < 3600,
      );

      if (dayAgoData?.meter?.lifetimeE) {
        const current = Number(data.meter?.lifetimeE) || 0;
        const previous = Number(dayAgoData.meter?.lifetimeE) || 0;
        const change = current - previous;

        powerGenChangeValue.textContent =
          (change >= 0 ? "+" : "") + change.toFixed(2) + UNITS.KWH;
        powerGenChangeValue.style.color =
          change >= 0 ? UI_COLORS.SUCCESS : UI_COLORS.ERROR;
        powerGenChangeCard.style.display = DISPLAY_STATES.BLOCK;
        totalNetEnergySubtitle.textContent =
          TIMESTAMP_LABELS.PREVIOUS + previous.toFixed(2) + UNITS.KWH;
      } else {
        powerGenChangeCard.style.display = DISPLAY_STATES.NONE;
        totalNetEnergySubtitle.textContent = "";
      }
    }

    initializeEntrySelector() {
      this.loadAvailableTimestamps();
      this.setupTimestampSelection();
    }

    async loadAvailableTimestamps() {
      const timestampSelect = document.getElementById("timestamp-select");
      if (!timestampSelect) return;

      try {
        const response = await fetch("/api/entries");
        let timestamps = await response.json();

        timestampSelect.innerHTML = `<option value="" disabled>${TIMESTAMP_LABELS.SELECT_ENTRY}</option>`;

        // Add current/latest option
        if (this.chartData.length > 0) {
          const latestTimestamp =
            this.chartData[this.chartData.length - 1].timestamp;
          const option = document.createElement("option");
          option.value = latestTimestamp;
          option.textContent = `${this.formatTimestamp(latestTimestamp)} ${TIMESTAMP_LABELS.LATEST}`;
          option.selected = true;
          timestampSelect.appendChild(option);

          // Filter out the latest timestamp from the list
          timestamps = timestamps.filter(
            (timestamp) => timestamp !== latestTimestamp,
          );
        }

        console.log(
          "Latest Timestamp:",
          this.chartData[this.chartData.length - 1].timestamp,
        );
        timestamps.forEach((timestamp) => {
          console.log("Current Timestamp:", timestamp);
          // Skip the latest timestamp
          if (
            this.chartData.length > 0 &&
            String(timestamp) ===
              String(this.chartData[this.chartData.length - 1].timestamp)
          ) {
            console.log("Skipping duplicate timestamp:", timestamp);
            return;
          }
          const option = document.createElement("option");
          option.value = timestamp;
          option.textContent = `${this.formatTimestamp(timestamp)} (${timestamp})`;
          timestampSelect.appendChild(option);
        });
      } catch (error) {
        console.error(`${ERROR_MESSAGES.LOAD_ENTRIES}:`, error);
        timestampSelect.innerHTML = `<option value="">${TIMESTAMP_LABELS.FAILED_TO_LOAD}</option>`;
      }
    }

    setupTimestampSelection() {
      const timestampSelect = document.getElementById("timestamp-select");
      if (!timestampSelect) return;

      timestampSelect.addEventListener("change", async (event) => {
        const selectedTimestamp = event.target.value;

        if (!selectedTimestamp) {
          // Reset to latest data
          if (this.chartData.length > 0) {
            const latestData = this.chartData[this.chartData.length - 1];
            this.updateStatCards(latestData, latestData.timestamp);
          }
          this.hideRawData();
          return;
        }

        await this.loadSelectedData(selectedTimestamp);
      });
    }

    async loadSelectedData(timestamp) {
      // Check if we have this data in chartData already
      const existingData = this.chartData.find(
        (d) => d.timestamp === timestamp,
      );

      if (existingData) {
        this.updateStatCards(existingData, parseInt(timestamp));
        this.showRawData(existingData, timestamp);
      } else {
        // Fetch from API
        try {
          const [processedResponse, rawResponse] = await Promise.all([
            fetch(`/api/processed/${timestamp}`),
            fetch(`/api/raw/${timestamp}`),
          ]);

          if (!processedResponse.ok || !rawResponse.ok) {
            throw new Error(ERROR_MESSAGES.FETCH_RAW_DATA);
          }

          const [processedData, rawData] = await Promise.all([
            processedResponse.json(),
            rawResponse.json(),
          ]);

          this.updateStatCards(processedData, parseInt(timestamp));
          this.showRawData(rawData, timestamp);
        } catch (error) {
          console.error(`${ERROR_MESSAGES.LOAD_RAW_DATA}:`, error);
          this.showRawDataError(error.message);
        }
      }
    }

    initializeRawDataViewer() {
      if (this.chartData.length > 0) {
        const latestData = this.chartData[this.chartData.length - 1];
        this.showRawData(latestData, latestData.timestamp);
      }
    }

    showRawData(data, timestamp) {
      const rawDataDisplay = document.getElementById("raw-data-display");
      const jsonContent = document.getElementById("json-content");
      const rawJsonLink = document.getElementById("raw-json-link");
      const placeholder = document.getElementById("raw-data-placeholder");

      if (!rawDataDisplay || !jsonContent || !rawJsonLink || !placeholder)
        return;

      const formattedJSON = JSON.stringify(data, null, 2);
      const highlightedJSON = this.highlightJSON(formattedJSON);

      jsonContent.innerHTML = highlightedJSON;
      rawJsonLink.href = `/api/raw/${timestamp}`;
      rawDataDisplay.style.display = DISPLAY_STATES.BLOCK;
      placeholder.style.display = DISPLAY_STATES.NONE;
    }

    hideRawData() {
      const rawDataDisplay = document.getElementById("raw-data-display");
      const placeholder = document.getElementById("raw-data-placeholder");

      if (rawDataDisplay && placeholder) {
        rawDataDisplay.style.display = DISPLAY_STATES.NONE;
        placeholder.style.display = DISPLAY_STATES.BLOCK;
      }
    }

    showRawDataError(errorMessage) {
      const rawDataDisplay = document.getElementById("raw-data-display");
      const jsonContent = document.getElementById("json-content");
      const placeholder = document.getElementById("raw-data-placeholder");

      if (rawDataDisplay && jsonContent && placeholder) {
        jsonContent.textContent =
          TIMESTAMP_LABELS.ERROR_LOADING_RAW + errorMessage;
        rawDataDisplay.style.display = DISPLAY_STATES.BLOCK;
        placeholder.style.display = DISPLAY_STATES.NONE;
      }
    }
  }

  window.DashboardManager = DashboardManager;

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.dashboardManager = new DashboardManager();
    });
  } else {
    window.dashboardManager = new DashboardManager();
  }
})();
