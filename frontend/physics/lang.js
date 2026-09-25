const dictionary = {
    title: { en: "PhysicsLab", bn: "ফিজিক্স ল্যাব" },
    heroTitle: { en: "Explore the Laws of Universe", bn: "মহাবিশ্বের নিয়মগুলো জানুন" },
    heroSub: { en: "Search and calculate complex formulas instantly.", bn: "যেকোনো কঠিন সূত্র খুঁজুন এবং নিমেষে হিসাব করুন।" },
    searchPlaceholder: { en: "Search formulas...", bn: "সূত্র খুঁজুন (যেমন: Force)..." },
    availableFormulas: { en: "Available Formulas", bn: "সকল সূত্র" },
    calcBtn: { en: "Calculate Result", bn: "ফলাফল নির্ণয় করুন" },
    targetLabel: { en: "What do you want to find?", bn: "কী বের করতে চান?" },
    targetDefault: { en: "-- Select Target --", bn: "-- নির্বাচন করুন --" },
    scientistTitle: { en: "Legendary Physicists", bn: "মহান পদার্থবিজ্ঞানীগণ" },

    tabBasic: { en: "Basic Formulas", bn: "সাধারণ সূত্র" },
    tabSmart: { en: "Smart AI Solver", bn: "স্মার্ট এ.আই সলভার" },
    smartTitle: { en: "Smart Physics Solver", bn: "স্মার্ট ফিজিক্স সলভার" },
    smartTargetLabel: { en: "What do you want to find?", bn: "আপনি কী বের করতে চান?" },
    smartKnownLabel: { en: "Add known values:", bn: "জানা মানগুলো যোগ করুন:" },
    addVarBtn: { en: "+ Add Value", bn: "+ নতুন মান যোগ করুন" },
    solveBtn: { en: "Calculate Result", bn: "ফলাফল নির্ণয় করুন" }
};

