CHEMISTRY_FORMULAS = [

    # =========================================================
    # MOLE CONCEPT & STOICHIOMETRY
    # =========================================================
    "n = mass/M",
    "mass = n*M",
    "M = mass/n",
    "n = N_particles/N_A",
    "N_particles = n*N_A",
    "n = V_STP/22.4",
    "V_STP = n*22.4",
    "Mol = n/V",
    "n = Mol*V",
    "m_molality = n/mass_solvent_kg",
    "n = m_molality*mass_solvent_kg",
    "mole_frac = n_solute/(n_solute + n_solvent)",
    "percent_mass = mass_solute*100/mass_solution",
    "percent_vol = V_solute*100/V_solution",
    "ppm = mass_solute*1000000/mass_solution",
    "normality = n_eq/V",
    "n_eq = mass/eq_wt",
    "eq_wt = M/n_factor",
    "Mol1*V1 = Mol2*V2",
    "N1*V1 = N2*V2",
    "percent_yield = actual_yield*100/theoretical_yield",
    "density = mass/V",
    "M = density*V*1000/n",

    # =========================================================
    # ATOMIC STRUCTURE
    # =========================================================
    "E_photon = h*f",
    "E_photon = h*c/lambda_w",
    "lambda_w = h*c/E_photon",
    "f = c/lambda_w",
    "KE_max = h*f - phi_work",
    "lambda_debroglie = h/(m*v)",
    "lambda_debroglie = h/p",
    "E_n = -1312*Z**2/n**2",
    "delta_E = E_n2 - E_n1",
    "1/lambda_w = R_H*(1/n1**2 - 1/n2**2)",
    "r_n = 52.9*n**2/Z",
    "v_e = 2.18e6*Z/n",
    "uncert_x*uncert_p = h/(4*pi)",

    # =========================================================
    # GASEOUS STATE
    # =========================================================
    "P*V = n*R*T",
    "P*V = n*0.0821*T",
    "P1*V1 = P2*V2",
    "V1/T1 = V2/T2",
    "P1/T1 = P2/T2",
    "P1*V1/T1 = P2*V2/T2",
    "n = P*V/(R*T)",
    "density = P*M/(R*T)",
    "M = density*R*T/P",
    "rms = sqrt(3*R*T/M)",
    "rms = sqrt(3*P/density)",
    "v_avg = sqrt(8*R*T/(pi*M))",
    "v_mp = sqrt(2*R*T/M)",
    "KE_avg = 3*R*T/2",
    "KE_total = 3*n*R*T/2",
    "rate1/rate2 = sqrt(M2/M1)",
    "rate1/rate2 = sqrt(d2/d1)",
    "t1/t2 = sqrt(M1/M2)",
    "P_total = P1 + P2",
    "P1 = mole_frac*P_total",
    "V_real = n*R*T/P + n*b",
    "Z_comp = P*V/(n*R*T)",

    # =========================================================
    # THERMOCHEMISTRY & THERMODYNAMICS
    # =========================================================
    "dU = q + w",
    "w = -P*dV",
    "w = -n*R*T*log(V2/V1)",
    "dH = dU + P*dV",
    "dH = dU + dn_g*R*T",
    "dH = dU + dn_g*0.0821*T",
    "q_v = dU",
    "q_p = dH",
    "dU = n*Cv*dT",
    "dH = n*Cp*dT",
    "Cp - Cv = R",
    "Cp - Cv = 2",
    "gamma_gas = Cp/Cv",
    "q = m*c*dT",
    "q = m*L_latent",
    "dH_rxn = sum_dH_prod - sum_dH_react",
    "dH_rxn = sum_BE_react - sum_BE_prod",
    "dG = dH - T*dS",
    "dG = dG0 + R*T*log(K)",
    "dG0 = -R*T*log(K)",
    "dG0 = -2.303*R*T*log10(K)",
    "K = exp(-dG0/(R*T))",
    "efficiency = 1 - T2/T1",

    # =========================================================
    # CHEMICAL EQUILIBRIUM
    # =========================================================
    "Kc = Kp/(R*T)**dn_g",
    "Kp = Kc*(R*T)**dn_g",
    "Kp = Kc*(0.0821*T)**dn_g",
    "alpha_diss = sqrt(Kc/(Kc + P))",
    "K_w = 1e-14",
    "K_w = Ka*Kb",
    "pH = -log10(H)",
    "pOH = -log10(OH)",
    "pH + pOH = 14",
    "H = 10**(-pH)",
    "OH = 10**(-pOH)",
    "pKa = -log10(Ka)",
    "pKb = -log10(Kb)",
    "pKa + pKb = 14",
    "Ka = H*A_ion/HA",
    "Kb = OH*BH/B",
    "H = sqrt(Ka*C_acid)",
    "OH = sqrt(Kb*C_base)",
    "pH = 0.5*pKa - 0.5*log10(C_acid)",
    "pH = pKa + log10(salt/acid)",
    "pOH = pKb + log10(salt/base)",
    "H = Ka*HA/A_ion",
    "degree_diss = sqrt(Ka/C_acid)",
    "buffer_pH = pKa + log10(salt/acid)",

    # =========================================================
    # SOLUTIONS & COLLIGATIVE PROPERTIES
    # =========================================================
    "delta_Tb = Kb_ebull*m_molality",
    "delta_Tf = Kf_cryo*m_molality",
    "Tb = Tb0 + delta_Tb",
    "Tf = Tf0 - delta_Tf",
    "pi_osm = C_molar*R*T",
    "pi_osm = n*R*T/V",
    "P_sol = mole_frac_solv*P0",
    "delta_P = mole_frac_solute*P0",
    "P_total = P_A + P_B",
    "P_A = mole_frac_A*P0_A",
    "P_B = mole_frac_B*P0_B",
    "relative_lowering = n_solute/(n_solute + n_solvent)",
    "i_vanthoff = observed/normal",
    "delta_Tb = i_vanthoff*Kb_ebull*m_molality",
    "delta_Tf = i_vanthoff*Kf_cryo*m_molality",
    "pi_osm = i_vanthoff*C_molar*R*T",
    "M = Kf_cryo*mass_solute*1000/(delta_Tf*mass_solvent_g)",
    "M = Kb_ebull*mass_solute*1000/(delta_Tb*mass_solvent_g)",

    # =========================================================
    # ELECTROCHEMISTRY
    # =========================================================
    "E_cell = E_cathode - E_anode",
    "E_cell = E0_cell - (0.0591/n_e)*log10(Q)",
    "E_cell = E0_cell - (R*T/(n_e*F))*log(Q)",
    "E0_cell = E0_cathode - E0_anode",
    "dG = -n_e*F*E_cell",
    "dG0 = -n_e*F*E0_cell",
    "log10(K) = n_e*E0_cell/0.0591",
    "K = 10**(n_e*E0_cell/0.0591)",
    "m_deposited = E_eq*I*t/F",
    "m_deposited = M*I*t/(n_e*F)",
    "eq_wt = M/n_e",
    "m1/m2 = E_eq1/E_eq2",
    "m1/E_eq1 = m2/E_eq2",
    "I = q/t",
    "q = I*t",
    "q = n_e*F*n",
    "kappa = 1/rho",
    "G_molar = kappa*1000/C_molar",
    "G_eq = kappa*1000/normality",
    "alpha_cond = G_molar/G_molar_inf",
    "Ka = C_molar*alpha_cond**2/(1 - alpha_cond)",

    # =========================================================
    # CHEMICAL KINETICS
    # =========================================================
    "rate = k_rate*C_A",
    "rate = k_rate*C_A*C_B",
    "rate = k_rate*C_A**2",
    "k_rate = 2.303*log10(C0/C)/t",
    "k_rate = log(C0/C)/t",
    "t_half = 0.693/k_rate",
    "t_half = 1/(k_rate*C0)",
    "t_half = C0/(2*k_rate)",
    "C = C0*exp(-k_rate*t)",
    "C = C0/(1 + k_rate*C0*t)",
    "k_rate = A_factor*exp(-Ea/(R*T))",
    "log10(k2/k1) = Ea*(T2 - T1)/(2.303*R*T1*T2)",
    "log(k2/k1) = Ea*(T2 - T1)/(R*T1*T2)",
    "order_rxn = log(rate2/rate1)/log(C2/C1)",

    # =========================================================
    # SURFACE CHEMISTRY & MISC
    # =========================================================
    "x_ads/m_ads = k_freundlich*P**(1/n_ads)",
    "log(x_ads/m_ads) = log(k_freundlich) + (1/n_ads)*log(P)",
    "theta_cov = K_ads*P/(1 + K_ads*P)",

    # =========================================================
    # REDOX & EQUIVALENT CONCEPT
    # =========================================================
    "eq_wt = M/n_factor",
    "n_factor = change_ox",
    "normality = Mol*n_factor",
    "Mol = normality/n_factor",
    "meq = N*V",
    "meq1 = meq2",
]
