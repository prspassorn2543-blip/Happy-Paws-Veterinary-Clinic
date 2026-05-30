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
document.addEventListener("DOMContentLoaded", function () {
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

function showError(show, msg) {
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
    projectionEl.textContent = "🔮 Projection: " + formatTHBShort(h.projection);
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
  setText("kpi-return", String(s.returnRate || 0) + "%");
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
      ? (d.monthly && d.monthly.revenue ? d.monthly.revenue : [])
      : (d.monthly && d.monthly.visits ? d.monthly.visits : []);

  _trendChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: d.monthly && d.monthly.labels ? d.monthly.labels : [],
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

  const arr = d.quarterRevenue || [];
  let html = "";

  for (let i = 0; i < arr.length; i++) {
    html +=
      '<div class="quarter-item">' +
      '<div class="quarter-label">Q' + (i + 1) + "</div>" +
      '<div class="quarter-value">' + formatTHBShort(arr[i]) + "</div>" +
      "</div>";
  }

  row.innerHTML = html;
}

// ------------------------------------------------------
// BARS
// ------------------------------------------------------
function createBars(containerId, data, field) {
  const box = document.getElementById(containerId);
  if (!box) return;

  const list = data || [];
  const max = list.length > 0 && list[0].revenue ? list[0].revenue : 1;

  let html = "";

  for (let i = 0; i < list.length; i++) {
    const x = list[i];
    const label = x[field] || "-";
    const revenue = x.revenue || 0;
    const width = (revenue / max) * 100;

    html +=
      '<div class="bar-row">' +
      '<div class="bar-label">' + label + "</div>" +
      '<div class="bar-track">' +
      '<div class="bar-fill rank-1" style="width:' + width + '%"></div>' +
      "</div>" +
      '<div class="bar-value">' + formatTHBShort(revenue) + "</div>" +
      "</div>";
  }

  box.innerHTML = html;
}

function renderServiceBars(d) {
  createBars("service-bars", d.serviceBreakdown, "name");
}

function renderDoctorBars(d) {
  createBars("doctor-bars", d.doctorBreakdown, "name");
}

// ------------------------------------------------------
// DONUTS
// ------------------------------------------------------
function renderPetChart(d) {
  if (_petChart) {
    _petChart.destroy();
  }

  const labels = [];
  const data = [];
  const list = d.petBreakdown || [];

  for (let i = 0; i < list.length; i++) {
    labels.push(list[i].pet);
    data.push(list[i].revenue);
  }

  _petChart = createDonut("pet-chart", labels, data);
}

function renderNvrChart(d) {
  if (_nvrChart) {
    _nvrChart.destroy();
  }

  _nvrChart = createDonut(
    "nvr-chart",
    ["New", "Returning"],
    [
      d.newVsReturning ? d.newVsReturning.new || 0 : 0,
      d.newVsReturning ? d.newVsReturning.returning || 0 : 0,
    ]
  );
}

function createDonut(id, labels, data) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return null;

  const ctx = canvas.getContext("2d");

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ["#3B82F6", "#93C5FD", "#F59E0B", "#10B981", "#EF4444"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// ------------------------------------------------------
// INSIGHTS
// ------------------------------------------------------
function renderInsights(d) {
  const row = document.getElementById("insight-row");
  if (!row) return;

  const list = d.insights || [];
  let html = "";

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    html +=
      '<div class="insight-card">' +
      '<div class="insight-icon">' + (item.icon || "") + "</div>" +
      '<div class="insight-title">' + (item.title || "") + "</div>" +
      '<div class="insight-body">' + (item.body || "") + "</div>" +
      "</div>";
  }

  row.innerHTML = html;
}

// ------------------------------------------------------
// FORMAT
// ------------------------------------------------------
function formatTHB(n) {
  return "฿" + Math.round(n || 0).toLocaleString("th-TH");
}

function formatTHBShort(n) {
  const value = Number(n || 0);

  if (value >= 1000000) {
    return "฿" + (value / 1000000).toFixed(1) + "M";
  }

  if (value >= 1000) {
    return "฿" + (value / 1000).toFixed(1) + "K";
  }

  return formatTHB(value);
}

function formatNum(n) {
  return Number(n || 0).toLocaleString("th-TH");
}
