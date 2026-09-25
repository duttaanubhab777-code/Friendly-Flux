const dictionary = {
    title: { en: "ChemLab", bn: "কেমিস্ট্রি ল্যাব" },
    heroTitle: { en: "Explore the Chemical World", bn: "রসায়নের দুনিয়ায় স্বাগতম" },
    heroSub: { en: "Search and calculate complex formulas instantly.", bn: "যেকোনো রাসায়নিক সূত্র খুঁজুন এবং নিমেষে হিসাব করুন।" },
    searchPlaceholder: { en: "Search formulas...", bn: "সূত্র খুঁজুন (যেমন: Moles)..." },
    availableFormulas: { en: "Available Formulas", bn: "সকল সূত্র" },
    formulaCountBadge: { en: "150+ ready-to-solve formulas", bn: "১৫০+ সমাধানযোগ্য সূত্র" },
    calcBtn: { en: "Calculate Result", bn: "ফলাফল নির্ণয় করুন" },
    targetLabel: { en: "What do you want to find?", bn: "কী বের করতে চান?" },
    targetDefault: { en: "-- Select Target --", bn: "-- নির্বাচন করুন --" },
    scientistTitle: { en: "Legendary Chemists", bn: "মহান রসায়নবিদগণ" },
    footerNote: { en: "Crafted with curiosity — powered by Friendly Flux", bn: "কৌতূহল দিয়ে গড়া — Friendly Flux দ্বারা চালিত" }
};

