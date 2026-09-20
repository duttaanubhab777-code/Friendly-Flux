window.renderCalcGraph = function (points, expression, containerId) {
    containerId = containerId || "graph-canvas";
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary").trim() || "#2563eb";

    const x_data = [];
    const y_data = [];
    const interceptX = [];
    const interceptY = [];
    const asymptotes = [];

    let xMin = Infinity;
    let xMax = -Infinity;

    for (let p of points) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
    }

    // ==========================================================
    // ডাইনামিক ক্লিপ থ্রেশহোল্ড (আগের ফিক্সড ±500-এর বদলে)
    // asymptote-এর কাছে sample ভ্যালু আকাশছোঁয়া হয়ে যায় — সেগুলোই আসল
    // "outlier"। IQR (Interquartile Range) দিয়ে normal ভ্যালু আর
    // outlier আলাদা করা হচ্ছে, যাতে y-axis অকারণে বিশাল বড় হয়ে গিয়ে
    // curve-টাকে flat না দেখায়, বরং tan/sec-এর আসল বাঁক দেখা যায়।
    // ==========================================================
    function computeClipThreshold(pts) {
        const abs = pts.map(p => Math.abs(p.y)).filter(v => Number.isFinite(v)).sort((a, b) => a - b);
        if (abs.length === 0) return 500;
        const q = (p) => abs[Math.min(abs.length - 1, Math.floor(abs.length * p))];
        const q1 = q(0.25);
        const q3 = q(0.75);
        const iqr = q3 - q1;
        const threshold = q3 + iqr * 3;
        return Math.max(threshold, 10); // অন্তত ১০ ইউনিট রেঞ্জ থাকবেই
    }
    const clipThreshold = computeClipThreshold(points);

    // clipThreshold শুধু "outlier বাদ দেওয়ার সীমা" — এটা আসল ডেটার max না,
    // তাই axis-range এর জন্য যেসব ভ্যালু টিকে থাকল (clip হয়নি) তাদের প্রকৃত
    // min/max আলাদাভাবে ট্র্যাক করা হচ্ছে।
    let retainedMin = Infinity;
    let retainedMax = -Infinity;

    for (let i = 0; i < points.length; i++) {
        let currX = points[i].x;
        let rawY = points[i].y; // ক্লিপ করার আগের আসল ভ্যালু

        // ==========================================================
        // Asymptote (খাড়া দাগ ভেঙে ড্যাশড লাইন করা) — raw ভ্যালু দিয়ে চেক
        // ==========================================================
        if (i > 0) {
            let prevX = points[i - 1].x;
            let rawPrevY = points[i - 1].y;

            let dx = currX - prevX;
            let dy = rawY - rawPrevY;
            let slope = Math.abs(dy / dx);

            if (slope > 100 && (rawY * rawPrevY < 0)) {
                let midX = (currX + prevX) / 2;

                // ==========================================================
                // Deduplication: একই pole-এর একদম কাছাকাছি sampling-noise-এর
                // কারণে sign flip দু'বার ধরা পড়তে পারে। পাশাপাশি দুটো
                // asymptote যদি গড় sample-step-এর ৩ গুণের কম দূরত্বে থাকে,
                // সেটাকে নতুন আলাদা asymptote না ধরে আগেরটাই রাখা হচ্ছে —
                // এতে একাধিক dashed লাইন একসাথে জমে "সলিড" দেখানো বন্ধ হবে,
                // আর কোথাও ডুপ্লিকেট বাদ দিতে গিয়ে আসল asymptote হারাবে না।
                // ==========================================================
                const avgStep = (xMax - xMin) / (points.length - 1);
                // merge-distance দুইভাবে হিসাব করে যেটা বড় সেটা নেওয়া হচ্ছে:
                // avgStep*3 (ঘন sampling-এ ভালো কাজ করে) আর মোট x-range-এর ০.৫%
                // (বড় xmin/xmax রেঞ্জে avgStep নিজেই বড় হয়ে গেলেও নির্ভরযোগ্য থাকে)
                const mergeDist = Math.max(avgStep * 3, (xMax - xMin) * 0.005);
                const lastAx = asymptotes.length > 0 ? asymptotes[asymptotes.length - 1] : null;
                if (lastAx === null || Math.abs(midX - lastAx) > mergeDist) {
                    asymptotes.push(midX);
                    x_data.push(midX);
                    y_data.push(null);
                }
            }
        }

        // ডাইনামিক থ্রেশহোল্ড দিয়ে ক্লিপ (asymptote-check শেষ হওয়ার পরে)
        let currY = (rawY > clipThreshold || rawY < -clipThreshold) ? null : rawY;

        if (currY !== null) {
            if (currY < retainedMin) retainedMin = currY;
            if (currY > retainedMax) retainedMax = currY;
        }

        x_data.push(currX);
        y_data.push(currY);

        // ==========================================================
        // ইন্টারসেক্ট (ছেদবিন্দু) বের করার সহজ লজিক
        // ==========================================================
        if (currY === 0) {
            interceptX.push(currX);
            interceptY.push(0);
        } else if (i > 0 && currY !== null && points[i - 1].y !== null) {
            let prevY = points[i - 1].y;
            let prevX = points[i - 1].x;
            if (currY * prevY < 0 && Math.abs(currY - prevY) < 50) {
                let rootX = currX - currY * (currX - prevX) / (currY - prevY);
                interceptX.push(rootX);
                interceptY.push(0);
            }
        }
    }

    // Y-Axis ইন্টারসেক্ট (x=0)
    for (let i = 0; i < points.length - 1; i++) {
        let currX = points[i].x, currY = points[i].y;
        let nextX = points[i + 1].x, nextY = points[i + 1].y;
        if (currX === 0 && currY !== null) {
            interceptX.push(0); interceptY.push(currY);
            break;
        } else if (currX * nextX < 0 && currY !== null && nextY !== null && Math.abs(currY - nextY) < 50) {
            let yInt = currY + (0 - currX) * (nextY - currY) / (nextX - currX);
            interceptX.push(0); interceptY.push(yInt);
            break;
        }
    }

    const data = [{
        x: x_data,
        y: y_data,
        name: "Curve",
        mode: "lines",
        type: "scattergl",
        line: { color: primaryColor, width: 2.5 },
        hovertemplate: "x = %{x}<br>y = %{y}<extra></extra>",
        showlegend: false
    }];

    if (interceptX.length > 0) {
        data.push({
            x: interceptX,
            y: interceptY,
            name: "Intercept",
            mode: "markers",
            type: "scattergl",
            marker: { color: isDark ? "#ef4444" : "#dc2626", size: 8, symbol: "circle" },
            hovertemplate: "ছেদবিন্দু<br>x = %{x:.4f}<br>y = %{y:.4f}<extra></extra>",
            showlegend: false
        });
    }

    const layoutShapes = asymptotes.map(ax => ({
        type: 'line',
        x0: ax, x1: ax,
        y0: 0, y1: 1, yref: 'paper',
        line: {
            color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
            width: 1.5,
            dash: 'dash'
        }
    }));

    // ==========================================================
    // Y-axis রেঞ্জ এখন আসল টিকে থাকা ডেটার min/max থেকে বানানো হচ্ছে —
    // clipThreshold থেকে না। যেমন sin(x): retainedMin/Max হবে প্রায়
    // −1/1, তাই range হবে ~[−1.1, 1.1] — amplitude পুরোপুরি বোঝা যাবে।
    // ==========================================================
    let yRangeLow, yRangeHigh;
    if (retainedMin === Infinity) {
        // সব পয়েন্ট ক্লিপ হয়ে গেলে (খুবই বিরল কেস) fallback
        yRangeLow = -clipThreshold;
        yRangeHigh = clipThreshold;
    } else {
        const span = retainedMax - retainedMin;
        const pad = Math.max(span * 0.1, 0.5); // ছোট amplitude (যেমন sin(x)) এর জন্য ন্যূনতম padding
        yRangeLow = retainedMin - pad;
        yRangeHigh = retainedMax + pad;
    }

    const xAxisConfig = {
        title: "x",
        gridcolor: "transparent",
        zerolinecolor: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
        zerolinewidth: 1.5
    };

    if (/(sin|cos|tan|cot|sec|csc|pi)/i.test(expression)) {
        const tickvals = [];
        const ticktext = [];
        const step = Math.PI / 2;
        const startMult = Math.floor(xMin / step);
        const endMult = Math.ceil(xMax / step);

        for (let i = startMult; i <= endMult; i++) {
            tickvals.push(i * step);
            if (i === 0) ticktext.push("0");
            else if (i === 1) ticktext.push("π/2");
            else if (i === -1) ticktext.push("-π/2");
            else if (i === 2) ticktext.push("π");
            else if (i === -2) ticktext.push("-π");
            else if (i % 2 === 0) ticktext.push((i / 2) + "π");
            else ticktext.push(i + "π/2");
        }
        xAxisConfig.tickvals = tickvals;
        xAxisConfig.ticktext = ticktext;
    }

    const layout = {
        margin: { t: 20, r: 20, b: 40, l: 45 },
        xaxis: xAxisConfig,
        yaxis: {
            title: "y",
            gridcolor: "transparent",
            zerolinecolor: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
            zerolinewidth: 1.5,
            range: [yRangeLow, yRangeHigh] // আসল টিকে থাকা ডেটার min/max থেকে, প্রকৃত amplitude অনুযায়ী
        },
        shapes: layoutShapes,
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: isDark ? "#9ca3af" : "#6b7280" },
        hovermode: "closest",
        autosize: true
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
