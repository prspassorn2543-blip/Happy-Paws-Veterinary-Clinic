```javascript
// ======================================================
// charts.js
// Happy Paws Dashboard (Vercel Version)
// ======================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbwzrr9_VDQdJ22YHCwzUTOK2_CA-MxeMGMXmtBWtzrgBkwQcSUBrrhYSiC_ObqR1MFTyg/exec";

let _data = null;
let _trendChart = null;
let _petChart = null;
let _nvrChart = null;
let _chartMode = "revenue";

// ------------------------------------------------------
// Chart Defaults
// ------------------------------------------------------

Chart.defaults.font.family =
"'Segoe UI','Sarabun','Noto Sans Thai',sans-serif";

Chart.defaults.color = "#64748B";

Chart.defaults.plugins.legend.display = false;

// ------------------------------------------------------
// INIT
// ------------------------------------------------------

document.addEventListener(
"DOMContentLoaded",
() => {
    loadData();
}
);

// ------------------------------------------------------
// API CALL
// ------------------------------------------------------

async function loadData(){

    showLoading(true);
    showError(false);

    try{

        const response =
            await fetch(API_URL);

        if(!response.ok){

            throw new Error(
                "ไม่สามารถโหลดข้อมูลได้"
            );
        }

        const payload =
            await response.json();

        if(!payload.success){

            throw new Error(
                payload.error ||
                "API Error"
            );
        }

        _data = payload;

        renderAll(payload);

        document
        .getElementById("dashboard")
        .classList.remove("hidden");

        setText(
            "last-updated",
            "อัปเดต " +
            new Date().toLocaleTimeString(
                "th-TH",
                {
                    hour:"2-digit",
                    minute:"2-digit"
                }
            )
        );

        showLoading(false);

    }

    catch(err){

        console.error(err);

        showLoading(false);

        showError(
            true,
            err.message
        );
    }
}

// ------------------------------------------------------
// UI HELPERS
// ------------------------------------------------------

function showLoading(show){

    const el =
    document.getElementById(
        "loading-overlay"
    );

    if(el){

        el.classList.toggle(
            "hidden",
            !show
        );
    }
}

function showError(show,msg=""){

    const el =
    document.getElementById(
        "error-state"
    );

    if(el){

        el.classList.toggle(
            "hidden",
            !show
        );
    }

    if(msg){

        setText(
            "error-msg",
            msg
        );
    }
}

function setText(id,val){

    const el =
    document.getElementById(id);

    if(el){

        el.textContent = val;
    }
}

// ------------------------------------------------------
// RENDER ALL
// ------------------------------------------------------

function renderAll(d){

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

function renderHero(d){

    const h = d.hero;

    setText(
        "hero-revenue",
        formatTHB(
            h.totalRevenue
        )
    );

    setText(
        "hero-ticket",
        formatTHB(
            h.avgTicket
        )
    );

    document.getElementById(
        "hero-projection-pill"
    ).textContent =
    "🔮 Projection: " +
    formatTHBShort(
        h.projection
    );

    const mom =
    document.getElementById(
        "hero-mom-pill"
    );

    if(h.momGrowth != null){

        mom.textContent =
        "MoM " +
        h.momGrowth +
        "%";

    }else{

        mom.textContent =
        "MoM รอข้อมูล";
    }
}

// ------------------------------------------------------
// KPI
// ------------------------------------------------------

function renderKPIs(d){

    const s =
    d.supporting;

    setText(
        "kpi-visits",
        formatNum(
            s.totalVisits
        )
    );

    setText(
        "kpi-customers",
        formatNum(
            s.uniqueCustomers
        )
    );

    setText(
        "kpi-return",
        s.returnRate + "%"
    );

    setText(
        "kpi-avg-month",
        formatTHBShort(
            s.avgMonthlyRevenue
        )
    );
}

// ------------------------------------------------------
// TREND CHART
// ------------------------------------------------------

function renderTrendChart(d){

    const ctx =
    document
    .getElementById(
        "trend-chart"
    )
    .getContext("2d");

    if(_trendChart){

        _trendChart.destroy();
    }

    const values =
    _chartMode === "revenue"
    ? d.monthly.revenue
    : d.monthly.visits;

    _trendChart =
    new Chart(ctx,{

        type:"bar",

        data:{

            labels:
            d.monthly.labels,

            datasets:[{

                data: values,

                borderRadius:6,

                backgroundColor:
                "#3B82F6"

            }]
        },

        options:{

            responsive:true,

            maintainAspectRatio:false
        }
    });
}

function switchChart(mode){

    _chartMode = mode;

    if(_data){

        renderTrendChart(
            _data
        );
    }
}

// ------------------------------------------------------
// QUARTER
// ------------------------------------------------------

function renderQuarters(d){

    const row =
    document.getElementById(
        "quarter-row"
    );

    row.innerHTML =
    d.quarterRevenue.map(
        (q,i)=>

        `<div class="quarter-item">
            <div class="quarter-label">
            Q${i+1}
            </div>

            <div class="quarter-value">
            ${formatTHBShort(q)}
            </div>
        </div>`
    ).join("");
}

// ------------------------------------------------------
// BARS
// ------------------------------------------------------

function createBars(
containerId,
data,
field
){

    const box =
    document.getElementById(
        containerId
    );

    if(!box) return;

    const max =
    data[0]?.revenue || 1;

    box.innerHTML =
    data.map(x=>`

