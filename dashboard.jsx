const { useState, useMemo } = React;

/* =========================================================
   DATOS SIMULADOS — misma ESTRUCTURA que la imagen original,
   pero con cifras inventadas (no son datos reales de nadie).
   ========================================================= */

const PORTFOLIO_TOTALS = [
  { name: "BioReliance",  total: 8250000 },
  { name: "Canada",       total: 6120000 },
  { name: "Carlsbad",     total: 980000 },
  { name: "Cell Marque",  total: 3140000 },
  { name: "Cerilliant",   total: 1450000 },
  { name: "Madison",      total: 2680000 },
  { name: "Oracle",       total: 41200000 },
  { name: "P80",          total: 9870000 },
  { name: "PRD",          total: 47600000 },
];

const AGE_BUCKETS = [
  { label: "Current",      value: 342000, txns: 24 },
  { label: "1-30 Days",    value: 41200,  txns: 9 },
  { label: "31-60 Days",   value: 18650,  txns: 5 },
  { label: "61-90 Days",   value: 6420,   txns: 3 },
  { label: "91-120 Days",  value: 3810,   txns: 2 },
  { label: "121-360 Days", value: 12900,  txns: 4 },
  { label: "361+ Days",    value: 5200,   txns: 1 },
];

const CHANGE_VS_PRIOR = [
  { label: "Decrease",  count: 612, change: -184200 },
  { label: "Increase",  count: 1890, change: 271500 },
  { label: "No > 30",   count: 9640, change: 4300 },
  { label: "No Change", count: 2510, change: 0 },
];