const physicsFormulas = {
    // =========================================================
    // MECHANICS — Kinematics
    // =========================================================
    "v_uat": {
        id: "v_uat", all_variables: ["v", "u", "a", "t"],
        name: { en: "First equation of motion", bn: "গতির প্রথম সমীকরণ" },
        formula: "v = u + at",
        tags: ["kinematics", "velocity", "acceleration", "বেগ", "ত্বরণ", "গতি"]
    },
    "s_ut_at2": {
        id: "s_ut_at2", all_variables: ["s", "u", "t", "a"],
        name: { en: "Second equation of motion", bn: "গতির দ্বিতীয় সমীকরণ" },
        formula: "s = ut + ½at²",
        tags: ["kinematics", "displacement", "সরণ", "গতি"]
    },
    "v2_u2_as": {
        id: "v2_u2_as", all_variables: ["v", "u", "a", "s"],
        name: { en: "Third equation of motion", bn: "গতির তৃতীয় সমীকরণ" },
        formula: "v² = u² + 2as",
        tags: ["kinematics", "velocity", "গতি"]
    },
    "s_avg": {
        id: "s_avg", all_variables: ["s", "u", "v", "t"],
        name: { en: "Displacement (avg velocity)", bn: "সরণ (গড় বেগ)" },
        formula: "s = (u + v)t / 2",
        tags: ["kinematics", "average", "গড়"]
    },
    "s_vt_at2": {
        id: "s_vt_at2", all_variables: ["s", "v", "t", "a"],
        name: { en: "Displacement (v, a, t)", bn: "সরণ (v, a, t)" },
        formula: "s = vt - ½at²",
        tags: ["kinematics", "displacement", "সরণ"]
    },
    "avg_v": {
        id: "avg_v", all_variables: ["avg_v", "total_s", "total_t"],
        name: { en: "Average velocity", bn: "গড় বেগ" },
        formula: "v_avg = s / t",
        tags: ["kinematics", "velocity", "average", "গড় বেগ"]
    },
    "avg_a": {
        id: "avg_a", all_variables: ["avg_a", "v", "u", "t"],
        name: { en: "Average acceleration", bn: "গড় ত্বরণ" },
        formula: "a_avg = (v - u) / t",
        tags: ["kinematics", "acceleration", "ত্বরণ"]
    },

    // =========================================================
    // MECHANICS — Newton's laws & force
    // =========================================================
    "newtons_second_law": {
        id: "newtons_second_law", all_variables: ["F", "m", "a"],
        name: { en: "Newton's Second Law", bn: "নিউটনের দ্বিতীয় সূত্র" },
        formula: "F = ma",
        tags: ["newton", "force", "mass", "acceleration", "বল", "ভর", "ত্বরণ"]
    },
    "weight": {
        id: "weight", all_variables: ["W_weight", "m", "g"],
        name: { en: "Weight", bn: "ওজন" },
        formula: "W = mg",
        tags: ["weight", "gravity", "ওজন", "মহাকর্ষ"]
    },
    "momentum": {
        id: "momentum", all_variables: ["p", "m", "v"],
        name: { en: "Momentum", bn: "ভরবেগ" },
        formula: "p = mv",
        tags: ["momentum", "ভরবেগ"]
    },
    "impulse": {
        id: "impulse", all_variables: ["impulse", "F", "t"],
        name: { en: "Impulse (F*t)", bn: "আবেগ (F×t)" },
        formula: "J = Ft",
        tags: ["impulse", "আবেগ"]
    },
    "impulse_mv_mu": {
        id: "impulse_mv_mu", all_variables: ["impulse", "m", "v", "u"],
        name: { en: "Impulse (change in momentum)", bn: "আবেগ (ভরবেগের পরিবর্তন)" },
        formula: "J = mv - mu",
        tags: ["impulse", "momentum", "আবেগ"]
    },
    "f_net": {
        id: "f_net", all_variables: ["F_net", "m", "a"],
        name: { en: "Net Force", bn: "লব্ধি বল" },
        formula: "F_net = ma",
        tags: ["force", "net", "বল"]
    },
    "friction": {
        id: "friction", all_variables: ["F_friction", "mu", "N"],
        name: { en: "Friction force", bn: "ঘর্ষণ বল" },
        formula: "f = μN",
        tags: ["friction", "ঘর্ষণ"]
    },
    "normal_force": {
        id: "normal_force", all_variables: ["N", "m", "g"],
        name: { en: "Normal force (horizontal)", bn: "লম্ব প্রতিক্রিয়া বল" },
        formula: "N = mg",
        tags: ["normal force", "প্রতিক্রিয়া"]
    },
    "friction_mg": {
        id: "friction_mg", all_variables: ["F_friction", "mu", "m", "g"],
        name: { en: "Friction (horizontal surface)", bn: "ঘর্ষণ (সমতল পৃষ্ঠ)" },
        formula: "f = μmg",
        tags: ["friction", "ঘর্ষণ"]
    },
    "accel_incline": {
        id: "accel_incline", all_variables: ["a", "g", "sin_theta"],
        name: { en: "Acceleration on smooth incline", bn: "মসৃণ নততলে ত্বরণ" },
        formula: "a = g sinθ",
        tags: ["acceleration", "incline", "ত্বরণ", "নততল"]
    },

    // =========================================================
    // MECHANICS — Work, Energy, Power
    // =========================================================
    "work": {
        id: "work", all_variables: ["W", "F", "s"],
        name: { en: "Work", bn: "কাজ" },
        formula: "W = Fs",
        tags: ["work", "কাজ"]
    },
    "work_angle": {
        id: "work_angle", all_variables: ["W", "F", "s", "cos_theta"],
        name: { en: "Work with angle", bn: "কোণসহ কাজ" },
        formula: "W = Fs cosθ",
        tags: ["work", "angle", "কাজ"]
    },
    "kinetic_energy": {
        id: "kinetic_energy", all_variables: ["KE", "m", "v"],
        name: { en: "Kinetic Energy", bn: "গতিশক্তি" },
        formula: "KE = ½mv²",
        tags: ["energy", "kinetic", "শক্তি", "গতি"]
    },
    "potential_energy": {
        id: "potential_energy", all_variables: ["PE", "m", "g", "h"],
        name: { en: "Gravitational PE", bn: "স্থিতিশক্তি" },
        formula: "PE = mgh",
        tags: ["potential", "energy", "স্থিতি", "শক্তি"]
    },
    "spring_pe": {
        id: "spring_pe", all_variables: ["PE_spring", "k", "x"],
        name: { en: "Spring PE", bn: "স্প্রিং স্থিতিশক্তি" },
        formula: "U = ½kx²",
        tags: ["spring", "elastic", "স্প্রিং"]
    },
    "total_energy": {
        id: "total_energy", all_variables: ["E_total", "KE", "PE"],
        name: { en: "Total Energy", bn: "মোট শক্তি" },
        formula: "E = KE + PE",
        tags: ["energy", "total", "মোট শক্তি"]
    },
    "work_ke_theorem": {
        id: "work_ke_theorem", all_variables: ["W", "KE_final", "KE_initial"],
        name: { en: "Work-Energy Theorem", bn: "কাজ-শক্তি উপপাদ্য" },
        formula: "W = ΔKE",
        tags: ["work", "theorem", "কাজ-শক্তি"]
    },
    "power": {
        id: "power", all_variables: ["P_power", "W", "t"],
        name: { en: "Power", bn: "ক্ষমতা" },
        formula: "P = W/t",
        tags: ["power", "ক্ষমতা"]
    },
    "power_fv": {
        id: "power_fv", all_variables: ["P_power", "F", "v"],
        name: { en: "Power (F*v)", bn: "ক্ষমতা (F·v)" },
        formula: "P = Fv",
        tags: ["power", "ক্ষমতা"]
    },
    "efficiency_work": {
        id: "efficiency_work", all_variables: ["efficiency", "useful_work", "total_work"],
        name: { en: "Efficiency (Work)", bn: "কর্মদক্ষতা (কাজ)" },
        formula: "η = W_out / W_in",
        tags: ["efficiency", "work", "কর্মদক্ষতা"]
    },

    // =========================================================
    // MECHANICS — Momentum & collisions
    // =========================================================
    "conservation_momentum": {
        id: "conservation_momentum", all_variables: ["m1", "u1", "m2", "u2", "v1", "v2"],
        name: { en: "Conservation of Momentum", bn: "ভরবেগের নিত্যতা সূত্র" },
        formula: "m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂",
        tags: ["momentum", "collision", "সংঘর্ষ"]
    },
    "restitution_coeff": {
        id: "restitution_coeff", all_variables: ["e", "v2", "v1", "u1", "u2"],
        name: { en: "Coefficient of Restitution", bn: "প্রত্যাবস্থান গুণাঙ্ক" },
        formula: "e = (v₂ - v₁) / (u₁ - u₂)",
        tags: ["restitution", "collision", "সংঘর্ষ"]
    },
    "ke_loss_collision": {
        id: "ke_loss_collision", all_variables: ["KE_loss", "m", "u", "v"],
        name: { en: "KE Loss in collision", bn: "সংঘর্ষে গতিশক্তি হ্রাস" },
        formula: "ΔKE = ½mu² - ½mv²",
        tags: ["collision", "loss", "গতিশক্তি হ্রাস"]
    },

    // =========================================================
    // MECHANICS — Circular motion
    // =========================================================
    "v_omega_r": {
        id: "v_omega_r", all_variables: ["v", "r", "omega"],
        name: { en: "Linear & angular velocity", bn: "রৈখিক ও কৌণিক বেগ" },
        formula: "v = rω",
        tags: ["circular", "omega", "বৃত্তাকার"]
    },
    "omega_period": {
        id: "omega_period", all_variables: ["omega", "T"],
        name: { en: "Angular velocity (Period)", bn: "পর্যায়কাল থেকে ω" },
        formula: "ω = 2π/T",
        tags: ["period", "omega", "পর্যায়কাল"]
    },
    "omega_frequency": {
        id: "omega_frequency", all_variables: ["omega", "f"],
        name: { en: "Angular velocity (Frequency)", bn: "কম্পাঙ্ক থেকে ω" },
        formula: "ω = 2πf",
        tags: ["frequency", "omega", "কম্পাঙ্ক"]
    },
    "centripetal_acc_v": {
        id: "centripetal_acc_v", all_variables: ["a_c", "v", "r"],
        name: { en: "Centripetal acceleration (v)", bn: "কেন্দ্রমুখী ত্বরণ (v)" },
        formula: "a_c = v²/r",
        tags: ["centripetal", "circular", "কেন্দ্রমুখী"]
    },
    "centripetal_acc_omega": {
        id: "centripetal_acc_omega", all_variables: ["a_c", "omega", "r"],
        name: { en: "Centripetal acceleration (ω)", bn: "কেন্দ্রমুখী ত্বরণ (ω)" },
        formula: "a_c = ω²r",
        tags: ["centripetal", "omega", "কেন্দ্রমুখী"]
    },
    "centripetal_force_v": {
        id: "centripetal_force_v", all_variables: ["F_c", "m", "v", "r"],
        name: { en: "Centripetal force (v)", bn: "কেন্দ্রমুখী বল (v)" },
        formula: "F_c = mv²/r",
        tags: ["centripetal", "force", "কেন্দ্রমুখী"]
    },
    "centripetal_force_omega": {
        id: "centripetal_force_omega", all_variables: ["F_c", "m", "omega", "r"],
        name: { en: "Centripetal force (ω)", bn: "কেন্দ্রমুখী বল (ω)" },
        formula: "F_c = mω²r",
        tags: ["centripetal", "force", "কেন্দ্রমুখী"]
    },
    "conical_pendulum_T": {
        id: "conical_pendulum_T", all_variables: ["T", "r", "g"],
        name: { en: "Period of circular path", bn: "বৃত্তাকার পথের পর্যায়কাল" },
        formula: "T = 2π√(r/g)",
        tags: ["circular", "pendulum", "পর্যায়কাল"]
    },
    "critical_velocity_loop": {
        id: "critical_velocity_loop", all_variables: ["v", "g", "r"],
        name: { en: "Critical velocity (Vertical loop)", bn: "ক্রান্তি বেগ (উল্লম্ব বৃত্ত)" },
        formula: "v = √(gr)",
        tags: ["critical", "loop", "বৃত্ত"]
    },

    // =========================================================
    // MECHANICS — Gravitation
    // =========================================================
    "newtons_gravity": {
        id: "newtons_gravity", all_variables: ["F", "G", "m1", "m2", "r"],
        name: { en: "Newton's law of gravitation", bn: "নিউটনের মহাকর্ষ সূত্র" },
        formula: "F = Gm₁m₂/r²",
        tags: ["gravity", "gravitation", "মহাকর্ষ"]
    },
    "g_surface": {
        id: "g_surface", all_variables: ["g", "G", "M", "R"],
        name: { en: "g on surface", bn: "পৃষ্ঠে g" },
        formula: "g = GM/R²",
        tags: ["gravity", "g", "মহাকর্ষ"]
    },
    "g_height": {
        id: "g_height", all_variables: ["g_h", "g", "h", "R"],
        name: { en: "g at height h", bn: "h উচ্চতায় g" },
        formula: "g_h = g(1 - 2h/R)",
        tags: ["gravity", "height", "উচ্চতা"]
    },
    "g_depth": {
        id: "g_depth", all_variables: ["g_d", "g", "d", "R"],
        name: { en: "g at depth d", bn: "d গভীরতায় g" },
        formula: "g_d = g(1 - d/R)",
        tags: ["gravity", "depth", "গভীরতা"]
    },
    "pe_grav_exact": {
        id: "pe_grav_exact", all_variables: ["PE_grav", "G", "M", "m", "r"],
        name: { en: "Gravitational PE (Exact)", bn: "মহাকর্ষীয় স্থিতিশক্তি (সঠিক)" },
        formula: "U = -GMm/r",
        tags: ["potential", "gravity", "স্থিতিশক্তি"]
    },
    "escape_velocity": {
        id: "escape_velocity", all_variables: ["escape_v", "G", "M", "R"],
        name: { en: "Escape velocity", bn: "পলায়ন বেগ" },
        formula: "v_e = √(2GM/R)",
        tags: ["escape", "পলায়ন"]
    },
    "orbital_velocity": {
        id: "orbital_velocity", all_variables: ["orbital_v", "G", "M", "r"],
        name: { en: "Orbital velocity", bn: "কক্ষীয় বেগ" },
        formula: "v_o = √(GM/r)",
        tags: ["orbital", "satellite", "উপগ্রহ"]
    },
    "kepler_t2": {
        id: "kepler_t2", all_variables: ["T", "r", "G", "M"],
        name: { en: "Kepler's 3rd law", bn: "কেপলারের তৃতীয় সূত্র" },
        formula: "T² = 4π²r³/(GM)",
        tags: ["kepler", "period", "কেপলার"]
    },

    // =========================================================
    // MECHANICS — Rotational motion
    // =========================================================
    "moment_of_inertia_point": {
        id: "moment_of_inertia_point", all_variables: ["I", "m", "r"],
        name: { en: "Moment of Inertia (Point)", bn: "জড়তার ভ্রামক (বিন্দু ভর)" },
        formula: "I = mr²",
        tags: ["inertia", "rotation", "জড়তার ভ্রামক"]
    },
    "torque": {
        id: "torque", all_variables: ["tau", "F", "r"],
        name: { en: "Torque (F*r)", bn: "টর্ক (F×r)" },
        formula: "τ = Fr",
        tags: ["torque", "moment", "টর্ক"]
    },
    "torque_I_alpha": {
        id: "torque_I_alpha", all_variables: ["tau", "I", "alpha"],
        name: { en: "Torque (I*α)", bn: "টর্ক (Iα)" },
        formula: "τ = Iα",
        tags: ["torque", "inertia", "টর্ক"]
    },
    "angular_momentum": {
        id: "angular_momentum", all_variables: ["L", "I", "omega"],
        name: { en: "Angular momentum", bn: "কৌণিক ভরবেগ" },
        formula: "L = Iω",
        tags: ["angular", "momentum", "কৌণিক"]
    },
    "ke_rot": {
        id: "ke_rot", all_variables: ["KE_rot", "I", "omega"],
        name: { en: "Rotational KE", bn: "ঘূর্ণন গতিশক্তি" },
        formula: "KE = ½Iω²",
        tags: ["rotation", "energy", "ঘূর্ণন"]
    },
    "omega_kinematics_1": {
        id: "omega_kinematics_1", all_variables: ["omega", "omega0", "alpha", "t"],
        name: { en: "Rotational Kinematics (1)", bn: "ঘূর্ণন গতির সমীকরণ (১)" },
        formula: "ω = ω₀ + αt",
        tags: ["rotation", "kinematics", "ঘূর্ণন"]
    },
    "theta_kinematics_2": {
        id: "theta_kinematics_2", all_variables: ["theta", "omega0", "t", "alpha"],
        name: { en: "Rotational Kinematics (2)", bn: "ঘূর্ণন গতির সমীকরণ (২)" },
        formula: "θ = ω₀t + ½αt²",
        tags: ["rotation", "kinematics", "ঘূর্ণন"]
    },
    "omega_kinematics_3": {
        id: "omega_kinematics_3", all_variables: ["omega", "omega0", "alpha", "theta"],
        name: { en: "Rotational Kinematics (3)", bn: "ঘূর্ণন গতির সমীকরণ (৩)" },
        formula: "ω² = ω₀² + 2αθ",
        tags: ["rotation", "kinematics", "ঘূর্ণন"]
    },
    "I_rod_cm": {
        id: "I_rod_cm", all_variables: ["I_rod_cm", "m", "L"],
        name: { en: "Inertia of Rod (CM)", bn: "দণ্ডের জড়তার ভ্রামক (CM)" },
        formula: "I = mL²/12",
        tags: ["inertia", "rod", "জড়তার ভ্রামক"]
    },
    "I_disc": {
        id: "I_disc", all_variables: ["I_disc", "m", "R"],
        name: { en: "Inertia of Disc", bn: "চাকতির জড়তার ভ্রামক" },
        formula: "I = ½mR²",
        tags: ["inertia", "disc", "জড়তার ভ্রামক"]
    },
    "I_ring": {
        id: "I_ring", all_variables: ["I_ring", "m", "R"],
        name: { en: "Inertia of Ring", bn: "রিংয়ের জড়তার ভ্রামক" },
        formula: "I = mR²",
        tags: ["inertia", "ring", "জড়তার ভ্রামক"]
    },
    "I_solid_sphere": {
        id: "I_solid_sphere", all_variables: ["I_solid_sphere", "m", "R"],
        name: { en: "Inertia of Solid Sphere", bn: "নিরেট গোলকের জড়তার ভ্রামক" },
        formula: "I = ⅖mR²",
        tags: ["inertia", "sphere", "জড়তার ভ্রামক"]
    },
    "I_hollow_sphere": {
        id: "I_hollow_sphere", all_variables: ["I_hollow_sphere", "m", "R"],
        name: { en: "Inertia of Hollow Sphere", bn: "ফাঁপা গোলকের জড়তার ভ্রামক" },
        formula: "I = ⅔mR²",
        tags: ["inertia", "sphere", "জড়তার ভ্রামক"]
    },

    // =========================================================
    // MECHANICS — Simple Harmonic Motion
    // =========================================================
    "shm_period_spring": {
        id: "shm_period_spring", all_variables: ["T", "m", "k"],
        name: { en: "SHM period (spring)", bn: "SHM পর্যায়কাল (স্প্রিং)" },
        formula: "T = 2π√(m/k)",
        tags: ["shm", "spring", "পর্যায়কাল"]
    },
    "shm_period_pendulum": {
        id: "shm_period_pendulum", all_variables: ["T", "L", "g"],
        name: { en: "Simple pendulum period", bn: "সরল দোলকের পর্যায়কাল" },
        formula: "T = 2π√(L/g)",
        tags: ["pendulum", "shm", "দোলক"]
    },
    "shm_omega_spring": {
        id: "shm_omega_spring", all_variables: ["omega", "k", "m"],
        name: { en: "Angular freq (Spring)", bn: "কৌণিক কম্পাঙ্ক (স্প্রিং)" },
        formula: "ω = √(k/m)",
        tags: ["shm", "omega", "স্প্রিং"]
    },
    "shm_omega_pendulum": {
        id: "shm_omega_pendulum", all_variables: ["omega", "g", "L"],
        name: { en: "Angular freq (Pendulum)", bn: "কৌণিক কম্পাঙ্ক (দোলক)" },
        formula: "ω = √(g/L)",
        tags: ["shm", "omega", "দোলক"]
    },
    "shm_a_x": {
        id: "shm_a_x", all_variables: ["a", "omega", "x"],
        name: { en: "SHM Acceleration", bn: "SHM ত্বরণ" },
        formula: "a = -ω²x",
        tags: ["shm", "acceleration", "ত্বরণ"]
    },
    "shm_v_x": {
        id: "shm_v_x", all_variables: ["v", "omega", "A", "x"],
        name: { en: "SHM Velocity", bn: "SHM বেগ" },
        formula: "v = ω√(A² - x²)",
        tags: ["shm", "velocity", "বেগ"]
    },
    "shm_vmax": {
        id: "shm_vmax", all_variables: ["v_max", "omega", "A"],
        name: { en: "SHM max velocity", bn: "SHM সর্বোচ্চ বেগ" },
        formula: "v_max = ωA",
        tags: ["shm", "velocity"]
    },
    "shm_amax": {
        id: "shm_amax", all_variables: ["a_max", "omega", "A"],
        name: { en: "SHM max acceleration", bn: "SHM সর্বোচ্চ ত্বরণ" },
        formula: "a_max = ω²A",
        tags: ["shm", "acceleration"]
    },
    "shm_E_k": {
        id: "shm_E_k", all_variables: ["E_shm", "k", "A"],
        name: { en: "Total Energy of SHM (k)", bn: "SHM এর মোট শক্তি (k)" },
        formula: "E = ½kA²",
        tags: ["shm", "energy", "শক্তি"]
    },
    "shm_E_m": {
        id: "shm_E_m", all_variables: ["E_shm", "m", "omega", "A"],
        name: { en: "Total Energy of SHM (m, ω)", bn: "SHM এর মোট শক্তি (m, ω)" },
        formula: "E = ½mω²A²",
        tags: ["shm", "energy", "শক্তি"]
    },
    "shm_KE": {
        id: "shm_KE", all_variables: ["KE_shm", "m", "omega", "A", "x"],
        name: { en: "Kinetic Energy in SHM", bn: "SHM গতিশক্তি" },
        formula: "KE = ½mω²(A² - x²)",
        tags: ["shm", "kinetic", "গতিশক্তি"]
    },
    "shm_PE": {
        id: "shm_PE", all_variables: ["PE_shm", "m", "omega", "x"],
        name: { en: "Potential Energy in SHM", bn: "SHM স্থিতিশক্তি" },
        formula: "PE = ½mω²x²",
        tags: ["shm", "potential", "স্থিতিশক্তি"]
    },
    "shm_x_sin": {
        id: "shm_x_sin", all_variables: ["x", "A", "omega", "t"],
        name: { en: "Displacement SHM (sine)", bn: "SHM সরণ (সাইন)" },
        formula: "x = A sin(ωt)",
        tags: ["shm", "displacement", "সরণ"]
    },
    "shm_x_cos": {
        id: "shm_x_cos", all_variables: ["x", "A", "omega", "t"],
        name: { en: "Displacement SHM (cosine)", bn: "SHM সরণ (কোসাইন)" },
        formula: "x = A cos(ωt)",
        tags: ["shm", "displacement", "সরণ"]
    },

    // =========================================================
    // MECHANICS — Waves
    // =========================================================
    "wave_speed": {
        id: "wave_speed", all_variables: ["v", "f", "lambda_w"],
        name: { en: "Wave speed", bn: "তরঙ্গ বেগ" },
        formula: "v = fλ",
        tags: ["wave", "frequency", "wavelength", "তরঙ্গ"]
    },
    "string_wave": {
        id: "string_wave", all_variables: ["v", "T_tension", "mu_linear"],
        name: { en: "Wave on string", bn: "তারের তরঙ্গ" },
        formula: "v = √(T/μ)",
        tags: ["string", "wave", "তার"]
    },
    "sound_solid": {
        id: "sound_solid", all_variables: ["v", "Y", "rho"],
        name: { en: "Sound in solid rod", bn: "কঠিন দণ্ডে শব্দের বেগ" },
        formula: "v = √(Y/ρ)",
        tags: ["sound", "solid", "শব্দ"]
    },
    "sound_fluid": {
        id: "sound_fluid", all_variables: ["v", "B_mod", "rho"],
        name: { en: "Sound in fluid", bn: "তরল/গ্যাসে শব্দের বেগ" },
        formula: "v = √(B/ρ)",
        tags: ["sound", "fluid", "শব্দ"]
    },
    "freq_period": {
        id: "freq_period", all_variables: ["f", "T"],
        name: { en: "Frequency & Period", bn: "কম্পাঙ্ক ও পর্যায়কাল" },
        formula: "f = 1/T",
        tags: ["frequency", "period", "কম্পাঙ্ক"]
    },
    "wave_number": {
        id: "wave_number", all_variables: ["k_wave", "lambda_w"],
        name: { en: "Wave Number", bn: "তরঙ্গ সংখ্যা" },
        formula: "k = 2π/λ",
        tags: ["wave number", "k_wave", "তরঙ্গ"]
    },
    "omega_wave": {
        id: "omega_wave", all_variables: ["omega", "f"],
        name: { en: "Angular frequency", bn: "কৌণিক কম্পাঙ্ক" },
        formula: "ω = 2πf",
        tags: ["frequency", "omega"]
    },
    "wave_equation": {
        id: "wave_equation", all_variables: ["y", "A", "k_wave", "x", "omega", "t"],
        name: { en: "Progressive wave equation", bn: "অগ্রগামী তরঙ্গের সমীকরণ" },
        formula: "y = A sin(kx - ωt)",
        tags: ["wave", "equation", "তরঙ্গ"]
    },
    "beat": {
        id: "beat", all_variables: ["beat_f", "f1", "f2"],
        name: { en: "Beat frequency", bn: "বিট কম্পাঙ্ক" },
        formula: "Δf = |f₁ - f₂|",
        tags: ["beat", "বিট"]
    },
    "open_pipe": {
        id: "open_pipe", all_variables: ["f_open", "n", "v", "L"],
        name: { en: "Freq in open pipe", bn: "খোলা নলের কম্পাঙ্ক" },
        formula: "f = nv/(2L)",
        tags: ["pipe", "wave", "নল"]
    },
    "closed_pipe": {
        id: "closed_pipe", all_variables: ["f_closed", "n", "v", "L"],
        name: { en: "Freq in closed pipe", bn: "বদ্ধ নলের কম্পাঙ্ক" },
        formula: "f = (2n - 1)v/(4L)",
        tags: ["pipe", "wave", "নল"]
    },
    "intensity_power": {
        id: "intensity_power", all_variables: ["I_intensity", "P_power", "r"],
        name: { en: "Wave Intensity (Power)", bn: "তরঙ্গের তীব্রতা (ক্ষমতা)" },
        formula: "I = P/(4πr²)",
        tags: ["intensity", "wave", "তীব্রতা"]
    },
    "intensity_amp": {
        id: "intensity_amp", all_variables: ["I_intensity", "f", "A", "v", "rho"],
        name: { en: "Wave Intensity (Amplitude)", bn: "তরঙ্গের তীব্রতা (বিস্তার)" },
        formula: "I = 2π²f²A²vρ",
        tags: ["intensity", "wave", "তীব্রতা"]
    },

    // =========================================================
    // MECHANICS — Elasticity & fluids
    // =========================================================
    "stress_def": {
        id: "stress_def", all_variables: ["stress", "F", "A"],
        name: { en: "Stress", bn: "পীড়ন" },
        formula: "Stress = F/A",
        tags: ["stress", "elasticity", "পীড়ন"]
    },
    "strain_def": {
        id: "strain_def", all_variables: ["strain", "delta_L", "L"],
        name: { en: "Strain", bn: "বিকৃতি" },
        formula: "Strain = ΔL/L",
        tags: ["strain", "elasticity", "বিকৃতি"]
    },
    "youngs_modulus_def": {
        id: "youngs_modulus_def", all_variables: ["Y", "stress", "strain"],
        name: { en: "Young's Modulus (Stress/Strain)", bn: "ইয়ং-এর গুণাঙ্ক (পীড়ন/বিকৃতি)" },
        formula: "Y = Stress/Strain",
        tags: ["young", "elasticity", "ইয়ং"]
    },
    "youngs_modulus": {
        id: "youngs_modulus", all_variables: ["Y", "F", "L", "A", "delta_L"],
        name: { en: "Young's Modulus", bn: "ইয়ং-এর গুণাঙ্ক" },
        formula: "Y = FL/(AΔL)",
        tags: ["elasticity", "young", "ইয়ং"]
    },
    "bulk_modulus": {
        id: "bulk_modulus", all_variables: ["B_mod", "P", "V", "delta_V"],
        name: { en: "Bulk Modulus", bn: "আয়তন গুণাঙ্ক" },
        formula: "B = -PV/ΔV",
        tags: ["bulk modulus", "elasticity", "আয়তন গুণাঙ্ক"]
    },
    "viscosity": {
        id: "viscosity", all_variables: ["eta", "F", "d", "A", "v"],
        name: { en: "Coefficient of Viscosity", bn: "সান্দ্রতা গুণাঙ্ক" },
        formula: "η = Fd/(Av)",
        tags: ["viscosity", "fluid", "সান্দ্রতা"]
    },
    "pressure": {
        id: "pressure", all_variables: ["P", "F", "A"],
        name: { en: "Pressure", bn: "চাপ" },
        formula: "P = F/A",
        tags: ["pressure", "চাপ"]
    },
    "hydrostatic": {
        id: "hydrostatic", all_variables: ["P", "rho", "g", "h"],
        name: { en: "Hydrostatic pressure", bn: "তরল স্তম্ভের চাপ" },
        formula: "P = ρgh",
        tags: ["fluid", "pressure", "তরল"]
    },
    "pressure_total": {
        id: "pressure_total", all_variables: ["P", "P0", "rho", "g", "h"],
        name: { en: "Total Pressure at depth", bn: "গভীরতায় মোট চাপ" },
        formula: "P = P₀ + ρgh",
        tags: ["fluid", "pressure", "চাপ"]
    },
    "buoyancy": {
        id: "buoyancy", all_variables: ["F_b", "V", "rho", "g"],
        name: { en: "Buoyant force", bn: "উর্ধ্বমুখী বল" },
        formula: "F_b = Vρg",
        tags: ["buoyancy", "archimedes", "আর্কিমিডিস"]
    },
    "flow_rate": {
        id: "flow_rate", all_variables: ["Q_flow", "A", "v"],
        name: { en: "Volume Flow Rate", bn: "প্রবাহের হার" },
        formula: "Q = Av",
        tags: ["flow", "fluid", "প্রবাহ"]
    },
    "continuity": {
        id: "continuity", all_variables: ["A1", "v1", "A2", "v2"],
        name: { en: "Equation of continuity", bn: "অবিচ্ছিন্নতার সমীকরণ" },
        formula: "A₁v₁ = A₂v₂",
        tags: ["fluid", "continuity", "প্রবাহ"]
    },
    "torricelli": {
        id: "torricelli", all_variables: ["v", "g", "h"],
        name: { en: "Torricelli's theorem", bn: "টরিসেলির উপপাদ্য" },
        formula: "v = √(2gh)",
        tags: ["fluid", "torricelli"]
    },
    "reynolds": {
        id: "reynolds", all_variables: ["Re", "rho", "v", "d", "eta"],
        name: { en: "Reynolds Number", bn: "রেনল্ডস সংখ্যা" },
        formula: "Re = ρvd/η",
        tags: ["reynolds", "fluid", "রেনল্ডস"]
    },
 // =========================================================
    // THERMAL PHYSICS
    // =========================================================
    "heat_capacity": {
        id: "heat_capacity", all_variables: ["Q", "m", "c", "dT"],
        name: { en: "Heat (Q = mcΔT)", bn: "তাপ (Q = mcΔT)" },
        formula: "Q = mcΔT",
        tags: ["heat", "thermal", "তাপ"]
    },
    "latent_heat": {
        id: "latent_heat", all_variables: ["Q", "m", "L_latent"],
        name: { en: "Latent heat", bn: "সুপ্ত তাপ" },
        formula: "Q = mL",
        tags: ["latent", "phase", "সুপ্ত"]
    },
    "linear_expansion": {
        id: "linear_expansion", all_variables: ["dL", "L", "alpha", "dT"],
        name: { en: "Linear expansion", bn: "রৈখিক প্রসারণ" },
        formula: "ΔL = LαΔT",
        tags: ["expansion", "thermal", "প্রসারণ"]
    },
    "area_expansion": {
        id: "area_expansion", all_variables: ["dA", "A", "alpha", "dT"],
        name: { en: "Area expansion", bn: "ক্ষেত্র প্রসারণ" },
        formula: "ΔA = A(2α)ΔT",
        tags: ["expansion", "area", "প্রসারণ"]
    },
    "volume_expansion": {
        id: "volume_expansion", all_variables: ["dV", "V", "gamma_exp", "dT"],
        name: { en: "Volume expansion", bn: "আয়তন প্রসারণ" },
        formula: "ΔV = VγΔT",
        tags: ["expansion", "volume", "প্রসারণ"]
    },
    "gamma_alpha": {
        id: "gamma_alpha", all_variables: ["gamma_exp", "alpha"],
        name: { en: "Gamma vs Alpha", bn: "গামা ও আলফার সম্পর্ক" },
        formula: "γ = 3α",
        tags: ["expansion", "thermal"]
    },
    "ideal_gas_phy": {
        id: "ideal_gas_phy", all_variables: ["P", "V", "n", "R", "T"],
        name: { en: "Ideal gas law", bn: "আদর্শ গ্যাস সূত্র" },
        formula: "PV = nRT",
        tags: ["gas", "thermal", "গ্যাস"]
    },
    "combined_gas_law": {
        id: "combined_gas_law", all_variables: ["P1", "V1", "T1", "P2", "V2", "T2"],
        name: { en: "Combined Gas Law", bn: "সম্মিলিত গ্যাস সূত্র" },
        formula: "P₁V₁/T₁ = P₂V₂/T₂",
        tags: ["gas", "combined"]
    },
    "boyle_law": {
        id: "boyle_law", all_variables: ["P1", "V1", "P2", "V2"],
        name: { en: "Boyle's Law", bn: "বয়লের সূত্র" },
        formula: "P₁V₁ = P₂V₂",
        tags: ["boyle", "gas", "বয়ল"]
    },
    "charles_law": {
        id: "charles_law", all_variables: ["V1", "T1", "V2", "T2"],
        name: { en: "Charles's Law", bn: "চার্লসের সূত্র" },
        formula: "V₁/T₁ = V₂/T₂",
        tags: ["charles", "gas", "চার্লস"]
    },
    "gay_lussac": {
        id: "gay_lussac", all_variables: ["P1", "T1", "P2", "T2"],
        name: { en: "Gay-Lussac's Law", bn: "গে-লুসাকের সূত্র" },
        formula: "P₁/T₁ = P₂/T₂",
        tags: ["gay-lussac", "gas"]
    },
    "internal_energy": {
        id: "internal_energy", all_variables: ["dU", "n", "Cv", "dT"],
        name: { en: "Change in Internal Energy", bn: "অভ্যন্তরীণ শক্তির পরিবর্তন" },
        formula: "ΔU = nC_vΔT",
        tags: ["internal energy", "thermodynamics"]
    },
    "enthalpy_change": {
        id: "enthalpy_change", all_variables: ["dH", "n", "Cp", "dT"],
        name: { en: "Change in Enthalpy", bn: "এনথ্যালপি পরিবর্তন" },
        formula: "ΔH = nC_pΔT",
        tags: ["enthalpy", "thermodynamics"]
    },
    "cp_cv": {
        id: "cp_cv", all_variables: ["Cp", "Cv", "R"],
        name: { en: "Cp - Cv = R", bn: "মায়ার-এর সম্পর্ক" },
        formula: "C_p - C_v = R",
        tags: ["heat capacity", "thermodynamics"]
    },
    "gamma_ratio": {
        id: "gamma_ratio", all_variables: ["gamma_gas", "Cp", "Cv"],
        name: { en: "Heat Capacity Ratio (γ)", bn: "তাপ ধারণ ক্ষমতার অনুপাত (γ)" },
        formula: "γ = C_p/C_v",
        tags: ["gamma", "thermodynamics"]
    },
    "work_gas_isobaric": {
        id: "work_gas_isobaric", all_variables: ["W_gas", "P", "dV"],
        name: { en: "Work done by gas (Isobaric)", bn: "গ্যাস দ্বারা কৃত কাজ (সমচাপ)" },
        formula: "W = PΔV",
        tags: ["work", "gas", "কাজ"]
    },
    "work_gas_isothermal": {
        id: "work_gas_isothermal", all_variables: ["W_gas", "n", "R", "T", "V2", "V1"],
        name: { en: "Work done by gas (Isothermal)", bn: "গ্যাস দ্বারা কৃত কাজ (সমোষ্ণ)" },
        formula: "W = nRT ln(V₂/V₁)",
        tags: ["work", "isothermal", "কাজ"]
    },
    "first_law_thermo": {
        id: "first_law_thermo", all_variables: ["dQ", "dU", "W_gas"],
        name: { en: "First Law of Thermodynamics", bn: "তাপগতিবিদ্যার প্রথম সূত্র" },
        formula: "ΔQ = ΔU + W",
        tags: ["thermodynamics", "first law"]
    },
    "carnot_eff_T": {
        id: "carnot_eff_T", all_variables: ["efficiency_carnot", "T1", "T2"],
        name: { en: "Carnot efficiency (T1, T2)", bn: "কার্নো দক্ষতা (তাপমাত্রা)" },
        formula: "η = 1 - T₂/T₁",
        tags: ["carnot", "engine", "কার্নো"]
    },
    "carnot_eff_diff": {
        id: "carnot_eff_diff", all_variables: ["efficiency_carnot", "T1", "T2"],
        name: { en: "Carnot efficiency (Diff)", bn: "কার্নো দক্ষতা (পার্থক্য)" },
        formula: "η = (T₁ - T₂)/T₁",
        tags: ["carnot", "engine", "কার্নো"]
    },
    "carnot_heat_ratio": {
        id: "carnot_heat_ratio", all_variables: ["Q1", "T1", "Q2", "T2"],
        name: { en: "Carnot Heat-Temp Ratio", bn: "কার্নো তাপ-তাপমাত্রা অনুপাত" },
        formula: "Q₁/T₁ = Q₂/T₂",
        tags: ["carnot", "heat", "তাপ"]
    },
    "rms_speed": {
        id: "rms_speed", all_variables: ["rms", "R", "T", "M"],
        name: { en: "RMS speed", bn: "RMS গতি" },
        formula: "v_rms = √(3RT/M)",
        tags: ["kinetic", "gas", "rms"]
    },
    "v_avg_gas": {
        id: "v_avg_gas", all_variables: ["v_avg", "R", "T", "M"],
        name: { en: "Average velocity of gas", bn: "গ্যাসের গড় বেগ" },
        formula: "v_avg = √(8RT/πM)",
        tags: ["velocity", "gas", "গড় বেগ"]
    },
    "v_mp_gas": {
        id: "v_mp_gas", all_variables: ["v_mp", "R", "T", "M"],
        name: { en: "Most probable velocity", bn: "সম্ভাব্যতম বেগ" },
        formula: "v_mp = √(2RT/M)",
        tags: ["velocity", "gas", "সম্ভাব্যতম বেগ"]
    },
    "ke_avg_mole": {
        id: "ke_avg_mole", all_variables: ["KE_avg", "R", "T"],
        name: { en: "Avg KE (per mole)", bn: "গড় গতিশক্তি (মোল প্রতি)" },
        formula: "KE = ³/₂ RT",
        tags: ["kinetic energy", "gas"]
    },
    "ke_avg_molecule": {
        id: "ke_avg_molecule", all_variables: ["KE_avg_molecule", "k_B", "T"],
        name: { en: "Avg KE (per molecule)", bn: "গড় গতিশক্তি (অণু প্রতি)" },
        formula: "KE = ³/₂ k_BT",
        tags: ["kinetic energy", "gas"]
    },
    "graham_law": {
        id: "graham_law", all_variables: ["rate1", "rate2", "M2", "M1"],
        name: { en: "Graham's Law of Diffusion", bn: "গ্রাহামের ব্যাপন সূত্র" },
        formula: "r₁/r₂ = √(M₂/M₁)",
        tags: ["graham", "diffusion", "ব্যাপন"]
    },

    // =========================================================
    // OPTICS — Ray optics
    // =========================================================
    "lens_mirror": {
        id: "lens_mirror", all_variables: ["f", "v_img", "u_obj"],
        name: { en: "Lens / mirror formula", bn: "লেন্স/দর্পণ সূত্র" },
        formula: "1/f = 1/v - 1/u",
        tags: ["lens", "mirror", "optics", "লেন্স", "দর্পণ"]
    },
    "lens_maker": {
        id: "lens_maker", all_variables: ["f", "n", "R1", "R2"],
        name: { en: "Lens Maker's Formula", bn: "লেন্স নির্মাতার সূত্র" },
        formula: "1/f = (n - 1)(1/R₁ - 1/R₂)",
        tags: ["lens maker", "optics", "লেন্স"]
    },
    "magnification_h": {
        id: "magnification_h", all_variables: ["m_mag", "h_i", "h_o"],
        name: { en: "Magnification (Heights)", bn: "বিবর্ধন (উচ্চতা)" },
        formula: "m = h_i/h_o",
        tags: ["magnification", "optics", "বিবর্ধন"]
    },
    "magnification_v_u": {
        id: "magnification_v_u", all_variables: ["m_mag", "v_img", "u_obj"],
        name: { en: "Magnification (Distances)", bn: "বিবর্ধন (দূরত্ব)" },
        formula: "m = v/u",
        tags: ["magnification", "optics", "বিবর্ধন"]
    },
    "lens_power": {
        id: "lens_power", all_variables: ["P_lens", "f"],
        name: { en: "Power of lens", bn: "লেন্সের ক্ষমতা" },
        formula: "P = 1/f",
        tags: ["power", "lens", "ডায়প্টার"]
    },
    "power_combo": {
        id: "power_combo", all_variables: ["P_combo", "P1", "P2"],
        name: { en: "Power of lens combination", bn: "যুক্ত লেন্সের ক্ষমতা" },
        formula: "P = P₁ + P₂",
        tags: ["power", "lens combination"]
    },
    "focal_combo": {
        id: "focal_combo", all_variables: ["F_combo", "f1", "f2"],
        name: { en: "Focal length of combination", bn: "যুক্ত লেন্সের ফোকাস দূরত্ব" },
        formula: "1/F = 1/f₁ + 1/f₂",
        tags: ["focal length", "lens combination"]
    },
    "refractive_index_v": {
        id: "refractive_index_v", all_variables: ["n", "c", "v"],
        name: { en: "Refractive Index (Velocity)", bn: "প্রতিসরাঙ্ক (বেগ)" },
        formula: "n = c/v",
        tags: ["refractive index", "optics", "প্রতিসরাঙ্ক"]
    },
    "snell": {
        id: "snell", all_variables: ["n1", "sin_i", "n2", "sin_r"],
        name: { en: "Snell's law", bn: "স্নেলের সূত্র" },
        formula: "n₁sin(i) = n₂sin(r)",
        tags: ["refraction", "snell", "প্রতিসরণ"]
    },
    "critical_angle": {
        id: "critical_angle", all_variables: ["sin_c", "n"],
        name: { en: "Critical angle", bn: "সংকট কোণ" },
        formula: "sin(c) = 1/n",
        tags: ["tir", "critical", "সংকট"]
    },
    "prism_delta": {
        id: "prism_delta", all_variables: ["delta", "i", "e", "A_prism"],
        name: { en: "Deviation in Prism", bn: "প্রিজমে বিচ্যুতি" },
        formula: "δ = i + e - A",
        tags: ["prism", "deviation", "প্রিজম"]
    },
    "prism_mu": {
        id: "prism_mu", all_variables: ["mu_prism", "A_prism", "D_m"],
        name: { en: "Prism Formula (Refractive Index)", bn: "প্রিজম সূত্র (প্রতিসরাঙ্ক)" },
        formula: "μ = sin((A+D_m)/2) / sin(A/2)",
        tags: ["prism", "refractive index", "প্রিজম"]
    },
    "mirror_f_R": {
        id: "mirror_f_R", all_variables: ["f", "R"],
        name: { en: "Focal length of Mirror", bn: "দর্পণের ফোকাস দূরত্ব" },
        formula: "f = R/2",
        tags: ["mirror", "focal length", "দর্পণ"]
    },
    "lens_maker_power": {
        id: "lens_maker_power", all_variables: ["P_lens", "n", "R1", "R2"],
        name: { en: "Power from Lens Maker", bn: "লেন্স নির্মাতা থেকে ক্ষমতা" },
        formula: "P = (n - 1)(1/R₁ - 1/R₂)",
        tags: ["lens maker", "power", "ক্ষমতা"]
    },
    "telescope_mag": {
        id: "telescope_mag", all_variables: ["m_telescope", "f_o", "f_e"],
        name: { en: "Telescope Magnification", bn: "টেলিস্কোপের বিবর্ধন" },
        formula: "m = f_o / f_e",
        tags: ["telescope", "magnification", "টেলিস্কোপ"]
    },
    "microscope_mag": {
        id: "microscope_mag", all_variables: ["m_microscope", "L_tube", "D_near", "f_o", "f_e"],
        name: { en: "Microscope Magnification", bn: "অণুবীক্ষণ যন্ত্রের বিবর্ধন" },
        formula: "m = L·D / (f_o·f_e)",
        tags: ["microscope", "magnification", "অণুবীক্ষণ"]
    },
// =========================================================
    // OPTICS — Wave optics
    // =========================================================
    "fringe_width": {
        id: "fringe_width", all_variables: ["beta", "lambda_w", "D_screen", "d_slit"],
        name: { en: "Fringe width (YDSE)", bn: "পটি প্রস্থ (YDSE)" },
        formula: "β = λD/d",
        tags: ["interference", "ydse", "ব্যতিচার"]
    },
    "path_diff_ydse": {
        id: "path_diff_ydse", all_variables: ["path_diff", "d_slit", "sin_theta"],
        name: { en: "Path Difference (YDSE)", bn: "পথ পার্থক্য (YDSE)" },
        formula: "Δx = d sinθ",
        tags: ["ydse", "path difference", "পথ পার্থক্য"]
    },
    "bright_fringe_path": {
        id: "bright_fringe_path", all_variables: ["bright", "n", "lambda_w"],
        name: { en: "Path Diff for Bright Fringe", bn: "উজ্জ্বল পটির পথ পার্থক্য" },
        formula: "Δx = nλ",
        tags: ["interference", "bright fringe", "উজ্জ্বল পটি"]
    },
    "dark_fringe_path": {
        id: "dark_fringe_path", all_variables: ["dark", "n", "lambda_w"],
        name: { en: "Path Diff for Dark Fringe", bn: "অন্ধকার পটির পথ পার্থক্য" },
        formula: "Δx = (2n - 1)λ/2",
        tags: ["interference", "dark fringe", "অন্ধকার পটি"]
    },
    "y_bright_fringe": {
        id: "y_bright_fringe", all_variables: ["y_bright", "n", "lambda_w", "D_screen", "d_slit"],
        name: { en: "Position of Bright Fringe", bn: "উজ্জ্বল পটির অবস্থান" },
        formula: "y = nλD/d",
        tags: ["ydse", "position", "অবস্থান"]
    },
    "y_dark_fringe": {
        id: "y_dark_fringe", all_variables: ["y_dark", "n", "lambda_w", "D_screen", "d_slit"],
        name: { en: "Position of Dark Fringe", bn: "অন্ধকার পটির অবস্থান" },
        formula: "y = (2n - 1)λD/(2d)",
        tags: ["ydse", "position", "অবস্থান"]
    },

    // =========================================================
    // ELECTROSTATICS
    // =========================================================
    "coulomb_k": {
        id: "coulomb_k", all_variables: ["F", "k", "q1", "q2", "r"],
        name: { en: "Coulomb's law (k)", bn: "কুলম্বের সূত্র (k)" },
        formula: "F = kq₁q₂/r²",
        tags: ["coulomb", "charge", "কুলম্ব", "চার্জ"]
    },
    "coulomb_eps": {
        id: "coulomb_eps", all_variables: ["F", "q1", "q2", "epsilon0", "r"],
        name: { en: "Coulomb's law (ε₀)", bn: "কুলম্বের সূত্র (ε₀)" },
        formula: "F = q₁q₂ / (4πε₀r²)",
        tags: ["coulomb", "epsilon"]
    },
    "electric_field": {
        id: "electric_field", all_variables: ["E_field", "F", "q"],
        name: { en: "Electric field (F/q)", bn: "তড়িৎ ক্ষেত্র (F/q)" },
        formula: "E = F/q",
        tags: ["electric", "field", "ক্ষেত্র"]
    },
    "efield_point": {
        id: "efield_point", all_variables: ["E_field", "k", "q", "r"],
        name: { en: "E due to point charge", bn: "বিন্দু চার্জের E" },
        formula: "E = kq/r²",
        tags: ["electric", "field"]
    },
    "efield_sheet": {
        id: "efield_sheet", all_variables: ["E_field", "sigma", "epsilon0"],
        name: { en: "E due to infinite sheet", bn: "অসীম পাতের E" },
        formula: "E = σ/(2ε₀)",
        tags: ["electric field", "sheet"]
    },
    "efield_conductor": {
        id: "efield_conductor", all_variables: ["E_field", "sigma", "epsilon0"],
        name: { en: "E near conductor surface", bn: "পরিবাহীর পৃষ্ঠে E" },
        formula: "E = σ/ε₀",
        tags: ["electric field", "conductor"]
    },
    "efield_v_d": {
        id: "efield_v_d", all_variables: ["E_field", "V", "d"],
        name: { en: "Electric Field (V/d)", bn: "তড়িৎ ক্ষেত্র (V/d)" },
        formula: "E = V/d",
        tags: ["electric field", "voltage"]
    },
    "potential": {
        id: "potential", all_variables: ["V", "k", "q", "r"],
        name: { en: "Electric potential", bn: "তড়িৎ বিভব" },
        formula: "V = kq/r",
        tags: ["potential", "voltage", "বিভব"]
    },
    "potential_e_d": {
        id: "potential_e_d", all_variables: ["V", "E_field", "d"],
        name: { en: "Potential (E*d)", bn: "তড়িৎ বিভব (E·d)" },
        formula: "V = Ed",
        tags: ["potential", "electric field"]
    },
    "pe_electrostatic": {
        id: "pe_electrostatic", all_variables: ["U", "k", "q1", "q2", "r"],
        name: { en: "Electrostatic PE (2 charges)", bn: "তড়িৎস্থিতিক স্থিতিশক্তি" },
        formula: "U = kq₁q₂/r",
        tags: ["potential energy", "electrostatics"]
    },
    "pe_electro_qV": {
        id: "pe_electro_qV", all_variables: ["U", "q", "V"],
        name: { en: "Electrostatic Energy (qV)", bn: "তড়িৎশক্তি (qV)" },
        formula: "U = qV",
        tags: ["energy", "electrostatics"]
    },
    "electric_flux": {
        id: "electric_flux", all_variables: ["phi", "E_field", "A"],
        name: { en: "Electric Flux", bn: "তড়িৎ ফ্লাক্স" },
        formula: "Φ = EA",
        tags: ["flux", "electric field"]
    },
    "gauss_law": {
        id: "gauss_law", all_variables: ["phi", "q_enclosed", "epsilon0"],
        name: { en: "Gauss's Law", bn: "গাউসের সূত্র" },
        formula: "Φ = q/ε₀",
        tags: ["gauss", "flux", "গাউস"]
    },
    "capacitance": {
        id: "capacitance", all_variables: ["C", "q", "V"],
        name: { en: "Capacitance", bn: "ধারকত্ব" },
        formula: "C = q/V",
        tags: ["capacitor", "ধারক"]
    },
    "parallel_plate": {
        id: "parallel_plate", all_variables: ["C", "epsilon0", "A", "d"],
        name: { en: "Parallel plate capacitor", bn: "সমান্তরাল পাত ধারক" },
        formula: "C = ε₀A/d",
        tags: ["capacitor", "ধারক"]
    },
    "isolated_sphere": {
        id: "isolated_sphere", all_variables: ["C", "epsilon0", "r"],
        name: { en: "Capacitance of Isolated Sphere", bn: "বিচ্ছিন্ন গোলকের ধারকত্ব" },
        formula: "C = 4πε₀r",
        tags: ["capacitor", "sphere", "গোলক"]
    },
    "cap_series": {
        id: "cap_series", all_variables: ["C_series", "C1", "C2"],
        name: { en: "Capacitors in Series", bn: "সিরিজে ধারক" },
        formula: "1/C = 1/C₁ + 1/C₂",
        tags: ["capacitor", "series"]
    },
    "cap_parallel": {
        id: "cap_parallel", all_variables: ["C_parallel", "C1", "C2"],
        name: { en: "Capacitors in Parallel", bn: "প্যারালালে ধারক" },
        formula: "C = C₁ + C₂",
        tags: ["capacitor", "parallel"]
    },
    "cap_energy_CV": {
        id: "cap_energy_CV", all_variables: ["U_cap", "C", "V"],
        name: { en: "Energy in capacitor (CV)", bn: "ধারকে শক্তি (CV)" },
        formula: "U = ½CV²",
        tags: ["capacitor", "energy"]
    },
    "cap_energy_qC": {
        id: "cap_energy_qC", all_variables: ["U_cap", "q", "C"],
        name: { en: "Energy in capacitor (qC)", bn: "ধারকে শক্তি (qC)" },
        formula: "U = q²/(2C)",
        tags: ["capacitor", "energy"]
    },
    "cap_energy_qV": {
        id: "cap_energy_qV", all_variables: ["U_cap", "q", "V"],
        name: { en: "Energy in capacitor (qV)", bn: "ধারকে শক্তি (qV)" },
        formula: "U = ½qV",
        tags: ["capacitor", "energy"]
    },
    "dipole_torque": {
        id: "dipole_torque", all_variables: ["tau_dipole", "p_dipole", "E_field", "sin_theta"],
        name: { en: "Torque on Dipole", bn: "দ্বিমেরুর উপর টর্ক" },
        formula: "τ = pE sinθ",
        tags: ["dipole", "torque", "টর্ক"]
    },
    "dipole_pe": {
        id: "dipole_pe", all_variables: ["U_dipole", "p_dipole", "E_field", "cos_theta"],
        name: { en: "PE of Dipole", bn: "দ্বিমেরুর স্থিতিশক্তি" },
        formula: "U = -pE cosθ",
        tags: ["dipole", "potential energy"]
    },
    "dipole_moment": {
        id: "dipole_moment", all_variables: ["p_dipole", "q", "d"],
        name: { en: "Electric Dipole Moment", bn: "তড়িৎ দ্বিমেরু ভ্রামক" },
        formula: "p = qd",
        tags: ["dipole", "moment", "ভ্রামক"]
    },
    "e_line_charge": {
        id: "e_line_charge", all_variables: ["E_line", "lambda_linear", "epsilon0", "r"],
        name: { en: "E due to infinite line charge", bn: "অসীম রৈখিক চার্জের তড়িৎ ক্ষেত্র" },
        formula: "E = λ/(2πε₀r)",
        tags: ["electric", "field", "line charge", "তড়িৎ ক্ষেত্র"]
    },
    "v_dipole": {
        id: "v_dipole", all_variables: ["V_dipole", "k", "p_dipole", "cos_theta", "r"],
        name: { en: "Potential due to dipole", bn: "দ্বিমেরুর বিভব" },
        formula: "V = kp cosθ/r²",
        tags: ["dipole", "potential", "বিভব"]
    },
    "e_axial": {
        id: "e_axial", all_variables: ["E_axial", "k", "p_dipole", "r"],
        name: { en: "Dipole field (axial)", bn: "দ্বিমেরু ক্ষেত্র (অক্ষীয়)" },
        formula: "E = 2kp/r³",
        tags: ["dipole", "field", "দ্বিমেরু"]
    },
    "e_equatorial": {
        id: "e_equatorial", all_variables: ["E_equatorial", "k", "p_dipole", "r"],
        name: { en: "Dipole field (equatorial)", bn: "দ্বিমেরু ক্ষেত্র (নিরক্ষীয়)" },
        formula: "E = kp/r³",
        tags: ["dipole", "field", "দ্বিমেরু"]
    },
    "c_cylinder": {
        id: "c_cylinder", all_variables: ["C_cylinder", "epsilon0", "L_len", "b_outer", "a_inner"],
        name: { en: "Cylindrical capacitor", bn: "চোঙাকার ধারক" },
        formula: "C = 2πε₀L / ln(b/a)",
        tags: ["capacitor", "cylindrical", "ধারক"]
    },
    "c_sphere": {
        id: "c_sphere", all_variables: ["C_sphere", "epsilon0", "a_inner", "b_outer"],
        name: { en: "Spherical capacitor", bn: "গোলীয় ধারক" },
        formula: "C = 4πε₀ab / (b - a)",
        tags: ["capacitor", "spherical", "ধারক"]
    },
    "c_dielectric": {
        id: "c_dielectric", all_variables: ["C_dielectric", "k_dielectric", "epsilon0", "A", "d"],
        name: { en: "Capacitor with dielectric", bn: "ডাইইলেকট্রিকসহ ধারক" },
        formula: "C = kε₀A/d",
        tags: ["capacitor", "dielectric", "ধারক"]
    },
    "energy_density_e": {
        id: "energy_density_e", all_variables: ["u_energy", "epsilon0", "E_field"],
        name: { en: "Electric field energy density", bn: "তড়িৎ ক্ষেত্রের শক্তি ঘনত্ব" },
        formula: "u = ½ε₀E²",
        tags: ["energy", "density", "field"]
    },
    "electrostatic_pressure": {
        id: "electrostatic_pressure", all_variables: ["F_per_area", "sigma", "epsilon0"],
        name: { en: "Electrostatic pressure", bn: "তড়িৎস্থিতিক চাপ" },
        formula: "P = σ²/(2ε₀)",
        tags: ["pressure", "conductor", "চাপ"]
    },
    "common_potential": {
        id: "common_potential", all_variables: ["V_common", "C1", "V1", "C2", "V2"],
        name: { en: "Common potential (sharing)", bn: "চার্জ ভাগাভাগির পর সাধারণ বিভব" },
        formula: "V = (C₁V₁ + C₂V₂) / (C₁ + C₂)",
        tags: ["capacitor", "sharing", "বিভব"]
    },

    // =========================================================
    // CURRENT ELECTRICITY
    // =========================================================
    "current_charge": {
        id: "current_charge", all_variables: ["I", "q", "t"],
        name: { en: "Current (Charge/Time)", bn: "প্রবাহ (চার্জ/সময়)" },
        formula: "I = q/t",
        tags: ["current", "charge"]
    },
    "current_drift": {
        id: "current_drift", all_variables: ["I", "n_e", "e", "A", "v_d"],
        name: { en: "Current from drift velocity", bn: "প্রবাহ বেগ থেকে কারেন্ট" },
        formula: "I = neAv_d",
        tags: ["current", "drift velocity"]
    },
    "ohms_law": {
        id: "ohms_law", all_variables: ["V", "I", "R"],
        name: { en: "Ohm's Law", bn: "ওমের সূত্র" },
        formula: "V = IR",
        tags: ["ohm", "voltage", "current", "resistance", "ওম", "রোধ"]
    },
    "resistance_rho": {
        id: "resistance_rho", all_variables: ["R", "rho", "L", "A"],
        name: { en: "Resistance (ρL/A)", bn: "রোধ (ρL/A)" },
        formula: "R = ρL/A",
        tags: ["resistance", "resistivity", "রোধ"]
    },
    "res_temp": {
        id: "res_temp", all_variables: ["R", "R0", "alpha_temp", "dT"],
        name: { en: "Resistance Temperature Dep.", bn: "রোধের ওপর তাপমাত্রার প্রভাব" },
        formula: "R = R₀(1 + αΔT)",
        tags: ["resistance", "temperature"]
    },
    "conductance": {
        id: "conductance", all_variables: ["G", "R"],
        name: { en: "Conductance", bn: "পরিবাহিতা (G)" },
        formula: "G = 1/R",
        tags: ["conductance", "resistance"]
    },
    "power_VI": {
        id: "power_VI", all_variables: ["P_elec", "V", "I"],
        name: { en: "Electric Power (VI)", bn: "তড়িৎ ক্ষমতা (VI)" },
        formula: "P = VI",
        tags: ["power", "electric"]
    },
    "power_I2R": {
        id: "power_I2R", all_variables: ["P_elec", "I", "R"],
        name: { en: "Electric Power (I²R)", bn: "তড়িৎ ক্ষমতা (I²R)" },
        formula: "P = I²R",
        tags: ["power", "resistance"]
    },
    "power_V2R": {
        id: "power_V2R", all_variables: ["P_elec", "V", "R"],
        name: { en: "Electric Power (V²/R)", bn: "তড়িৎ ক্ষমতা (V²/R)" },
        formula: "P = V²/R",
        tags: ["power", "voltage"]
    },
    "joule_heat": {
        id: "joule_heat", all_variables: ["H", "I", "R", "t"],
        name: { en: "Joule's heating (I²Rt)", bn: "জুলের তাপ (I²Rt)" },
        formula: "H = I²Rt",
        tags: ["joule", "heat", "জুল"]
    },
    "joule_heat_VIt": {
        id: "joule_heat_VIt", all_variables: ["H", "V", "I", "t"],
        name: { en: "Joule's heating (VIt)", bn: "জুলের তাপ (VIt)" },
        formula: "H = VIt",
        tags: ["joule", "heat"]
    },
    "emf_internal_res": {
        id: "emf_internal_res", all_variables: ["E_emf", "I", "R", "r_int"],
        name: { en: "EMF and Internal Resistance", bn: "তড়িৎচালক বল ও অভ্যন্তরীণ রোধ" },
        formula: "E = I(R + r)",
        tags: ["emf", "resistance"]
    },
    "emf_terminal": {
        id: "emf_terminal", all_variables: ["E_emf", "V", "I", "r_int"],
        name: { en: "EMF and terminal voltage", bn: "তড়িৎচালক বল ও টার্মিনাল ভোল্টেজ" },
        formula: "E = V + Ir",
        tags: ["emf", "battery", "তড়িৎচালক"]
    },
    "terminal_vol": {
        id: "terminal_vol", all_variables: ["V", "E_emf", "I", "r_int"],
        name: { en: "Terminal Voltage (Discharging)", bn: "টার্মিনাল ভোল্টেজ (ডিসচার্জিং)" },
        formula: "V = E - Ir",
        tags: ["terminal voltage", "battery"]
    },
    "res_series": {
        id: "res_series", all_variables: ["R_series", "R1", "R2"],
        name: { en: "Resistors in Series", bn: "সিরিজে রোধ" },
        formula: "R = R₁ + R₂",
        tags: ["resistance", "series"]
    },
    "res_parallel": {
        id: "res_parallel", all_variables: ["R_parallel", "R1", "R2"],
        name: { en: "Resistors in Parallel", bn: "প্যারালালে রোধ" },
        formula: "1/R = 1/R₁ + 1/R₂",
        tags: ["resistance", "parallel"]
    },
    "current_density": {
        id: "current_density", all_variables: ["J", "I", "A"],
        name: { en: "Current Density (J)", bn: "প্রবাহ ঘনত্ব (J)" },
        formula: "J = I/A",
        tags: ["current density", "area"]
    },
    "current_density_sigma": {
        id: "current_density_sigma", all_variables: ["J", "sigma_cond", "E_field"],
        name: { en: "Ohm's Law (Microscopic)", bn: "ওমের সূত্র (আণুবীক্ষণিক)" },
        formula: "J = σE",
        tags: ["ohm", "microscopic"]
    },
    "resistivity_cond": {
        id: "resistivity_cond", all_variables: ["rho", "sigma_cond"],
        name: { en: "Resistivity vs Conductivity", bn: "আপেক্ষিক রোধ বনাম পরিবাহিতা" },
        formula: "ρ = 1/σ",
        tags: ["resistivity", "conductivity"]
    },
    "drift_v_I": {
        id: "drift_v_I", all_variables: ["v_d", "I", "n_e", "e", "A"],
        name: { en: "Drift velocity from Current", bn: "কারেন্ট থেকে প্রবাহ বেগ" },
        formula: "v_d = I/(neA)",
        tags: ["drift", "current", "প্রবাহ"]
    },
    "drift_v_mobility": {
        id: "drift_v_mobility", all_variables: ["v_d", "mu_mobility", "E_field"],
        name: { en: "Drift velocity (Mobility)", bn: "গতিশীলতা থেকে প্রবাহ বেগ" },
        formula: "v_d = μE",
        tags: ["drift", "mobility", "গতিশীলতা"]
    },
    "conductivity_mobility": {
        id: "conductivity_mobility", all_variables: ["sigma_cond", "n_e", "e", "mu_mobility"],
        name: { en: "Conductivity from mobility", bn: "গতিশীলতা থেকে পরিবাহিতা" },
        formula: "σ = neμ",
        tags: ["conductivity", "mobility", "পরিবাহিতা"]
    },
    "cells_series_emf": {
        id: "cells_series_emf", all_variables: ["E_series", "n_cells", "E_emf"],
        name: { en: "EMF of cells in series", bn: "সিরিজে সেলের তড়িৎচালক বল" },
        formula: "E_eq = nE",
        tags: ["cells", "series", "সেল"]
    },
    "cells_series_r": {
        id: "cells_series_r", all_variables: ["r_series", "n_cells", "r_int"],
        name: { en: "Internal resistance, cells in series", bn: "সিরিজে অভ্যন্তরীণ রোধ" },
        formula: "r_eq = nr",
        tags: ["cells", "series", "রোধ"]
    },
    "cells_parallel_r": {
        id: "cells_parallel_r", all_variables: ["r_parallel", "r_int", "n_cells"],
        name: { en: "Internal resistance, cells in parallel", bn: "প্যারালালে অভ্যন্তরীণ রোধ" },
        formula: "r_eq = r/n",
        tags: ["cells", "parallel", "রোধ"]
    },
    "ammeter_shunt": {
        id: "ammeter_shunt", all_variables: ["S_shunt", "I_g", "G_galv", "I"],
        name: { en: "Shunt resistance (ammeter)", bn: "শান্ট রোধ (অ্যামিটার)" },
        formula: "S = I_g G / (I - I_g)",
        tags: ["ammeter", "shunt", "গ্যালভানোমিটার"]
    },
    "voltmeter_resistance": {
        id: "voltmeter_resistance", all_variables: ["R_v", "V", "I_g", "G_galv"],
        name: { en: "Series resistance (voltmeter)", bn: "সিরিজ রোধ (ভোল্টমিটার)" },
        formula: "R = V/I_g - G",
        tags: ["voltmeter", "resistance", "রোধ"]
    },
    "potentiometer": {
        id: "potentiometer", all_variables: ["E1", "l2", "E2", "l1"],
        name: { en: "Potentiometer balance condition", bn: "পটেনশিওমিটার সাম্যাবস্থা" },
        formula: "E₁/E₂ = l₁/l₂",
        tags: ["potentiometer", "balance", "পটেনশিওমিটার"]
    },
// =========================================================
    // MAGNETISM & EMI
    // =========================================================
    "lorentz": {
        id: "lorentz", all_variables: ["F", "q", "v", "B", "sin_theta"],
        name: { en: "Lorentz force", bn: "লরেঞ্জ বল" },
        formula: "F = qvB sinθ",
        tags: ["lorentz", "magnetic", "চৌম্বক"]
    },
    "force_wire": {
        id: "force_wire", all_variables: ["F", "I", "L", "B", "sin_theta"],
        name: { en: "Force on current wire", bn: "প্রবাহী তারের উপর বল" },
        formula: "F = ILB sinθ",
        tags: ["magnetic", "wire", "চৌম্বক"]
    },
    "force_parallel_wires": {
        id: "force_parallel_wires", all_variables: ["F", "mu0", "I1", "I2", "L", "d"],
        name: { en: "Force between parallel wires", bn: "সমান্তরাল তারের মধ্যে বল" },
        formula: "F/L = μ₀I₁I₂/(2πd)",
        tags: ["parallel wires", "magnetic force"]
    },
    "biot_wire": {
        id: "biot_wire", all_variables: ["B", "mu0", "I", "r"],
        name: { en: "B due to long wire", bn: "দীর্ঘ তারের B" },
        formula: "B = μ₀I/(2πr)",
        tags: ["biot", "magnetic", "চৌম্বক"]
    },
    "b_center_coil": {
        id: "b_center_coil", all_variables: ["B", "mu0", "I", "R"],
        name: { en: "B at center of loop", bn: "লুপের কেন্দ্রে B" },
        formula: "B = μ₀I/(2R)",
        tags: ["magnetic field", "loop"]
    },
    "b_center_N_coil": {
        id: "b_center_N_coil", all_variables: ["B", "mu0", "N", "I", "R"],
        name: { en: "B at center of N-turn coil", bn: "N-প্যাঁচের কুণ্ডলীর কেন্দ্রে B" },
        formula: "B = μ₀NI/(2R)",
        tags: ["magnetic field", "coil"]
    },
    "solenoid_B": {
        id: "solenoid_B", all_variables: ["B", "mu0", "n_turns", "I"],
        name: { en: "B inside solenoid", bn: "সলেনয়েডের ভিতর B" },
        formula: "B = μ₀nI",
        tags: ["solenoid", "magnetic"]
    },
    "mag_flux": {
        id: "mag_flux", all_variables: ["phi_B", "B", "A"],
        name: { en: "Magnetic Flux", bn: "চৌম্বক ফ্লাক্স" },
        formula: "Φ = BA",
        tags: ["magnetic", "flux"]
    },
    "mag_flux_angle": {
        id: "mag_flux_angle", all_variables: ["phi_B", "B", "A", "cos_theta"],
        name: { en: "Magnetic Flux with Angle", bn: "কোণসহ চৌম্বক ফ্লাক্স" },
        formula: "Φ = BA cosθ",
        tags: ["magnetic", "flux", "angle"]
    },
    "faraday": {
        id: "faraday", all_variables: ["emf", "d_phi", "dt"],
        name: { en: "Faraday's law", bn: "ফ্যারাডের সূত্র" },
        formula: "ε = -dΦ/dt",
        tags: ["faraday", "emi", "ফ্যারাডে"]
    },
    "motional_emf": {
        id: "motional_emf", all_variables: ["emf", "B", "L", "v"],
        name: { en: "Motional EMF", bn: "গতিজনিত তড়িৎচালক বল" },
        formula: "ε = Blv",
        tags: ["emi", "emf", "আবেশ"]
    },
    "emf_rotate_loop": {
        id: "emf_rotate_loop", all_variables: ["emf", "B", "A", "omega"],
        name: { en: "EMF (Rotating Loop)", bn: "তড়িৎচালক বল (ঘূর্ণায়মান লুপ)" },
        formula: "ε = BAω",
        tags: ["emf", "rotation"]
    },
    "emf_rotate_coil": {
        id: "emf_rotate_coil", all_variables: ["emf", "N", "B", "A", "omega"],
        name: { en: "EMF (Rotating Coil - AC Generator)", bn: "এসি জেনারেটরের তড়িৎচালক বল" },
        formula: "ε = NBAω",
        tags: ["emf", "generator", "ac"]
    },
    "mutual_inductance": {
        id: "mutual_inductance", all_variables: ["M_mutual", "phi_B", "I"],
        name: { en: "Mutual Inductance", bn: "পারস্পরিক আবেশাঙ্ক" },
        formula: "M = Φ/I",
        tags: ["mutual", "inductance"]
    },
    "emf_mutual": {
        id: "emf_mutual", all_variables: ["emf", "M_mutual", "dI", "dt"],
        name: { en: "EMF from Mutual Inductance", bn: "পারস্পরিক আবেশজনিত EMF" },
        formula: "ε = -M(dI/dt)",
        tags: ["emf", "mutual"]
    },
    "self_inductance": {
        id: "self_inductance", all_variables: ["L_ind", "phi_B", "I"],
        name: { en: "Self Inductance", bn: "স্ব-আবেশাঙ্ক" },
        formula: "L = Φ/I",
        tags: ["self", "inductance"]
    },
    "emf_self": {
        id: "emf_self", all_variables: ["emf", "L_ind", "dI", "dt"],
        name: { en: "EMF from Self Inductance", bn: "স্ব-আবেশজনিত EMF" },
        formula: "ε = -L(dI/dt)",
        tags: ["emf", "self inductance"]
    },
    "energy_ind": {
        id: "energy_ind", all_variables: ["U_ind", "L_ind", "I"],
        name: { en: "Energy in Inductor", bn: "আবেশকে সঞ্চিত শক্তি" },
        formula: "U = ½LI²",
        tags: ["energy", "inductor"]
    },
    "time_constant_LR": {
        id: "time_constant_LR", all_variables: ["tau_L", "L_ind", "R"],
        name: { en: "Time Constant (L-R Circuit)", bn: "সময় ধ্রুবক (L-R)" },
        formula: "τ = L/R",
        tags: ["time constant", "LR circuit"]
    },
    "time_constant_CR": {
        id: "time_constant_CR", all_variables: ["tau_C", "R", "C"],
        name: { en: "Time Constant (C-R Circuit)", bn: "সময় ধ্রুবক (R-C)" },
        formula: "τ = RC",
        tags: ["time constant", "CR circuit"]
    },
    "cyclotron_radius": {
        id: "cyclotron_radius", all_variables: ["r_cyclotron", "m", "v", "q", "B"],
        name: { en: "Cyclotron Radius", bn: "সাইক্লোট্রনের ব্যাসার্ধ" },
        formula: "r = mv/(qB)",
        tags: ["cyclotron", "radius"]
    },
    "cyclotron_period": {
        id: "cyclotron_period", all_variables: ["T_cyclotron", "m", "q", "B"],
        name: { en: "Cyclotron Period", bn: "সাইক্লোট্রনের পর্যায়কাল" },
        formula: "T = 2πm/(qB)",
        tags: ["cyclotron", "period"]
    },
    "cyclotron_frequency": {
        id: "cyclotron_frequency", all_variables: ["f_cyclotron", "q", "B", "m"],
        name: { en: "Cyclotron Frequency", bn: "সাইক্লোট্রন কম্পাঙ্ক" },
        formula: "f = qB/(2πm)",
        tags: ["cyclotron", "frequency"]
    },
    "mag_dipole_moment": {
        id: "mag_dipole_moment", all_variables: ["m_dipole", "I", "A"],
        name: { en: "Magnetic dipole moment of loop", bn: "লুপের চৌম্বক ভ্রামক" },
        formula: "m = IA",
        tags: ["dipole", "loop", "ভ্রামক"]
    },
    "torque_current_loop": {
        id: "torque_current_loop", all_variables: ["tau_mag", "N_turns", "I", "A", "B", "sin_theta"],
        name: { en: "Torque on current loop", bn: "প্রবাহী লুপের উপর টর্ক" },
        formula: "τ = NIAB sinθ",
        tags: ["torque", "loop", "টর্ক"]
    },
    "b_axis_coil": {
        id: "b_axis_coil", all_variables: ["B_axis", "mu0", "I", "R", "x"],
        name: { en: "B on axis of circular coil", bn: "বৃত্তাকার কুণ্ডলীর অক্ষে B" },
        formula: "B = μ₀IR² / 2(R² + x²)^(3/2)",
        tags: ["magnetic", "coil", "চৌম্বক"]
    },
    "hall_voltage": {
        id: "hall_voltage", all_variables: ["V_hall", "I", "B", "n_e", "e", "t_thick"],
        name: { en: "Hall voltage", bn: "হল বিভব" },
        formula: "V_H = IB/(net)",
        tags: ["hall", "effect", "হল"]
    },
    "solenoid_inductance": {
        id: "solenoid_inductance", all_variables: ["L_solenoid", "mu0", "n_turns", "A", "len_solenoid"],
        name: { en: "Self-inductance of solenoid", bn: "সলেনয়েডের স্ব-আবেশাঙ্ক" },
        formula: "L = μ₀n²Al",
        tags: ["inductance", "solenoid", "আবেশাঙ্ক"]
    },
    "transformer_voltage": {
        id: "transformer_voltage", all_variables: ["V_s", "N_p", "V_p", "N_s"],
        name: { en: "Transformer voltage ratio", bn: "ট্রান্সফরমার ভোল্টেজ অনুপাত" },
        formula: "V_s/V_p = N_s/N_p",
        tags: ["transformer", "voltage", "ট্রান্সফরমার"]
    },
    "transformer_current": {
        id: "transformer_current", all_variables: ["I_p", "N_p", "I_s", "N_s"],
        name: { en: "Transformer current ratio", bn: "ট্রান্সফরমার প্রবাহ অনুপাত" },
        formula: "I_p/I_s = N_s/N_p",
        tags: ["transformer", "current", "ট্রান্সফরমার"]
    },
    "energy_density_b": {
        id: "energy_density_b", all_variables: ["u_mag", "B", "mu0"],
        name: { en: "Magnetic field energy density", bn: "চৌম্বক ক্ষেত্রের শক্তি ঘনত্ব" },
        formula: "u = B²/(2μ₀)",
        tags: ["energy", "density", "চৌম্বক"]
    },
    "galvanometer": {
        id: "galvanometer", all_variables: ["k_torsion", "theta", "N_turns", "I", "A", "B"],
        name: { en: "Moving coil galvanometer", bn: "চল কুণ্ডলী গ্যালভানোমিটার" },
        formula: "kθ = NIAB",
        tags: ["galvanometer", "torsion", "গ্যালভানোমিটার"]
    },

    // =========================================================
    // ALTERNATING CURRENT
    // =========================================================
    "rms_current": {
        id: "rms_current", all_variables: ["I_rms", "I0"],
        name: { en: "RMS current", bn: "RMS প্রবাহ" },
        formula: "I_rms = I₀/√2",
        tags: ["ac", "rms"]
    },
    "rms_voltage": {
        id: "rms_voltage", all_variables: ["V_rms", "V0"],
        name: { en: "RMS Voltage", bn: "RMS ভোল্টেজ" },
        formula: "V_rms = V₀/√2",
        tags: ["ac", "voltage"]
    },
    "reactance_L": {
        id: "reactance_L", all_variables: ["X_L", "omega", "L_ind"],
        name: { en: "Inductive reactance", bn: "আবেশীয় প্রতিবন্ধকতা" },
        formula: "X_L = ωL",
        tags: ["ac", "inductor"]
    },
    "reactance_C": {
        id: "reactance_C", all_variables: ["X_C", "omega", "C"],
        name: { en: "Capacitive reactance", bn: "ধারকীয় প্রতিবন্ধকতা" },
        formula: "X_C = 1/(ωC)",
        tags: ["ac", "capacitor"]
    },
    "impedance": {
        id: "impedance", all_variables: ["Z", "R", "X_L", "X_C"],
        name: { en: "Impedance (LCR)", bn: "প্রতিবন্ধকতা (LCR)" },
        formula: "Z = √[R² + (X_L - X_C)²]",
        tags: ["ac", "lcr", "impedance"]
    },
    "rms_ohm_law": {
        id: "rms_ohm_law", all_variables: ["I_rms", "V_rms", "Z"],
        name: { en: "AC Ohm's Law (RMS)", bn: "এসি ওমের সূত্র (RMS)" },
        formula: "I_rms = V_rms/Z",
        tags: ["ac", "ohm"]
    },
    "ac_power": {
        id: "ac_power", all_variables: ["P_avg", "V_rms", "I_rms", "cos_phi"],
        name: { en: "Average AC Power", bn: "গড় এসি ক্ষমতা" },
        formula: "P = V_rms I_rms cosφ",
        tags: ["ac", "power"]
    },
    "power_factor": {
        id: "power_factor", all_variables: ["cos_phi", "R", "Z"],
        name: { en: "Power Factor", bn: "ক্ষমতা গুণাঙ্ক" },
        formula: "cosφ = R/Z",
        tags: ["ac", "power factor"]
    },
    "resonance_omega": {
        id: "resonance_omega", all_variables: ["omega0", "L_ind", "C"],
        name: { en: "Resonant Angular Freq", bn: "অনুরণন কৌণিক কম্পাঙ্ক" },
        formula: "ω₀ = 1/√(LC)",
        tags: ["ac", "resonance"]
    },
    "resonance": {
        id: "resonance", all_variables: ["f0", "L_ind", "C"],
        name: { en: "Resonant frequency", bn: "অনুরণন কম্পাঙ্ক" },
        formula: "f₀ = 1/(2π√(LC))",
        tags: ["ac", "resonance", "অনুরণন"]
    },
    "q_factor_L": {
        id: "q_factor_L", all_variables: ["Q_factor", "omega0", "L_ind", "R"],
        name: { en: "Q-Factor (Inductor)", bn: "Q-ফ্যাক্টর (আবেশক)" },
        formula: "Q = ω₀L/R",
        tags: ["ac", "quality factor"]
    },
    "q_factor_C": {
        id: "q_factor_C", all_variables: ["Q_factor", "omega0", "C", "R"],
        name: { en: "Q-Factor (Capacitor)", bn: "Q-ফ্যাক্টর (ধারক)" },
        formula: "Q = 1/(ω₀CR)",
        tags: ["ac", "quality factor"]
    },
// =========================================================
    // MODERN PHYSICS
    // =========================================================
    "photon_energy": {
        id: "photon_energy", all_variables: ["E_photon", "h", "f"],
        name: { en: "Photon energy", bn: "ফোটন শক্তি" },
        formula: "E = hf",
        tags: ["photon", "quantum", "ফোটন"]
    },
    "photon_energy_wl": {
        id: "photon_energy_wl", all_variables: ["E_photon", "h", "c", "lambda_w"],
        name: { en: "Photon energy (hc/λ)", bn: "ফোটন শক্তি (hc/λ)" },
        formula: "E = hc/λ",
        tags: ["photon", "wavelength"]
    },
    "photoelectric": {
        id: "photoelectric", all_variables: ["KE_max", "h", "f", "phi_work"],
        name: { en: "Photoelectric equation", bn: "আলোক তড়িৎ সমীকরণ" },
        formula: "KE_max = hf - φ",
        tags: ["photoelectric", "einstein", "আলোকতড়িৎ"]
    },
    "photoelectric_v0": {
        id: "photoelectric_v0", all_variables: ["KE_max", "e", "V0"],
        name: { en: "KE Max and Stopping Potential", bn: "সর্বোচ্চ গতিশক্তি ও নিবৃত্তি বিভব" },
        formula: "KE_max = eV₀",
        tags: ["photoelectric", "stopping potential"]
    },
    "debroglie": {
        id: "debroglie", all_variables: ["lambda_debroglie", "h", "p"],
        name: { en: "de Broglie wavelength (momentum)", bn: "দ্রব্রগলি তরঙ্গদৈর্ঘ্য (ভরবেগ)" },
        formula: "λ = h/p",
        tags: ["debroglie", "wave", "দ্রব্রগলি"]
    },
    "debroglie_v": {
        id: "debroglie_v", all_variables: ["lambda_debroglie", "h", "m", "v"],
        name: { en: "de Broglie wavelength (velocity)", bn: "দ্রব্রগলি তরঙ্গদৈর্ঘ্য (বেগ)" },
        formula: "λ = h/(mv)",
        tags: ["debroglie", "velocity"]
    },
    "bohr_energy": {
        id: "bohr_energy", all_variables: ["E_n", "Z", "n"],
        name: { en: "Bohr energy levels", bn: "বোর শক্তিস্তর" },
        formula: "E_n = -13.6 Z²/n² eV",
        tags: ["bohr", "atom", "বোর"]
    },
    "bohr_radius": {
        id: "bohr_radius", all_variables: ["r_n", "n", "Z"],
        name: { en: "Bohr Radius", bn: "বোর ব্যাসার্ধ" },
        formula: "r_n = 0.529 n²/Z",
        tags: ["bohr", "radius"]
    },
    "rydberg": {
        id: "rydberg", all_variables: ["lambda_w", "R_H", "n1", "n2"],
        name: { en: "Rydberg formula", bn: "রিডবার্গ সূত্র" },
        formula: "1/λ = R_H(1/n₁² - 1/n₂²)",
        tags: ["rydberg", "spectrum", "রিডবার্গ"]
    },
    "mass_energy": {
        id: "mass_energy", all_variables: ["E_rest", "m", "c"],
        name: { en: "Mass-energy equivalence", bn: "ভর-শক্তি সমতুল্যতা" },
        formula: "E = mc²",
        tags: ["einstein", "relativity", "আইনস্টাইন"]
    },
    "mass_defect_energy": {
        id: "mass_defect_energy", all_variables: ["delta_E", "delta_m", "c"],
        name: { en: "Binding Energy (Mass Defect)", bn: "বন্ধন শক্তি (ভর ত্রুটি)" },
        formula: "ΔE = Δmc²",
        tags: ["binding energy", "nuclear"]
    },
    "decay_law": {
        id: "decay_law", all_variables: ["N", "N0", "lambda_decay", "t"],
        name: { en: "Radioactive Decay Law", bn: "তেজস্ক্রিয় ক্ষয় সূত্র" },
        formula: "N = N₀e^(-λt)",
        tags: ["radioactivity", "decay"]
    },
    "half_life": {
        id: "half_life", all_variables: ["T_half", "lambda_decay"],
        name: { en: "Half-life", bn: "অর্ধায়ু" },
        formula: "T_½ = 0.693/λ",
        tags: ["radioactivity", "half", "অর্ধায়ু"]
    },
    "activity_N": {
        id: "activity_N", all_variables: ["A_activity", "lambda_decay", "N"],
        name: { en: "Activity (N)", bn: "তেজস্ক্রিয়তা (N)" },
        formula: "A = λN",
        tags: ["activity", "radioactivity"]
    },
    "activity_t": {
        id: "activity_t", all_variables: ["A_activity", "A0", "lambda_decay", "t"],
        name: { en: "Activity over time", bn: "সময়ের সাথে তেজস্ক্রিয়তা" },
        formula: "A = A₀e^(-λt)",
        tags: ["activity", "time"]
    }
};
const variableGlossary = {
    v: { en: "Final velocity", bn: "অন্তিম বেগ" },
    u: { en: "Initial velocity", bn: "প্রাথমিক বেগ" },
    a: { en: "Acceleration", bn: "ত্বরণ" },
    t: { en: "Time", bn: "সময়" },
    s: { en: "Displacement", bn: "সরণ" },
    total_s: { en: "Total distance/displacement", bn: "মোট অতিক্রান্ত দূরত্ব/সরণ" },
    total_t: { en: "Total time", bn: "মোট সময়" },
    avg_v: { en: "Average velocity", bn: "গড় বেগ" },
    avg_a: { en: "Average acceleration", bn: "গড় ত্বরণ" },
    F: { en: "Force", bn: "বল" },
    m: { en: "Mass", bn: "ভর" },
    g: { en: "Acceleration due to gravity", bn: "মহাকর্ষীয় ত্বরণ" },
    p: { en: "Momentum", bn: "ভরবেগ" },
    F_net: { en: "Net Force", bn: "লব্ধি বল" },
    W: { en: "Work", bn: "কাজ" },
    KE: { en: "Kinetic energy", bn: "গতিশক্তি" },
    PE: { en: "Potential energy", bn: "স্থিতিশক্তি" },
    P_power: { en: "Power", bn: "ক্ষমতা" },
    r: { en: "Radius / distance", bn: "ব্যাসার্ধ / দূরত্ব" },
    omega: { en: "Angular velocity", bn: "কৌণিক বেগ" },
    T: { en: "Time period", bn: "পর্যায়কাল" },
    G: { en: "Gravitational constant", bn: "মহাকর্ষীয় ধ্রুবক" },
    M: { en: "Mass of large body (planet/star)", bn: "বৃহৎ বস্তুর (গ্রহ/তারা) ভর" },
    R: { en: "Radius of large body / gas constant", bn: "বৃহৎ বস্তুর ব্যাসার্ধ / গ্যাস ধ্রুবক" },
    tau: { en: "Torque", bn: "টর্ক" },
    L: { en: "Angular momentum / length", bn: "কৌণিক ভরবেগ / দৈর্ঘ্য" },
    x: { en: "Displacement from equilibrium", bn: "সাম্যাবস্থা থেকে সরণ" },
    A: { en: "Amplitude / area", bn: "বিস্তার / ক্ষেত্রফল" },
    f: { en: "Frequency", bn: "কম্পাঙ্ক" },
    lambda_w: { en: "Wavelength", bn: "তরঙ্গদৈর্ঘ্য" },
    Y: { en: "Young's modulus", bn: "ইয়ং-এর গুণাঙ্ক" },
    P: { en: "Pressure", bn: "চাপ" },
    rho: { en: "Density", bn: "ঘনত্ব" },
    Q: { en: "Heat", bn: "তাপ" },
    c: { en: "Specific heat / speed of light", bn: "আপেক্ষিক তাপ / আলোর বেগ" },
    dT: { en: "Change in temperature", bn: "তাপমাত্রার পরিবর্তন" },
    n: { en: "Number of moles / refractive index", bn: "মোল সংখ্যা / প্রতিসরাঙ্ক" },
    q: { en: "Charge", bn: "চার্জ" },
    V: { en: "Voltage / Volume", bn: "ভোল্টেজ / আয়তন" },
    C: { en: "Capacitance", bn: "ধারকত্ব" },
    I: { en: "Current / Moment of inertia", bn: "প্রবাহমাত্রা / জড়তার ভ্রামক" },
    Z: { en: "Atomic number / Impedance", bn: "পারমাণবিক সংখ্যা / প্রতিবন্ধকতা" },
    k: { en: "Spring constant / Coulomb's constant", bn: "স্প্রিং ধ্রুবক / কুলম্বের ধ্রুবক" },
    B: { en: "Magnetic field", bn: "চৌম্বক ক্ষেত্র" },
    h: { en: "Height / Planck's constant", bn: "উচ্চতা / প্লাঙ্ক ধ্রুবক" },
    W_weight: { en: "Weight", bn: "ওজন" },
    impulse: { en: "Impulse", bn: "আবেগ" },
    F_friction: { en: "Friction force", bn: "ঘর্ষণ বল" },
    mu: { en: "Coefficient of friction", bn: "ঘর্ষণ গুণাঙ্ক" },
    N: { en: "Normal force", bn: "লম্ব প্রতিক্রিয়া বল" },
    cos_theta: { en: "Cosine of angle θ", bn: "θ কোণের কোসাইন" },
    sin_theta: { en: "Sine of angle θ", bn: "θ কোণের সাইন" },
    PE_spring: { en: "Spring potential energy", bn: "স্প্রিং স্থিতিশক্তি" },
    a_c: { en: "Centripetal acceleration", bn: "কেন্দ্রমুখী ত্বরণ" },
    F_c: { en: "Centripetal force", bn: "কেন্দ্রমুখী বল" },
    m1: { en: "Mass of object 1", bn: "১ম বস্তুর ভর" },
    m2: { en: "Mass of object 2", bn: "২য় বস্তুর ভর" },
    alpha: { en: "Angular acceleration / expansion coefficient", bn: "কৌণিক ত্বরণ / প্রসারণ গুণাঙ্ক" },
    v_max: { en: "Maximum velocity", bn: "সর্বোচ্চ বেগ" },
    a_max: { en: "Maximum acceleration", bn: "সর্বোচ্চ ত্বরণ" },
    T_tension: { en: "Tension in string", bn: "তারের টান" },
    mu_linear: { en: "Linear mass density", bn: "রৈখিক ভর ঘনত্ব" },
    beat_f: { en: "Beat frequency", bn: "বিট কম্পাঙ্ক" },
    f1: { en: "Frequency 1", bn: "১ম কম্পাঙ্ক" },
    f2: { en: "Frequency 2", bn: "২য় কম্পাঙ্ক" },
    delta_L: { en: "Change in length", bn: "দৈর্ঘ্যের পরিবর্তন" },
    F_b: { en: "Buoyant force", bn: "উর্ধ্বমুখী বল" },
    A1: { en: "Area 1", bn: "১ম ক্ষেত্রফল" },
    v1: { en: "Velocity 1", bn: "১ম বেগ" },
    A2: { en: "Area 2", bn: "২য় ক্ষেত্রফল" },
    v2: { en: "Velocity 2", bn: "২য় বেগ" },
    L_latent: { en: "Specific latent heat", bn: "আপেক্ষিক সুপ্ত তাপ" },
    dL: { en: "Change in length", bn: "দৈর্ঘ্যের পরিবর্তন" },
    efficiency_carnot: { en: "Carnot efficiency", bn: "কার্নো দক্ষতা" },
    T1: { en: "Temperature of hot reservoir", bn: "উষ্ণ আধারের তাপমাত্রা" },
    T2: { en: "Temperature of cold reservoir", bn: "শীতল আধারের তাপমাত্রা" },
    v_img: { en: "Image distance", bn: "প্রতিবিম্বের দূরত্ব" },
    u_obj: { en: "Object distance", bn: "বস্তুর দূরত্ব" },
    m_mag: { en: "Magnification", bn: "বিবর্ধন" },
    h_i: { en: "Image height", bn: "প্রতিবিম্বের উচ্চতা" },
    h_o: { en: "Object height", bn: "বস্তুর উচ্চতা" },
    P_lens: { en: "Power of lens", bn: "লেন্সের ক্ষমতা" },
    n1: { en: "Refractive index of medium 1", bn: "১ম মাধ্যমের প্রতিসরাঙ্ক" },
    n2: { en: "Refractive index of medium 2", bn: "২য় মাধ্যমের প্রতিসরাঙ্ক" },
    sin_i: { en: "Sine of angle of incidence", bn: "আপতন কোণের সাইন" },
    sin_r: { en: "Sine of angle of refraction", bn: "প্রতিসরণ কোণের সাইন" },
    sin_c: { en: "Sine of critical angle", bn: "সংকট কোণের সাইন" },
    beta: { en: "Fringe width", bn: "পটি প্রস্থ" },
    D_screen: { en: "Slit-to-screen distance", bn: "চির থেকে পর্দার দূরত্ব" },
    d_slit: { en: "Slit separation", bn: "চিরের ব্যবধান" },
    q1: { en: "Charge 1", bn: "১ম চার্জ" },
    q2: { en: "Charge 2", bn: "২য় চার্জ" },
    E_field: { en: "Electric field", bn: "তড়িৎ ক্ষেত্র" },
    epsilon0: { en: "Permittivity of free space", bn: "শূন্যস্থানের ভেদনযোগ্যতা" },
    d: { en: "Separation / thickness", bn: "ব্যবধান / পুরুত্ব" },
    U_cap: { en: "Energy stored in capacitor", bn: "ধারকে সঞ্চিত শক্তি" },
    r_int: { en: "Internal resistance", bn: "আভ্যন্তরীণ রোধ" },
    E_emf: { en: "EMF", bn: "তড়িৎচালক বল" },
    mu0: { en: "Permeability of free space", bn: "শূন্যস্থানের ভেদ্যতা" },
    n_turns: { en: "Number of turns", bn: "প্যাঁচের সংখ্যা" },
    emf: { en: "Electromotive force", bn: "তড়িৎচালক বল" },
    d_phi: { en: "Change in magnetic flux", bn: "চৌম্বক ফ্লাক্সের পরিবর্তন" },
    dt: { en: "Change in time", bn: "সময়ের পরিবর্তন" },
    I_rms: { en: "RMS current", bn: "RMS প্রবাহ" },
    I0: { en: "Peak current", bn: "সর্বোচ্চ প্রবাহ" },
    X_L: { en: "Inductive reactance", bn: "আবেশীয় প্রতিবন্ধকতা" },
    X_C: { en: "Capacitive reactance", bn: "ধারকীয় প্রতিবন্ধকতা" },
    L_ind: { en: "Inductance", bn: "আবেশাঙ্ক" },
    f0: { en: "Resonant frequency", bn: "অনুরণন কম্পাঙ্ক" },
    E_photon: { en: "Photon energy", bn: "ফোটন শক্তি" },
    KE_max: { en: "Max kinetic energy (photoelectrons)", bn: "সর্বোচ্চ গতিশক্তি (আলোক-ইলেকট্রন)" },
    phi_work: { en: "Work function", bn: "কার্যাপেক্ষক" },
    lambda_debroglie: { en: "de Broglie wavelength", bn: "দ্রব্রগলি তরঙ্গদৈর্ঘ্য" },
    E_n: { en: "Energy of nth orbit", bn: "n-তম কক্ষপথের শক্তি" },
    T_half: { en: "Half-life", bn: "অর্ধায়ু" },
    lambda_decay: { en: "Decay constant", bn: "ক্ষয় ধ্রুবক" },
    E_rest: { en: "Rest mass energy", bn: "স্থিতি ভর-শক্তি" },
    lambda_linear: { en: "Linear charge density", bn: "রৈখিক চার্জ ঘনত্ব" },
    p_dipole: { en: "Electric dipole moment", bn: "তড়িৎ দ্বিমেরু ভ্রামক" },
    E_line: { en: "Field due to line charge", bn: "রৈখিক চার্জের ক্ষেত্র" },
    V_dipole: { en: "Dipole potential", bn: "দ্বিমেরু বিভব" },
    E_axial: { en: "Axial dipole field", bn: "অক্ষীয় দ্বিমেরু ক্ষেত্র" },
    E_equatorial: { en: "Equatorial dipole field", bn: "নিরক্ষীয় দ্বিমেরু ক্ষেত্র" },
    C_cylinder: { en: "Cylindrical capacitance", bn: "চোঙাকার ধারকত্ব" },
    L_len: { en: "Length of cylinder", bn: "চোঙের দৈর্ঘ্য" },
    b_outer: { en: "Outer radius", bn: "বাইরের ব্যাসার্ধ" },
    a_inner: { en: "Inner radius", bn: "ভিতরের ব্যাসার্ধ" },
    C_sphere: { en: "Spherical capacitance", bn: "গোলীয় ধারকত্ব" },
    C_dielectric: { en: "Capacitance with dielectric", bn: "ডাইইলেকট্রিকসহ ধারকত্ব" },
    k_dielectric: { en: "Dielectric constant", bn: "ডাইইলেকট্রিক ধ্রুবক" },
    u_energy: { en: "Electric energy density", bn: "তড়িৎ শক্তি ঘনত্ব" },
    F_per_area: { en: "Force per unit area", bn: "একক ক্ষেত্রফলে বল" },
    sigma: { en: "Surface charge density", bn: "পৃষ্ঠ চার্জ ঘনত্ব" },
    V_common: { en: "Common potential", bn: "সাধারণ বিভব" },
    C1: { en: "Capacitance 1", bn: "১ম ধারকত্ব" },
    C2: { en: "Capacitance 2", bn: "২য় ধারকত্ব" },
    V1: { en: "Voltage 1", bn: "১ম ভোল্টেজ" },
    V2: { en: "Voltage 2", bn: "২য় ভোল্টেজ" },
    v_d: { en: "Drift velocity", bn: "প্রবাহ বেগ" },
    n_e: { en: "Free electron density", bn: "মুক্ত ইলেকট্রন ঘনত্ব" },
    e: { en: "Elementary charge / Coefficient of restitution", bn: "মৌলিক চার্জ / প্রত্যাবস্থান গুণাঙ্ক" },
    mu_mobility: { en: "Electron mobility", bn: "ইলেকট্রন গতিশীলতা" },
    sigma_cond: { en: "Conductivity", bn: "পরিবাহিতা" },
    E_series: { en: "EMF, cells in series", bn: "সিরিজে তড়িৎচালক বল" },
    n_cells: { en: "Number of cells", bn: "সেলের সংখ্যা" },
    r_series: { en: "Internal resistance, series", bn: "সিরিজে অভ্যন্তরীণ রোধ" },
    r_parallel: { en: "Internal resistance, parallel", bn: "প্যারালালে অভ্যন্তরীণ রোধ" },
    S_shunt: { en: "Shunt resistance", bn: "শান্ট রোধ" },
    I_g: { en: "Galvanometer full-scale current", bn: "গ্যালভানোমিটারের পূর্ণ স্কেল প্রবাহ" },
    G_galv: { en: "Galvanometer resistance", bn: "গ্যালভানোমিটারের রোধ" },
    R_v: { en: "Voltmeter series resistance", bn: "ভোল্টমিটারের সিরিজ রোধ" },
    E1: { en: "EMF 1", bn: "১ম তড়িৎচালক বল" },
    E2: { en: "EMF 2", bn: "২য় তড়িৎচালক বল" },
    l1: { en: "Balance length 1", bn: "১ম সাম্য দৈর্ঘ্য" },
    l2: { en: "Balance length 2", bn: "২য় সাম্য দৈর্ঘ্য" },
    m_dipole: { en: "Magnetic dipole moment", bn: "চৌম্বক দ্বিমেরু ভ্রামক" },
    tau_mag: { en: "Torque on loop", bn: "লুপের উপর টর্ক" },
    N_turns: { en: "Number of turns", bn: "প্যাঁচের সংখ্যা" },
    B_axis: { en: "Field on coil axis", bn: "কুণ্ডলীর অক্ষে ক্ষেত্র" },
    V_hall: { en: "Hall voltage", bn: "হল বিভব" },
    t_thick: { en: "Thickness of conductor", bn: "পরিবাহীর পুরুত্ব" },
    L_solenoid: { en: "Self-inductance of solenoid", bn: "সলেনয়েডের স্ব-আবেশাঙ্ক" },
    len_solenoid: { en: "Length of solenoid", bn: "সলেনয়েডের দৈর্ঘ্য" },
    V_s: { en: "Secondary voltage", bn: "সেকেন্ডারি ভোল্টেজ" },
    V_p: { en: "Primary voltage", bn: "প্রাইমারি ভোল্টেজ" },
    N_p: { en: "Primary turns", bn: "প্রাইমারি প্যাঁচ" },
    N_s: { en: "Secondary turns", bn: "সেকেন্ডারি প্যাঁচ" },
    I_p: { en: "Primary current", bn: "প্রাইমারি প্রবাহ" },
    I_s: { en: "Secondary current", bn: "সেকেন্ডারি প্রবাহ" },
    u_mag: { en: "Magnetic energy density", bn: "চৌম্বক শক্তি ঘনত্ব" },
    k_torsion: { en: "Torsional constant", bn: "মোচড় ধ্রুবক" },
    E_total: { en: "Total energy", bn: "মোট শক্তি" },
    KE_final: { en: "Final kinetic energy", bn: "চূড়ান্ত গতিশক্তি" },
    KE_initial: { en: "Initial kinetic energy", bn: "প্রাথমিক গতিশক্তি" },
    efficiency: { en: "Efficiency", bn: "কর্মদক্ষতা" },
    useful_work: { en: "Useful work", bn: "কার্যকর কাজ" },
    total_work: { en: "Total work / energy", bn: "মোট কাজ / প্রদত্ত শক্তি" },
    u1: { en: "Initial velocity 1", bn: "১ম বস্তুর আদি বেগ" },
    u2: { en: "Initial velocity 2", bn: "২য় বস্তুর আদি বেগ" },
    KE_loss: { en: "Loss in kinetic energy", bn: "গতিশক্তি হ্রাস" },
    g_h: { en: "Gravity at height h", bn: "h উচ্চতায় মহাকর্ষীয় ত্বরণ" },
    g_d: { en: "Gravity at depth d", bn: "d গভীরতায় মহাকর্ষীয় ত্বরণ" },
    PE_grav: { en: "Gravitational potential energy", bn: "মহাকর্ষীয় স্থিতিশক্তি" },
    escape_v: { en: "Escape velocity", bn: "পলায়ন বেগ" },
    orbital_v: { en: "Orbital velocity", bn: "কক্ষীয় বেগ" },
    omega0: { en: "Initial angular velocity", bn: "আদি কৌণিক বেগ" },
    theta: { en: "Angular displacement", bn: "কৌণিক সরণ" },
    I_rod_cm: { en: "Inertia of rod (CM)", bn: "দণ্ডের জড়তার ভ্রামক (কেন্দ্রগামী)" },
    I_disc: { en: "Inertia of disc", bn: "চাকতির জড়তার ভ্রামক" },
    I_ring: { en: "Inertia of ring", bn: "রিংয়ের জড়তার ভ্রামক" },
    I_solid_sphere: { en: "Inertia of solid sphere", bn: "নিরেট গোলকের জড়তার ভ্রামক" },
    I_hollow_sphere: { en: "Inertia of hollow sphere", bn: "ফাঁপা গোলকের জড়তার ভ্রামক" },
    E_shm: { en: "Total energy in SHM", bn: "SHM এর মোট শক্তি" },
    KE_shm: { en: "Kinetic energy in SHM", bn: "SHM গতিশক্তি" },
    PE_shm: { en: "Potential energy in SHM", bn: "SHM স্থিতিশক্তি" },
    k_wave: { en: "Wave number", bn: "তরঙ্গ সংখ্যা" },
    y: { en: "Displacement of wave particle", bn: "তরঙ্গ কণার সরণ" },
    f_open: { en: "Frequency (open pipe)", bn: "খোলা নলের কম্পাঙ্ক" },
    f_closed: { en: "Frequency (closed pipe)", bn: "বদ্ধ নলের কম্পাঙ্ক" },
    I_intensity: { en: "Intensity", bn: "তীব্রতা" },
    stress: { en: "Stress", bn: "পীড়ন" },
    strain: { en: "Strain", bn: "বিকৃতি" },
    B_mod: { en: "Bulk modulus", bn: "আয়তন গুণাঙ্ক" },
    delta_V: { en: "Change in volume", bn: "আয়তনের পরিবর্তন" },
    eta: { en: "Coefficient of viscosity", bn: "সান্দ্রতা গুণাঙ্ক" },
    P0: { en: "Atmospheric pressure", bn: "বায়ুমণ্ডলীয় চাপ" },
    Q_flow: { en: "Volume flow rate", bn: "প্রবাহের হার" },
    Re: { en: "Reynolds number", bn: "রেনল্ডস সংখ্যা" },
    dA: { en: "Change in area", bn: "ক্ষেত্রফলের পরিবর্তন" },
    dV: { en: "Change in volume", bn: "আয়তনের পরিবর্তন" },
    gamma_exp: { en: "Volume expansion coefficient", bn: "আয়তন প্রসারণ গুণাঙ্ক" },
    P1: { en: "Pressure 1", bn: "১ম চাপ" },
    P2: { en: "Pressure 2", bn: "২য় চাপ" },
    V1: { en: "Volume / Voltage 1", bn: "১ম আয়তন / ভোল্টেজ" },
    V2: { en: "Volume / Voltage 2", bn: "২য় আয়তন / ভোল্টেজ" },
    dU: { en: "Change in internal energy", bn: "অভ্যন্তরীণ শক্তির পরিবর্তন" },
    Cv: { en: "Molar heat capacity at constant volume", bn: "স্থির আয়তনে মোলার তাপ ধারণ ক্ষমতা" },
    dH: { en: "Change in enthalpy", bn: "এনথ্যালপির পরিবর্তন" },
    Cp: { en: "Molar heat capacity at constant pressure", bn: "স্থির চাপে মোলার তাপ ধারণ ক্ষমতা" },
    gamma_gas: { en: "Heat capacity ratio (γ)", bn: "তাপ ধারণ ক্ষমতার অনুপাত (γ)" },
    W_gas: { en: "Work done by gas", bn: "গ্যাস দ্বারা কৃত কাজ" },
    dQ: { en: "Heat added to system", bn: "সিস্টেমে সরবরাহকৃত তাপ" },
    Q1: { en: "Heat from hot reservoir", bn: "উষ্ণ আধার থেকে গৃহীত তাপ" },
    Q2: { en: "Heat rejected to cold reservoir", bn: "শীতল আধারে বর্জিত তাপ" },
    rms: { en: "Root mean square speed", bn: "RMS বেগ" },
    v_avg: { en: "Average speed (gas)", bn: "গ্যাসের গড় বেগ" },
    v_mp: { en: "Most probable speed", bn: "সম্ভাব্যতম বেগ" },
    KE_avg: { en: "Average kinetic energy (per mole)", bn: "গড় গতিশক্তি (মোল প্রতি)" },
    KE_avg_molecule: { en: "Average kinetic energy (per molecule)", bn: "গড় গতিশক্তি (অণু প্রতি)" },
    k_B: { en: "Boltzmann constant", bn: "বোলটজম্যান ধ্রুবক" },
    rate1: { en: "Rate of diffusion 1", bn: "১ম ব্যাপন হার" },
    rate2: { en: "Rate of diffusion 2", bn: "২য় ব্যাপন হার" },
    M1: { en: "Molar mass 1", bn: "১ম গ্যাসের আণবিক ভর" },
    M2: { en: "Molar mass 2", bn: "২য় গ্যাসের আণবিক ভর" },
    R1: { en: "Radius of curvature 1 / Resistance 1", bn: "১ম বক্রতার ব্যাসার্ধ / ১ম রোধ" },
    R2: { en: "Radius of curvature 2 / Resistance 2", bn: "২য় বক্রতার ব্যাসার্ধ / ২য় রোধ" },
    P_combo: { en: "Power of lens combination", bn: "যুক্ত লেন্সের ক্ষমতা" },
    F_combo: { en: "Focal length of combination", bn: "যুক্ত লেন্সের ফোকাস দূরত্ব" },
    delta: { en: "Angle of deviation", bn: "বিচ্যুতি কোণ" },
    i: { en: "Angle of incidence", bn: "আপতন কোণ" },
    e: { en: "Angle of emergence / Elementary charge", bn: "নির্গত কোণ / মৌলিক চার্জ" },
    A_prism: { en: "Angle of prism", bn: "প্রিজম কোণ" },
    mu_prism: { en: "Refractive index of prism", bn: "প্রিজমের প্রতিসরাঙ্ক" },
    D_m: { en: "Angle of minimum deviation", bn: "ন্যূনতম বিচ্যুতি কোণ" },
    m_telescope: { en: "Magnification of telescope", bn: "টেলিস্কোপের বিবর্ধন" },
    f_o: { en: "Focal length of objective", bn: "অভিলক্ষ্যের ফোকাস দূরত্ব" },
    f_e: { en: "Focal length of eyepiece", bn: "অভিনেত্রের ফোকাস দূরত্ব" },
    m_microscope: { en: "Magnification of microscope", bn: "অণুবীক্ষণ যন্ত্রের বিবর্ধন" },
    L_tube: { en: "Tube length", bn: "নলের দৈর্ঘ্য" },
    D_near: { en: "Least distance of distinct vision", bn: "স্পষ্ট দর্শনের ন্যূনতম দূরত্ব" },
    path_diff: { en: "Path difference", bn: "পথ পার্থক্য" },
    bright: { en: "Condition for bright fringe", bn: "উজ্জ্বল পটির শর্ত" },
    dark: { en: "Condition for dark fringe", bn: "অন্ধকার পটির শর্ত" },
    y_bright: { en: "Position of bright fringe", bn: "উজ্জ্বল পটির অবস্থান" },
    y_dark: { en: "Position of dark fringe", bn: "অন্ধকার পটির অবস্থান" },
    q_enclosed: { en: "Enclosed charge", bn: "আবদ্ধ চার্জ" },
    C_series: { en: "Equivalent capacitance (Series)", bn: "তুল্য ধারকত্ব (সিরিজ)" },
    C_parallel: { en: "Equivalent capacitance (Parallel)", bn: "তুল্য ধারকত্ব (প্যারালাল)" },
    R0: { en: "Resistance at reference temp / Initial radius", bn: "প্রাথমিক রোধ / আদি ব্যাসার্ধ" },
    alpha_temp: { en: "Temperature coefficient of resistance", bn: "রোধের উষ্ণতা গুণাঙ্ক" },
    G: { en: "Conductance / Gravitational const.", bn: "পরিবাহিতা / মহাকর্ষীয় ধ্রুবক" },
    R_series: { en: "Equivalent resistance (Series)", bn: "তুল্য রোধ (সিরিজ)" },
    R_parallel: { en: "Equivalent resistance (Parallel)", bn: "তুল্য রোধ (প্যারালাল)" },
    J: { en: "Current density", bn: "প্রবাহ ঘনত্ব" },
    I1: { en: "Current 1", bn: "১ম প্রবাহমাত্রা" },
    I2: { en: "Current 2", bn: "২য় প্রবাহমাত্রা" },
    phi_B: { en: "Magnetic flux", bn: "চৌম্বক ফ্লাক্স" },
    M_mutual: { en: "Mutual inductance", bn: "পারস্পরিক আবেশাঙ্ক" },
    dI: { en: "Change in current", bn: "কারেন্টের পরিবর্তন" },
    U_ind: { en: "Energy stored in inductor", bn: "আবেশকে সঞ্চিত শক্তি" },
    tau_L: { en: "Time constant (L-R circuit)", bn: "সময় ধ্রুবক (L-R)" },
    tau_C: { en: "Time constant (R-C circuit)", bn: "সময় ধ্রুবক (R-C)" },
    r_cyclotron: { en: "Radius of cyclotron path", bn: "সাইক্লোট্রনের ব্যাসার্ধ" },
    T_cyclotron: { en: "Time period of cyclotron", bn: "সাইক্লোট্রনের পর্যায়কাল" },
    f_cyclotron: { en: "Frequency of cyclotron", bn: "সাইক্লোট্রন কম্পাঙ্ক" },
    V_rms: { en: "RMS voltage", bn: "RMS ভোল্টেজ" },
    V0: { en: "Peak voltage / Stopping potential", bn: "সর্বোচ্চ ভোল্টেজ / নিবৃত্তি বিভব" },
    P_avg: { en: "Average power", bn: "গড় ক্ষমতা" },
    cos_phi: { en: "Power factor", bn: "ক্ষমতা গুণাঙ্ক" },
    omega0: { en: "Resonant angular frequency", bn: "অনুরণন কৌণিক কম্পাঙ্ক" },
    Q_factor: { en: "Quality factor", bn: "Q-ফ্যাক্টর" },
    delta_m: { en: "Mass defect", bn: "ভর ত্রুটি" },
    N0: { en: "Initial number of nuclei", bn: "প্রাথমিক নিউক্লিয়াস সংখ্যা" },
    A_activity: { en: "Radioactive activity", bn: "তেজস্ক্রিয়তা" },
    A0: { en: "Initial activity", bn: "প্রাথমিক তেজস্ক্রিয়তা" }
};