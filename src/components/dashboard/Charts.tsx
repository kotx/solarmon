import type { FC } from "hono/jsx";

interface ChartsProps {
	chartData: ChartDataEntry[];
	meterData: MeterData;
	solarBridgeData: SolarBridgeData;
	individualInverters: InverterData[];
	deltaEnergyViews: DeltaEnergyViews;
}

export const Charts: FC<ChartsProps> = ({
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
        // Initialize charts data globally
        window.chartsData = {
          chartData: ${JSON.stringify(chartData)},
          meterData: ${JSON.stringify(meterData)},
          solarBridgeData: ${JSON.stringify(solarBridgeData)},
          individualInverters: ${JSON.stringify(individualInverters)},
          deltaEnergyViews: ${JSON.stringify(deltaEnergyViews)}
        };

        // Initialize charts manager if available
        if (window.chartsManager) {
          window.chartsManager.initializeCharts(window.chartsData);
        }
        `,
			}}
		/>
	);
};
