PHYSICS_FORMULAS = [

    # =========================================================
    # MECHANICS — Kinematics
    # =========================================================
    "v = u + a*t",
    "s = u*t + a*t**2/2",
    "v**2 = u**2 + 2*a*s",
    "s = (u + v)*t/2",
    "s = v*t - a*t**2/2",
    "avg_v = total_s/total_t",
    "avg_a = (v - u)/t",

    # =========================================================
    # MECHANICS — Newton's laws & force
    # =========================================================
    "F = m*a",
    "W_weight = m*g",
    "p = m*v",
    "impulse = F*t",
    "impulse = m*v - m*u",
    "F_net = m*a",
    "F_friction = mu*N",
    "N = m*g",
    "F_friction = mu*m*g",
    "a = g*sin_theta",

    # =========================================================
    # MECHANICS — Work, Energy, Power
    # =========================================================
    "W = F*s",
    "W = F*s*cos_theta",
    "KE = m*v**2/2",
    "PE = m*g*h",
    "PE_spring = k*x**2/2",
    "E_total = KE + PE",
    "W = KE_final - KE_initial",
    "P_power = W/t",
    "P_power = F*v",
    "efficiency = useful_work/total_work",

    # =========================================================
    # MECHANICS — Momentum & collisions
    # =========================================================
    "p = m*v",
    "m1*u1 + m2*u2 = m1*v1 + m2*v2",
    "e = (v2 - v1)/(u1 - u2)",
    "KE_loss = m*u**2/2 - m*v**2/2",

    # =========================================================
    # MECHANICS — Circular motion
    # =========================================================
    "v = r*omega",
    "omega = 2*pi/T",
    "omega = 2*pi*f",
    "a_c = v**2/r",
    "a_c = omega**2*r",
    "F_c = m*v**2/r",
    "F_c = m*omega**2*r",
    "T = 2*pi*sqrt(r/g)",
    "v = sqrt(g*r)",
    "v = sqrt(G*M/r)",

    # =========================================================
    # MECHANICS — Gravitation
    # =========================================================
    "F = G*m1*m2/r**2",
    "g = G*M/R**2",
    "g_h = g*(1 - 2*h/R)",
    "g_d = g*(1 - d/R)",
    "PE_grav = -G*M*m/r",
    "escape_v = sqrt(2*G*M/R)",
    "orbital_v = sqrt(G*M/r)",
    "T**2 = 4*pi**2*r**3/(G*M)",
    "I = m*r**2",

    # =========================================================
    # MECHANICS — Rotational motion
    # =========================================================
    "tau = F*r",
    "tau = I*alpha",
    "L = I*omega",
    "KE_rot = I*omega**2/2",
    "omega = omega0 + alpha*t",
    "theta = omega0*t + alpha*t**2/2",
    "omega**2 = omega0**2 + 2*alpha*theta",
    "I_rod_cm = m*L**2/12",
    "I_disc = m*R**2/2",
    "I_ring = m*R**2",
    "I_solid_sphere = 2*m*R**2/5",
    "I_hollow_sphere = 2*m*R**2/3",

    # =========================================================
    # MECHANICS — Simple Harmonic Motion
    # =========================================================
    "T = 2*pi*sqrt(m/k)",
    "T = 2*pi*sqrt(L/g)",
    "omega = sqrt(k/m)",
    "omega = sqrt(g/L)",
    "a = -omega**2*x",
    "v = omega*sqrt(A**2 - x**2)",
    "v_max = omega*A",
    "a_max = omega**2*A",
    "E_shm = k*A**2/2",
    "E_shm = m*omega**2*A**2/2",
    "KE_shm = m*omega**2*(A**2 - x**2)/2",
    "PE_shm = m*omega**2*x**2/2",
    "x = A*sin(omega*t)",
    "x = A*cos(omega*t)",

    # =========================================================
    # MECHANICS — Waves
    # =========================================================
    "v = f*lambda_w",
    "v = sqrt(T_tension/mu_linear)",
    "v = sqrt(Y/rho)",
    "v = sqrt(B/rho)",
    "f = 1/T",
    "k_wave = 2*pi/lambda_w",
    "omega = 2*pi*f",
    "y = A*sin(k_wave*x - omega*t)",
    "beat_f = f1 - f2",
    "f_open = n*v/(2*L)",
    "f_closed = (2*n - 1)*v/(4*L)",
    "I_intensity = P_power/(4*pi*r**2)",
    "I_intensity = 2*pi**2*f**2*A**2*v*rho",

    # =========================================================
    # MECHANICS — Elasticity & fluids
    # =========================================================
    "stress = F/A",
    "strain = delta_L/L",
    "Y = stress/strain",
    "Y = F*L/(A*delta_L)",
    "B_mod = -P*V/delta_V",
    "eta = F*d/(A*v)",
    "P = F/A",
    "P = rho*g*h",
    "P = P0 + rho*g*h",
    "F_b = V*rho*g",
    "Q_flow = A*v",
    "A1*v1 = A2*v2",
    "v = sqrt(2*g*h)",
    "Re = rho*v*d/eta",

    # =========================================================
    # THERMAL PHYSICS
    # =========================================================
    "Q = m*c*dT",
    "Q = m*L_latent",
    "dL = L*alpha*dT",
    "dA = A*2*alpha*dT",
    "dV = V*gamma_exp*dT",
    "gamma_exp = 3*alpha",
    "PV = n*R*T",
    "P1*V1/T1 = P2*V2/T2",
    "P1*V1 = P2*V2",
    "V1/T1 = V2/T2",
    "P1/T1 = P2/T2",
    "dU = n*Cv*dT",
    "dH = n*Cp*dT",
    "Cp - Cv = R",
    "gamma_gas = Cp/Cv",
    "W_gas = P*dV",
    "W_gas = n*R*T*log(V2/V1)",
    "dQ = dU + W_gas",
    "efficiency_carnot = 1 - T2/T1",
    "efficiency_carnot = (T1 - T2)/T1",
    "Q1/T1 = Q2/T2",
    "rms = sqrt(3*R*T/M)",
    "v_avg = sqrt(8*R*T/(pi*M))",
    "v_mp = sqrt(2*R*T/M)",
    "KE_avg = 3*R*T/2",
    "KE_avg_molecule = 3*k_B*T/2",
    "rate1/rate2 = sqrt(M2/M1)",

    # =========================================================
    # OPTICS — Ray optics
    # =========================================================
    "1/f = 1/v_img - 1/u_obj",
    "1/f = (n - 1)*(1/R1 - 1/R2)",
    "m_mag = h_i/h_o",
    "m_mag = v_img/u_obj",
    "P_lens = 1/f",
    "P_combo = P1 + P2",
    "1/F_combo = 1/f1 + 1/f2",
    "n = c/v",
    "n1*sin_i = n2*sin_r",
    "sin_c = 1/n",
    "delta = i + e - A_prism",
    "mu_prism = sin((A_prism + D_m)/2)/sin(A_prism/2)",
    "f = R/2",
    "P_lens = (n - 1)*(1/R1 - 1/R2)",
    "m_telescope = f_o/f_e",
    "m_microscope = L_tube*D_near/(f_o*f_e)",

    # =========================================================
    # OPTICS — Wave optics
    # =========================================================
    "beta = lambda_w*D_screen/d_slit",
    "path_diff = d_slit*sin_theta",
    "bright = n*lambda_w",
    "dark = (2*n - 1)*lambda_w/2",
    "y_bright = n*lambda_w*D_screen/d_slit",
    "y_dark = (2*n - 1)*lambda_w*D_screen/(2*d_slit)",

    # =========================================================
    # ELECTROSTATICS
    # =========================================================
    "F = k*q1*q2/r**2",
    "F = q1*q2/(4*pi*epsilon0*r**2)",
    "E_field = F/q",
    "E_field = k*q/r**2",
    "E_field = sigma/(2*epsilon0)",
    "E_field = sigma/epsilon0",
    "E_field = V/d",
    "V = k*q/r",
    "V = E_field*d",
    "U = k*q1*q2/r",
    "U = q*V",
    "phi = E_field*A",
    "phi = q_enclosed/epsilon0",
    "C = q/V",
    "C = epsilon0*A/d",
    "C = 4*pi*epsilon0*r",
    "C_series = 1/(1/C1 + 1/C2)",
    "C_parallel = C1 + C2",
    "U_cap = C*V**2/2",
    "U_cap = q**2/(2*C)",
    "U_cap = q*V/2",
    "tau_dipole = p_dipole*E_field*sin_theta",
    "U_dipole = -p_dipole*E_field*cos_theta",
    "p_dipole = q*d",

    # =========================================================
    # CURRENT ELECTRICITY
    # =========================================================
    "I = q/t",
    "I = n_e*e*A*v_d",
    "V = I*R",
    "R = rho*L/A",
    "R = R0*(1 + alpha_temp*dT)",
    "G = 1/R",
    "P_elec = V*I",
    "P_elec = I**2*R",
    "P_elec = V**2/R",
    "H = I**2*R*t",
    "H = V*I*t",
    "E_emf = I*(R + r_int)",
    "E_emf = V + I*r_int",
    "V = E_emf - I*r_int",
    "R_series = R1 + R2",
    "R_parallel = 1/(1/R1 + 1/R2)",
    "J = I/A",
    "J = sigma_cond*E_field",
    "rho = 1/sigma_cond",

    # =========================================================
    # MAGNETISM & EMI
    # =========================================================
    "F = q*v*B*sin_theta",
    "F = I*L*B*sin_theta",
    "F = mu0*I1*I2*L/(2*pi*d)",
    "B = mu0*I/(2*pi*r)",
    "B = mu0*I/(2*R)",
    "B = mu0*n_turns*I",
    "B = mu0*N*I/(2*R)",
    "phi_B = B*A",
    "phi_B = B*A*cos_theta",
    "emf = -d_phi/dt",
    "emf = B*L*v",
    "emf = B*A*omega",
    "emf = N*B*A*omega",
    "M_mutual = phi_B/I",
    "emf = -M_mutual*dI/dt",
    "L_ind = phi_B/I",
    "emf = -L_ind*dI/dt",
    "U_ind = L_ind*I**2/2",
    "tau_L = L_ind/R",
    "tau_C = R*C",
    "r_cyclotron = m*v/(q*B)",
    "T_cyclotron = 2*pi*m/(q*B)",
    "f_cyclotron = q*B/(2*pi*m)",

    # =========================================================
    # ALTERNATING CURRENT
    # =========================================================
    "I_rms = I0/sqrt(2)",
    "V_rms = V0/sqrt(2)",
    "X_L = omega*L_ind",
    "X_C = 1/(omega*C)",
    "Z = sqrt(R**2 + (X_L - X_C)**2)",
    "I_rms = V_rms/Z",
    "P_avg = V_rms*I_rms*cos_phi",
    "cos_phi = R/Z",
    "omega0 = 1/sqrt(L_ind*C)",
    "f0 = 1/(2*pi*sqrt(L_ind*C))",
    "Q_factor = omega0*L_ind/R",
    "Q_factor = 1/(omega0*C*R)",

    # =========================================================
    # MODERN PHYSICS
    # =========================================================
    "E_photon = h*f",
    "E_photon = h*c/lambda_w",
    "KE_max = h*f - phi_work",
    "KE_max = e*V0",
    "lambda_debroglie = h/p",
    "lambda_debroglie = h/(m*v)",
    "E_n = -13.6*Z**2/n**2",
    "r_n = 0.529*n**2/Z",
    "1/lambda_w = R_H*(1/n1**2 - 1/n2**2)",
    "E_rest = m*c**2",
    "delta_E = delta_m*c**2",
    "N = N0*exp(-lambda_decay*t)",
    "T_half = 0.693/lambda_decay",
    "A_activity = lambda_decay*N",
    "A_activity = A0*exp(-lambda_decay*t)",
]
