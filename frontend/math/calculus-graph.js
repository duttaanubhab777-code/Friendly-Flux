window.renderCalcGraph = function (points, expression, containerId) {
    containerId = containerId || "graph-canvas";
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary").trim() || "#2563eb";

    const data = [{
        x: points.map((p) => p.x),
        y: points.map((p) => p.y),
        mode: "lines",
        type: "scattergl",
        line: { color: primaryColor, width: 2.5 },
        fill: "tozeroy",
        fillcolor: primaryColor + "26",
        hovertemplate: "x = %{x}<br>y = %{y}<extra></extra>",
    }];

    const layout = {
        margin: { t: 20, r: 20, b: 40, l: 45 },
        xaxis: { title: "x", gridcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" },
        yaxis: { title: "y", gridcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: isDark ? "#9ca3af" : "#6b7280" },
    };

    Plotly.newPlot(containerId, data, layout, {
        responsive: true,
        scrollZoom: true,
        displaylogo: false,
    });
};

window.clearCalcGraph = function (containerId) {
    containerId = containerId || "graph-canvas";
    const el = document.getElementById(containerId);
    if (el && el.data) Plotly.purge(el);
};