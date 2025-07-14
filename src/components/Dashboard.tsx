import type { FC } from "hono/jsx";
import { Charts } from "./dashboard/Charts";
import {
	DataUpdateScript,
	EntrySelector,
	RawDataViewer,
	StatCards,
	SystemInfo,
} from "./dashboard/EntryData";

interface DashboardProps {
	data: Record<string, EntryData>;
}

export const Dashboard: FC<DashboardProps> = ({ data }) => {
	// Object keys are unix timestamps
	const timestamps = Object.keys(data).sort(
		(a, b) => parseInt(a) - parseInt(b),
	);

	// Prepare data for charts
	const chartData = timestamps.map((timestamp) => {
		const entry = data[timestamp];
		return {
			timestamp: parseInt(timestamp),
			meter: entry.meter,
			inverters: entry.inverters,
			pvs: entry.pvs,
		};
	});

	// Calculate delta net energy from meter data between consecutive measurements
	const meterEnergyData = chartData.map((d) => d.meter.lifetimeE || 0);
	const deltaMeterEnergyData = meterEnergyData.map((energy, index) => {
		if (index === 0) return 0; // First measurement has no previous data
		return energy - meterEnergyData[index - 1];
	});

	const meterData = {
		labels: chartData.map((d) => d.timestamp),
		lifetimeEnergy: meterEnergyData,
		currentPower: chartData.map((d) => d.meter.lifetimeP || 0),
		deltaEnergy: deltaMeterEnergyData,
		powerFactor: chartData.map((d) => d.meter.totalPfac || 0),
	};

	// Prepare delta energy data for different views
	const prepareDeltaEnergyViews = (data, deltaEnergy) => {
		// Last 30 data points - keep timestamps for client-side formatting
		const last30 = {
			timestamps: data.slice(-30).map((d) => d.timestamp),
			deltaEnergy: deltaEnergy.slice(-30),
		};

		// Group by different time periods using UTC dates for grouping keys
		const groupedData = data.reduce(
			(acc, d, index) => {
				const date = new Date(d.timestamp * 1000);
				const year = date.getUTCFullYear();
				const month = date.getUTCMonth();
				const day = date.getUTCDate();
				const hour = date.getUTCHours();

				// Monthly view (group by days)
				const monthKey = `${year}-${(month + 1).toString().padStart(2, "0")}`;
				const dayKey = `${monthKey}-${day.toString().padStart(2, "0")}`;

				// Daily view (group by hours)
				const hourKey = `${dayKey}-${hour.toString().padStart(2, "0")}`;

				// Yearly view (group by months)
				const yearKey = year.toString();

				if (!acc.monthly[monthKey]) acc.monthly[monthKey] = {};
				if (!acc.monthly[monthKey][dayKey]) acc.monthly[monthKey][dayKey] = [];
				acc.monthly[monthKey][dayKey].push({
					delta: deltaEnergy[index],
					timestamp: d.timestamp,
				});

				if (!acc.daily[dayKey]) acc.daily[dayKey] = {};
				if (!acc.daily[dayKey][hourKey]) acc.daily[dayKey][hourKey] = [];
				acc.daily[dayKey][hourKey].push({
					delta: deltaEnergy[index],
					timestamp: d.timestamp,
				});

				if (!acc.yearly[yearKey]) acc.yearly[yearKey] = {};
				if (!acc.yearly[yearKey][monthKey]) acc.yearly[yearKey][monthKey] = [];
				acc.yearly[yearKey][monthKey].push({
					delta: deltaEnergy[index],
					timestamp: d.timestamp,
				});

				return acc;
			},
			{ monthly: {}, daily: {}, yearly: {} },
		);

		// Get the most recent period data with timestamps for client-side formatting
		const monthKeys = Object.keys(groupedData.monthly).sort();
		const recentMonth = monthKeys[monthKeys.length - 1];
		const monthlyView = recentMonth ? groupedData.monthly[recentMonth] : {};

		const dayKeys = Object.keys(groupedData.daily).sort();
		const recentDay = dayKeys[dayKeys.length - 1];
		const dailyView = recentDay ? groupedData.daily[recentDay] : {};

		const yearKeys = Object.keys(groupedData.yearly).sort();
		const recentYear = yearKeys[yearKeys.length - 1];
		const yearlyView = recentYear ? groupedData.yearly[recentYear] : {};

		return {
			last30,
			monthly: {
				periods: Object.keys(monthlyView).sort(),
				timestamps: Object.keys(monthlyView)
					.sort()
					.map(
						(day) => monthlyView[day][0].timestamp, // Use first timestamp of each day
					),
				deltaEnergy: Object.keys(monthlyView)
					.sort()
					.map((day) =>
						monthlyView[day].reduce((sum, item) => sum + item.delta, 0),
					),
			},
			daily: {
				periods: Object.keys(dailyView).sort(),
				timestamps: Object.keys(dailyView)
					.sort()
					.map(
						(hour) => dailyView[hour][0].timestamp, // Use first timestamp of each hour
					),
				deltaEnergy: Object.keys(dailyView)
					.sort()
					.map((hour) =>
						dailyView[hour].reduce((sum, item) => sum + item.delta, 0),
					),
			},
			yearly: {
				periods: Object.keys(yearlyView).sort(),
				timestamps: Object.keys(yearlyView)
					.sort()
					.map(
						(month) => yearlyView[month][0].timestamp, // Use first timestamp of each month
					),
				deltaEnergy: Object.keys(yearlyView)
					.sort()
					.map((month) =>
						yearlyView[month].reduce((sum, item) => sum + item.delta, 0),
					),
			},
		};
	};

	const deltaEnergyViews = prepareDeltaEnergyViews(
		chartData,
		deltaMeterEnergyData,
	);

	const solarBridgeData = {
		labels: chartData.map((d) => d.timestamp),
		lifetimeEnergy: chartData.map((d) =>
			d.inverters.reduce((sum, sb) => sum + (parseFloat(sb.lifetimeE) || 0), 0),
		),
		currentPower: chartData.map((d) =>
			d.inverters.reduce((sum, sb) => sum + (parseFloat(sb.lifetimeP) || 0), 0),
		),
		avgTemp: chartData.map((d) => {
			if (!d.inverters || !Array.isArray(d.inverters)) {
				return null;
			}
			const temps = d.inverters
				.map((sb) => sb.tempHeatsink)
				.filter(
					(t) => t != null && !Number.isNaN(parseFloat(t)) && parseFloat(t) > 0,
				)
				.map((t) => parseFloat(t));
			return temps.length > 0
				? temps.reduce((sum, t) => sum + t, 0) / temps.length
				: null;
		}),
	};

	// Calculate power generation change using meter net energy data
	// Find the reading closest to 24 hours ago
	const powerGenDiff =
		chartData.length >= 2
			? (() => {
					const currentReading = chartData[chartData.length - 1];
					const currentTime = currentReading.timestamp;
					const targetTime = currentTime - 24 * 60 * 60; // 24 hours ago in seconds

					// Find the reading closest to 24 hours ago
					let closestIndex = 0;
					let minTimeDiff = Math.abs(chartData[0].timestamp - targetTime);

					for (let i = 1; i < chartData.length - 1; i++) {
						const timeDiff = Math.abs(chartData[i].timestamp - targetTime);
						if (timeDiff < minTimeDiff) {
							minTimeDiff = timeDiff;
							closestIndex = i;
						}
					}

					const current =
						Number(
							meterData.lifetimeEnergy[meterData.lifetimeEnergy.length - 1],
						) || 0;
					const previous = Number(meterData.lifetimeEnergy[closestIndex]) || 0;

					return {
						current,
						previous,
						get change() {
							return this.current - this.previous;
						},
					};
				})()
			: null;

	// Individual inverter data
	const inverterCount =
		chartData.length > 0 ? chartData[0].inverters.length : 0;
	const individualInverters = [];
	for (let i = 0; i < inverterCount; i++) {
		individualInverters.push({
			id: i + 1,
			lifetimeEnergy: chartData.map(
				(d) => parseFloat(d.inverters[i]?.lifetimeE) || 0,
			),
			currentPower: chartData.map(
				(d) => parseFloat(d.inverters[i]?.lifetimeP) || 0,
			),
			temperature: chartData.map((d) => {
				const temp = d.inverters[i]?.tempHeatsink;
				return temp != null && !Number.isNaN(parseFloat(temp))
					? parseFloat(temp)
					: null;
			}),
		});
	}

	return (
		<>
			<div class="dashboard-timestamp" id="dashboard-timestamp">
				As of: {chartData.length > 0 ? "Loading..." : "No data available"}
			</div>

			<EntrySelector chartData={chartData} />

			<SystemInfo chartData={chartData} />

			<StatCards
				chartData={chartData}
				powerGenDiff={powerGenDiff || undefined}
			/>

			<RawDataViewer chartData={chartData} />

			<div class="section-title">Power Meter Data</div>
			<p class="dashboard-description">
				The power meters measure your system's overall energy production and
				consumption at the grid connection point.
			</p>

			<div class="chart-container full-width">
				<h2>Net Energy Change (kWh)</h2>

				<div
					id="deltaEnergyTabs"
					style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb;"
				>
					<button
						class="tab-button tab-button-active"
						data-view="last30"
						type="button"
					>
						Last 30
					</button>
					<button class="tab-button" data-view="daily" type="button">
						Daily
					</button>
					<button class="tab-button" data-view="monthly" type="button">
						Monthly
					</button>
					<button class="tab-button" data-view="yearly" type="button">
						Yearly
					</button>
				</div>
				<canvas id="deltaPowerChart"></canvas>
			</div>

			<div class="dashboard" style="margin-top: 30px;">
				<div class="chart-container">
					<h2>Real Power (kW)</h2>

					<canvas id="meterPowerChart"></canvas>
				</div>

				<div class="chart-container">
					<h2>Power Factor Efficiency</h2>

					<canvas id="meterPowerFactorChart"></canvas>
				</div>
			</div>

			<div class="section-title">Inverter Data</div>
			<p class="dashboard-description">
				Micro-inverters convert DC power from solar panels to AC power. Each
				inverter monitors individual panel performance and temperature.
			</p>

			<div class="dashboard">
				<div class="chart-container">
					<h2>Solar Power Output (kW)</h2>

					<canvas id="solarPowerChart"></canvas>
				</div>

				<div class="chart-container">
					<h2>Average Inverter Temperature (°C)</h2>

					<canvas id="solarTempChart"></canvas>
				</div>
			</div>

			<div class="section-title">Individual Inverter Performance</div>
			<p class="dashboard-description">
				Performance metrics for each individual micro-inverter in your system.
			</p>

			<div class="inverter-grid">
				{individualInverters.map((inverter, _index) => (
					<div key={`inverter-${inverter.id}`} class="chart-container">
						<h3>Inverter {inverter.id}</h3>

						<canvas id={`inverter-${inverter.id}-chart`}></canvas>
					</div>
				))}
			</div>
			<DataUpdateScript
				chartData={chartData}
				meterData={meterData}
				solarBridgeData={solarBridgeData}
				individualInverters={individualInverters}
				deltaEnergyViews={deltaEnergyViews}
			/>

			<Charts
				chartData={chartData}
				meterData={meterData}
				solarBridgeData={solarBridgeData}
				individualInverters={individualInverters}
				deltaEnergyViews={deltaEnergyViews}
			/>
		</>
	);
};
