const dictionary = {
    title: { en: "ChemLab", bn: "কেমিস্ট্রি ল্যাব" },
    heroTitle: { en: "Explore the Chemical World", bn: "রসায়নের দুনিয়ায় স্বাগতম" },
    heroSub: { en: "Search and calculate complex formulas instantly.", bn: "যেকোনো রাসায়নিক সূত্র খুঁজুন এবং নিমেষে হিসাব করুন।" },
    searchPlaceholder: { en: "Search formulas...", bn: "সূত্র খুঁজুন (যেমন: Moles)..." },
    availableFormulas: { en: "Available Formulas", bn: "সকল সূত্র" },
    calcBtn: { en: "Calculate Result", bn: "ফলাফল নির্ণয় করুন" },
    targetLabel: { en: "What do you want to find?", bn: "কী বের করতে চান?" },
    targetDefault: { en: "-- Select Target --", bn: "-- নির্বাচন করুন --" },
    scientistTitle: { en: "Legendary Chemists", bn: "মহান রসায়নবিদগণ" }
};

const chemistryFormulas = {
    // ---- Mole concept ----
    "moles": {
        id: "moles", all_variables: ["n", "mass", "M"],
        name: { en: "Number of moles", bn: "মোল সংখ্যা" },
        formula: "n = mass / M",
        tags: ["moles", "mass", "molar", "মোল", "ভর"]
    },
    "particles": {
        id: "particles", all_variables: ["n", "N_particles", "N_A"],
        name: { en: "Moles from particles", bn: "কণা থেকে মোল" },
        formula: "n = N / N_A",
        tags: ["avogadro", "particles", "অ্যাভোগাড্রো"]
    },
    "moles_stp": {
        id: "moles_stp", all_variables: ["n", "V_STP"],
        name: { en: "Moles at STP", bn: "STP-তে মোল" },
        formula: "n = V / 22.4",
        tags: ["stp", "volume", "গ্যাস"]
    },
    "molarity": {
        id: "molarity", all_variables: ["Mol", "n", "V"],
        name: { en: "Molarity", bn: "মোলারিটি" },
        formula: "M = n / V",
        tags: ["molarity", "concentration", "মোলারিটি"]
    },
    "molality": {
        id: "molality", all_variables: ["m_molality", "n", "mass_solvent_kg"],
        name: { en: "Molality", bn: "মোল্যালিটি" },
        formula: "m = n / mass_solvent(kg)",
        tags: ["molality", "মোল্যালিটি"]
    },
    "mole_fraction": {
        id: "mole_fraction", all_variables: ["mole_frac", "n_solute", "n_solvent"],
        name: { en: "Mole fraction", bn: "মোল ভগ্নাংশ" },
        formula: "x = n₁/(n₁+n₂)",
        tags: ["mole fraction", "মোল ভগ্নাংশ"]
    },
    "normality": {
        id: "normality", all_variables: ["normality", "n_eq", "V"],
        name: { en: "Normality", bn: "নরম্যালিটি" },
        formula: "N = n_eq / V",
        tags: ["normality", "নরম্যালিটি"]
    },
    "dilution_M": {
        id: "dilution_M", all_variables: ["Mol1", "V1", "Mol2", "V2"],
        name: { en: "Dilution (M₁V₁ = M₂V₂)", bn: "তনুকরণ (M₁V₁ = M₂V₂)" },
        formula: "M₁V₁ = M₂V₂",
        tags: ["dilution", "তনুকরণ"]
    },
    "percent_yield": {
        id: "percent_yield", all_variables: ["percent_yield", "actual_yield", "theoretical_yield"],
        name: { en: "Percent yield", bn: "শতকরা প্রাপ্তি" },
        formula: "% yield = actual/theoretical × 100",
        tags: ["yield", "প্রাপ্তি"]
    },
    "density_chem": {
        id: "density_chem", all_variables: ["density", "mass", "V"],
        name: { en: "Density", bn: "ঘনত্ব" },
        formula: "d = mass / V",
        tags: ["density", "ঘনত্ব"]
    },

    // ---- Atomic structure ----
    "photon_energy_chem": {
        id: "photon_energy_chem", all_variables: ["E_photon", "h", "f"],
        name: { en: "Photon energy (E = hf)", bn: "ফোটন শক্তি" },
        formula: "E = hf",
        tags: ["photon", "quantum", "ফোটন"]
    },
    "photon_wavelength": {
        id: "photon_wavelength", all_variables: ["E_photon", "h", "c", "lambda_w"],
        name: { en: "Photon energy (hc/λ)", bn: "ফোটন শক্তি (hc/λ)" },
        formula: "E = hc/λ",
        tags: ["photon", "wavelength"]
    },
    "debroglie_chem": {
        id: "debroglie_chem", all_variables: ["lambda_debroglie", "h", "m", "v"],
        name: { en: "de Broglie wavelength", bn: "দ্রব্রগলি তরঙ্গদৈর্ঘ্য" },
        formula: "λ = h/(mv)",
        tags: ["debroglie", "wave"]
    },
    "bohr_energy_chem": {
        id: "bohr_energy_chem", all_variables: ["E_n", "Z", "n"],
        name: { en: "Bohr energy (kJ/mol scale)", bn: "বোর শক্তিস্তর" },
        formula: "Eₙ = −1312 Z²/n²",
        tags: ["bohr", "atom", "বোর"]
    },
    "rydberg": {
        id: "rydberg", all_variables: ["lambda_w", "R_H", "n1", "n2"],
        name: { en: "Rydberg formula", bn: "রিডবার্গ সূত্র" },
        formula: "1/λ = R(1/n₁² − 1/n₂²)",
        tags: ["rydberg", "spectrum", "রিডবার্গ"]
    },

    // ---- Gaseous state ----
    "ideal_gas": {
        id: "ideal_gas", all_variables: ["P", "V", "n", "T"],
        name: { en: "Ideal gas (R = 0.0821)", bn: "আদর্শ গ্যাস (R = 0.0821)" },
        formula: "PV = n·0.0821·T",
        tags: ["gas", "ideal", "গ্যাস", "চাপ"]
    },
    "ideal_gas_R": {
        id: "ideal_gas_R", all_variables: ["P", "V", "n", "R", "T"],
        name: { en: "Ideal gas law (PV = nRT)", bn: "আদর্শ গ্যাস সূত্র" },
        formula: "PV = nRT",
        tags: ["gas", "ideal", "গ্যাস"]
    },
    "boyle": {
        id: "boyle", all_variables: ["P1", "V1", "P2", "V2"],
        name: { en: "Boyle's law", bn: "বয়লের সূত্র" },
        formula: "P₁V₁ = P₂V₂",
        tags: ["boyle", "gas", "বয়ল"]
    },
    "charles": {
        id: "charles", all_variables: ["V1", "T1", "V2", "T2"],
        name: { en: "Charles's law", bn: "চার্লসের সূত্র" },
        formula: "V₁/T₁ = V₂/T₂",
        tags: ["charles", "gas", "চার্লস"]
    },
    "gay_lussac": {
        id: "gay_lussac", all_variables: ["P1", "T1", "P2", "T2"],
        name: { en: "Gay-Lussac's law", bn: "গে-লুসাকের সূত্র" },
        formula: "P₁/T₁ = P₂/T₂",
        tags: ["gay-lussac", "gas"]
    },
    "combined_gas": {
        id: "combined_gas", all_variables: ["P1", "V1", "T1", "P2", "V2", "T2"],
        name: { en: "Combined gas law", bn: "সম্মিলিত গ্যাস সূত্র" },
        formula: "P₁V₁/T₁ = P₂V₂/T₂",
        tags: ["gas", "combined"]
    },
    "gas_density": {
        id: "gas_density", all_variables: ["density", "P", "M", "R", "T"],
        name: { en: "Gas density", bn: "গ্যাসের ঘনত্ব" },
        formula: "d = PM/(RT)",
        tags: ["density", "gas"]
    },
    "rms_chem": {
        id: "rms_chem", all_variables: ["rms", "R", "T", "M"],
        name: { en: "RMS speed", bn: "RMS গতি" },
        formula: "vᵣₘₛ = √(3RT/M)",
        tags: ["rms", "kinetic", "গ্যাস"]
    },
    "graham": {
        id: "graham", all_variables: ["rate1", "rate2", "M1", "M2"],
        name: { en: "Graham's law", bn: "গ্রাহামের সূত্র" },
        formula: "r₁/r₂ = √(M₂/M₁)",
        tags: ["graham", "diffusion", "গ্রাহাম"]
    },
    "dalton": {
        id: "dalton", all_variables: ["P_total", "P1", "P2"],
        name: { en: "Dalton's law", bn: "ডালটনের সূত্র" },
        formula: "P = P₁ + P₂",
        tags: ["dalton", "partial", "ডালটন"]
    },

    // ---- Thermochemistry ----
    "first_law": {
        id: "first_law", all_variables: ["dU", "q", "w"],
        name: { en: "First law of thermodynamics", bn: "তাপগতির প্রথম সূত্র" },
        formula: "ΔU = q + w",
        tags: ["thermodynamics", "তাপগতি"]
    },
    "enthalpy_relation": {
        id: "enthalpy_relation", all_variables: ["dH", "dU", "dn_g", "R", "T"],
        name: { en: "ΔH = ΔU + Δn_g RT", bn: "ΔH = ΔU + Δn_g RT" },
        formula: "ΔH = ΔU + Δn_g RT",
        tags: ["enthalpy", "এনথ্যালপি"]
    },
    "heat_capacity_u": {
        id: "heat_capacity_u", all_variables: ["dU", "n", "Cv", "dT"],
        name: { en: "ΔU = n Cv ΔT", bn: "ΔU = n Cv ΔT" },
        formula: "ΔU = nCᵥΔT",
        tags: ["heat capacity", "Cv"]
    },
    "heat_capacity_h": {
        id: "heat_capacity_h", all_variables: ["dH", "n", "Cp", "dT"],
        name: { en: "ΔH = n Cp ΔT", bn: "ΔH = n Cp ΔT" },
        formula: "ΔH = nCₚΔT",
        tags: ["heat capacity", "Cp"]
    },
    "cp_cv": {
        id: "cp_cv", all_variables: ["Cp", "Cv", "R"],
        name: { en: "Cp − Cv = R", bn: "Cp − Cv = R" },
        formula: "Cₚ − Cᵥ = R",
        tags: ["heat capacity"]
    },
    "gibbs": {
        id: "gibbs", all_variables: ["dG", "dH", "T", "dS"],
        name: { en: "Gibbs free energy", bn: "গিবস মুক্ত শক্তি" },
        formula: "ΔG = ΔH − TΔS",
        tags: ["gibbs", "free energy", "গিবস"]
    },
    "gibbs_eq": {
        id: "gibbs_eq", all_variables: ["dG0", "R", "T", "K"],
        name: { en: "ΔG° = −RT ln K", bn: "ΔG° = −RT ln K" },
        formula: "ΔG° = −RT ln K",
        tags: ["gibbs", "equilibrium"]
    },

    // ---- Equilibrium & pH ----
    "ph": {
        id: "ph", all_variables: ["pH", "H"],
        name: { en: "pH definition", bn: "pH সংজ্ঞা" },
        formula: "pH = −log₁₀[H⁺]",
        tags: ["ph", "acid", "পিএইচ"]
    },
    "poh": {
        id: "poh", all_variables: ["pOH", "OH"],
        name: { en: "pOH definition", bn: "pOH সংজ্ঞা" },
        formula: "pOH = −log₁₀[OH⁻]",
        tags: ["poh", "base"]
    },
    "ph_poh": {
        id: "ph_poh", all_variables: ["pH", "pOH"],
        name: { en: "pH + pOH = 14", bn: "pH + pOH = 14" },
        formula: "pH + pOH = 14",
        tags: ["ph", "water"]
    },
    "h_from_ph": {
        id: "h_from_ph", all_variables: ["H", "pH"],
        name: { en: "[H⁺] from pH", bn: "pH থেকে [H⁺]" },
        formula: "[H⁺] = 10^(−pH)",
        tags: ["ph", "hydrogen"]
    },
    "pka": {
        id: "pka", all_variables: ["pKa", "Ka"],
        name: { en: "pKa", bn: "pKa" },
        formula: "pKa = −log₁₀ Ka",
        tags: ["pka", "acid"]
    },
    "henderson": {
        id: "henderson", all_variables: ["pH", "pKa", "salt", "acid"],
        name: { en: "Henderson–Hasselbalch", bn: "হেন্ডারসন–হ্যাসেলব্যালক" },
        formula: "pH = pKa + log([salt]/[acid])",
        tags: ["buffer", "henderson", "বাফার"]
    },
    "weak_acid_h": {
        id: "weak_acid_h", all_variables: ["H", "Ka", "C_acid"],
        name: { en: "[H⁺] weak acid", bn: "দুর্বল অ্যাসিডের [H⁺]" },
        formula: "[H⁺] = √(Ka · C)",
        tags: ["weak acid", "equilibrium"]
    },
    "kw_ka_kb": {
        id: "kw_ka_kb", all_variables: ["K_w", "Ka", "Kb"],
        name: { en: "Kw = Ka · Kb", bn: "Kw = Ka · Kb" },
        formula: "K_w = Ka · Kb",
        tags: ["equilibrium", "water"]
    },
    "kp_kc": {
        id: "kp_kc", all_variables: ["Kp", "Kc", "R", "T", "dn_g"],
        name: { en: "Kp = Kc (RT)^{Δn}", bn: "Kp = Kc (RT)^{Δn}" },
        formula: "Kp = Kc(RT)^{Δn}",
        tags: ["equilibrium", "kp", "kc"]
    },

    // ---- Solutions / colligative ----
    "boiling_elevation": {
        id: "boiling_elevation", all_variables: ["delta_Tb", "Kb_ebull", "m_molality"],
        name: { en: "Elevation of boiling point", bn: "স্ফুটনাঙ্ক বৃদ্ধি" },
        formula: "ΔTb = Kb · m",
        tags: ["colligative", "boiling", "স্ফুটনাঙ্ক"]
    },
    "freezing_depression": {
        id: "freezing_depression", all_variables: ["delta_Tf", "Kf_cryo", "m_molality"],
        name: { en: "Depression of freezing point", bn: "হিমাঙ্ক হ্রাস" },
        formula: "ΔTf = Kf · m",
        tags: ["colligative", "freezing", "হিমাঙ্ক"]
    },
    "osmotic": {
        id: "osmotic", all_variables: ["pi_osm", "C_molar", "R", "T"],
        name: { en: "Osmotic pressure", bn: "অভিস্রবণ চাপ" },
        formula: "π = CRT",
        tags: ["osmotic", "colligative", "অভিস্রবণ"]
    },
    "raoult": {
        id: "raoult", all_variables: ["P_sol", "mole_frac_solv", "P0"],
        name: { en: "Raoult's law", bn: "রাউল্টের সূত্র" },
        formula: "P = x · P°",
        tags: ["raoult", "vapour", "রাউল্ট"]
    },

    // ---- Electrochemistry ----
    "cell_potential": {
        id: "cell_potential", all_variables: ["E_cell", "E_cathode", "E_anode"],
        name: { en: "Cell potential", bn: "কোষ বিভব" },
        formula: "E = E_cathode − E_anode",
        tags: ["electrochemistry", "cell", "কোষ"]
    },
    "nernst": {
        id: "nernst", all_variables: ["E_cell", "E0_cell", "n_e", "Q"],
        name: { en: "Nernst equation (25°C)", bn: "নার্নস্ট সমীকরণ (25°C)" },
        formula: "E = E° − (0.0591/n) log Q",
        tags: ["nernst", "electrochemistry", "নার্নস্ট"]
    },
    "gibbs_electro": {
        id: "gibbs_electro", all_variables: ["dG", "n_e", "F", "E_cell"],
        name: { en: "ΔG = −nFE", bn: "ΔG = −nFE" },
        formula: "ΔG = −nFE",
        tags: ["gibbs", "faraday"]
    },
    "faraday_mass": {
        id: "faraday_mass", all_variables: ["m_deposited", "M", "I", "t", "n_e", "F"],
        name: { en: "Faraday's first law (mass)", bn: "ফ্যারাডের প্রথম সূত্র" },
        formula: "m = MIt/(nF)",
        tags: ["faraday", "electrolysis", "ফ্যারাডে"]
    },
    "conductivity": {
        id: "conductivity", all_variables: ["G_molar", "kappa", "C_molar"],
        name: { en: "Molar conductivity", bn: "মোলার পরিবাহিতা" },
        formula: "Λₘ = κ × 1000 / C",
        tags: ["conductivity", "পরিবাহিতা"]
    },

    // ---- Kinetics ----
    "first_order_k": {
        id: "first_order_k", all_variables: ["k_rate", "C0", "C", "t"],
        name: { en: "First-order rate constant", bn: "প্রথম ক্রমের হার ধ্রুবক" },
        formula: "k = (2.303/t) log(C₀/C)",
        tags: ["kinetics", "rate", "বিক্রিয়ার হার"]
    },
    "half_life_1st": {
        id: "half_life_1st", all_variables: ["t_half", "k_rate"],
        name: { en: "Half-life (1st order)", bn: "অর্ধায়ু (প্রথম ক্রম)" },
        formula: "t½ = 0.693 / k",
        tags: ["kinetics", "half-life", "অর্ধায়ু"]
    },
    "arrhenius": {
        id: "arrhenius", all_variables: ["k2", "k1", "Ea", "T1", "T2", "R"],
        name: { en: "Arrhenius (two temperatures)", bn: "অ্যারেনিয়াস (দুই তাপমাত্রা)" },
        formula: "log(k₂/k₁) = Ea(T₂−T₁)/(2.303 R T₁ T₂)",
        tags: ["arrhenius", "activation", "অ্যারেনিয়াস"]
    },
    "half_life_2nd": {
        id: "half_life_2nd", all_variables: ["t_half", "k_rate", "C0"],
        name: { en: "Half-life (2nd order)", bn: "অর্ধায়ু (দ্বিতীয় ক্রম)" },
        formula: "t½ = 1/(k C₀)",
        tags: ["kinetics", "half-life"]
    },

    // ---- Redox / equivalent ----
    "eq_weight": {
        id: "eq_weight", all_variables: ["eq_wt", "M", "n_factor"],
        name: { en: "Equivalent weight", bn: "তুল্যাঙ্ক ভর" },
        formula: "Eq. wt = M / n-factor",
        tags: ["equivalent", "redox", "তুল্যাঙ্ক"]
    },
    "normality_molarity": {
        id: "normality_molarity", all_variables: ["normality", "Mol", "n_factor"],
        name: { en: "N = M × n-factor", bn: "N = M × n-factor" },
        formula: "N = M × n",
        tags: ["normality", "molarity"]
    }
};