const chemistryFormulas = {
    // =========================================================
    // MOLE CONCEPT & STOICHIOMETRY
    // =========================================================
    "moles": {
        id: "moles", all_variables: ["n", "mass", "M"],
        name: { en: "Number of moles", bn: "মোল সংখ্যা" },
        formula: "n = mass / M",
        tags: ["moles", "mass", "molar", "মোল", "ভর"]
    },
    "particles": {
        id: "particles", all_variables: ["n", "N_particles", "N_A"],
        name: { en: "Moles from particles", bn: "কণা থেকে মোল" },
        formula: "n = N_particles / N_A",
        tags: ["avogadro", "particles", "অ্যাভোগাড্রো"]
    },
    "moles_stp": {
        id: "moles_stp", all_variables: ["n", "V_STP"],
        name: { en: "Moles at STP", bn: "STP-তে মোল" },
        formula: "n = V_STP / 22.4",
        tags: ["stp", "volume", "গ্যাস"]
    },
    "molarity": {
        id: "molarity", all_variables: ["Mol", "n", "V"],
        name: { en: "Molarity", bn: "মোলারিটি" },
        formula: "Mol = n / V",
        tags: ["molarity", "concentration", "মোলারিটি"]
    },
    "molality": {
        id: "molality", all_variables: ["m_molality", "n", "mass_solvent_kg"],
        name: { en: "Molality", bn: "মোল্যালিটি" },
        formula: "m_molality = n / mass_solvent_kg",
        tags: ["molality", "মোল্যালিটি"]
    },
    "mole_fraction": {
        id: "mole_fraction", all_variables: ["mole_frac", "n_solute", "n_solvent"],
        name: { en: "Mole fraction", bn: "মোল ভগ্নাংশ" },
        formula: "mole_frac = n_solute / (n_solute + n_solvent)",
        tags: ["mole fraction", "মোল ভগ্নাংশ"]
    },
    "percent_mass": {
        id: "percent_mass", all_variables: ["percent_mass", "mass_solute", "mass_solution"],
        name: { en: "Percent by Mass", bn: "ভরের শতকরা হার" },
        formula: "percent_mass = (mass_solute × 100) / mass_solution",
        tags: ["percent", "mass", "শতকরা"]
    },
    "percent_vol": {
        id: "percent_vol", all_variables: ["percent_vol", "V_solute", "V_solution"],
        name: { en: "Percent by Volume", bn: "আয়তনের শতকরা হার" },
        formula: "percent_vol = (V_solute × 100) / V_solution",
        tags: ["percent", "volume", "শতকরা"]
    },
    "ppm": {
        id: "ppm", all_variables: ["ppm", "mass_solute", "mass_solution"],
        name: { en: "Parts per million (ppm)", bn: "পার্টস পার মিলিয়ন (ppm)" },
        formula: "ppm = (mass_solute × 10⁶) / mass_solution",
        tags: ["ppm", "concentration", "ঘনমাত্রা"]
    },
    "normality": {
        id: "normality", all_variables: ["normality", "n_eq", "V"],
        name: { en: "Normality", bn: "নরম্যালিটি" },
        formula: "normality = n_eq / V",
        tags: ["normality", "নরম্যালিটি"]
    },
    "n_eq_mass": {
        id: "n_eq_mass", all_variables: ["n_eq", "mass", "eq_wt"],
        name: { en: "Number of Equivalents", bn: "তুল্যাঙ্ক সংখ্যা" },
        formula: "n_eq = mass / eq_wt",
        tags: ["equivalents", "mass", "তুল্যাঙ্ক"]
    },
    "dilution_M": {
        id: "dilution_M", all_variables: ["Mol1", "V1", "Mol2", "V2"],
        name: { en: "Dilution (Molarity)", bn: "তনুকরণ (M₁V₁ = M₂V₂)" },
        formula: "Mol1 × V1 = Mol2 × V2",
        tags: ["dilution", "তনুকরণ"]
    },
    "dilution_N": {
        id: "dilution_N", all_variables: ["N1", "V1", "N2", "V2"],
        name: { en: "Dilution (Normality)", bn: "তনুকরণ (N₁V₁ = N₂V₂)" },
        formula: "N1 × V1 = N2 × V2",
        tags: ["dilution", "normality", "তনুকরণ"]
    },
    "percent_yield": {
        id: "percent_yield", all_variables: ["percent_yield", "actual_yield", "theoretical_yield"],
        name: { en: "Percent yield", bn: "শতকরা প্রাপ্তি" },
        formula: "percent_yield = (actual_yield × 100) / theoretical_yield",
        tags: ["yield", "প্রাপ্তি"]
    },
    "density_chem": {
        id: "density_chem", all_variables: ["density", "mass", "V"],
        name: { en: "Density", bn: "ঘনত্ব" },
        formula: "density = mass / V",
        tags: ["density", "ঘনত্ব"]
    },
    "molar_mass_from_density": {
        id: "molar_mass_from_density", all_variables: ["M", "density", "V", "n"],
        name: { en: "Molar Mass from Density", bn: "ঘনত্ব থেকে আণবিক ভর" },
        formula: "M = density × V × 1000 / n",
        tags: ["molar mass", "density", "আণবিক ভর"]
    },

    // =========================================================
    // ATOMIC STRUCTURE
    // =========================================================
    "photon_energy_chem": {
        id: "photon_energy_chem", all_variables: ["E_photon", "h", "f"],
        name: { en: "Photon energy (E = hf)", bn: "ফোটন শক্তি" },
        formula: "E_photon = h × f",
        tags: ["photon", "quantum", "ফোটন"]
    },
    "photon_wavelength": {
        id: "photon_wavelength", all_variables: ["E_photon", "h", "c", "lambda_w"],
        name: { en: "Photon energy (hc/λ)", bn: "ফোটন শক্তি (hc/λ)" },
        formula: "E_photon = h × c / lambda_w",
        tags: ["photon", "wavelength"]
    },
    "frequency_wavelength": {
        id: "frequency_wavelength", all_variables: ["f", "c", "lambda_w"],
        name: { en: "Frequency from Wavelength", bn: "তরঙ্গদৈর্ঘ্য থেকে কম্পাঙ্ক" },
        formula: "f = c / lambda_w",
        tags: ["frequency", "wavelength", "কম্পাঙ্ক"]
    },
    "photoelectric_effect": {
        id: "photoelectric_effect", all_variables: ["KE_max", "h", "f", "phi_work"],
        name: { en: "Photoelectric Effect", bn: "আলোকতড়িৎ ক্রিয়া" },
        formula: "KE_max = h × f - phi_work",
        tags: ["photoelectric", "work function", "আলোকতড়িৎ"]
    },
    "debroglie_chem": {
        id: "debroglie_chem", all_variables: ["lambda_debroglie", "h", "m", "v"],
        name: { en: "de Broglie wavelength", bn: "দ্রব্রগলি তরঙ্গদৈর্ঘ্য" },
        formula: "lambda_debroglie = h / (m × v)",
        tags: ["debroglie", "wave"]
    },
    "debroglie_momentum": {
        id: "debroglie_momentum", all_variables: ["lambda_debroglie", "h", "p"],
        name: { en: "de Broglie (Momentum)", bn: "দ্রব্রগলি (ভরবেগ)" },
        formula: "lambda_debroglie = h / p",
        tags: ["debroglie", "momentum", "ভরবেগ"]
    },
    "bohr_energy_chem": {
        id: "bohr_energy_chem", all_variables: ["E_n", "Z", "n"],
        name: { en: "Bohr energy", bn: "বোর শক্তিস্তর" },
        formula: "E_n = -1312 × Z² / n²",
        tags: ["bohr", "atom", "বোর"]
    },
    "energy_difference": {
        id: "energy_difference", all_variables: ["delta_E", "E_n2", "E_n1"],
        name: { en: "Energy Difference", bn: "শক্তির পার্থক্য" },
        formula: "delta_E = E_n2 - E_n1",
        tags: ["energy", "difference", "পার্থক্য"]
    },
    "rydberg": {
        id: "rydberg", all_variables: ["lambda_w", "R_H", "n1", "n2"],
        name: { en: "Rydberg formula", bn: "রিডবার্গ সূত্র" },
        formula: "1/lambda_w = R_H × (1/n1² − 1/n2²)",
        tags: ["rydberg", "spectrum", "রিডবার্গ"]
    },
    "bohr_radius": {
        id: "bohr_radius", all_variables: ["r_n", "n", "Z"],
        name: { en: "Bohr Radius", bn: "বোর ব্যাসার্ধ" },
        formula: "r_n = 52.9 × n² / Z",
        tags: ["bohr", "radius", "ব্যাসার্ধ"]
    },
    "bohr_velocity": {
        id: "bohr_velocity", all_variables: ["v_e", "Z", "n"],
        name: { en: "Electron Velocity (Bohr)", bn: "ইলেকট্রনের বেগ (বোর)" },
        formula: "v_e = 2.18e6 × Z / n",
        tags: ["bohr", "velocity", "বেগ"]
    },
    "heisenberg_uncert": {
        id: "heisenberg_uncert", all_variables: ["uncert_x", "uncert_p", "h", "pi"],
        name: { en: "Heisenberg Uncertainty", bn: "হাইজেনবার্গের অনিশ্চয়তা নীতি" },
        formula: "uncert_x × uncert_p = h / (4 × pi)",
        tags: ["heisenberg", "uncertainty", "অনিশ্চয়তা"]
    },
    "azimuthal_quantum": {
        id: "azimuthal_quantum", all_variables: ["l_max", "n_quantum"],
        name: { en: "Max Azimuthal Quantum No.", bn: "সর্বোচ্চ অ্যাজিমুথাল কোয়ান্টাম সংখ্যা" },
        formula: "l_max = n_quantum - 1",
        tags: ["quantum", "azimuthal"]
    },
    "orbitals_in_subshell": {
        id: "orbitals_in_subshell", all_variables: ["orbitals_subshell", "l_quantum"],
        name: { en: "Orbitals in Subshell", bn: "উপস্তরে অরবিটাল সংখ্যা" },
        formula: "orbitals_subshell = 2 × l_quantum + 1",
        tags: ["orbitals", "subshell", "অরবিটাল"]
    },
    "max_electrons_shell": {
        id: "max_electrons_shell", all_variables: ["electrons_max_shell", "n_quantum"],
        name: { en: "Max Electrons in Shell", bn: "কক্ষপথে সর্বোচ্চ ইলেকট্রন" },
        formula: "electrons_max_shell = 2 × n_quantum²",
        tags: ["quantum", "electrons", "ইলেকট্রন"]
    },
    "max_electrons_subshell": {
        id: "max_electrons_subshell", all_variables: ["electrons_max_subshell", "l_quantum"],
        name: { en: "Max Electrons in Subshell", bn: "উপস্তরে সর্বোচ্চ ইলেকট্রন" },
        formula: "electrons_max_subshell = 2 × (2 × l_quantum + 1)",
        tags: ["quantum", "electrons", "subshell"]
    },
    "mass_defect": {
        id: "mass_defect", all_variables: ["mass_defect", "Z", "m_proton", "A_mass", "m_neutron", "M_nucleus"],
        name: { en: "Mass Defect", bn: "ভর ত্রুটি" },
        formula: "mass_defect = Z×m_proton + (A_mass - Z)×m_neutron - M_nucleus",
        tags: ["nuclear", "mass defect", "ভর ত্রুটি"]
    },
    "binding_energy": {
        id: "binding_energy", all_variables: ["binding_energy", "mass_defect", "c"],
        name: { en: "Binding Energy", bn: "বন্ধন শক্তি" },
        formula: "binding_energy = mass_defect × c²",
        tags: ["nuclear", "binding energy", "বন্ধন শক্তি"]
    },
    "nuclear_radius": {
        id: "nuclear_radius", all_variables: ["nuclear_radius", "r0", "A_mass"],
        name: { en: "Nuclear Radius", bn: "নিউক্লিয়াসের ব্যাসার্ধ" },
        formula: "nuclear_radius = r0 × A_mass^(1/3)",
        tags: ["nuclear", "radius", "ব্যাসার্ধ"]
    },

    // =========================================================
    // GASEOUS STATE
    // =========================================================
    "ideal_gas_R": {
        id: "ideal_gas_R", all_variables: ["P", "V", "n", "R", "T"],
        name: { en: "Ideal gas law (PV = nRT)", bn: "আদর্শ গ্যাস সূত্র" },
        formula: "P × V = n × R × T",
        tags: ["gas", "ideal", "গ্যাস"]
    },
    "ideal_gas": {
        id: "ideal_gas", all_variables: ["P", "V", "n", "T"],
        name: { en: "Ideal gas (R = 0.0821)", bn: "আদর্শ গ্যাস (R = 0.0821)" },
        formula: "P × V = n × 0.0821 × T",
        tags: ["gas", "ideal", "গ্যাস", "চাপ"]
    },
    "boyle": {
        id: "boyle", all_variables: ["P1", "V1", "P2", "V2"],
        name: { en: "Boyle's law", bn: "বয়লের সূত্র" },
        formula: "P1 × V1 = P2 × V2",
        tags: ["boyle", "gas", "বয়ল"]
    },
    "charles": {
        id: "charles", all_variables: ["V1", "T1", "V2", "T2"],
        name: { en: "Charles's law", bn: "চার্লসের সূত্র" },
        formula: "V1 / T1 = V2 / T2",
        tags: ["charles", "gas", "চার্লস"]
    },
    "gay_lussac": {
        id: "gay_lussac", all_variables: ["P1", "T1", "P2", "T2"],
        name: { en: "Gay-Lussac's law", bn: "গে-লুসাকের সূত্র" },
        formula: "P1 / T1 = P2 / T2",
        tags: ["gay-lussac", "gas"]
    },
    "combined_gas": {
        id: "combined_gas", all_variables: ["P1", "V1", "T1", "P2", "V2", "T2"],
        name: { en: "Combined gas law", bn: "সম্মিলিত গ্যাস সূত্র" },
        formula: "P1×V1 / T1 = P2×V2 / T2",
        tags: ["gas", "combined"]
    },
    "gas_density": {
        id: "gas_density", all_variables: ["density", "P", "M", "R", "T"],
        name: { en: "Gas density", bn: "গ্যাসের ঘনত্ব" },
        formula: "density = P × M / (R × T)",
        tags: ["density", "gas"]
    },
    "rms_chem": {
        id: "rms_chem", all_variables: ["rms", "R", "T", "M"],
        name: { en: "RMS speed", bn: "RMS গতি" },
        formula: "rms = √(3 × R × T / M)",
        tags: ["rms", "kinetic", "গ্যাস"]
    },
    "rms_pressure_density": {
        id: "rms_pressure_density", all_variables: ["rms", "P", "density"],
        name: { en: "RMS speed (Pressure/Density)", bn: "RMS গতি (চাপ/ঘনত্ব)" },
        formula: "rms = √(3 × P / density)",
        tags: ["rms", "pressure", "density"]
    },
    "avg_velocity": {
        id: "avg_velocity", all_variables: ["v_avg", "R", "T", "pi", "M"],
        name: { en: "Average Velocity", bn: "গড় বেগ" },
        formula: "v_avg = √(8 × R × T / (pi × M))",
        tags: ["velocity", "average", "গড় বেগ"]
    },
    "mp_velocity": {
        id: "mp_velocity", all_variables: ["v_mp", "R", "T", "M"],
        name: { en: "Most Probable Velocity", bn: "সম্ভাব্যতম বেগ" },
        formula: "v_mp = √(2 × R × T / M)",
        tags: ["velocity", "most probable", "সম্ভাব্যতম বেগ"]
    },
    "kinetic_energy_avg": {
        id: "kinetic_energy_avg", all_variables: ["KE_avg", "R", "T"],
        name: { en: "Average Kinetic Energy (Per Mole)", bn: "গড় গতিশক্তি (মোল প্রতি)" },
        formula: "KE_avg = 3 × R × T / 2",
        tags: ["kinetic energy", "গতিশক্তি"]
    },
    "kinetic_energy_total": {
        id: "kinetic_energy_total", all_variables: ["KE_total", "n", "R", "T"],
        name: { en: "Total Kinetic Energy", bn: "মোট গতিশক্তি" },
        formula: "KE_total = 3 × n × R × T / 2",
        tags: ["kinetic", "total energy"]
    },
    "graham": {
        id: "graham", all_variables: ["rate1", "rate2", "M1", "M2"],
        name: { en: "Graham's law (Mass)", bn: "গ্রাহামের সূত্র (ভর)" },
        formula: "rate1 / rate2 = √(M2 / M1)",
        tags: ["graham", "diffusion", "গ্রাহাম"]
    },
    "graham_density": {
        id: "graham_density", all_variables: ["rate1", "rate2", "d1", "d2"],
        name: { en: "Graham's law (Density)", bn: "গ্রাহামের সূত্র (ঘনত্ব)" },
        formula: "rate1 / rate2 = √(d2 / d1)",
        tags: ["graham", "diffusion", "density"]
    },
    "graham_time": {
        id: "graham_time", all_variables: ["t1", "t2", "M1", "M2"],
        name: { en: "Graham's law (Time)", bn: "গ্রাহামের সূত্র (সময়)" },
        formula: "t1 / t2 = √(M1 / M2)",
        tags: ["graham", "time", "diffusion"]
    },
    "dalton": {
        id: "dalton", all_variables: ["P_total", "P1", "P2"],
        name: { en: "Dalton's law", bn: "ডালটনের সূত্র" },
        formula: "P_total = P1 + P2",
        tags: ["dalton", "partial", "ডালটন"]
    },
    "partial_pressure": {
        id: "partial_pressure", all_variables: ["P1", "mole_frac", "P_total"],
        name: { en: "Partial Pressure", bn: "আংশিক চাপ" },
        formula: "P1 = mole_frac × P_total",
        tags: ["dalton", "partial pressure", "আংশিক চাপ"]
    },
    "real_gas_vdw": {
        id: "real_gas_vdw", all_variables: ["V_real", "n", "R", "T", "P", "b"],
        name: { en: "Real Gas Volume Approx", bn: "বাস্তব গ্যাসের আয়তন" },
        formula: "V_real = (n×R×T/P) + n×b",
        tags: ["van der waals", "real gas", "বাস্তব গ্যাস"]
    },
    "compressibility_factor": {
        id: "compressibility_factor", all_variables: ["Z_comp", "P", "V", "n", "R", "T"],
        name: { en: "Compressibility Factor (Z)", bn: "সংকোচনশীলতা গুণাঙ্ক (Z)" },
        formula: "Z_comp = P × V / (n × R × T)",
        tags: ["compressibility", "real gas"]
    },
    "vdw_b": {
        id: "vdw_b", all_variables: ["b_vdw", "V_critical"],
        name: { en: "Van der Waals Constant (b)", bn: "ভ্যান ডার ওয়ালস ধ্রুবক (b)" },
        formula: "b_vdw = V_critical / 3",
        tags: ["van der waals", "constant b"]
    },
    "vdw_a": {
        id: "vdw_a", all_variables: ["a_vdw", "P_critical", "V_critical"],
        name: { en: "Van der Waals Constant (a)", bn: "ভ্যান ডার ওয়ালস ধ্রুবক (a)" },
        formula: "a_vdw = 3 × P_critical × V_critical²",
        tags: ["van der waals", "constant a"]
    },
    "critical_temp": {
        id: "critical_temp", all_variables: ["T_critical", "a_vdw", "R", "b_vdw"],
        name: { en: "Critical Temperature", bn: "ক্রান্তি তাপমাত্রা" },
        formula: "T_critical = 8 × a_vdw / (27 × R × b_vdw)",
        tags: ["critical", "van der waals", "ক্রান্তি"]
    },
    "critical_pressure": {
        id: "critical_pressure", all_variables: ["P_critical", "a_vdw", "b_vdw"],
        name: { en: "Critical Pressure", bn: "ক্রান্তি চাপ" },
        formula: "P_critical = a_vdw / (27 × b_vdw²)",
        tags: ["critical", "pressure", "চাপ"]
    },
    "mean_free_path": {
        id: "mean_free_path", all_variables: ["mean_free_path", "R", "T", "pi", "d_molecule", "N_A", "P"],
        name: { en: "Mean Free Path", bn: "গড় মুক্ত পথ" },
        formula: "mean_free_path = R×T / (√2 × pi × d_molecule² × N_A × P)",
        tags: ["mean free path", "kinetic"]
    },

    // =========================================================
    // THERMOCHEMISTRY & THERMODYNAMICS
    // =========================================================
    "first_law": {
        id: "first_law", all_variables: ["dU", "q", "w"],
        name: { en: "First law of thermodynamics", bn: "তাপগতির প্রথম সূত্র" },
        formula: "dU = q + w",
        tags: ["thermodynamics", "তাপগতি"]
    },
    "work_pv": {
        id: "work_pv", all_variables: ["w", "P", "dV"],
        name: { en: "Work Done (P-V)", bn: "সম্পাদিত কাজ (P-V)" },
        formula: "w = -P × dV",
        tags: ["work", "pressure", "কাজ"]
    },
    "work_rev_iso": {
        id: "work_rev_iso", all_variables: ["w", "n", "R", "T", "V1", "V2"],
        name: { en: "Reversible Isothermal Work", bn: "প্রত্যাবর্তী সমোষ্ণ কাজ" },
        formula: "w = -n × R × T × log(V2 / V1)",
        tags: ["work", "isothermal", "কাজ"]
    },
    "enthalpy_pv": {
        id: "enthalpy_pv", all_variables: ["dH", "dU", "P", "dV"],
        name: { en: "Enthalpy Change (P-V)", bn: "এনথ্যালপি পরিবর্তন (P-V)" },
        formula: "dH = dU + P × dV",
        tags: ["enthalpy", "এনথ্যালপি"]
    },
    "enthalpy_relation": {
        id: "enthalpy_relation", all_variables: ["dH", "dU", "dn_g", "R", "T"],
        name: { en: "Enthalpy Change (Gases)", bn: "গ্যাসের এনথ্যালপি পরিবর্তন" },
        formula: "dH = dU + dn_g × R × T",
        tags: ["enthalpy", "এনথ্যালপি"]
    },
    "heat_const_vol": {
        id: "heat_const_vol", all_variables: ["q_v", "dU"],
        name: { en: "Heat at Constant Volume", bn: "স্থির আয়তনে তাপ" },
        formula: "q_v = dU",
        tags: ["heat", "volume", "তাপ"]
    },
    "heat_const_pres": {
        id: "heat_const_pres", all_variables: ["q_p", "dH"],
        name: { en: "Heat at Constant Pressure", bn: "স্থির চাপে তাপ" },
        formula: "q_p = dH",
        tags: ["heat", "pressure", "তাপ"]
    },
    "heat_capacity_u": {
        id: "heat_capacity_u", all_variables: ["dU", "n", "Cv", "dT"],
        name: { en: "Internal Energy Change (Cv)", bn: "অন্তঃস্থ শক্তি পরিবর্তন (Cv)" },
        formula: "dU = n × Cv × dT",
        tags: ["heat capacity", "Cv"]
    },
    "heat_capacity_h": {
        id: "heat_capacity_h", all_variables: ["dH", "n", "Cp", "dT"],
        name: { en: "Enthalpy Change (Cp)", bn: "এনথ্যালপি পরিবর্তন (Cp)" },
        formula: "dH = n × Cp × dT",
        tags: ["heat capacity", "Cp"]
    },
    "cp_cv": {
        id: "cp_cv", all_variables: ["Cp", "Cv", "R"],
        name: { en: "Cp − Cv = R", bn: "Cp − Cv = R" },
        formula: "Cp - Cv = R",
        tags: ["heat capacity", "mayer"]
    },
    "gamma_ratio": {
        id: "gamma_ratio", all_variables: ["gamma_gas", "Cp", "Cv"],
        name: { en: "Heat Capacity Ratio (Gamma)", bn: "তাপ ধারণ ক্ষমতার অনুপাত" },
        formula: "gamma_gas = Cp / Cv",
        tags: ["gamma", "heat capacity"]
    },
    "specific_heat": {
        id: "specific_heat", all_variables: ["q", "m", "c", "dT"],
        name: { en: "Specific Heat", bn: "আপেক্ষিক তাপ" },
        formula: "q = m × c × dT",
        tags: ["heat", "specific heat", "তাপ"]
    },
    "latent_heat": {
        id: "latent_heat", all_variables: ["q", "m", "L_latent"],
        name: { en: "Latent Heat", bn: "সুপ্ত তাপ" },
        formula: "q = m × L_latent",
        tags: ["latent heat", "সুপ্ত তাপ"]
    },
    "enthalpy_reaction": {
        id: "enthalpy_reaction", all_variables: ["dH_rxn", "sum_dH_prod", "sum_dH_react"],
        name: { en: "Enthalpy of Reaction", bn: "বিক্রিয়া এনথ্যালপি" },
        formula: "dH_rxn = sum_dH_prod - sum_dH_react",
        tags: ["reaction", "enthalpy"]
    },
    "enthalpy_bond_energy": {
        id: "enthalpy_bond_energy", all_variables: ["dH_rxn", "sum_BE_react", "sum_BE_prod"],
        name: { en: "Enthalpy from Bond Energy", bn: "বন্ধন শক্তি থেকে এনথ্যালপি" },
        formula: "dH_rxn = sum_BE_react - sum_BE_prod",
        tags: ["bond energy", "enthalpy"]
    },
    "gibbs": {
        id: "gibbs", all_variables: ["dG", "dH", "T", "dS"],
        name: { en: "Gibbs free energy", bn: "গিবস মুক্ত শক্তি" },
        formula: "dG = dH - T × dS",
        tags: ["gibbs", "free energy", "গিবস"]
    },
    "gibbs_non_standard": {
        id: "gibbs_non_standard", all_variables: ["dG", "dG0", "R", "T", "K"],
        name: { en: "Gibbs Free Energy (Non-Standard)", bn: "গিবস মুক্ত শক্তি (অ-প্রমাণ)" },
        formula: "dG = dG0 + R × T × log(K)",
        tags: ["gibbs", "non-standard"]
    },
    "gibbs_eq": {
        id: "gibbs_eq", all_variables: ["dG0", "R", "T", "K"],
        name: { en: "Standard Gibbs Free Energy", bn: "প্রমাণ গিবস মুক্ত শক্তি" },
        formula: "dG0 = -R × T × log(K)",
        tags: ["gibbs", "equilibrium"]
    },
    "carnot_efficiency": {
        id: "carnot_efficiency", all_variables: ["efficiency", "T1", "T2"],
        name: { en: "Carnot Efficiency", bn: "কার্নো ইঞ্জিনের দক্ষতা" },
        formula: "efficiency = 1 - (T2 / T1)",
        tags: ["carnot", "efficiency", "দক্ষতা"]
    },
    "entropy_change": {
        id: "entropy_change", all_variables: ["dS", "q_rev", "T"],
        name: { en: "Entropy Change", bn: "এনট্রপি পরিবর্তন" },
        formula: "dS = q_rev / T",
        tags: ["entropy", "এনট্রপি"]
    },
    "entropy_isothermal": {
        id: "entropy_isothermal", all_variables: ["dS", "n", "R", "V2", "V1"],
        name: { en: "Entropy Change (Isothermal)", bn: "সমোষ্ণ এনট্রপি পরিবর্তন" },
        formula: "dS = n × R × log(V2 / V1)",
        tags: ["entropy", "isothermal"]
    },
    "entropy_isobaric": {
        id: "entropy_isobaric", all_variables: ["dS", "n", "Cp", "T2", "T1"],
        name: { en: "Entropy Change (Isobaric)", bn: "সমচাপ এনট্রপি পরিবর্তন" },
        formula: "dS = n × Cp × log(T2 / T1)",
        tags: ["entropy", "isobaric"]
    },

    // =========================================================
    // CHEMICAL EQUILIBRIUM
    // =========================================================
    "kp_kc": {
        id: "kp_kc", all_variables: ["Kp", "Kc", "R", "T", "dn_g"],
        name: { en: "Kp and Kc Relation", bn: "Kp এবং Kc এর সম্পর্ক" },
        formula: "Kp = Kc × (R × T)^dn_g",
        tags: ["equilibrium", "kp", "kc"]
    },
    "degree_dissociation_kp": {
        id: "degree_dissociation_kp", all_variables: ["alpha_diss", "Kc", "P"],
        name: { en: "Degree of Dissociation", bn: "বিয়োজন মাত্রা" },
        formula: "alpha_diss = √(Kc / (Kc + P))",
        tags: ["dissociation", "equilibrium"]
    },
    "kw_value": {
        id: "kw_value", all_variables: ["K_w"],
        name: { en: "Ion Product of Water", bn: "পানির আয়নিক গুণফল" },
        formula: "K_w = 1e-14",
        tags: ["water", "kw"]
    },
    "kw_ka_kb": {
        id: "kw_ka_kb", all_variables: ["K_w", "Ka", "Kb"],
        name: { en: "Kw = Ka × Kb", bn: "Kw = Ka × Kb" },
        formula: "K_w = Ka × Kb",
        tags: ["equilibrium", "water"]
    },
    "ph": {
        id: "ph", all_variables: ["pH", "H"],
        name: { en: "pH definition", bn: "pH সংজ্ঞা" },
        formula: "pH = -log10(H)",
        tags: ["ph", "acid", "পিএইচ"]
    },
    "poh": {
        id: "poh", all_variables: ["pOH", "OH"],
        name: { en: "pOH definition", bn: "pOH সংজ্ঞা" },
        formula: "pOH = -log10(OH)",
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
        name: { en: "[H+] from pH", bn: "pH থেকে [H+]" },
        formula: "H = 10^(-pH)",
        tags: ["ph", "hydrogen"]
    },
    "oh_from_poh": {
        id: "oh_from_poh", all_variables: ["OH", "pOH"],
        name: { en: "[OH-] from pOH", bn: "pOH থেকে [OH-]" },
        formula: "OH = 10^(-pOH)",
        tags: ["poh", "hydroxide"]
    },
    "pka": {
        id: "pka", all_variables: ["pKa", "Ka"],
        name: { en: "pKa definition", bn: "pKa সংজ্ঞা" },
        formula: "pKa = -log10(Ka)",
        tags: ["pka", "acid"]
    },
    "pkb": {
        id: "pkb", all_variables: ["pKb", "Kb"],
        name: { en: "pKb definition", bn: "pKb সংজ্ঞা" },
        formula: "pKb = -log10(Kb)",
        tags: ["pkb", "base"]
    },
    "pka_pkb": {
        id: "pka_pkb", all_variables: ["pKa", "pKb"],
        name: { en: "pKa + pKb = 14", bn: "pKa + pKb = 14" },
        formula: "pKa + pKb = 14",
        tags: ["pka", "pkb"]
    },
    "ka_definition": {
        id: "ka_definition", all_variables: ["Ka", "H", "A_ion", "HA"],
        name: { en: "Acid Dissociation Constant", bn: "অ্যাসিড বিয়োজন ধ্রুবক" },
        formula: "Ka = H × A_ion / HA",
        tags: ["ka", "acid"]
    },
    "kb_definition": {
        id: "kb_definition", all_variables: ["Kb", "OH", "BH", "B"],
        name: { en: "Base Dissociation Constant", bn: "ক্ষারক বিয়োজন ধ্রুবক" },
        formula: "Kb = OH × BH / B",
        tags: ["kb", "base"]
    },
    "weak_acid_h": {
        id: "weak_acid_h", all_variables: ["H", "Ka", "C_acid"],
        name: { en: "[H+] weak acid", bn: "দুর্বল অ্যাসিডের [H+]" },
        formula: "H = √(Ka × C_acid)",
        tags: ["weak acid", "equilibrium"]
    },
    "weak_base_oh": {
        id: "weak_base_oh", all_variables: ["OH", "Kb", "C_base"],
        name: { en: "[OH-] weak base", bn: "দুর্বল ক্ষারকের [OH-]" },
        formula: "OH = √(Kb × C_base)",
        tags: ["weak base", "equilibrium"]
    },
    "ph_weak_acid_approx": {
        id: "ph_weak_acid_approx", all_variables: ["pH", "pKa", "C_acid"],
        name: { en: "pH of Weak Acid (Approx)", bn: "দুর্বল অ্যাসিডের pH (আনুমানিক)" },
        formula: "pH = 0.5 × pKa - 0.5 × log10(C_acid)",
        tags: ["ph", "weak acid"]
    },
    "henderson": {
        id: "henderson", all_variables: ["pH", "pKa", "salt", "acid"],
        name: { en: "Henderson–Hasselbalch (Acidic)", bn: "হেন্ডারসন সমীকরণ (অম্লীয়)" },
        formula: "pH = pKa + log10(salt / acid)",
        tags: ["buffer", "henderson", "বাফার"]
    },
    "henderson_base": {
        id: "henderson_base", all_variables: ["pOH", "pKb", "salt", "base"],
        name: { en: "Henderson–Hasselbalch (Basic)", bn: "হেন্ডারসন সমীকরণ (ক্ষারীয়)" },
        formula: "pOH = pKb + log10(salt / base)",
        tags: ["buffer", "base", "বাফার"]
    },
    "ostwald_dilution": {
        id: "ostwald_dilution", all_variables: ["degree_diss", "Ka", "C_acid"],
        name: { en: "Ostwald's Dilution Law", bn: "অসওয়াল্ডের লঘুকরণ সূত্র" },
        formula: "degree_diss = √(Ka / C_acid)",
        tags: ["ostwald", "dilution"]
    },
    "vant_hoff_eq": {
        id: "vant_hoff_eq", all_variables: ["K2", "K1", "dH_rxn", "T2", "T1", "R"],
        name: { en: "Van't Hoff Equation", bn: "ভ্যান্ট হফ সমীকরণ" },
        formula: "log10(K2/K1) = dH_rxn × (T2 - T1) / (2.303 × R × T1 × T2)",
        tags: ["vant hoff", "equilibrium"]
    },
    "ksp_ab": {
        id: "ksp_ab", all_variables: ["Ksp_AB", "S_solubility"],
        name: { en: "Solubility Product (AB type)", bn: "দ্রাব্যতা গুণফল (AB)" },
        formula: "Ksp_AB = S_solubility²",
        tags: ["solubility", "ksp", "দ্রাব্যতা"]
    },
    "ksp_ab2": {
        id: "ksp_ab2", all_variables: ["Ksp_AB2", "S_solubility"],
        name: { en: "Solubility Product (AB2 type)", bn: "দ্রাব্যতা গুণফল (AB2)" },
        formula: "Ksp_AB2 = 4 × S_solubility³",
        tags: ["solubility", "ksp", "দ্রাব্যতা"]
    },
    "hydrolysis_constant": {
        id: "hydrolysis_constant", all_variables: ["Kh_hydrolysis", "K_w", "Ka"],
        name: { en: "Hydrolysis Constant", bn: "আর্দ্রবিশ্লেষণ ধ্রুবক" },
        formula: "Kh_hydrolysis = K_w / Ka",
        tags: ["hydrolysis", "equilibrium", "আর্দ্রবিশ্লেষণ"]
    },

    // =========================================================
    // SOLUTIONS & COLLIGATIVE PROPERTIES
    // =========================================================
    "boiling_elevation": {
        id: "boiling_elevation", all_variables: ["delta_Tb", "Kb_ebull", "m_molality"],
        name: { en: "Elevation of boiling point", bn: "স্ফুটনাঙ্ক বৃদ্ধি" },
        formula: "delta_Tb = Kb_ebull × m_molality",
        tags: ["colligative", "boiling", "স্ফুটনাঙ্ক"]
    },
    "freezing_depression": {
        id: "freezing_depression", all_variables: ["delta_Tf", "Kf_cryo", "m_molality"],
        name: { en: "Depression of freezing point", bn: "হিমাঙ্ক হ্রাস" },
        formula: "delta_Tf = Kf_cryo × m_molality",
        tags: ["colligative", "freezing", "হিমাঙ্ক"]
    },
    "solution_boiling_point": {
        id: "solution_boiling_point", all_variables: ["Tb", "Tb0", "delta_Tb"],
        name: { en: "Boiling Point of Solution", bn: "দ্রবণের স্ফুটনাঙ্ক" },
        formula: "Tb = Tb0 + delta_Tb",
        tags: ["boiling point", "solution"]
    },
    "solution_freezing_point": {
        id: "solution_freezing_point", all_variables: ["Tf", "Tf0", "delta_Tf"],
        name: { en: "Freezing Point of Solution", bn: "দ্রবণের হিমাঙ্ক" },
        formula: "Tf = Tf0 - delta_Tf",
        tags: ["freezing point", "solution"]
    },
    "osmotic": {
        id: "osmotic", all_variables: ["pi_osm", "C_molar", "R", "T"],
        name: { en: "Osmotic pressure", bn: "অভিস্রবণ চাপ" },
        formula: "pi_osm = C_molar × R × T",
        tags: ["osmotic", "colligative", "অভিস্রবণ"]
    },
    "raoult": {
        id: "raoult", all_variables: ["P_sol", "mole_frac_solv", "P0"],
        name: { en: "Raoult's law", bn: "রাউল্টের সূত্র" },
        formula: "P_sol = mole_frac_solv × P0",
        tags: ["raoult", "vapour", "রাউল্ট"]
    },
    "relative_lowering_vp": {
        id: "relative_lowering_vp", all_variables: ["delta_P", "mole_frac_solute", "P0"],
        name: { en: "Lowering of Vapor Pressure", bn: "বাষ্পচাপের অবনমন" },
        formula: "delta_P = mole_frac_solute × P0",
        tags: ["vapor pressure", "lowering"]
    },
    "total_vapor_pressure": {
        id: "total_vapor_pressure", all_variables: ["P_total", "P_A", "P_B"],
        name: { en: "Total Vapor Pressure", bn: "মোট বাষ্পচাপ" },
        formula: "P_total = P_A + P_B",
        tags: ["vapor pressure", "total"]
    },
    "rlvp_moles": {
        id: "rlvp_moles", all_variables: ["relative_lowering", "n_solute", "n_solvent"],
        name: { en: "Relative Lowering (Moles)", bn: "বাষ্পচাপের আপেক্ষিক অবনমন" },
        formula: "relative_lowering = n_solute / (n_solute + n_solvent)",
        tags: ["rlvp", "moles"]
    },
    "vanthoff_factor": {
        id: "vanthoff_factor", all_variables: ["i_vanthoff", "observed", "normal"],
        name: { en: "Van't Hoff Factor", bn: "ভ্যান্ট হফ ফ্যাক্টর" },
        formula: "i_vanthoff = observed / normal",
        tags: ["vanthoff", "colligative", "ভ্যান্ট হফ"]
    },
    "boiling_elevation_vanthoff": {
        id: "boiling_elevation_vanthoff", all_variables: ["delta_Tb", "i_vanthoff", "Kb_ebull", "m_molality"],
        name: { en: "Elevation of B.P. (Van't Hoff)", bn: "স্ফুটনাঙ্ক বৃদ্ধি (ভ্যান্ট হফ)" },
        formula: "delta_Tb = i_vanthoff × Kb_ebull × m_molality",
        tags: ["boiling", "vanthoff"]
    },
    "freezing_depression_vanthoff": {
        id: "freezing_depression_vanthoff", all_variables: ["delta_Tf", "i_vanthoff", "Kf_cryo", "m_molality"],
        name: { en: "Depression of F.P. (Van't Hoff)", bn: "হিমাঙ্ক হ্রাস (ভ্যান্ট হফ)" },
        formula: "delta_Tf = i_vanthoff × Kf_cryo × m_molality",
        tags: ["freezing", "vanthoff"]
    },
    "osmotic_vanthoff": {
        id: "osmotic_vanthoff", all_variables: ["pi_osm", "i_vanthoff", "C_molar", "R", "T"],
        name: { en: "Osmotic Pressure (Van't Hoff)", bn: "অভিস্রবণ চাপ (ভ্যান্ট হফ)" },
        formula: "pi_osm = i_vanthoff × C_molar × R × T",
        tags: ["osmotic", "vanthoff"]
    },
    "molar_mass_cryo": {
        id: "molar_mass_cryo", all_variables: ["M", "Kf_cryo", "mass_solute", "delta_Tf", "mass_solvent_g"],
        name: { en: "Molar Mass from Freezing Dep.", bn: "হিমাঙ্ক হ্রাস থেকে আণবিক ভর" },
        formula: "M = Kf_cryo × mass_solute × 1000 / (delta_Tf × mass_solvent_g)",
        tags: ["molar mass", "cryoscopy"]
    },
    "molar_mass_ebull": {
        id: "molar_mass_ebull", all_variables: ["M", "Kb_ebull", "mass_solute", "delta_Tb", "mass_solvent_g"],
        name: { en: "Molar Mass from Boiling Elev.", bn: "স্ফুটনাঙ্ক বৃদ্ধি থেকে আণবিক ভর" },
        formula: "M = Kb_ebull × mass_solute × 1000 / (delta_Tb × mass_solvent_g)",
        tags: ["molar mass", "ebullioscopy"]
    },
    "henry_law": {
        id: "henry_law", all_variables: ["P_gas", "K_henry", "mole_frac_gas"],
        name: { en: "Henry's Law", bn: "হেনরীর সূত্র" },
        formula: "P_gas = K_henry × mole_frac_gas",
        tags: ["henry", "gas solubility", "হেনরী"]
    },
    "vanthoff_dissociation": {
        id: "vanthoff_dissociation", all_variables: ["i_vanthoff", "n_particles", "alpha_diss"],
        name: { en: "Van't Hoff (Dissociation)", bn: "ভ্যান্ট হফ (বিয়োজন)" },
        formula: "i_vanthoff = 1 + (n_particles - 1) × alpha_diss",
        tags: ["vanthoff", "dissociation"]
    },

    // =========================================================
    // ELECTROCHEMISTRY
    // =========================================================
    "cell_potential": {
        id: "cell_potential", all_variables: ["E_cell", "E_cathode", "E_anode"],
        name: { en: "Cell potential", bn: "কোষ বিভব" },
        formula: "E_cell = E_cathode - E_anode",
        tags: ["electrochemistry", "cell", "কোষ"]
    },
    "nernst": {
        id: "nernst", all_variables: ["E_cell", "E0_cell", "n_e", "Q"],
        name: { en: "Nernst equation (25°C)", bn: "নার্নস্ট সমীকরণ (25°C)" },
        formula: "E_cell = E0_cell - (0.0591 / n_e) × log10(Q)",
        tags: ["nernst", "electrochemistry", "নার্নস্ট"]
    },
    "std_cell_potential": {
        id: "std_cell_potential", all_variables: ["E0_cell", "E0_cathode", "E0_anode"],
        name: { en: "Standard Cell Potential", bn: "প্রমাণ কোষ বিভব" },
        formula: "E0_cell = E0_cathode - E0_anode",
        tags: ["standard cell", "potential"]
    },
    "gibbs_electro": {
        id: "gibbs_electro", all_variables: ["dG", "n_e", "F", "E_cell"],
        name: { en: "Gibbs Energy (Electrochemistry)", bn: "গিবস শক্তি (তড়িৎ রসায়ন)" },
        formula: "dG = -n_e × F × E_cell",
        tags: ["gibbs", "faraday"]
    },
    "std_gibbs_electro": {
        id: "std_gibbs_electro", all_variables: ["dG0", "n_e", "F", "E0_cell"],
        name: { en: "Standard Gibbs Energy (Cell)", bn: "প্রমাণ গিবস শক্তি (কোষ)" },
        formula: "dG0 = -n_e × F × E0_cell",
        tags: ["standard gibbs", "cell"]
    },
    "eq_constant_electro": {
        id: "eq_constant_electro", all_variables: ["K", "n_e", "E0_cell"],
        name: { en: "Eq. Constant from Cell Potential", bn: "কোষ বিভব থেকে সাম্য ধ্রুবক" },
        formula: "log10(K) = n_e × E0_cell / 0.0591",
        tags: ["equilibrium constant", "cell"]
    },
    "faraday_eq_mass": {
        id: "faraday_eq_mass", all_variables: ["m_deposited", "E_eq", "I", "t", "F"],
        name: { en: "Faraday's Law (Eq. Mass)", bn: "ফ্যারাডের সূত্র (তুল্যাঙ্ক ভর)" },
        formula: "m_deposited = E_eq × I × t / F",
        tags: ["faraday", "equivalent mass"]
    },
    "faraday_mass": {
        id: "faraday_mass", all_variables: ["m_deposited", "M", "I", "t", "n_e", "F"],
        name: { en: "Faraday's first law (mass)", bn: "ফ্যারাডের প্রথম সূত্র" },
        formula: "m_deposited = M × I × t / (n_e × F)",
        tags: ["faraday", "electrolysis", "ফ্যারাডে"]
    },
    "faraday_second_law": {
        id: "faraday_second_law", all_variables: ["m1", "m2", "E_eq1", "E_eq2"],
        name: { en: "Faraday's Second Law", bn: "ফ্যারাডের দ্বিতীয় সূত্র" },
        formula: "m1 / m2 = E_eq1 / E_eq2",
        tags: ["faraday", "second law"]
    },
    "current_charge": {
        id: "current_charge", all_variables: ["I", "q", "t"],
        name: { en: "Current from Charge", bn: "চার্জ থেকে বিদ্যুৎ প্রবাহ" },
        formula: "I = q / t",
        tags: ["current", "charge"]
    },
    "charge_moles_electrons": {
        id: "charge_moles_electrons", all_variables: ["q", "n_e", "F", "n"],
        name: { en: "Total Charge (Moles of Electrons)", bn: "মোট চার্জ (ইলেকট্রনের মোল)" },
        formula: "q = n_e × F × n",
        tags: ["charge", "electrons"]
    },
    "specific_conductance": {
        id: "specific_conductance", all_variables: ["kappa", "rho"],
        name: { en: "Specific Conductance", bn: "আপেক্ষিক পরিবাহিতা" },
        formula: "kappa = 1 / rho",
        tags: ["conductance", "specific"]
    },
    "conductivity": {
        id: "conductivity", all_variables: ["G_molar", "kappa", "C_molar"],
        name: { en: "Molar conductivity", bn: "মোলার পরিবাহিতা" },
        formula: "G_molar = kappa × 1000 / C_molar",
        tags: ["conductivity", "পরিবাহিতা"]
    },
    "eq_conductivity": {
        id: "eq_conductivity", all_variables: ["G_eq", "kappa", "normality"],
        name: { en: "Equivalent Conductivity", bn: "তুল্যাঙ্ক পরিবাহিতা" },
        formula: "G_eq = kappa × 1000 / normality",
        tags: ["equivalent", "conductivity"]
    },
    "degree_dissociation_cond": {
        id: "degree_dissociation_cond", all_variables: ["alpha_cond", "G_molar", "G_molar_inf"],
        name: { en: "Degree of Dissociation (Cond.)", bn: "বিয়োজন মাত্রা (পরিবাহিতা)" },
        formula: "alpha_cond = G_molar / G_molar_inf",
        tags: ["dissociation", "conductivity"]
    },
    "ostwald_cond": {
        id: "ostwald_cond", all_variables: ["Ka", "C_molar", "alpha_cond"],
        name: { en: "Acid Constant (Conductivity)", bn: "অ্যাসিড ধ্রুবক (পরিবাহিতা)" },
        formula: "Ka = C_molar × alpha_cond² / (1 - alpha_cond)",
        tags: ["acid constant", "conductivity"]
    },
     "cell_constant": {
        id: "cell_constant", all_variables: ["cell_constant", "L_len", "A"],
        name: { en: "Cell Constant", bn: "কোষ ধ্রুবক" },
        formula: "cell_constant = L_len / A",
        tags: ["cell constant", "electrochemistry"]
    },
    "conductivity_cell_const": {
        id: "conductivity_cell_const", all_variables: ["kappa", "G_conductance", "cell_constant"],
        name: { en: "Conductivity with Cell Constant", bn: "কোষ ধ্রুবক সহ পরিবাহিতা" },
        formula: "kappa = G_conductance × cell_constant",
        tags: ["conductivity", "cell constant"]
    },
    "kohlrausch_law": {
        id: "kohlrausch_law", all_variables: ["lambda_m_inf", "lambda_cation_inf", "lambda_anion_inf"],
        name: { en: "Kohlrausch's Law", bn: "কোলরাউশের সূত্র" },
        formula: "lambda_m_inf = lambda_cation_inf + lambda_anion_inf",
        tags: ["kohlrausch", "conductivity", "কোলরাউশ"]
    },

    // =========================================================
    // CHEMICAL KINETICS
    // =========================================================
    "rate_1st_order": {
        id: "rate_1st_order", all_variables: ["rate", "k_rate", "C_A"],
        name: { en: "Rate of Reaction (1st Order)", bn: "বিক্রিয়ার হার (১ম ক্রম)" },
        formula: "rate = k_rate × C_A",
        tags: ["rate", "first order"]
    },
    "rate_2nd_order": {
        id: "rate_2nd_order", all_variables: ["rate", "k_rate", "C_A", "C_B"],
        name: { en: "Rate of Reaction (2nd Order)", bn: "বিক্রিয়ার হার (২য় ক্রম)" },
        formula: "rate = k_rate × C_A × C_B",
        tags: ["rate", "second order"]
    },
    "first_order_k": {
        id: "first_order_k", all_variables: ["k_rate", "C0", "C", "t"],
        name: { en: "First-order rate constant", bn: "প্রথম ক্রমের হার ধ্রুবক" },
        formula: "k_rate = 2.303 × log10(C0 / C) / t",
        tags: ["kinetics", "rate", "বিক্রিয়ার হার"]
    },
    "half_life_1st": {
        id: "half_life_1st", all_variables: ["t_half", "k_rate"],
        name: { en: "Half-life (1st order)", bn: "অর্ধায়ু (প্রথম ক্রম)" },
        formula: "t_half = 0.693 / k_rate",
        tags: ["kinetics", "half-life", "অর্ধায়ু"]
    },
    "half_life_2nd": {
        id: "half_life_2nd", all_variables: ["t_half", "k_rate", "C0"],
        name: { en: "Half-life (2nd order)", bn: "অর্ধায়ু (দ্বিতীয় ক্রম)" },
        formula: "t_half = 1 / (k_rate × C0)",
        tags: ["kinetics", "half-life"]
    },
    "half_life_zero": {
        id: "half_life_zero", all_variables: ["t_half", "C0", "k_rate"],
        name: { en: "Half-life (Zero order)", bn: "অর্ধায়ু (শূন্য ক্রম)" },
        formula: "t_half = C0 / (2 × k_rate)",
        tags: ["kinetics", "zero order"]
    },
    "integrated_rate_1st_exp": {
        id: "integrated_rate_1st_exp", all_variables: ["C", "C0", "k_rate", "t"],
        name: { en: "Integrated Rate (1st Order Exp)", bn: "সমন্বিত হার (১ম ক্রম সূচকীয়)" },
        formula: "C = C0 × exp(-k_rate × t)",
        tags: ["integrated rate", "exponential"]
    },
    "integrated_rate_2nd": {
        id: "integrated_rate_2nd", all_variables: ["C", "C0", "k_rate", "t"],
        name: { en: "Integrated Rate (2nd Order)", bn: "সমন্বিত হার (২য় ক্রম)" },
        formula: "C = C0 / (1 + k_rate × C0 × t)",
        tags: ["integrated rate", "second order"]
    },
    "arrhenius_eq": {
        id: "arrhenius_eq", all_variables: ["k_rate", "A_factor", "Ea", "R", "T"],
        name: { en: "Arrhenius Equation", bn: "অ্যারেনিয়াস সমীকরণ" },
        formula: "k_rate = A_factor × exp(-Ea / (R × T))",
        tags: ["arrhenius", "kinetics"]
    },
    "arrhenius": {
        id: "arrhenius", all_variables: ["k2", "k1", "Ea", "T1", "T2", "R"],
        name: { en: "Arrhenius (two temperatures)", bn: "অ্যারেনিয়াস (দুই তাপমাত্রা)" },
        formula: "log10(k2/k1) = Ea × (T2 - T1) / (2.303 × R × T1 × T2)",
        tags: ["arrhenius", "activation", "অ্যারেনিয়াস"]
    },
    "reaction_order_det": {
        id: "reaction_order_det", all_variables: ["order_rxn", "rate2", "rate1", "C2", "C1"],
        name: { en: "Reaction Order Determination", bn: "বিক্রিয়ার ক্রম নির্ণয়" },
        formula: "order_rxn = log(rate2 / rate1) / log(C2 / C1)",
        tags: ["reaction order", "kinetics"]
    },
    "integrated_rate_zero": {
        id: "integrated_rate_zero", all_variables: ["C", "C0", "k_rate", "t"],
        name: { en: "Integrated Rate (Zero Order)", bn: "সমন্বিত হার (শূন্য ক্রম)" },
        formula: "C = C0 - k_rate × t",
        tags: ["integrated rate", "zero order"]
    },
    "zero_order_k": {
        id: "zero_order_k", all_variables: ["k_rate", "C0", "C", "t"],
        name: { en: "Zero-order Rate Constant", bn: "শূন্য ক্রমের হার ধ্রুবক" },
        formula: "k_rate = (C0 - C) / t",
        tags: ["rate constant", "zero order"]
    },
    "second_order_k": {
        id: "second_order_k", all_variables: ["k_rate", "t", "C", "C0"],
        name: { en: "Second-order Rate Constant", bn: "দ্বিতীয় ক্রমের হার ধ্রুবক" },
        formula: "k_rate = (1 / t) × (1 / C - 1 / C0)",
        tags: ["rate constant", "second order"]
    },
    "collision_theory": {
        id: "collision_theory", all_variables: ["k_rate", "P_factor", "Z_collision", "Ea", "R", "T"],
        name: { en: "Collision Theory Rate", bn: "সংঘর্ষ তত্ত্ব অনুযায়ী হার" },
        formula: "k_rate = P_factor × Z_collision × exp(-Ea / (R × T))",
        tags: ["collision theory", "kinetics"]
    },

    // =========================================================
    // SURFACE CHEMISTRY & MISC
    // =========================================================
    "freundlich_ads": {
        id: "freundlich_ads", all_variables: ["x_ads", "m_ads", "k_freundlich", "P", "n_ads"],
        name: { en: "Freundlich Adsorption Isotherm", bn: "ফ্রয়েন্ডলিচ অধিশোষণ সমতাপীয়" },
        formula: "x_ads / m_ads = k_freundlich × P^(1/n_ads)",
        tags: ["adsorption", "surface", "অধিশোষণ"]
    },
    "freundlich_log": {
        id: "freundlich_log", all_variables: ["x_ads", "m_ads", "k_freundlich", "n_ads", "P"],
        name: { en: "Freundlich Isotherm (Log form)", bn: "ফ্রয়েন্ডলিচ আইসোথার্ম (লগ আকার)" },
        formula: "log(x_ads / m_ads) = log(k_freundlich) + (1 / n_ads) × log(P)",
        tags: ["adsorption", "logarithmic"]
    },
    "langmuir_isotherm": {
        id: "langmuir_isotherm", all_variables: ["theta_cov", "K_ads", "P"],
        name: { en: "Langmuir Adsorption Isotherm", bn: "ল্যাংমুইর অধিশোষণ সমতাপীয়" },
        formula: "theta_cov = K_ads × P / (1 + K_ads × P)",
        tags: ["langmuir", "adsorption"]
    },
    "catalyst_rate": {
        id: "catalyst_rate", all_variables: ["rate_cat", "k_cat", "theta_cov"],
        name: { en: "Catalytic Rate", bn: "প্রভাবকীয় বিক্রিয়ার হার" },
        formula: "rate_cat = k_cat × theta_cov",
        tags: ["catalyst", "rate"]
    },
// =========================================================
    // REDOX & EQUIVALENT CONCEPT
    // =========================================================
    "eq_weight": {
        id: "eq_weight", all_variables: ["eq_wt", "M", "n_factor"],
        name: { en: "Equivalent weight", bn: "তুল্যাঙ্ক ভর" },
        formula: "eq_wt = M / n_factor",
        tags: ["equivalent", "redox", "তুল্যাঙ্ক"]
    },
    "n_factor_redox": {
        id: "n_factor_redox", all_variables: ["n_factor", "change_ox"],
        name: { en: "n-factor (Redox)", bn: "n-ফ্যাক্টর (জারণ-বিজারণ)" },
        formula: "n_factor = change_ox",
        tags: ["n-factor", "oxidation state"]
    },
    "normality_molarity": {
        id: "normality_molarity", all_variables: ["normality", "Mol", "n_factor"],
        name: { en: "N = M × n-factor", bn: "N = M × n-factor" },
        formula: "normality = Mol × n_factor",
        tags: ["normality", "molarity"]
    },
    "milli_equivalents": {
        id: "milli_equivalents", all_variables: ["meq", "N", "V"],
        name: { en: "Milli-equivalents", bn: "মিলি-তুল্যাঙ্ক" },
        formula: "meq = N × V",
        tags: ["milli-equivalents", "titration"]
    },
    "law_of_equivalence": {
        id: "law_of_equivalence", all_variables: ["meq1", "meq2"],
        name: { en: "Law of Equivalence", bn: "তুল্যাঙ্ক সূত্র" },
        formula: "meq1 = meq2",
        tags: ["equivalence", "titration"]
    },
    "eq_wt_oxidant": {
        id: "eq_wt_oxidant", all_variables: ["eq_wt_ox", "M", "electrons_lost"],
        name: { en: "Equivalent Wt. of Oxidant", bn: "জারকের তুল্যাঙ্ক ভর" },
        formula: "eq_wt_ox = M / electrons_lost",
        tags: ["oxidant", "equivalent weight"]
    },
    "eq_wt_reductant": {
        id: "eq_wt_reductant", all_variables: ["eq_wt_red", "M", "electrons_gained"],
        name: { en: "Equivalent Wt. of Reductant", bn: "বিজারকের তুল্যাঙ্ক ভর" },
        formula: "eq_wt_red = M / electrons_gained",
        tags: ["reductant", "equivalent weight"]
    }
};