<div class="bar-row">

<div class="bar-label">
${x[field]}
</div>

<div class="bar-track">

<div
class="bar-fill rank-1"

style="
width:
${(x.revenue/max)*100}%">
</div>

</div>

<div class="bar-value">

${formatTHBShort(
x.revenue
)}

</div>

</div>

`).join("");
}

function renderServiceBars(d){

    createBars(
        "service-bars",
        d.serviceBreakdown,
        "name"
    );
}

function renderDoctorBars(d){

    createBars(
        "doctor-bars",
        d.doctorBreakdown,
        "name"
    );
}

// ------------------------------------------------------
// DONUTS
// ------------------------------------------------------

function renderPetChart(d){

    createDonut(

        "pet-chart",

        d.petBreakdown.map(
            x=>x.pet
        ),

        d.petBreakdown.map(
            x=>x.revenue
        )
    );
}

function renderNvrChart(d){

    createDonut(

        "nvr-chart",

        ["New","Returning"],

        [

            d.newVsReturning.new,

            d.newVsReturning.returning
        ]
    );
}

function createDonut(
id,
labels,
data
){

    const ctx =
    document
    .getElementById(id)
    .getContext("2d");

    return new Chart(ctx,{

        type:"doughnut",

        data:{

            labels,

            datasets:[{

                data
            }]
        },

        options:{

            responsive:true,

            maintainAspectRatio:false
        }
    });
}

// ------------------------------------------------------
// INSIGHTS
// ------------------------------------------------------

function renderInsights(d){

    const row =
    document.getElementById(
        "insight-row"
    );

    row.innerHTML =
    d.insights.map(i=>`

<div class="insight-card">

<div class="insight-icon">
${i.icon}
</div>

<div class="insight-title">
${i.title}
</div>

<div class="insight-body">
${i.body}
</div>

</div>

`).join("");
}

// ------------------------------------------------------
// FORMAT
// ------------------------------------------------------

function formatTHB(n){

    return "฿" +
    Math.round(
        n || 0
    ).toLocaleString(
        "th-TH"
    );
}

function formatTHBShort(n){

    if(n >= 1000000){

        return "฿" +
        (n/1000000).toFixed(1)
        + "M";
    }

    if(n >= 1000){

        return "฿" +
        (n/1000).toFixed(1)
        + "K";
    }

    return formatTHB(n);
}

function formatNum(n){

    return (
        n || 0
    ).toLocaleString(
        "th-TH"
    );
}
```
