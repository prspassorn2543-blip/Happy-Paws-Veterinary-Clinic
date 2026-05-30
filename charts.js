// ======================================================
// charts.js
// Happy Paws Dashboard (Vercel Version)
// ======================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwzrr9_VDQdJ22YHCwzUTOK2_CA-MxeMGMXmtBWtzrgBkwQcSUBrrhYSiC_ObqR1MFTyg/exec?api=1";

let _data = null;
let _trendChart = null;
let _petChart = null;
let _nvrChart = null;
let _chartMode = "revenue";

// ------------------------------------------------------
// Chart Defaults
// ------------------------------------------------------
if (window.Chart) {
  Chart.defaults.font.family =
    "'Segoe UI','Sarabun','Noto Sans Thai',sans-serif";
  Chart.defaults.color = "#64748B";
  Chart.defaults.plugins.legend.display = false;
}

// ------------------------------------------------------
// INIT
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});

// ------------------------------------------------------
// API CALL
// ------------------------------------------------------
async function loadData() {
  showLoading(true);
  showError(false);

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("ไม่สามารถโหลดข้อมูลได้");
    }

    const text = await response.text();
    console.log("API raw response:", text);

    let payload;
    try {
      payload = JSON.parse(text);
    } catch (e) {
      throw new Error("API ไม่ได้ส่ง JSON");
    }

    if (!payload.success) {
      throw new Error(payload.error || "API Error");
    }

    _data = payload;
    renderAll(payload);

    const dashboardEl = document.getElementById("dashboard");
    if (dashboardEl) {
      dashboardEl.classList.remove("hidden");
    }

    setText(
      "last-updated",
      "อัปเดต " +
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        })
    );

    showLoading(false);
  } catch (err) {
    console.error(err);
    showLoading(false);
    showError(true, err.message || "เกิดข้อผิดพลาด");
  }
}

// ------------------------------------------------------
// UI HELPERS
// ------------------------------------------------------
function showLoading(show) {
  const el = document.getElementById("loading-overlay");
  if (el) {
    el.classList.toggle("hidden", !show);
  }
}

function showError(show, msg = "") {
  const el = document.getElementById("error-state");
  if (el) {
    el.classList.toggle("hidden", !show);
  }
  if (msg) {
    setText("error-msg", msg);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = val;
  }
}

// ------------------------------------------------------
// RENDER ALL
// ------------------------------------------------------
function renderAll(d) {
  renderHero(d);
  renderKPIs(d);
  renderTrendChart(d);
  renderQuarters(d);
  renderServiceBars(d);
  renderPetChart(d);
  renderNvrChart(d);
  renderDoctorBars(d);
  renderInsights(d);
}

// ------------------------------------------------------
// HERO
// ------------------------------------------------------
function renderHero(d) {
  const h = d.hero || {};

  setText("hero-revenue", formatTHB(h.totalRevenue));
  setText("hero-ticket", formatTHB(h.avgTicket));

  const projectionEl = document.getElementById("hero-projection-pill");
  if (projectionEl) {
    projectionEl.textContent =
      "🔮 Projection: " + formatTHBShort(h.projection);
  }

  const momEl = document.getElementById("hero-mom-pill");
  if (momEl) {
    if (h.momGrowth != null) {
      momEl.textContent = "MoM " + h.momGrowth + "%";
    } else {
      momEl.textContent = "MoM รอข้อมูล";
    }
  }
}

// ------------------------------------------------------
// KPI
// ------------------------------------------------------
function renderKPIs(d) {
  const s = d.supporting || {};

  setText("kpi-visits", formatNum(s.totalVisits));
  setText("kpi-customers", formatNum(s.uniqueCustomers));
  setText("kpi-return", (s.returnRate ?? 0) + "%");
  setText("kpi-avg-month", formatTHBShort(s.avgMonthlyRevenue));
}

// ------------------------------------------------------
// TREND CHART
// ------------------------------------------------------
function renderTrendChart(d) {
  const canvas = document.getElementById("trend-chart");
  if (!canvas || !window.Chart) return;

  const ctx = canvas.getContext("2d");

  if (_trendChart) {
    _trendChart.destroy();
  }

  const values =
    _chartMode === "revenue"
      ? (d.monthly?.revenue || [])
      : (d.monthly?.visits || []);

  _trendChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: d.monthly?.labels || [],
      datasets: [
        {
          data: values,
          borderRadius: 6,
          backgroundColor: "#3B82F6",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function switchChart(mode) {
  _chartMode = mode;
  if (_data) {
    renderTrendChart(_data);
  }
}

// ------------------------------------------------------
// QUARTER
// ------------------------------------------------------
function renderQuarters(d) {
  const row = document.getElementById("quarter-row");
  if (!row) return;

  row.innerHTML = (d.quarterRevenue || [])
    .map(
      (q, i) => `
      <div class="quarter-item">
        <div class="quarter-label">Q${i + 1}</div>
        <div class="quarter-value">${formatTHBShort(q)}</div>
      </div>
    `
    )
    .join("");
}

// ------------------------------------------------------
// BARS
// ------------------------------------------------------
function createBars(containerId, data, field) {
  const box = document.getElementById(containerId);
  if (!box) return;

  const list = data || [];
  const max = list[0]?.revenue || 1;

  box.innerHTML = list
    .map(
      (x) => `
      <div class="bar-row">
        <div class="bar-label">${x[field] || "-"}</div>
        <div class="bar-track">
          <div
            class="bar-fill rank-1"
            style="width:${((x.revenue || 0) / max) * 100}%">
          </div>
        </div>
        <div class="bar-value">${formatTHBShort(x.revenue || 0)}</div>
      </div>
    `
    )
    .join("");
}

function renderServiceBars(d) {
  createBars("service-bars", d.serviceBreakdown, "name");
}

function renderDoctorBars(d) {
  createBars("doctor-bars
