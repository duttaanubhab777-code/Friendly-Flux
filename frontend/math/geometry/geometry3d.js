document.addEventListener("DOMContentLoaded", () => {
    // Theme বা Lang-এর ইভেন্ট লিসেনার এখানে থাকবে না, কারণ math.js সেটা গ্লোবালি কন্ট্রোল করছে।
    // window.currentLang, window.getApiBase(), window.t() এই ফাইলে সরাসরি কাজ করবে।

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

    // HTML-এর সাথে ম্যাচ করার জন্য geo- যুক্ত করা হলো
    const geoCategoryRow = document.getElementById("geo-category-row");
    
    if(geoCategoryRow) {
        CATEGORIES.forEach((cat) => {
            const pill = document.createElement("button");
            pill.type = "button";
            pill.className = "category-pill" + (cat.id === "all" ? " active" : "");
            pill.dataset.lang = cat.labelKey;
            pill.textContent = window.t(cat.labelKey);
            pill.addEventListener("click", () => {
                activeCategory = cat.id;
                geoCategoryRow.querySelectorAll(".category-pill").forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");
                populateGeoOperationSelect();
            });
            geoCategoryRow.appendChild(pill);
        });
    }

    

        const geoOperationSelect = document.getElementById("geo-operation-select");
    const geoCustomSelectBtn = document.getElementById("geo-custom-select-btn");
    const geoCustomSelectText = document.getElementById("geo-custom-select-text");
    const geoModalOverlay = document.getElementById("geo-modal-overlay");
    const geoModalCloseBtn = document.getElementById("geo-modal-close-btn");
    const geoModalList = document.getElementById("geo-modal-list");

    // পপআপ খোলা এবং বন্ধ করার লজিক
    if(geoCustomSelectBtn) {
        geoCustomSelectBtn.addEventListener("click", () => geoModalOverlay.classList.remove("hidden"));
        geoModalCloseBtn.addEventListener("click", () => geoModalOverlay.classList.add("hidden"));
        geoModalOverlay.addEventListener("click", (e) => {
            if(e.target === geoModalOverlay) geoModalOverlay.classList.add("hidden");
        });
    }

    function populateGeoOperationSelect() {
        if(!geoOperationSelect || !geoModalList) return;
        const previousId = currentOperation ? currentOperation.id : null;
        
        geoOperationSelect.innerHTML = "";
        geoModalList.innerHTML = "";
        
        const visible = OPERATIONS.filter((op) => activeCategory === "all" || op.category === activeCategory);
        
        visible.forEach((op) => {
            // ১. লুকানো সিলেক্ট ট্যাগ আপডেট করা
            const opt = document.createElement("option");
            opt.value = op.id;
            geoOperationSelect.appendChild(opt);

            // ২. পপআপের লিস্ট বানানো (সাথে টিক চিহ্ন)
            const li = document.createElement("li");
            li.dataset.value = op.id;
            li.innerHTML = `<span data-lang="${op.labelKey}">${window.t(op.labelKey)}</span> <i class="fa-solid fa-check"></i>`;
            
            li.addEventListener("click", () => {
                geoOperationSelect.value = op.id;
                geoModalOverlay.classList.add("hidden"); // ক্লিক করলেই পপআপ বন্ধ
                onGeoOperationChange();
            });
            
            geoModalList.appendChild(li);
        });
        
        const stillVisible = visible.some((op) => op.id === previousId);
        geoOperationSelect.value = stillVisible ? previousId : visible[0].id;
        
        onGeoOperationChange();
    }

    function onGeoOperationChange() {
        currentOperation = OPERATIONS.find((op) => op.id === geoOperationSelect.value) || OPERATIONS[0];
        
        // বাটনের লেখা আপডেট করা
        if(geoCustomSelectText) {
            geoCustomSelectText.textContent = window.t(currentOperation.labelKey);
            geoCustomSelectText.dataset.lang = currentOperation.labelKey;
        }

        // লিস্টের মধ্যে টিক চিহ্ন (selected ক্লাস) আপডেট করা
        document.querySelectorAll("#geo-modal-list li").forEach(li => {
            if (li.dataset.value === currentOperation.id) {
                li.classList.add("selected");
            } else {
                li.classList.remove("selected");
            }
        });

        renderGeoFields(currentOperation);
        hideGeoResult();
    }


    const geoDynamicFields = document.getElementById("geo-dynamic-fields");

    function makeGeoFieldItem(key, labelKey, placeholder) {
        const item = document.createElement("div");
        item.className = "field-item";
        item.dataset.key = key;
        const label = document.createElement("label");
        label.dataset.lang = labelKey;
        label.textContent = window.t(labelKey);
        label.setAttribute("for", `f_${key}`);
        const input = document.createElement("input");
        input.type = "text";
        input.id = `f_${key}`;
        input.placeholder = placeholder || "";
        item.appendChild(label);
        item.appendChild(input);
        return item;
    }

    function makeGeoSelectItem(key, labelKey, options) {
        const item = document.createElement("div");
        item.className = "field-item";
        item.dataset.key = key;
        const label = document.createElement("label");
        label.dataset.lang = labelKey;
        label.textContent = window.t(labelKey);
        const select = document.createElement("select");
        select.id = `f_${key}`;
        options.forEach(([value, optLabelKey]) => {
            const opt = document.createElement("option");
            opt.value = value;
            opt.dataset.lang = optLabelKey;
            opt.textContent = window.t(optLabelKey);
            select.appendChild(opt);
        });
        item.appendChild(label);
        item.appendChild(select);
        return item;
    }

    function makeGeoPill(mode, labelKey, isActive) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "toggle-pill" + (isActive ? " active" : "");
        btn.dataset.mode = mode;
        btn.dataset.lang = labelKey;
        btn.textContent = window.t(labelKey);
        return btn;
    }

    function setGeoActivePill(active, inactive) {
        active.classList.add("active");
        inactive.classList.remove("active");
    }

    function renderGeoPlaneGroup(field) {
        const wrap = document.createElement("div");
        wrap.className = "composite-group";
        wrap.dataset.groupType = "plane";
        wrap.dataset.mode = "point_normal";

        const title = document.createElement("div");
        title.className = "composite-group-title";
        title.dataset.lang = field.labelKey || "groupPlane";
        title.textContent = window.t(field.labelKey || "groupPlane");
        wrap.appendChild(title);

        const toggles = document.createElement("div");
        toggles.className = "toggle-pills";
        const pillA = makeGeoPill("point_normal", "pointNormalMode", true);
        const pillB = makeGeoPill("three_points", "threePointsMode", false);
        toggles.appendChild(pillA);
        toggles.appendChild(pillB);
        wrap.appendChild(toggles);

        const subA = document.createElement("div");
        subA.className = "field-row";
        subA.appendChild(makeGeoFieldItem("plane_point", "fieldPoint", "1,1,1"));
        subA.appendChild(makeGeoFieldItem("plane_normal", "fieldNormal", "1,-1,2"));

        const subB = document.createElement("div");
        subB.className = "field-row hidden";
        subB.appendChild(makeGeoFieldItem("plane_point1", "fieldPoint1", "1,1,1"));
        subB.appendChild(makeGeoFieldItem("plane_point2", "fieldPoint2", "2,3,1"));
        subB.appendChild(makeGeoFieldItem("plane_point3", "fieldPoint3", "4,1,2"));

        wrap.appendChild(subA);
        wrap.appendChild(subB);

        pillA.addEventListener("click", () => {
            setGeoActivePill(pillA, pillB);
            subA.classList.remove("hidden");
            subB.classList.add("hidden");
            wrap.dataset.mode = "point_normal";
        });
        pillB.addEventListener("click", () => {
            setGeoActivePill(pillB, pillA);
            subB.classList.remove("hidden");
            subA.classList.add("hidden");
            wrap.dataset.mode = "three_points";
        });

        return wrap;
    }

    function renderGeoLineGroup(field) {
        const suffix = field.suffix || "";
        const wrap = document.createElement("div");
        wrap.className = "composite-group";
        wrap.dataset.groupType = "line";
        wrap.dataset.suffix = suffix;
        wrap.dataset.mode = "point_direction";

        const title = document.createElement("div");
        title.className = "composite-group-title";
        title.dataset.lang = field.labelKey || "groupLine";
        title.textContent = window.t(field.labelKey || "groupLine");
        wrap.appendChild(title);

        const toggles = document.createElement("div");
        toggles.className = "toggle-pills";
        const pillA = makeGeoPill("point_direction", "pointDirectionMode", true);
        const pillB = makeGeoPill("two_points", "twoPointsMode", false);
        toggles.appendChild(pillA);
        toggles.appendChild(pillB);
        wrap.appendChild(toggles);

        const rowA = document.createElement("div");
        rowA.className = "field-row";
        rowA.appendChild(makeGeoFieldItem(`line_point${suffix}`, "fieldPointA", "1,0,0"));
        wrap.appendChild(rowA);

        const subDirection = document.createElement("div");
        subDirection.className = "field-row";
        subDirection.appendChild(makeGeoFieldItem(`line_direction${suffix}`, "fieldDirection", "1,1,1"));

        const subTwoPoints = document.createElement("div");
        subTwoPoints.className = "field-row hidden";
        subTwoPoints.appendChild(makeGeoFieldItem(`line_point2${suffix}`, "fieldPointB", "4,5,6"));

        wrap.appendChild(subDirection);
        wrap.appendChild(subTwoPoints);

        pillA.addEventListener("click", () => {
            setGeoActivePill(pillA, pillB);
            subDirection.classList.remove("hidden");
            subTwoPoints.classList.add("hidden");
            wrap.dataset.mode = "point_direction";
        });
        pillB.addEventListener("click", () => {
            setGeoActivePill(pillB, pillA);
            subTwoPoints.classList.remove("hidden");
            subDirection.classList.add("hidden");
            wrap.dataset.mode = "two_points";
        });

        return wrap;
    }

    function renderGeoFields(operation) {
        if(!geoDynamicFields) return;
        geoDynamicFields.innerHTML = "";
        let rowBuffer = null;

        function flushRow() {
            if (rowBuffer && rowBuffer.children.length) geoDynamicFields.appendChild(rowBuffer);
            rowBuffer = null;
        }

        operation.fields.forEach((field) => {
            if (field.type === "planeGroup") {
                flushRow();
                geoDynamicFields.appendChild(renderGeoPlaneGroup(field));
                return;
            }
            if (field.type === "lineGroup") {
                flushRow();
                geoDynamicFields.appendChild(renderGeoLineGroup(field));
                return;
            }
            if (!rowBuffer) {
                rowBuffer = document.createElement("div");
                rowBuffer.className = "field-row";
            }
            if (field.type === "select") {
                rowBuffer.appendChild(makeGeoSelectItem(field.key, field.labelKey, field.options));
            } else {
                rowBuffer.appendChild(makeGeoFieldItem(field.key, field.labelKey, field.placeholder));
            }
        });
        flushRow();
    }

    const geoFillExampleBtn = document.getElementById("geo-fill-example-btn");
    const geoClearFieldsBtn = document.getElementById("geo-clear-fields-btn");

    if(geoFillExampleBtn) {
        geoFillExampleBtn.addEventListener("click", () => {
            const example = currentOperation.example || {};
            geoDynamicFields.querySelectorAll(".composite-group").forEach((group) => {
                const type = group.dataset.groupType;
                const suffix = group.dataset.suffix || "";
                const modeKey = type === "plane" ? "plane_mode" : `line_mode${suffix}`;
                const desiredMode = example[modeKey];
                if (desiredMode && desiredMode !== group.dataset.mode) {
                    const pill = group.querySelector(`.toggle-pill[data-mode="${desiredMode}"]`);
                    if (pill) pill.click();
                }
            });

            geoDynamicFields.querySelectorAll(".field-item").forEach((item) => {
                const key = item.dataset.key;
                if (key in example) {
                    item.querySelector("input, select").value = example[key];
                }
            });
        });
    }

    if(geoClearFieldsBtn) {
        geoClearFieldsBtn.addEventListener("click", () => {
            geoDynamicFields.querySelectorAll("input[type='text']").forEach((input) => { input.value = ""; });
            hideGeoResult();
        });
    }

    const geoSolveBtn = document.getElementById("geo-solve-btn");
    const geoSolveBtnSpinner = document.getElementById("geo-solve-btn-spinner");
    const geoSolveBtnText = document.getElementById("geo-solve-btn-text");
    const geoResultCard = document.getElementById("geo-result-card");
    const geoResultHead = document.getElementById("geo-result-head");
    const geoResultText = document.getElementById("geo-result-text");
    const geoResultExtra = document.getElementById("geo-result-extra");
    const geoStepsToggle = document.getElementById("geo-steps-toggle");
    const geoStepsList = document.getElementById("geo-steps-list");
    const geoResultActions = document.getElementById("geo-result-actions");
    const geoCopyResultBtn = document.getElementById("geo-copy-result-btn");

    function hideGeoResult() {
        if(geoResultCard) {
            geoResultCard.classList.add("hidden");
            geoResultCard.classList.remove("error");
        }
    }

    function collectGeoParams() {
        const params = {};
        geoDynamicFields.querySelectorAll(".field-item").forEach((item) => {
            params[item.dataset.key] = item.querySelector("input, select").value.trim();
        });
        geoDynamicFields.querySelectorAll(".composite-group").forEach((group) => {
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

    function setGeoLoading(isLoading) {
        if(!geoSolveBtn) return;
        geoSolveBtn.disabled = isLoading;
        geoSolveBtnSpinner.classList.toggle("hidden", !isLoading);
        geoSolveBtnText.textContent = isLoading ? window.t("solvingBtn") : window.t("solveBtn");
    }

    if(geoStepsToggle) {
        geoStepsToggle.addEventListener("click", () => {
            const open = geoStepsList.classList.toggle("hidden");
            geoStepsToggle.classList.toggle("open", !open);
            geoStepsToggle.querySelector("span").textContent = open ? window.t("showSteps") : window.t("hideSteps");
        });
    }

    if(geoCopyResultBtn) {
        geoCopyResultBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(geoResultText.dataset.plainText || geoResultText.textContent).then(() => {
                const original = geoCopyResultBtn.textContent;
                geoCopyResultBtn.textContent = window.t("copiedBtn");
                setTimeout(() => { geoCopyResultBtn.textContent = original; }, 1500);
            });
        });
    }

        function showGeoSuccess(data) {
        geoResultCard.classList.remove("hidden", "error");
        geoResultHead.textContent = window.t ? window.t("resultHead") : "Result";
        geoResultHead.classList.remove("hidden");

        geoResultText.dataset.plainText = data.result;
        
        // নতুন লাইন: রেজাল্ট থেকে সব * চিহ্ন মুছে ফেলার জন্য
        let cleanResult = (data.latex || data.result).replace(/\*/g, "");

        try {
            katex.render(cleanResult, geoResultText, { throwOnError: false, displayMode: true });
        } catch (e) {
            geoResultText.textContent = data.result.replace(/\*/g, "");
        }

        if (data.extra) {
            geoResultExtra.textContent = data.extra;
            geoResultExtra.classList.remove("hidden");
        } else {
            geoResultExtra.classList.add("hidden");
        }

        if (Array.isArray(data.steps) && data.steps.length) {
            geoStepsList.innerHTML = "";
            data.steps.forEach((step) => {
                const li = document.createElement("li");
                li.dataset.plainText = step;
                
                // নতুন লাইন: স্টেপস থেকেও সব * চিহ্ন মুছে ফেলার জন্য
                let cleanStep = step.replace(/\*/g, "");
                
                try {
                    katex.render(cleanStep, li, { throwOnError: false, displayMode: false });
                } catch(e) {
                    li.textContent = cleanStep;
                }
                geoStepsList.appendChild(li);
            });
            geoStepsToggle.classList.remove("hidden");
            geoStepsList.classList.add("hidden");
            geoStepsToggle.classList.remove("open");
            geoStepsToggle.textContent = window.t ? window.t("showSteps") : "Show steps";
        } else {
            geoStepsToggle.classList.add("hidden");
            geoStepsList.classList.add("hidden");
        }

        geoResultActions.classList.remove("hidden");
    }


    function showGeoError(message) {
        geoResultCard.classList.remove("hidden");
        geoResultCard.classList.add("error");
        geoResultHead.classList.add("hidden");
        geoResultText.textContent = message;
        geoResultExtra.classList.add("hidden");
        geoStepsToggle.classList.add("hidden");
        geoStepsList.classList.add("hidden");
        geoResultActions.classList.add("hidden");
    }

    if(geoSolveBtn) {
        geoSolveBtn.addEventListener("click", async () => {
            const params = collectGeoParams();
            setGeoLoading(true);

            try {
                const response = await fetch(`${window.getApiBase()}/api/geometry3d/solve`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ operation: currentOperation.id, params }),
                });
                const data = await response.json();
                if (data.success) {
                    showGeoSuccess(data);
                } else {
                    showGeoError(data.error);
                }
            } catch (err) {
                console.error(err);
                showGeoError(window.t("serverErrMsg"));
            } finally {
                setGeoLoading(false);
            }
        });
    }

    // Initialize Geometry
    populateGeoOperationSelect();
});