import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Filter, X } from "lucide-react";

/*
  ============================================================
  PATRÓN: AR Aging Dashboard (React + Recharts)
  ============================================================
  Este archivo es un EJEMPLO STANDALONE para aprender el patrón
  antes de integrarlo a DentalOS / Loyalty Card / Veterinaria.

  Lo que en Power BI eran "measures" (DAX) y "slicers", aquí son:
    - measures  -> funciones de agregación en JS (useMemo)
                   -> en producción: vistas SQL o RPC en Supabase
    - slicers   -> useState + <select> controlados
                   -> en producción: se traducen a WHERE clauses
                      o a params de una función RPC de Supabase

  Ejemplo de la vista SQL que reemplazaría el cálculo de aging:

  create or replace view v_ar_aging as
  select
    c.portfolio,
    c.customer_name,
    c.cust_num,
    sum(t.amount) filter (where t.days_overdue <= 0)                as current_amt,
    sum(t.amount) filter (where t.days_overdue between 1 and 30)    as d1_30,
    sum(t.amount) filter (where t.days_overdue between 31 and 60)   as d31_60,
    sum(t.amount) filter (where t.days_overdue between 61 and 90)   as d61_90,
    sum(t.amount) filter (where t.days_overdue between 91 and 120)  as d91_120,
    sum(t.amount) filter (where t.days_overdue between 121 and 360) as d121_360,
    sum(t.amount)                                                   as total_ar
  from transactions t
  join customers c on c.id = t.customer_id
  group by c.portfolio, c.customer_name, c.cust_num;

  En Next.js harías:
    const { data } = await supabase.from('v_ar_aging').select('*').eq('portfolio', selectedPortfolio)
  ============================================================
*/

// ---------- MOCK DATA (simula lo que vendría de la vista de Supabase) ----------

const RAW_DATA = [
  { portfolio: "Oracle",      custNum: "689579", customer: "Emergex USA Corp",              current: 675975, d1_30: 116,    d31_60: -282149, d61_90: -20374, d91_120: 0,     d121_360: 0 },
  { portfolio: "Oracle",      custNum: "1537",    customer: "Bristol Myers Squibb Co",       current: 0,      d1_30: 0,      d31_60: 0,       d61_90: 0,      d91_120: 0,     d121_360: 0 },
  { portfolio: "Cell Marque", custNum: "2060126637", customer: "Origene Wuxi Biotechnology", current: 9469,   d1_30: 7195,   d31_60: 11540,   d61_90: 2895,   d91_120: 4237,  d121_360: 6769 },
  { portfolio: "PRD",         custNum: "50230478", customer: "Dow Chemical USA (SCT)",       current: 0,      d1_30: 1763,   d31_60: 24141,   d61_90: 12,     d91_120: 3913,  d121_360: 37401 },
  { portfolio: "Oracle",      custNum: "5041",    customer: "US Food & Drug Administration", current: 76,     d1_30: 1718,   d31_60: 0,       d61_90: 0,      d91_120: 0,     d121_360: 19916 },
  { portfolio: "PRD",         custNum: "49682778", customer: "NIH DUNS 832563121",           current: 3838561,d1_30: 0,      d31_60: 26265,   d61_90: 41603,  d91_120: 7140,  d121_360: 11021 },
  { portfolio: "Cell Marque", custNum: "2049990013", customer: "Roche Diagnostics Corp",     current: 204682,d1_30: 39782,  d31_60: 2238,    d61_90: 451,    d91_120: 0,     d121_360: 38733 },
  { portfolio: "PRD",         custNum: "49510792", customer: "Thermo Fisher Scientific",     current: 3695,  d1_30: 16171,  d31_60: 4144,    d61_90: 827,    d91_120: 0,     d121_360: 180 },
  { portfolio: "PRD",         custNum: "49439892", customer: "Dow Chemical USA (SCT)",       current: 0,      d1_30: 0,      d31_60: 0,       d61_90: 5025,   d91_120: 2012,  d121_360: 6792 },
  { portfolio: "Oracle",      custNum: "703494",  customer: "TEAM Financial Grp Inc",        current: 470378, d1_30: 7837,   d31_60: 856,     d61_90: 0,      d91_120: 0,     d121_360: 0 },
  { portfolio: "Canada",      custNum: "50317384", customer: "NTL Laboratory",               current: 0,      d1_30: 0,      d31_60: 0,       d61_90: 0,      d91_120: 0,     d121_360: 0 },
  { portfolio: "Oracle",      custNum: "496099",  customer: "Steward Health Care System",    current: 0,      d1_30: 0,      d31_60: 0,       d61_90: 0,      d91_120: 0,     d121_360: 0 },
];

const BUCKET_DEFS = [
  { key: "current",  label: "Current" },
  { key: "d1_30",    label: "1-30 Days" },
  { key: "d31_60",   label: "31-60 Days" },
  { key: "d61_90",   label: "61-90 Days" },
  { key: "d91_120",  label: "91-120 Days" },
  { key: "d121_360", label: "121-360 Days" },
];

