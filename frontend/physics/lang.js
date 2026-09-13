const dictionary = {
    title: { en: "PhysicsLab", bn: "ফিজিক্স ল্যাব" },
    heroTitle: { en: "Explore the Laws of Universe", bn: "মহাবিশ্বের নিয়মগুলো জানুন" },
    heroSub: { en: "Search and calculate complex formulas instantly.", bn: "যেকোনো কঠিন সূত্র খুঁজুন এবং নিমেষে হিসাব করুন।" },
    searchPlaceholder: { en: "Search formulas...", bn: "সূত্র খুঁজুন (যেমন: Force)..." },
    availableFormulas: { en: "Available Formulas", bn: "সকল সূত্র" },
    calcBtn: { en: "Calculate Result", bn: "ফলাফল নির্ণয় করুন" },
    targetLabel: { en: "What do you want to find?", bn: "কী বের করতে চান?" },
    targetDefault: { en: "-- Select Target --", bn: "-- নির্বাচন করুন --" },
    scientistTitle: { en: "Legendary Physicists", bn: "মহান পদার্থবিজ্ঞানীগণ" }
};

const physicsFormulas = {
    // ---- Mechanics: kinematics ----
    "v_uat": {
        id: "v_uat", all_variables: ["v", "u", "a", "t"],
        name: { en: "First equation of motion", bn: "গতির প্রথম সমীকরণ" },
        formula: "v = u + at",
        tags: ["kinematics", "velocity", "acceleration", "বেগ", "ত্বরণ", "গতি"]
    },
    "s_ut_at2": {
        id: "s_ut_at2", all_variables: ["s", "u", "a", "t"],
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
        formula: "s = (u+v)t/2",
        tags: ["kinematics", "average", "গড়"]
    },

    // ---- Force & Newton ----
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
        name: { en: "Impulse", bn: "আবেগ" },
        formula: "J = Ft",
        tags: ["impulse", "আবেগ"]
    },
    "friction": {
        id: "friction", all_variables: ["F_friction", "mu", "N"],
        name: { en: "Friction force", bn: "ঘর্ষণ বল" },
        formula: "f = μN",
        tags: ["friction", "ঘর্ষণ"]
    },

    // ---- Work energy power ----
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
    "power": {
        id: "power", all_variables: ["P_power", "W", "t"],
        name: { en: "Power", bn: "ক্ষমতা" },
        formula: "P = W/t",
        tags: ["power", "ক্ষমতা"]
    },
    "power_fv": {
        id: "power_fv", all_variables: ["P_power", "F", "v"],
        name: { en: "Power (F·v)", bn: "ক্ষমতা (F·v)" },
        formula: "P = Fv",
        tags: ["power", "ক্ষমতা"]
    },

    // ---- Circular motion ----
    "v_omega_r": {
        id: "v_omega_r", all_variables: ["v", "r", "omega"],
        name: { en: "Linear & angular velocity", bn: "রৈখিক ও কৌণিক বেগ" },
        formula: "v = rω",
        tags: ["circular", "omega", "বৃত্তাকার"]
    },
    "centripetal_acc": {
        id: "centripetal_acc", all_variables: ["a_c", "v", "r"],
        name: { en: "Centripetal acceleration", bn: "কেন্দ্রমুখী ত্বরণ" },
        formula: "a = v²/r",
        tags: ["centripetal", "circular", "কেন্দ্রমুখী"]
    },
    "centripetal_force": {
        id: "centripetal_force", all_variables: ["F_c", "m", "v", "r"],
        name: { en: "Centripetal force", bn: "কেন্দ্রমুখী বল" },
        formula: "F = mv²/r",
        tags: ["centripetal", "force", "কেন্দ্রমুখী"]
    },
    "omega_period": {
        id: "omega_period", all_variables: ["omega", "T"],
        name: { en: "Angular velocity from period", bn: "পর্যায়কাল থেকে ω" },
        formula: "ω = 2π/T",
        tags: ["period", "omega", "পর্যায়কাল"]
    },

    // ---- Gravitation ----
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
    "escape_velocity": {
        id: "escape_velocity", all_variables: ["escape_v", "G", "M", "R"],
        name: { en: "Escape velocity", bn: "পলায়ন বেগ" },
        formula: "vₑ = √(2GM/R)",
        tags: ["escape", "পলায়ন"]
    },
    "orbital_velocity": {
        id: "orbital_velocity", all_variables: ["orbital_v", "G", "M", "r"],
        name: { en: "Orbital velocity", bn: "কক্ষীয় বেগ" },
        formula: "v₀ = √(GM/r)",
        tags: ["orbital", "satellite", "উপগ্রহ"]
    },
    "kepler_t2": {
        id: "kepler_t2", all_variables: ["T", "r", "G", "M"],
        name: { en: "Kepler's 3rd law", bn: "কেপলারের তৃতীয় সূত্র" },
        formula: "T² = 4π²r³/(GM)",
        tags: ["kepler", "period", "কেপলার"]
    },

    // ---- Rotation ----
    "torque": {
        id: "torque", all_variables: ["tau", "F", "r"],
        name: { en: "Torque", bn: "টর্ক" },
        formula: "τ = Fr",
        tags: ["torque", "moment", "টর্ক"]
    },
    "torque_I_alpha": {
        id: "torque_I_alpha", all_variables: ["tau", "I", "alpha"],
        name: { en: "Torque (Iα)", bn: "টর্ক (Iα)" },
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

    // ---- SHM ----
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
    "shm_vmax": {
        id: "shm_vmax", all_variables: ["v_max", "omega", "A"],
        name: { en: "SHM max velocity", bn: "SHM সর্বোচ্চ বেগ" },
        formula: "vₘₐₓ = ωA",
        tags: ["shm", "velocity"]
    },
    "shm_amax": {
        id: "shm_amax", all_variables: ["a_max", "omega", "A"],
        name: { en: "SHM max acceleration", bn: "SHM সর্বোচ্চ ত্বরণ" },
        formula: "aₘₐₓ = ω²A",
        tags: ["shm", "acceleration"]
    },

    // ---- Waves ----
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
    "beat": {
        id: "beat", all_variables: ["beat_f", "f1", "f2"],
        name: { en: "Beat frequency", bn: "বিট কম্পাঙ্ক" },
        formula: "Δf = |f₁ − f₂|",
        tags: ["beat", "বিট"]
    },

    // ---- Elasticity & fluids ----
    "youngs_modulus": {
        id: "youngs_modulus", all_variables: ["Y", "F", "L", "A", "delta_L"],
        name: { en: "Young's modulus", bn: "ইয়ং-এর গুণাঙ্ক" },
        formula: "Y = FL/(AΔL)",
        tags: ["elasticity", "young", "ইয়ং"]
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
    "buoyancy": {
        id: "buoyancy", all_variables: ["F_b", "V", "rho", "g"],
        name: { en: "Buoyant force", bn: "উর্ধ্বমুখী বল" },
        formula: "Fᵦ = Vρg",
        tags: ["buoyancy", "archimedes", "আর্কিমিডিস"]
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

    // ---- Thermal ----
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
    "ideal_gas_phy": {
        id: "ideal_gas_phy", all_variables: ["P", "V", "n", "R", "T"],
        name: { en: "Ideal gas law", bn: "আদর্শ গ্যাস সূত্র" },
        formula: "PV = nRT",
        tags: ["gas", "thermal", "গ্যাস"]
    },
    "rms_speed": {
        id: "rms_speed", all_variables: ["rms", "R", "T", "M"],
        name: { en: "RMS speed", bn: "RMS গতি" },
        formula: "vᵣₘₛ = √(3RT/M)",
        tags: ["kinetic", "gas", "rms"]
    },
    "carnot": {
        id: "carnot", all_variables: ["efficiency_carnot", "T1", "T2"],
        name: { en: "Carnot efficiency", bn: "কার্নো দক্ষতা" },
        formula: "η = 1 − T₂/T₁",
        tags: ["carnot", "engine", "কার্নো"]
    },

    // ---- Optics ----
    "lens_formula": {
        id: "lens_formula", all_variables: ["f", "v_img", "u_obj"],
        name: { en: "Lens / mirror formula", bn: "লেন্স/দর্পণ সূত্র" },
        formula: "1/f = 1/v − 1/u",
        tags: ["lens", "mirror", "optics", "লেন্স", "দর্পণ"]
    },
    "magnification": {
        id: "magnification", all_variables: ["m_mag", "h_i", "h_o"],
        name: { en: "Magnification", bn: "বিবর্ধন" },
        formula: "m = hᵢ/h₀",
        tags: ["magnification", "optics", "বিবর্ধন"]
    },
    "lens_power": {
        id: "lens_power", all_variables: ["P_lens", "f"],
        name: { en: "Power of lens", bn: "লেন্সের ক্ষমতা" },
        formula: "P = 1/f",
        tags: ["power", "lens", "ডায়প্টার"]
    },
    "snell": {
        id: "snell", all_variables: ["n1", "sin_i", "n2", "sin_r"],
        name: { en: "Snell's law", bn: "স্নেলের সূত্র" },
        formula: "n₁sin i = n₂sin r",
        tags: ["refraction", "snell", "প্রতিসরণ"]
    },
    "critical_angle": {
        id: "critical_angle", all_variables: ["sin_c", "n"],
        name: { en: "Critical angle", bn: "সংকট কোণ" },
        formula: "sin c = 1/n",
        tags: ["tir", "critical", "সংকট"]
    },
    "fringe_width": {
        id: "fringe_width", all_variables: ["beta", "lambda_w", "D_screen", "d_slit"],
        name: { en: "Fringe width (YDSE)", bn: "পটি প্রস্থ (YDSE)" },
        formula: "β = λD/d",
        tags: ["interference", "ydse", "ব্যতিচার"]
    },

    // ---- Electrostatics ----
    "coulomb": {
        id: "coulomb", all_variables: ["F", "k", "q1", "q2", "r"],
        name: { en: "Coulomb's law", bn: "কুলম্বের সূত্র" },
        formula: "F = kq₁q₂/r²",
        tags: ["coulomb", "charge", "কুলম্ব", "চার্জ"]
    },
    "electric_field": {
        id: "electric_field", all_variables: ["E_field", "F", "q"],
        name: { en: "Electric field", bn: "তড়িৎ ক্ষেত্র" },
        formula: "E = F/q",
        tags: ["electric", "field", "ক্ষেত্র"]
    },
    "efield_point": {
        id: "efield_point", all_variables: ["E_field", "k", "q", "r"],
        name: { en: "E due to point charge", bn: "বিন্দু চার্জের E" },
        formula: "E = kq/r²",
        tags: ["electric", "field"]
    },
    "potential": {
        id: "potential", all_variables: ["V", "k", "q", "r"],
        name: { en: "Electric potential", bn: "তড়িৎ বিভব" },
        formula: "V = kq/r",
        tags: ["potential", "voltage", "বিভব"]
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
    "cap_energy": {
        id: "cap_energy", all_variables: ["U_cap", "C", "V"],
        name: { en: "Energy in capacitor", bn: "ধারকে শক্তি" },
        formula: "U = ½CV²",
        tags: ["capacitor", "energy"]
    },

    // ---- Current electricity ----
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
    "electric_power": {
        id: "electric_power", all_variables: ["P_elec", "V", "I"],
        name: { en: "Electric power", bn: "তড়িৎ ক্ষমতা" },
        formula: "P = VI",
        tags: ["power", "electric", "ক্ষমতা"]
    },
    "joule_heat": {
        id: "joule_heat", all_variables: ["H", "I", "R", "t"],
        name: { en: "Joule's heating", bn: "জুলের তাপ" },
        formula: "H = I²Rt",
        tags: ["joule", "heat", "জুল"]
    },
    "emf_terminal": {
        id: "emf_terminal", all_variables: ["E_emf", "V", "I", "r_int"],
        name: { en: "EMF and terminal voltage", bn: "তড়িৎচালক বল ও টার্মিনাল ভোল্টেজ" },
        formula: "E = V + Ir",
        tags: ["emf", "battery", "তড়িৎচালক"]
    },

    // ---- Magnetism & EMI ----
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
    "biot_wire": {
        id: "biot_wire", all_variables: ["B", "mu0", "I", "r"],
        name: { en: "B due to long wire", bn: "দীর্ঘ তারের B" },
        formula: "B = μ₀I/(2πr)",
        tags: ["biot", "magnetic", "চৌম্বক"]
    },
    "solenoid_B": {
        id: "solenoid_B", all_variables: ["B", "mu0", "n_turns", "I"],
        name: { en: "B inside solenoid", bn: "সলেনয়েডের ভিতর B" },
        formula: "B = μ₀nI",
        tags: ["solenoid", "magnetic"]
    },
    "motional_emf": {
        id: "motional_emf", all_variables: ["emf", "B", "L", "v"],
        name: { en: "Motional EMF", bn: "গতিজনিত তড়িৎচালক বল" },
        formula: "ε = Bℓv",
        tags: ["emi", "emf", "আবেশ"]
    },
    "faraday": {
        id: "faraday", all_variables: ["emf", "d_phi", "dt"],
        name: { en: "Faraday's law", bn: "ফ্যারাডের সূত্র" },
        formula: "ε = −dΦ/dt",
        tags: ["faraday", "emi", "ফ্যারাডে"]
    },

    // ---- AC ----
    "rms_current": {
        id: "rms_current", all_variables: ["I_rms", "I0"],
        name: { en: "RMS current", bn: "RMS প্রবাহ" },
        formula: "Iᵣₘₛ = I₀/√2",
        tags: ["ac", "rms"]
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
        formula: "Z = √[R²+(X_L−X_C)²]",
        tags: ["ac", "lcr", "impedance"]
    },
    "resonance": {
        id: "resonance", all_variables: ["f0", "L_ind", "C"],
        name: { en: "Resonant frequency", bn: "অনুরণন কম্পাঙ্ক" },
        formula: "f₀ = 1/(2π√(LC))",
        tags: ["ac", "resonance", "অনুরণন"]
    },

    // ---- Modern physics ----
    "photon_energy": {
        id: "photon_energy", all_variables: ["E_photon", "h", "f"],
        name: { en: "Photon energy", bn: "ফোটন শক্তি" },
        formula: "E = hf",
        tags: ["photon", "quantum", "ফোটন"]
    },
    "photoelectric": {
        id: "photoelectric", all_variables: ["KE_max", "h", "f", "phi_work"],
        name: { en: "Photoelectric equation", bn: "আলোক তড়িৎ সমীকরণ" },
        formula: "KEₘₐₓ = hf − φ",
        tags: ["photoelectric", "einstein", "আলোকতড়িৎ"]
    },
    "debroglie": {
        id: "debroglie", all_variables: ["lambda_debroglie", "h", "p"],
        name: { en: "de Broglie wavelength", bn: "দ্রব্রগলি তরঙ্গদৈর্ঘ্য" },
        formula: "λ = h/p",
        tags: ["debroglie", "wave", "দ্রব্রগলি"]
    },
    "bohr_energy": {
        id: "bohr_energy", all_variables: ["E_n", "Z", "n"],
        name: { en: "Bohr energy levels", bn: "বোর শক্তিস্তর" },
        formula: "Eₙ = −13.6 Z²/n² eV",
        tags: ["bohr", "atom", "বোর"]
    },
    "half_life": {
        id: "half_life", all_variables: ["T_half", "lambda_decay"],
        name: { en: "Half-life", bn: "অর্ধায়ু" },
        formula: "T½ = 0.693/λ",
        tags: ["radioactivity", "half", "অর্ধায়ু"]
    },
    "mass_energy": {
        id: "mass_energy", all_variables: ["E_rest", "m", "c"],
        name: { en: "Mass-energy equivalence", bn: "ভর-শক্তি সমতুল্যতা" },
        formula: "E = mc²",
        tags: ["einstein", "relativity", "আইনস্টাইন"]
    }
};
