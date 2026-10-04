// geometry3d-graph.js
// এই ফাইলটা geometry3d.js এর ফর্ম (#geo-dynamic-fields, #geo-operation-select) থেকে
// ইনপুট পড়ে ব্যাকএন্ডের /api/geometry3d/graph এন্ডপয়েন্ট কল করে, আর Plotly.js
// দিয়ে 3D গ্রাফ (scatter3d / surface traces) রেন্ডার করে।
// geometry3d.js এর কোনো ভ্যারিয়েবল/ফাংশন এখানে ব্যবহার করা হয়নি — DOM থেকেই সব পড়া হচ্ছে।

document.addEventListener("DOMContentLoaded", () => {
    const geoGraphBtn = document.getElementById("geo-graph-btn");
    const geoGraphBtnSpinner = document.getElementById("geo-graph-btn-spinner");
    const geoGraphBtnText = document.getElementById("geo-graph-btn-text");

    const geoGraphCard = document.getElementById("geo-graph-card");
    const geoGraphTitle = document.getElementById("geo-graph-title");
    const geoGraphCanvas = document.getElementById("geo-graph-canvas");
    const geoGraphNote = document.getElementById("geo-graph-note");

    if (!geoGraphBtn || !geoGraphCard || !geoGraphCanvas) return;

    // ফর্ম থেকে বর্তমান operation id পড়া (geometry3d.js এই হিডেন সিলেক্টের value
    // সবসময় currentOperation.id এর সাথে sync রাখে, তাই আলাদা করে ওই ফাইল টাচ করার দরকার নেই)
    function getCurrentOperationId() {
        const sel = document.getElementById("geo-operation-select");
        return sel ? sel.value : null;
    }

    // geometry3d.js এর collectGeoParams() এর মতোই লজিক, কিন্তু independent copy
    function collectGraphParams() {
        const params = {};
        const container = document.getElementById("geo-dynamic-fields");
        if (!container) return params;

        container.querySelectorAll(".field-item").forEach((item) => {
            const input = item.querySelector("input, select");
            if (input) params[item.dataset.key] = input.value.trim();
        });

        container.querySelectorAll(".composite-group").forEach((group) => {
            const type = group.dataset.groupType;
            const suffix = group.dataset.suffix || "";
            if (type === "plane") {
                params.plane_mode = group.dataset.mode;
            } else {
                params[`line_mode${suffix}`] = group.dataset.mode;
            }
        });

        return params;
    }

    function setGeoGraphLoading(isLoading) {
        geoGraphBtn.disabled = isLoading;
        if (geoGraphBtnSpinner) geoGraphBtnSpinner.classList.toggle("hidden", !isLoading);
        if (geoGraphBtnText) {
            geoGraphBtnText.textContent = isLoading
                ? (window.t ? window.t("graphingBtn") : "প্লট হচ্ছে...")
                : (window.t ? window.t("graphBtn") : "3D গ্রাফ দেখুন");
        }
    }

    function currentThemeTextColor() {
        const val = getComputedStyle(document.body).getPropertyValue("--text-color");
        return val && val.trim() ? val.trim() : "#333333";
    }

    function hideGeoGraph() {
        geoGraphCard.classList.add("hidden");
        geoGraphCard.classList.remove("error");
    }

    function showGeoGraphError(message) {
        geoGraphCard.classList.remove("hidden");
        geoGraphCard.classList.add("error");
        if (geoGraphTitle) geoGraphTitle.textContent = window.t ? window.t("graphTitle") : "গ্রাফ";
        geoGraphCanvas.innerHTML = "";
        if (geoGraphNote) {
            geoGraphNote.textContent = message;
            geoGraphNote.classList.remove("hidden");
        }
    }

    function renderGeoGraph(data) {
        geoGraphCard.classList.remove("hidden");
        geoGraphCard.classList.remove("error");

        if (geoGraphTitle) {
            geoGraphTitle.textContent = data.title || (window.t ? window.t("graphTitle") : "গ্রাফ");
        }

        const traces = Array.isArray(data.traces) ? data.traces : [];

        const layout = {
            autosize: true,
            margin: { l: 0, r: 0, b: 0, t: 10 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: currentThemeTextColor() },
            legend: { font: { color: currentThemeTextColor() } },
            scene: {
                xaxis: { title: "X" },
                yaxis: { title: "Y" },
                zaxis: { title: "Z" },
                aspectmode: "cube",
            },
            showlegend: true,
        };

        const config = {
            responsive: true,
            displaylogo: false,
            modeBarButtonsToRemove: ["sendDataToCloud"],
        };

        if (typeof Plotly === "undefined") {
            showGeoGraphError("Plotly.js লোড হয়নি — পেজে script ট্যাগ আছে কিনা দেখো।");
            return;
        }

        Plotly.newPlot(geoGraphCanvas, traces, layout, config);

        if (data.extra) {
            geoGraphNote.textContent = data.extra;
            geoGraphNote.classList.remove("hidden");
        } else if (geoGraphNote) {
            geoGraphNote.classList.add("hidden");
        }

        geoGraphCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    geoGraphBtn.addEventListener("click", async () => {
        const operation = getCurrentOperationId();
        if (!operation) return;

        const params = collectGraphParams();
        setGeoGraphLoading(true);

        try {
            const response = await fetch(`${window.getApiBase()}/api/geometry3d/graph`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ operation, params }),
            });
            const data = await response.json();
            if (data.success) {
                renderGeoGraph(data);
            } else {
                showGeoGraphError(data.error || (window.t ? window.t("serverErrMsg") : "Something went wrong."));
            }
        } catch (err) {
            console.error(err);
            showGeoGraphError(window.t ? window.t("serverErrMsg") : "Something went wrong.");
        } finally {
            setGeoGraphLoading(false);
        }
    });

    // অপারেশন বদলালে আগের গ্রাফ হাইড করে দেওয়া (পুরনো গ্রাফ ভুল কনটেক্সটে থেকে যাবে না)
    const geoOperationSelect = document.getElementById("geo-operation-select");
    if (geoOperationSelect) {
        geoOperationSelect.addEventListener("change", hideGeoGraph);
    }

    // উইন্ডো রিসাইজ হলে Plotly canvas ঠিকভাবে fit করানো
    window.addEventListener("resize", () => {
        if (geoGraphCard && !geoGraphCard.classList.contains("hidden") && typeof Plotly !== "undefined") {
            Plotly.Plots.resize(geoGraphCanvas);
        }
    });
});