const ACCENT = "#0F766E";
const ACCENT_SOFT = "#5EEAD4";
const NEGATIVE = "#B91C1C";

const fmtUSD = (n) =>
  n < 0
    ? `($${Math.abs(n).toLocaleString("en-US")})`
    : `$${n.toLocaleString("en-US")}`;

export default function ARAgingDashboard() {
  const [portfolio, setPortfolio] = useState("All");

  const portfolios = useMemo(
    () => ["All", ...Array.from(new Set(RAW_DATA.map((r) => r.portfolio)))],
    []
  );

  const filtered = useMemo(
    () => (portfolio === "All" ? RAW_DATA : RAW_DATA.filter((r) => r.portfolio === portfolio)),
    [portfolio]
  );

  // ---- "measures" (equivalente a DAX / SQL aggregations) ----
  const totalAR = filtered.reduce(
    (sum, r) => sum + BUCKET_DEFS.reduce((s, b) => s + r[b.key], 0),
    0
  );

  const totalPastDue = filtered.reduce(
    (sum, r) =>
      sum + ["d1_30", "d31_60", "d61_90", "d91_120", "d121_360"].reduce((s, k) => s + r[k], 0),
    0
  );

  const pctPastDue = totalAR !== 0 ? (totalPastDue / totalAR) * 100 : 0;
  const transactionCount = filtered.length;
  const customerCount = new Set(filtered.map((r) => r.customer)).size;

  const bucketTotals = BUCKET_DEFS.map((b) => ({
    label: b.label,
    value: filtered.reduce((s, r) => s + r[b.key], 0),
  }));

  const byPortfolio = useMemo(() => {
    const map = {};
    RAW_DATA.forEach((r) => {
      const total = BUCKET_DEFS.reduce((s, b) => s + r[b.key], 0);
      map[r.portfolio] = (map[r.portfolio] || 0) + total;
    });
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, []);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F6F7F8", padding: 24, minHeight: "100vh" }}>
      {/* ---------- Filtros ---------- */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Filter size={16} color="#64748B" />
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Portfolio</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {portfolios.map((p) => (
            <button
              key={p}
              onClick={() => setPortfolio(p)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: p === portfolio ? `1px solid ${ACCENT}` : "1px solid #E2E8F0",
                background: p === portfolio ? ACCENT : "#fff",
                color: p === portfolio ? "#fff" : "#334155",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {p}
            </button>
          ))}
        </div>
        {portfolio !== "All" && (
          <button
            onClick={() => setPortfolio("All")}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={12} /> limpiar
          </button>
        )}
      </div>

      {/* ---------- KPI cards ---------- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Transactions", value: transactionCount, mono: true },
          { label: "Customer Count", value: customerCount, mono: true },
          { label: "Total AR", value: fmtUSD(totalAR), accent: true },
          { label: "Total Past Due", value: fmtUSD(totalPastDue) },
          { label: "% Past Due", value: `${pctPastDue.toFixed(2)}%` },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: kpi.accent ? ACCENT : "#fff",
              color: kpi.accent ? "#fff" : "#0F172A",
              borderRadius: 10,
              padding: "14px 16px",
              border: kpi.accent ? "none" : "1px solid #E2E8F0",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* ---------- Bar chart por portafolio ---------- */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>Total AR por Portfolio</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byPortfolio} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: "#334155" }} />
              <Tooltip formatter={(v) => fmtUSD(v)} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {byPortfolio.map((entry, i) => (
                  <Cell key={i} fill={entry.name === portfolio ? ACCENT : ACCENT_SOFT} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ---------- Aging buckets ---------- */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>Age Bucket</div>
          {bucketTotals.map((b) => (
            <div key={b.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F1F5F9", fontSize: 13 }}>
              <span style={{ color: "#64748B" }}>{b.label}</span>
              <span style={{ fontWeight: 600, color: b.value < 0 ? NEGATIVE : "#0F172A", fontVariantNumeric: "tabular-nums" }}>
                {fmtUSD(b.value)}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontSize: 13, fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtUSD(totalAR)}</span>
          </div>
        </div>
      </div>

      {/* ---------- Matriz detallada ---------- */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", padding: 16, overflowX: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>Detalle por cliente</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", textAlign: "right" }}>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748B" }}>Portfolio</th>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748B" }}>Customer</th>
              {BUCKET_DEFS.map((b) => (
                <th key={b.key} style={{ padding: "6px 8px", color: "#64748B", fontWeight: 600 }}>{b.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "6px 8px", color: "#334155" }}>{r.portfolio}</td>
                <td style={{ padding: "6px 8px", color: "#334155" }}>{r.customer}</td>
                {BUCKET_DEFS.map((b) => (
                  <td key={b.key} style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: r[b.key] < 0 ? NEGATIVE : "#0F172A" }}>
                    {fmtUSD(r[b.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
