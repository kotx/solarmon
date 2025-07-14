import { type Context, Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { Dashboard } from "./components/Dashboard";
import { Layout } from "./components/Layout";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  });
  return auth(c, next);
});

const fetchData = async (c: Context) => {
  const entries = await c.env.R2_BUCKET.list({
    prefix: "monitor/",
  });

  const data: Record<string, any> = {};
  for (const entry of entries.objects) {
    const object = await c.env.R2_BUCKET.get(entry.key);
    const status = await object.json();
    const entryData: Record<string, unknown> = {
      meter: {},
      inverters: [] as unknown[],
      pvs: null,
    };

    // Initialize meter data structures
    const meterData: { production?: unknown; consumption?: unknown } = {};

    for (const device of status.devices) {
      switch (device.DEVICE_TYPE) {
        case "PVS":
          entryData.pvs = {
            STATE: device.STATE,
            SERIAL: device.SERIAL,
            MODEL: device.MODEL,
            HWVER: device.HWVER,
            SWVER: device.SWVER,
            dl_err_count: device.dl_err_count,
            dl_untransmitted: device.dl_untransmitted,
            dl_uptime: device.dl_uptime,
            dl_mem_used: device.dl_mem_used,
            dl_cpu_load: device.dl_cpu_load,
            dl_flash_avail: device.dl_flash_avail,
          };
          break;

        case "Power Meter":
          if (device.TYPE.endsWith("METER-P")) {
            // Production meter
            meterData.production = {
              lifetimeE: device.net_ltea_3phsum_kwh,
              lifetimeP: device.p_3phsum_kw,
              totalPfac: device.tot_pf_rto,
            };
          } else if (device.TYPE.endsWith("METER-C")) {
            // Consumption meter
            meterData.consumption = {
              lifetimeE: device.net_ltea_3phsum_kwh,
              lifetimeP: device.p_3phsum_kw,
              totalPfac: device.tot_pf_rto,
            };
          } else {
            // Unknown meter type
            continue;
          }
          break;
        case "Inverter":
          entryData.inverters.push({
            lifetimeE: device.ltea_3phsum_kwh,
            lifetimeP: device.p_3phsum_kw,
            tempHeatsink: device.t_htsnk_degc,
          });
          break;
      }
    }

    // Aggregate Production and Consumption metrics as Production - Consumption
    const production = meterData.production || {
      lifetimeE: 0,
      lifetimeP: 0,
      totalPfac: 0,
    };
    const consumption = meterData.consumption || {
      lifetimeE: 0,
      lifetimeP: 0,
      totalPfac: 0,
    };

    entryData.meter = {
      lifetimeE: production.lifetimeE - consumption.lifetimeE,
      lifetimeP: production.lifetimeP - consumption.lifetimeP,
      totalPfac: Math.min(production.totalPfac, consumption.totalPfac),
    };

    data[entry.key.replace("monitor/", "").replace(".json", "")] = entryData;
  }

  return data;
};

app.get("/", async (c) => {
  const data = await fetchData(c);
  return c.html(
    "<!DOCTYPE html>" +
    (
      <Layout title="Solar Monitor">
        <Dashboard data={data} />
      </Layout>
    ),
  );
});

app.get("/api/entries", async (c) => {
  const entries = await c.env.R2_BUCKET.list({
    prefix: "monitor/",
  });

  const timestamps = entries.objects
    .map((entry) => entry.key.replace("monitor/", "").replace(".json", ""))
    .sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending (newest first)

  return c.json(timestamps);
});

app.get("/api/raw/:timestamp", async (c) => {
  const timestamp = c.req.param("timestamp");
  const key = `monitor/${timestamp}.json`;

  try {
    const object = await c.env.R2_BUCKET.get(key);
    if (!object) {
      return c.json({ error: "Entry not found" }, 404);
    }

    const rawData = await object.json();
    return c.json(rawData);
  } catch (error) {
    console.error("Error fetching raw data:", error);
    return c.json({ error: "Failed to fetch raw data" }, 500);
  }
});

app.get("/api/processed/:timestamp", async (c) => {
  const timestamp = c.req.param("timestamp");
  const key = `monitor/${timestamp}.json`;

  try {
    const object = await c.env.R2_BUCKET.get(key);
    if (!object) {
      return c.json({ error: "Entry not found" }, 404);
    }

    const status = await object.json();
    const entryData: Record<string, unknown> = {
      meter: {},
      inverters: [] as unknown[],
      pvs: null,
    };

    // Initialize meter data structures
    const meterData: { production?: unknown; consumption?: unknown } = {};

    for (const device of status.devices) {
      switch (device.DEVICE_TYPE) {
        case "PVS":
          entryData.pvs = {
            STATE: device.STATE,
            SERIAL: device.SERIAL,
            MODEL: device.MODEL,
            HWVER: device.HWVER,
            SWVER: device.SWVER,
            dl_err_count: device.dl_err_count,
            dl_untransmitted: device.dl_untransmitted,
            dl_uptime: device.dl_uptime,
            dl_mem_used: device.dl_mem_used,
            dl_cpu_load: device.dl_cpu_load,
            dl_flash_avail: device.dl_flash_avail,
          };
          break;

        case "Power Meter":
          if (device.TYPE.endsWith("METER-P")) {
            // Production meter
            meterData.production = {
              lifetimeE: device.net_ltea_3phsum_kwh,
              lifetimeP: device.p_3phsum_kw,
              totalPfac: device.tot_pf_rto,
            };
          } else if (device.TYPE.endsWith("METER-C")) {
            // Consumption meter
            meterData.consumption = {
              lifetimeE: device.net_ltea_3phsum_kwh,
              lifetimeP: device.p_3phsum_kw,
              totalPfac: device.tot_pf_rto,
            };
          }
          break;
        case "Inverter":
          entryData.inverters.push({
            lifetimeE: device.ltea_3phsum_kwh,
            lifetimeP: device.p_3phsum_kw,
            tempHeatsink: device.t_htsnk_degc,
          });
          break;
      }
    }

    // Aggregate Production and Consumption metrics as Production - Consumption
    const production = meterData.production || {
      lifetimeE: 0,
      lifetimeP: 0,
      totalPfac: 0,
    };
    const consumption = meterData.consumption || {
      lifetimeE: 0,
      lifetimeP: 0,
      totalPfac: 0,
    };

    entryData.meter = {
      lifetimeE: production.lifetimeE - consumption.lifetimeE,
      lifetimeP: production.lifetimeP - consumption.lifetimeP,
      totalPfac: Math.min(production.totalPfac, consumption.totalPfac),
    };

    return c.json(entryData);
  } catch (error) {
    console.error("Error processing data:", error);
    return c.json({ error: "Failed to process data" }, 500);
  }
});

export default app;