const CUSTOMERS = [
  { portfolio: "Canada",      territory: "Canada",          custNum: "2000650114", name: "Abbott Laboratories Co",     current: 39773,  d1_30: 52680,  d31_60: 1998,   d61_90: 3342,   d91_120: 1519,  d121_360: 50557 },
  { portfolio: "Oracle",      territory: "NA_KDalawaimath",  custNum: "689579",     name: "Emergex USA Corp",           current: 0,      d1_30: 0,      d31_60: 116,    d61_90: -18200, d91_120: -6100, d121_360: 15500 },
  { portfolio: "Oracle",      territory: "NA_AkshayDU",      custNum: "1537",       name: "Bristol Myers Squibb Co",    current: 675975, d1_30: 20402,  d31_60: 0,      d61_90: 0,      d91_120: 0,     d121_360: 0 },
  { portfolio: "Cell Marque", territory: "Prasanna Hegde",   custNum: "2060126637", name: "Origene Wuxi Biotechnology", current: 9469,   d1_30: 7195,   d31_60: 11540,  d61_90: 2895,   d91_120: 4237,  d121_360: 6769 },
  { portfolio: "PRD",         territory: "9730",             custNum: "50230478",   name: "Dow Chemical USA (B2B)",     current: 0,      d1_30: 1763,   d31_60: 24141,  d61_90: 12,     d91_120: 3913,  d121_360: 37401 },
  { portfolio: "Oracle",      territory: "NA_VNaik",         custNum: "5041",       name: "US Food & Drug Administration", current: 76,  d1_30: 1718,   d31_60: 0,      d61_90: 0,      d91_120: 0,     d121_360: 19916 },
  { portfolio: "PRD",         territory: "9700",             custNum: "49682778",   name: "NIH DUNS 832563121",         current: 838561,d1_30: 0,      d31_60: 26265,  d61_90: 41603,  d91_120: 7140,  d121_360: 11021 },
  { portfolio: "Cell Marque", territory: "Prasanna Hegde",   custNum: "2049990013", name: "Roche Diagnostics Corp",     current: 204682, d1_30: 39782,  d31_60: 2238,   d61_90: 451,    d91_120: 0,     d121_360: 38733 },
  { portfolio: "PRD",         territory: "1000",             custNum: "49510792",   name: "Thermo Fisher Scientific",   current: 3695,   d1_30: 16171,  d31_60: 4144,   d61_90: 827,    d91_120: 0,     d121_360: 180 },
  { portfolio: "PRD",         territory: "9730",             custNum: "49439892",   name: "Dow Chemical USA (SCT)",     current: 0,      d1_30: 0,      d31_60: 0,      d61_90: 5025,   d91_120: 2012,  d121_360: 6792 },
  { portfolio: "Oracle",      territory: "NA_DJyothi",       custNum: "2986",       name: "Kimberly Clark Corp",        current: 0,      d1_30: 0,      d31_60: 0,      d61_90: 0,      d91_120: 0,     d121_360: 0 },
  { portfolio: "Oracle",      territory: "NA_VNaik",         custNum: "703494",     name: "TEAM Financial Grp Inc",     current: 470378, d1_30: 7837,   d31_60: 856,    d61_90: 0,      d91_120: 0,     d121_360: 0 },
  { portfolio: "PRD",         territory: "9700",             custNum: "49707530",   name: "Partners",                  current: 0,      d1_30: 0,      d31_60: 0,      d61_90: 0,      d91_120: 0,     d121_360: 0 },
  { portfolio: "PRD",         territory: "4500",             custNum: "50317384",   name: "NTL Laboratory",             current: 0,      d1_30: 0,      d31_60: 0,      d61_90: 0,      d91_120: 0,     d121_360: 0 },
  { portfolio: "Oracle",      territory: "NA_KKotian",       custNum: "496099",     name: "Steward Health Care System", current: 0,      d1_30: 0,      d31_60: 0,      d61_90: 0,      d91_120: 0,     d121_360: 0 },
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
const TEAL_BG = "#E8F6F4";

const fmtUSD = (n) => n < 0 ? `($${Math.abs(Math.round(n)).toLocaleString("en-US")})` : `$${Math.round(n).toLocaleString("en-US")}`;

function Card({ children, style }) {
  return <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", padding: 16, ...style }}>{children}</div>;
}

function HorizontalBarChart({ data, highlight }) {
  const max = Math.max(...data.map((d) => d.total));
  const rowH = 30;
  const width = 520;
  const labelW = 90;
  const chartW = width - labelW - 70;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${data.length * rowH + 10}`}>
      {data.map((d, i) => {
        const barW = (d.total / max) * chartW;
        const y = i * rowH + 6;
        return (
          <g key={d.name}>
            <text x={labelW - 8} y={y + 13} textAnchor="end" fontSize="11.5" fill="#334155">{d.name}</text>
            <rect x={labelW} y={y} width={Math.max(barW, 2)} height={16} rx="3" fill={d.name === highlight ? ACCENT : ACCENT_SOFT} />
            <text x={labelW + barW + 6} y={y + 13} fontSize="10.5" fill="#64748B">{fmtUSD(d.total)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function FilterBar({ portfolio, setPortfolio, portfolios }) {
  const staticFilters = ["Collector/Territory", "Cust Num", "Cust Name", "Doc Type"];
  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase" }}>Portfolio</div>
          <select value={portfolio} onChange={(e) => setPortfolio(e.target.value)}>
            {portfolios.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {staticFilters.map((f) => (
          <div key={f}>
            <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase" }}>{f}</div>
            <select disabled><option>All</option></select>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase" }}>Reporting Period End</div>
          <input type="text" disabled value="Jul 31, 2026" style={{ color: "#334155" }} />
        </div>
        <button onClick={() => setPortfolio("All")} style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", fontSize: 12, cursor: "pointer", color: "#475569" }}>
          Clear
        </button>
      </div>
    </Card>
  );
}

function AgeBucketPanel({ buckets, total, txnTotal }) {
  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>Age Bucket</div>
      <table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "#94A3B8", fontSize: 11 }}>
            <th style={{ textAlign: "left", padding: "2px 0" }}></th>
            <th style={{ textAlign: "right", padding: "2px 0" }}>AR</th>
            <th style={{ textAlign: "right", padding: "2px 0" }}>Txns</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.label} style={{ borderBottom: "1px solid #F1F5F9" }}>
              <td style={{ padding: "5px 0", color: "#64748B" }}>{b.label}</td>
              <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 600 }}>{fmtUSD(b.value)}</td>
              <td style={{ padding: "5px 0", textAlign: "right", color: "#94A3B8" }}>{b.txns}</td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: "8px 0 0", fontWeight: 700 }}>Total</td>
            <td style={{ padding: "8px 0 0", textAlign: "right", fontWeight: 700 }}>{fmtUSD(total)}</td>
            <td style={{ padding: "8px 0 0", textAlign: "right", fontWeight: 700 }}>{txnTotal}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

function ChangePanel({ rows }) {
  const totalCount = rows.reduce((s, r) => s + r.count, 0);
  const totalChange = rows.reduce((s, r) => s + r.change, 0);
  return (
    <Card style={{ marginTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>&gt;30 Change from Prior Month</div>
      <table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "#94A3B8", fontSize: 11 }}>
            <th style={{ textAlign: "left", padding: "2px 0" }}>Designation</th>
            <th style={{ textAlign: "right", padding: "2px 0" }}>Count</th>
            <th style={{ textAlign: "right", padding: "2px 0" }}>Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} style={{ borderBottom: "1px solid #F1F5F9" }}>
              <td style={{ padding: "5px 0", color: "#64748B" }}>{r.label}</td>
              <td style={{ padding: "5px 0", textAlign: "right" }}>{r.count.toLocaleString("en-US")}</td>
              <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 600, color: r.change < 0 ? NEGATIVE : "#0F172A" }}>{fmtUSD(r.change)}</td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: "8px 0 0", fontWeight: 700 }}>Total</td>
            <td style={{ padding: "8px 0 0", textAlign: "right", fontWeight: 700 }}>{totalCount.toLocaleString("en-US")}</td>
            <td style={{ padding: "8px 0 0", textAlign: "right", fontWeight: 700 }}>{fmtUSD(totalChange)}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

function ARAgingDashboard() {
  const [portfolio, setPortfolio] = useState("All");
  const portfolios = useMemo(() => ["All", ...PORTFOLIO_TOTALS.map((p) => p.name)], []);

  const filteredCustomers = useMemo(
    () => (portfolio === "All" ? CUSTOMERS : CUSTOMERS.filter((c) => c.portfolio === portfolio)),
    [portfolio]
  );

  const totalAR = filteredCustomers.reduce((s, r) => s + BUCKET_DEFS.reduce((a, b) => a + r[b.key], 0), 0);
  const totalPastDue = filteredCustomers.reduce((s, r) => s + ["d1_30","d31_60","d61_90","d91_120","d121_360"].reduce((a,k)=>a+r[k],0), 0);
  const pctPastDue = totalAR !== 0 ? (totalPastDue / totalAR) * 100 : 0;
  const txnCount = filteredCustomers.length;
  const customerCount = new Set(filteredCustomers.map((r) => r.name)).size;

  const bucketTotal = AGE_BUCKETS.reduce((s, b) => s + b.value, 0);
  const bucketTxnTotal = AGE_BUCKETS.reduce((s, b) => s + b.txns, 0);

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <FilterBar portfolio={portfolio} setPortfolio={setPortfolio} portfolios={portfolios} />

      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.3fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Columna izquierda: KPIs estilo caja teal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: ACCENT, color: "#fff", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{txnCount}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>Transactions*</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{customerCount}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>Customer Count</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtUSD(totalAR)}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>Total AR</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtUSD(totalPastDue)}</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Total Past Due</div>
          </div>
          <div style={{ background: TEAL_BG, borderRadius: 10, padding: 16, color: "#0F172A" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{pctPastDue.toFixed(2)}%</div>
            <div style={{ fontSize: 11, color: "#475569" }}>% &gt; 30 Days</div>
          </div>
        </div>

        {/* Columna central: gráfico de barras por portfolio */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>Total AR por Portfolio</div>
          <HorizontalBarChart data={PORTFOLIO_TOTALS} highlight={portfolio} />
        </Card>

        {/* Columna derecha: age bucket + change panel */}
        <div>
          <AgeBucketPanel buckets={AGE_BUCKETS} total={bucketTotal} txnTotal={bucketTxnTotal} />
          <ChangePanel rows={CHANGE_VS_PRIOR} />
        </div>
      </div>

      {/* Matriz detallada */}
      <Card style={{ overflowX: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>Detalle por cliente</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748B" }}>Portfolio</th>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748B" }}>Territory</th>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748B" }}>Cust #</th>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748B" }}>Customer</th>
              {BUCKET_DEFS.map((b) => <th key={b.key} style={{ padding: "6px 8px", color: "#64748B" }}>{b.label}</th>)}
              <th style={{ padding: "6px 8px", color: "#64748B" }}>Total AR</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((r, i) => {
              const rowTotal = BUCKET_DEFS.reduce((s, b) => s + r[b.key], 0);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "6px 8px" }}>{r.portfolio}</td>
                  <td style={{ padding: "6px 8px", color: "#64748B" }}>{r.territory}</td>
                  <td style={{ padding: "6px 8px", color: "#64748B" }}>{r.custNum}</td>
                  <td style={{ padding: "6px 8px" }}>{r.name}</td>
                  {BUCKET_DEFS.map((b) => (
                    <td key={b.key} style={{ padding: "6px 8px", textAlign: "right", color: r[b.key] < 0 ? NEGATIVE : "#0F172A" }}>
                      {fmtUSD(r[b.key])}
                    </td>
                  ))}
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmtUSD(rowTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop: 14, fontSize: 11, color: "#94A3B8" }}>
        * Datos simulados con fines demostrativos — no representan cifras reales de ninguna empresa.
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ARAgingDashboard />);
