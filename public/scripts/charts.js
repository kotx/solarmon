import { CHART_LABELS, CHART_TOOLTIPS } from "./constants.js";

(() => {
	class ChartsManager {
		constructor() {
			this.charts = {};
			this.currentDeltaChart = null;
			this.currentDeltaView = "last30";
			this.init();
		}

		init() {
			// Initialize when data is available
			if (window.dashboardData) {
				this.initializeCharts(window.dashboardData);
			}
		}

		initializeCharts(data) {
			const {
				meterData,
				solarBridgeData,
				individualInverters,
				deltaEnergyViews,
			} = data;

			// Format labels for charts
			const formatLabelsForChart = (timestamps) => {
				return timestamps.map((timestamp) => {
					const date = new Date(parseInt(timestamp) * 1000);
					const month = String(date.getMonth() + 1).padStart(2, "0");
					const day = String(date.getDate()).padStart(2, "0");
					const hour = String(date.getHours()).padStart(2, "0");
					const minute = String(date.getMinutes()).padStart(2, "0");
					return `${month}-${day} ${hour}:${minute}`;
				});
			};

			// Update labels in data
			const meterDataForCharts = { ...meterData };
			const solarBridgeDataForCharts = { ...solarBridgeData };
			const deltaEnergyViewsForCharts = { ...deltaEnergyViews };

			if (meterDataForCharts.labels) {
				meterDataForCharts.labels = formatLabelsForChart(
					meterDataForCharts.labels,
				);
			}
			if (solarBridgeDataForCharts.labels) {
				solarBridgeDataForCharts.labels = formatLabelsForChart(
					solarBridgeDataForCharts.labels,
				);
			}

			// Get theme colors
			const { textColor, gridColor } = this.getThemeColors();

			// Create base chart options
			const chartOptions = {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						display: true,
						title: {
							display: true,
							text: CHART_LABELS.TIME,
							color: textColor,
						},
						ticks: {
							color: textColor,
						},
						grid: {
							color: gridColor,
						},
					},
					y: {
						display: true,
						beginAtZero: false,
						title: {
							color: textColor,
						},
						ticks: {
							color: textColor,
						},
						grid: {
							color: gridColor,
						},
					},
				},
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						titleColor: "#fff",
						bodyColor: "#fff",
						borderColor: "rgba(255, 255, 255, 0.1)",
						borderWidth: 1,
						cornerRadius: 6,
						displayColors: false,
						callbacks: {
							afterBody: (context) => {
								const datasetLabel = context[0].dataset.label;
								if (
									datasetLabel.includes("Net Energy") ||
									datasetLabel.includes("Daily Energy")
								) {
									return "Net energy = Solar generation - Grid consumption";
								} else if (datasetLabel.includes("Real Power")) {
									return "Negative: Exporting to grid | Positive: Consuming from grid";
								} else if (datasetLabel.includes("Power Output")) {
									return "Solar power generation at time of measurement";
								} else if (datasetLabel.includes("Net Energy Change")) {
									return "Shows change in net energy between readings";
								} else if (datasetLabel.includes("Power Factor")) {
									return "Range: 0-1 (higher = more efficient)";
								} else if (datasetLabel.includes("Total Energy")) {
									return "Cumulative AC energy from all solar panels";
								} else if (datasetLabel.includes("Temperature")) {
									return "Higher temps may reduce inverter efficiency";
								}
								return "";
							},
						},
					},
				},
			};

			// Create meter power chart
			this.createMeterPowerChart(meterDataForCharts, chartOptions);

			// Create meter power factor chart
			this.createMeterPowerFactorChart(meterDataForCharts, chartOptions);

			// Create solar power chart
			this.createSolarPowerChart(solarBridgeDataForCharts, chartOptions);

			// Create solar temperature chart
			this.createSolarTempChart(solarBridgeDataForCharts, chartOptions);

			// Create individual inverter charts
			this.createIndividualInverterCharts(
				individualInverters,
				solarBridgeDataForCharts,
			);

			// Create delta energy chart
			this.createDeltaEnergyChart(deltaEnergyViewsForCharts);

			// Setup theme change listener
			this.setupThemeChangeListener();
		}

		getThemeColors() {
			const isDarkMode =
				document.documentElement.getAttribute("data-theme") === "dark";
			return {
				textColor: isDarkMode ? "#e5e5e5" : "#374151",
				gridColor: isDarkMode ? "#404040" : "#e5e7eb",
			};
		}

		createMeterPowerChart(meterData, chartOptions) {
			const canvas = document.getElementById("meterPowerChart");
			if (!canvas) return;

			this.charts.meterPower = new Chart(canvas, {
				type: "line",
				data: {
					labels: meterData.labels,
					datasets: [
						{
							label: CHART_LABELS.REAL_POWER,
							data: meterData.currentPower,
							borderColor: "#3b82f6",
							backgroundColor: "#3b82f620",
							tension: 0.1,
						},
					],
				},
				options: chartOptions,
			});
		}

		createMeterPowerFactorChart(meterData, chartOptions) {
			const canvas = document.getElementById("meterPowerFactorChart");
			if (!canvas) return;

			this.charts.meterPowerFactor = new Chart(canvas, {
				type: "line",
				data: {
					labels: meterData.labels,
					datasets: [
						{
							label: CHART_LABELS.POWER_FACTOR,
							data: meterData.powerFactor,
							borderColor: "#8b5cf6",
							backgroundColor: "#8b5cf620",
							tension: 0.1,
						},
					],
				},
				options: chartOptions,
			});
		}

		createSolarPowerChart(solarBridgeData, chartOptions) {
			const canvas = document.getElementById("solarPowerChart");
			if (!canvas) return;

			this.charts.solarPower = new Chart(canvas, {
				type: "line",
				data: {
					labels: solarBridgeData.labels,
					datasets: [
						{
							label: "Power Output (kW)",
							data: solarBridgeData.currentPower,
							borderColor: "#ef4444",
							backgroundColor: "#ef444420",
							tension: 0.1,
							pointRadius: 6,
							pointHoverRadius: 8,
							showLine: true,
						},
					],
				},
				options: {
					...chartOptions,
					scales: {
						...chartOptions.scales,
						y: {
							...chartOptions.scales.y,
							beginAtZero: true,
						},
					},
				},
			});
		}

		createSolarTempChart(solarBridgeData, chartOptions) {
			const canvas = document.getElementById("solarTempChart");
			if (!canvas) return;

			this.charts.solarTemp = new Chart(canvas, {
				type: "line",
				data: {
					labels: solarBridgeData.labels,
					datasets: [
						{
							label: CHART_LABELS.AVG_TEMPERATURE,
							data: solarBridgeData.avgTemp,
							borderColor: "#06b6d4",
							backgroundColor: "#06b6d420",
							tension: 0.1,
							pointRadius: 6,
							pointHoverRadius: 8,
							showLine: true,
						},
					],
				},
				options: {
					...chartOptions,
					scales: {
						...chartOptions.scales,
						y: {
							...chartOptions.scales.y,
							beginAtZero: false,
						},
					},
				},
			});
		}

		createIndividualInverterCharts(individualInverters, solarBridgeData) {
			const { textColor, gridColor } = this.getThemeColors();

			individualInverters.forEach((inverter, _index) => {
				const canvas = document.getElementById(`inverter-${inverter.id}-chart`);
				if (!canvas) return;

				this.charts[`inverter-${inverter.id}`] = new Chart(canvas, {
					type: "line",
					data: {
						labels: solarBridgeData.labels,
						datasets: [
							{
								label: CHART_LABELS.POWER_OUTPUT,
								data: inverter.currentPower,
								borderColor: "#10b981",
								backgroundColor: "#10b98120",
								tension: 0.1,
								yAxisID: "y",
							},
							{
								label: CHART_LABELS.TEMPERATURE,
								data: inverter.temperature,
								borderColor: "#f59e0b",
								backgroundColor: "#f59e0b20",
								tension: 0.1,
								yAxisID: "y1",
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						scales: {
							x: {
								display: true,
								title: {
									display: true,
									text: "Time",
									color: textColor,
								},
								ticks: {
									color: textColor,
								},
								grid: {
									color: gridColor,
								},
							},
							y: {
								type: "linear",
								display: true,
								position: "left",
								title: {
									display: true,
									text: CHART_LABELS.POWER,
									color: textColor,
								},
								ticks: {
									color: textColor,
								},
								grid: {
									color: gridColor,
								},
								beginAtZero: true,
							},
							y1: {
								type: "linear",
								display: true,
								position: "right",
								title: {
									display: true,
									text: CHART_LABELS.TEMPERATURE,
									color: textColor,
								},
								ticks: {
									color: textColor,
								},
								grid: {
									drawOnChartArea: false,
									color: gridColor,
								},
							},
						},
						plugins: {
							legend: {
								display: true,
								position: "top",
								labels: {
									color: textColor,
								},
							},
							tooltip: {
								backgroundColor: "rgba(0, 0, 0, 0.8)",
								titleColor: "#fff",
								bodyColor: "#fff",
								borderColor: "rgba(255, 255, 255, 0.1)",
								borderWidth: 1,
								cornerRadius: 6,
								callbacks: {
									afterBody: (context) => {
										const datasetLabel = context[0].dataset.label;
										if (datasetLabel.includes("Power")) {
											return CHART_TOOLTIPS.INDIVIDUAL_POWER;
										} else if (datasetLabel.includes("Temperature")) {
											return CHART_TOOLTIPS.INDIVIDUAL_TEMP;
										}
										return "";
									},
								},
							},
						},
					},
				});
			});
		}

		createDeltaEnergyChart(deltaEnergyViews) {
			const formatLabelsForView = (viewData, viewName) => {
				if (viewName === "last30") {
					return viewData.timestamps.map((timestamp) => {
						const date = new Date(timestamp * 1000);
						const month = (date.getMonth() + 1).toString().padStart(2, "0");
						const day = date.getDate().toString().padStart(2, "0");
						const hours = date.getHours().toString().padStart(2, "0");
						const minutes = date.getMinutes().toString().padStart(2, "0");
						return `${month}-${day} ${hours}:${minutes}`;
					});
				} else if (viewName === "daily") {
					return viewData.timestamps.map((timestamp) => {
						const date = new Date(timestamp * 1000);
						const hours = date.getHours().toString().padStart(2, "0");
						const minutes = date.getMinutes().toString().padStart(2, "0");
						return `${hours}:${minutes}`;
					});
				} else if (viewName === "monthly") {
					return viewData.timestamps.map((timestamp) => {
						const date = new Date(timestamp * 1000);
						const month = (date.getMonth() + 1).toString().padStart(2, "0");
						const day = date.getDate().toString().padStart(2, "0");
						return `${month}-${day}`;
					});
				} else if (viewName === "yearly") {
					return viewData.timestamps.map((timestamp) => {
						const date = new Date(timestamp * 1000);
						return date.getFullYear().toString();
					});
				}
				return [];
			};

			const createDeltaChart = (viewData, viewName) => {
				if (this.currentDeltaChart) {
					this.currentDeltaChart.destroy();
				}

				const canvas = document.getElementById("deltaPowerChart");
				if (!canvas) return;

				const labels = formatLabelsForView(viewData, viewName);
				const { textColor, gridColor } = this.getThemeColors();

				this.currentDeltaChart = new Chart(canvas, {
					type: "bar",
					data: {
						labels: labels,
						datasets: [
							{
								label: CHART_LABELS.NET_ENERGY_CHANGE,
								data: viewData.deltaEnergy,
								backgroundColor: viewData.deltaEnergy.map((value) =>
									value >= 0 ? "#10b981" : "#ef4444",
								),
								borderWidth: 0,
							},
						],
					},
					options: {
						responsive: true,
						scales: {
							x: {
								display: true,
								title: {
									display: true,
									text: "Time",
									color: textColor,
								},
								ticks: {
									color: textColor,
								},
								grid: {
									color: gridColor,
								},
							},
							y: {
								display: true,
								beginAtZero: false,
								title: {
									color: textColor,
								},
								ticks: {
									color: textColor,
								},
								grid: {
									color: gridColor,
								},
							},
						},
						plugins: {
							legend: { display: false },
							tooltip: {
								backgroundColor: "rgba(0, 0, 0, 0.8)",
								titleColor: "#fff",
								bodyColor: "#fff",
								borderColor: "rgba(255, 255, 255, 0.1)",
								borderWidth: 1,
								cornerRadius: 6,
								displayColors: false,
								callbacks: {
									afterBody: function (_context) {
										if (this.currentDeltaView === "last30") {
											return CHART_TOOLTIPS.LAST_30;
										} else if (this.currentDeltaView === "daily") {
											return CHART_TOOLTIPS.DAILY;
										} else if (this.currentDeltaView === "monthly") {
											return CHART_TOOLTIPS.MONTHLY;
										} else if (this.currentDeltaView === "yearly") {
											return CHART_TOOLTIPS.YEARLY;
										}
										return CHART_TOOLTIPS.NET_ENERGY;
									}.bind(this),
								},
							},
						},
					},
				});
			};

			// Initialize with Last 30 view (default)
			createDeltaChart(deltaEnergyViews.last30, "last30");

			// Add tab switching functionality
			document.querySelectorAll(".tab-button").forEach((button) => {
				button.addEventListener("click", () => {
					const view = button.getAttribute("data-view");

					// Update tab styles
					document.querySelectorAll(".tab-button").forEach((btn) => {
						btn.classList.remove("active");
						btn.classList.remove("tab-button-active");
					});

					button.classList.add("active");
					button.classList.add("tab-button-active");

					// Update chart
					this.currentDeltaView = view;
					createDeltaChart(deltaEnergyViews[view], view);
				});
			});
		}

		setupThemeChangeListener() {
			// Listen for theme changes
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (
						mutation.type === "attributes" &&
						mutation.attributeName === "data-theme"
					) {
						this.updateChartsWithNewTheme();
					}
				});
			});

			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["data-theme"],
			});
		}

		updateChartsWithNewTheme() {
			const { textColor, gridColor } = this.getThemeColors();

			// Update all charts with new theme colors
			Object.values(this.charts).forEach((chart) => {
				if (chart?.options) {
					// Update scales
					if (chart.options.scales) {
						Object.values(chart.options.scales).forEach((scale) => {
							if (scale) {
								if (scale.title) scale.title.color = textColor;
								if (scale.ticks) scale.ticks.color = textColor;
								if (scale.grid) scale.grid.color = gridColor;
							}
						});
					}

					// Update plugins
					if (chart.options.plugins) {
						if (chart.options.plugins.legend?.labels) {
							chart.options.plugins.legend.labels.color = textColor;
						}
					}

					chart.update();
				}
			});

			// Update delta chart if it exists
			if (this.currentDeltaChart?.options) {
				// Update scales
				if (this.currentDeltaChart.options.scales) {
					Object.values(this.currentDeltaChart.options.scales).forEach(
						(scale) => {
							if (scale) {
								if (scale.title) scale.title.color = textColor;
								if (scale.ticks) scale.ticks.color = textColor;
								if (scale.grid) scale.grid.color = gridColor;
							}
						},
					);
				}

				// Update plugins
				if (this.currentDeltaChart.options.plugins) {
					if (this.currentDeltaChart.options.plugins.legend?.labels) {
						this.currentDeltaChart.options.plugins.legend.labels.color =
							textColor;
					}
				}

				this.currentDeltaChart.update();
			}
		}

		destroy() {
			// Destroy all charts
			Object.values(this.charts).forEach((chart) => {
				if (chart) chart.destroy();
			});

			if (this.currentDeltaChart) {
				this.currentDeltaChart.destroy();
			}

			this.charts = {};
			this.currentDeltaChart = null;
		}
	}

	window.ChartsManager = ChartsManager;

	// Initialize when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			window.chartsManager = new ChartsManager();
		});
	} else {
		window.chartsManager = new ChartsManager();
	}
})();
