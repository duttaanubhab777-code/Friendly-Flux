document.addEventListener("DOMContentLoaded", () => {
    let currentLang = "en";

    function getApiBase() {
        if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
            return "http://127.0.0.1:5000";
        }
        return "https://friendlyflux.pythonanywhere.com";
    }

    function t(key) {
        return dictionary[key] ? dictionary[key][currentLang] : key;
    }

    // ---------- Theme & language toggle ----------
    document.getElementById("theme-toggle").addEventListener("click", function () {
        const html = document.documentElement;
        if (html.getAttribute("data-theme") === "dark") {
            html.removeAttribute("data-theme");
            this.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            html.setAttribute("data-theme", "dark");
            this.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });

    document.getElementById("lang-toggle").addEventListener("click", () => {
        currentLang = currentLang === "en" ? "bn" : "en";
        updateStaticTexts();
    });

    function updateStaticTexts() {
        document.querySelectorAll("[data-lang]").forEach((el) => {
            const key = el.getAttribute("data-lang");
            if (dictionary[key]) el.textContent = dictionary[key][currentLang];
        });
    }

    // =====================================================================
    // Operation catalog — one entry per 3D-geometry problem type.
    // "fields" drives what gets rendered; "example" drives the one-tap fill.
    // Keys here match the backend's expected param names exactly.
    // =====================================================================
    const OPERATIONS = [
        {
            id: "distance_points", category: "pointsLines", labelKey: "opDistancePoints",
            fields: [
                { key: "point1", type: "point", labelKey: "fieldPoint1", placeholder: "1,2,3" },
                { key: "point2", type: "point", labelKey: "fieldPoint2", placeholder: "4,6,3" },
            ],
            example: { point1: "1,2,3", point2: "4,6,3" },
        },
        {
            id: "section_formula", category: "pointsLines", labelKey: "opSectionFormula",
            fields: [
                { key: "point1", type: "point", labelKey: "fieldPoint1", placeholder: "1,2,3" },
                { key: "point2", type: "point", labelKey: "fieldPoint2", placeholder: "4,5,6" },
                { key: "m", type: "text", labelKey: "fieldM", placeholder: "2" },
                { key: "n", type: "text", labelKey: "fieldN", placeholder: "1" },
                { key: "mode", type: "select", labelKey: "fieldMode", options: [["internal", "internalMode"], ["external", "externalMode"]] },
            ],
            example: { point1: "1,2,3", point2: "4,5,6", m: "2", n: "1", mode: "internal" },
        },
        {
            id: "direction_ratios", category: "pointsLines", labelKey: "opDirectionRatios",
            fields: [
                { key: "point1", type: "point", labelKey: "fieldPoint1", placeholder: "1,2,3" },
                { key: "point2", type: "point", labelKey: "fieldPoint2", placeholder: "4,6,3" },
            ],
            example: { point1: "1,2,3", point2: "4,6,3" },
        },
        {
            id: "line_two_points", category: "pointsLines", labelKey: "opLineTwoPoints",
            fields: [
                { key: "point1", type: "point", labelKey: "fieldPoint1", placeholder: "1,2,3" },
                { key: "point2", type: "point", labelKey: "fieldPoint2", placeholder: "4,5,6" },
            ],
            example: { point1: "1,2,3", point2: "4,5,6" },
        },
        {
            id: "plane_three_points", category: "planes", labelKey: "opPlaneThreePoints",
            fields: [
                { key: "point1", type: "point", labelKey: "fieldPoint1", placeholder: "1,1,1" },
                { key: "point2", type: "point", labelKey: "fieldPoint2", placeholder: "2,3,1" },
                { key: "point3", type: "point", labelKey: "fieldPoint3", placeholder: "4,1,2" },
            ],
            example: { point1: "1,1,1", point2: "2,3,1", point3: "4,1,2" },
        },
        {
            id: "plane_point_normal", category: "planes", labelKey: "opPlanePointNormal",
            fields: [
                { key: "point", type: "point", labelKey: "fieldPoint", placeholder: "1,1,1" },
                { key: "normal", type: "point", labelKey: "fieldNormal", placeholder: "1,-1,2" },
            ],
            example: { point: "1,1,1", normal: "1,-1,2" },
        },
        {
            id: "angle_between_lines", category: "angles", labelKey: "opAngleLines",
            fields: [
                { key: "direction1", type: "point", labelKey: "fieldDirection1", placeholder: "1,1,0" },
                { key: "direction2", type: "point", labelKey: "fieldDirection2", placeholder: "1,0,0" },
            ],
            example: { direction1: "1,1,0", direction2: "1,0,0" },
        },
        {
            id: "angle_between_planes", category: "angles", labelKey: "opAnglePlanes",
            fields: [
                { key: "normal1", type: "point", labelKey: "fieldNormal1", placeholder: "1,0,0" },
                { key: "normal2", type: "point", labelKey: "fieldNormal2", placeholder: "0,1,0" },
            ],
            example: { normal1: "1,0,0", normal2: "0,1,0" },
        },
        {
            id: "angle_line_plane", category: "angles", labelKey: "opAngleLinePlane",
            fields: [
                { key: "direction", type: "point", labelKey: "fieldDirection", placeholder: "1,1,1" },
                { key: "normal", type: "point", labelKey: "fieldNormal", placeholder: "1,-1,2" },
            ],
            example: { direction: "1,1,1", normal: "1,-1,2" },
        },
        {
            id: "distance_point_plane", category: "distances", labelKey: "opDistPointPlane",
            fields: [
                { key: "point", type: "point", labelKey: "fieldPoint", placeholder: "0,0,0" },
                { type: "planeGroup", labelKey: "groupPlane" },
            ],
            example: { point: "0,0,0", plane_mode: "point_normal", plane_point: "1,1,1", plane_normal: "1,-1,2" },
        },
        {
            id: "distance_point_line", category: "distances", labelKey: "opDistPointLine",
            fields: [
                { key: "point", type: "point", labelKey: "fieldPoint", placeholder: "0,0,0" },
                { type: "lineGroup", suffix: "", labelKey: "groupLine" },
            ],
            example: { point: "0,0,0", line_mode: "point_direction", line_point: "1,0,0", line_direction: "1,1,1" },
        },
        {
            id: "shortest_distance_lines", category: "distances", labelKey: "opShortestDist",
            fields: [
                { type: "lineGroup", suffix: "1", labelKey: "groupLine1" },
                { type: "lineGroup", suffix: "2", labelKey: "groupLine2" },
            ],
            example: {
                line_mode1: "point_direction", line_point1: "0,0,0", line_direction1: "1,0,0",
                line_mode2: "point_direction", line_point2: "0,0,1", line_direction2: "0,1,0",
            },
        },
        {
            id: "foot_perpendicular_plane", category: "distances", labelKey: "opFootPlane",
            fields: [
                { key: "point", type: "point", labelKey: "fieldPoint", placeholder: "5,5,5" },
                { type: "planeGroup", labelKey: "groupPlane" },
            ],
            example: { point: "5,5,5", plane_mode: "point_normal", plane_point: "0,0,0", plane_normal: "1,0,0" },
        },
        {
            id: "foot_perpendicular_line", category: "distances", labelKey: "opFootLine",
            fields: [
                { key: "point", type: "point", labelKey: "fieldPoint", placeholder: "5,5,5" },
                { type: "lineGroup", suffix: "", labelKey: "groupLine" },
            ],
            example: { point: "5,5,5", line_mode: "point_direction", line_point: "0,0,0", line_direction: "1,0,0" },
        },
        {
            id: "image_in_plane", category: "special", labelKey: "opImagePlane",
            fields: [
                { key: "point", type: "point", labelKey: "fieldPoint", placeholder: "2,3,4" },
                { type: "planeGroup", labelKey: "groupPlane" },
            ],
            example: { point: "2,3,4", plane_mode: "point_normal", plane_point: "1,1,1", plane_normal: "1,-1,2" },
        },
        {
            id: "coplanarity", category: "special", labelKey: "opCoplanarity",
            fields: [
                { key: "point1", type: "point", labelKey: "fieldPoint1", placeholder: "0,0,0" },
                { key: "point2", type: "point", labelKey: "fieldPoint2", placeholder: "1,0,0" },
                { key: "point3", type: "point", labelKey: "fieldPoint3", placeholder: "0,1,0" },
                { key: "point4", type: "point", labelKey: "fieldPoint4", placeholder: "1,1,0" },
            ],
            example: { point1: "0,0,0", point2: "1,0,0", point3: "0,1,0", point4: "1,1,0" },
        },
        {
            id: "intersection_line_plane", category: "special", labelKey: "opIntersection",
            fields: [
                { type: "lineGroup", suffix: "", labelKey: "groupLine" },
                { type: "planeGroup", labelKey: "groupPlane" },
            ],
            example: {
                line_mode: "point_direction", line_point: "1,0,0", line_direction: "1,1,1",
                plane_mode: "point_normal", plane_point: "0,0,0", plane_normal: "1,0,0",
            },
        },
    ];

    const CATEGORIES = [
        { id: "all", labelKey: "catAll" },
        { id: "pointsLines", labelKey: "catPointsLines" },
        { id: "planes", labelKey: "catPlanes" },
        { id: "angles", labelKey: "catAngles" },
        { id: "distances", labelKey: "catDistances" },
        { id: "special", labelKey: "catSpecial" },
    ];

    let activeCategory = "all";
    let currentOperation = OPERATIONS[0];

    // ---------- Category pills ----------
    const categoryRow = document.getElementById("category-row");
    CATEGORIES.forEach((cat) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = "category-pill" + (cat.id === "all" ? " active" : "");
        pill.dataset.lang = cat.labelKey;
        pill.textContent = t(cat.labelKey);
        pill.addEventListener("click", () => {
            activeCategory = cat.id;
            categoryRow.querySelectorAll(".category-pill").forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            populateOperationSelect();
        });
        categoryRow.appendChild(pill);
    });

    // ---------- Operation <select> ----------
    const operationSelect = document.getElementById("operation-select");

    function populateOperationSelect() {
        const previousId = currentOperation ? currentOperation.id : null;
        operationSelect.innerHTML = "";
        const visible = OPERATIONS.filter((op) => activeCategory === "all" || op.category === activeCategory);
        visible.forEach((op) => {
            const opt = document.createElement("option");
            opt.value = op.id;
            opt.dataset.lang = op.labelKey;
            opt.textContent = t(op.labelKey);
            operationSelect.appendChild(opt);
        });
        const stillVisible = visible.some((op) => op.id === previousId);
        operationSelect.value = stillVisible ? previousId : visible[0].id;
        onOperationChange();
    }

    operationSelect.addEventListener("change", onOperationChange);

    function onOperationChange() {
        currentOperation = OPERATIONS.find((op) => op.id === operationSelect.value) || OPERATIONS[0];
        renderFields(currentOperation);
        hideResult();
    }

    // ---------- Dynamic field rendering ----------
    const dynamicFields = document.getElementById("dynamic-fields");

    function makeFieldItem(key, labelKey, placeholder) {
        const item = document.createElement("div");
        item.className = "field-item";
        item.dataset.key = key;
        const label = document.createElement("label");
        label.dataset.lang = labelKey;
        label.textContent = t(labelKey);
        label.setAttribute("for", `f_${key}`);
        const input = document.createElement("input");
        input.type = "text";
        input.id = `f_${key}`;
        input.placeholder = placeholder || "";
        item.appendChild(label);
        item.appendChild(input);
        return item;
    }

    function makeSelectItem(key, labelKey, options) {
        const item = document.createElement("div");
        item.className = "field-item";
        item.dataset.key = key;
        const label = document.createElement("label");
        label.dataset.lang = labelKey;
        label.textContent = t(labelKey);
        const select = document.createElement("select");
        select.id = `f_${key}`;
        options.forEach(([value, optLabelKey]) => {
            const opt = document.createElement("option");
            opt.value = value;
            opt.dataset.lang = optLabelKey;
            opt.textContent = t(optLabelKey);
            select.appendChild(opt);
        });
        item.appendChild(label);
        item.appendChild(select);
        return item;
    }

    function makePill(mode, labelKey, isActive) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "toggle-pill" + (isActive ? " active" : "");
        btn.dataset.mode = mode;
        btn.dataset.lang = labelKey;
        btn.textContent = t(labelKey);
        return btn;
    }

    function setActivePill(active, inactive) {
        active.classList.add("active");
        inactive.classList.remove("active");
    }

    function renderPlaneGroup(field) {
        const wrap = document.createElement("div");
        wrap.className = "composite-group";
        wrap.dataset.groupType = "plane";
        wrap.dataset.mode = "point_normal";

        const title = document.createElement("div");
        title.className = "composite-group-title";
        title.dataset.lang = field.labelKey || "groupPlane";
        title.textContent = t(field.labelKey || "groupPlane");
        wrap.appendChild(title);

        const toggles = document.createElement("div");
        toggles.className = "toggle-pills";
        const pillA = makePill("point_normal", "pointNormalMode", true);
        const pillB = makePill("three_points", "threePointsMode", false);
        toggles.appendChild(pillA);
        toggles.appendChild(pillB);
        wrap.appendChild(toggles);

        const subA = document.createElement("div");
        subA.className = "field-row";
        subA.appendChild(makeFieldItem("plane_point", "fieldPoint", "1,1,1"));
        subA.appendChild(makeFieldItem("plane_normal", "fieldNormal", "1,-1,2"));

        const subB = document.createElement("div");
        subB.className = "field-row hidden";
        subB.appendChild(makeFieldItem("plane_point1", "fieldPoint1", "1,1,1"));
        subB.appendChild(makeFieldItem("plane_point2", "fieldPoint2", "2,3,1"));
        subB.appendChild(makeFieldItem("plane_point3", "fieldPoint3", "4,1,2"));

        wrap.appendChild(subA);
        wrap.appendChild(subB);

        pillA.addEventListener("click", () => {
            setActivePill(pillA, pillB);
            subA.classList.remove("hidden");
            subB.classList.add("hidden");
            wrap.dataset.mode = "point_normal";
        });
        pillB.addEventListener("click", () => {
            setActivePill(pillB, pillA);
            subB.classList.remove("hidden");
            subA.classList.add("hidden");
            wrap.dataset.mode = "three_points";
        });

        return wrap;
    }

    function renderLineGroup(field) {
        const suffix = field.suffix || "";
        const wrap = document.createElement("div");
        wrap.className = "composite-group";
        wrap.dataset.groupType = "line";
        wrap.dataset.suffix = suffix;
        wrap.dataset.mode = "point_direction";

        const title = document.createElement("div");
        title.className = "composite-group-title";
        title.dataset.lang = field.labelKey || "groupLine";
        title.textContent = t(field.labelKey || "groupLine");
        wrap.appendChild(title);

        const toggles = document.createElement("div");
        toggles.className = "toggle-pills";
        const pillA = makePill("point_direction", "pointDirectionMode", true);
        const pillB = makePill("two_points", "twoPointsMode", false);
        toggles.appendChild(pillA);
        toggles.appendChild(pillB);
        wrap.appendChild(toggles);

        // Point A is common to both modes
        const rowA = document.createElement("div");
        rowA.className = "field-row";
        rowA.appendChild(makeFieldItem(`line_point${suffix}`, "fieldPointA", "1,0,0"));
        wrap.appendChild(rowA);

        const subDirection = document.createElement("div");
        subDirection.className = "field-row";
        subDirection.appendChild(makeFieldItem(`line_direction${suffix}`, "fieldDirection", "1,1,1"));

        const subTwoPoints = document.createElement("div");
        subTwoPoints.className = "field-row hidden";
        subTwoPoints.appendChild(makeFieldItem(`line_point2${suffix}`, "fieldPointB", "4,5,6"));

        wrap.appendChild(subDirection);
        wrap.appendChild(subTwoPoints);

        pillA.addEventListener("click", () => {
            setActivePill(pillA, pillB);
            subDirection.classList.remove("hidden");
            subTwoPoints.classList.add("hidden");
            wrap.dataset.mode = "point_direction";
        });
        pillB.addEventListener("click", () => {
            setActivePill(pillB, pillA);
            subTwoPoints.classList.remove("hidden");
            subDirection.classList.add("hidden");
            wrap.dataset.mode = "two_points";
        });

        return wrap;
    }

    function renderFields(operation) {
        dynamicFields.innerHTML = "";
        let rowBuffer = null;

        function flushRow() {
            if (rowBuffer && rowBuffer.children.length) dynamicFields.appendChild(rowBuffer);
            rowBuffer = null;
        }

        operation.fields.forEach((field) => {
            if (field.type === "planeGroup") {
                flushRow();
                dynamicFields.appendChild(renderPlaneGroup(field));
                return;
            }
            if (field.type === "lineGroup") {
                flushRow();
                dynamicFields.appendChild(renderLineGroup(field));
                return;
            }
            if (!rowBuffer) {
                rowBuffer = document.createElement("div");
                rowBuffer.className = "field-row";
            }
            if (field.type === "select") {
                rowBuffer.appendChild(makeSelectItem(field.key, field.labelKey, field.options));
            } else {
                rowBuffer.appendChild(makeFieldItem(field.key, field.labelKey, field.placeholder));
            }
        });
        flushRow();
    }

    // ---------- Example fill / clear ----------
    document.getElementById("fill-example-btn").addEventListener("click", () => {
        const example = currentOperation.example || {};

        // First switch any composite groups to the mode the example expects
        dynamicFields.querySelectorAll(".composite-group").forEach((group) => {
            const type = group.dataset.groupType;
            const suffix = group.dataset.suffix || "";
            const modeKey = type === "plane" ? "plane_mode" : `line_mode${suffix}`;
            const desiredMode = example[modeKey];
            if (desiredMode && desiredMode !== group.dataset.mode) {
                const pill = group.querySelector(`.toggle-pill[data-mode="${desiredMode}"]`);
                if (pill) pill.click();
            }
        });

        // Then fill in every field this example specifies
        dynamicFields.querySelectorAll(".field-item").forEach((item) => {
            const key = item.dataset.key;
            if (key in example) {
                item.querySelector("input, select").value = example[key];
            }
        });
    });

    document.getElementById("clear-fields-btn").addEventListener("click", () => {
        dynamicFields.querySelectorAll("input[type='text']").forEach((input) => { input.value = ""; });
        hideResult();
    });

    // ---------- Solve ----------
    const solveBtn = document.getElementById("solve-btn");
    const solveBtnSpinner = document.getElementById("solve-btn-spinner");
    const solveBtnText = document.getElementById("solve-btn-text");
    const resultCard = document.getElementById("result-card");
    const resultHead = document.getElementById("result-head");
    const resultText = document.getElementById("result-text");
    const resultExtra = document.getElementById("result-extra");
    const stepsToggle = document.getElementById("steps-toggle");
    const stepsList = document.getElementById("steps-list");
    const resultActions = document.getElementById("result-actions");
    const copyResultBtn = document.getElementById("copy-result-btn");

    function hideResult() {
        resultCard.classList.add("hidden");
        resultCard.classList.remove("error");
    }

    function collectParams() {
        const params = {};
        dynamicFields.querySelectorAll(".field-item").forEach((item) => {
            params[item.dataset.key] = item.querySelector("input, select").value.trim();
        });
        dynamicFields.querySelectorAll(".composite-group").forEach((group) => {
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

    function setLoading(isLoading) {
        solveBtn.disabled = isLoading;
        solveBtnSpinner.classList.toggle("hidden", !isLoading);
        solveBtnText.textContent = isLoading ? t("solvingBtn") : t("solveBtn");
    }

    stepsToggle.addEventListener("click", () => {
        const open = stepsList.classList.toggle("hidden");
        stepsToggle.classList.toggle("open", !open);
        stepsToggle.querySelector("span").textContent = open ? t("showSteps") : t("hideSteps");
    });

    copyResultBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(resultText.textContent).then(() => {
            const original = copyResultBtn.textContent;
            copyResultBtn.textContent = t("copiedBtn");
            setTimeout(() => { copyResultBtn.textContent = original; }, 1500);
        });
    });

    function showSuccess(data) {
        resultCard.classList.remove("hidden", "error");
        resultHead.textContent = t("resultHead");
        resultHead.classList.remove("hidden");
        resultText.textContent = data.result;

        if (data.extra) {
            resultExtra.textContent = data.extra;
            resultExtra.classList.remove("hidden");
        } else {
            resultExtra.classList.add("hidden");
        }

        if (Array.isArray(data.steps) && data.steps.length) {
            stepsList.innerHTML = "";
            data.steps.forEach((step) => {
                const li = document.createElement("li");
                li.textContent = step;
                stepsList.appendChild(li);
            });
            stepsToggle.classList.remove("hidden");
            stepsList.classList.add("hidden");
            stepsToggle.classList.remove("open");
            stepsToggle.querySelector("span").textContent = t("showSteps");
        } else {
            stepsToggle.classList.add("hidden");
            stepsList.classList.add("hidden");
        }

        resultActions.classList.remove("hidden");
    }

    function showError(message) {
        resultCard.classList.remove("hidden");
        resultCard.classList.add("error");
        resultHead.classList.add("hidden");
        resultText.textContent = message;
        resultExtra.classList.add("hidden");
        stepsToggle.classList.add("hidden");
        stepsList.classList.add("hidden");
        resultActions.classList.add("hidden");
    }

    solveBtn.addEventListener("click", async () => {
        const params = collectParams();
        setLoading(true);

        try {
            const response = await fetch(`${getApiBase()}/api/geometry3d/solve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ operation: currentOperation.id, params }),
            });
            const data = await response.json();
            if (data.success) {
                showSuccess(data);
            } else {
                showError(data.error);
            }
        } catch (err) {
            console.error(err);
            showError(t("serverErrMsg"));
        } finally {
            setLoading(false);
        }
    });

    // ---------- Init ----------
    populateOperationSelect();
    updateStaticTexts();
});
