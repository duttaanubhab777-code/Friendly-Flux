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
    "moles": {
        id: "moles",
        all_variables: ["n", "mass", "M"],
        name: { en: "Moles", bn: "মোল সংখ্যা" },
        formula: "n = mass / M",
        tags: ["moles", "mass", "molar", "মোল", "ভর"]
    },
    "molarity": {
        id: "molarity",
        all_variables: ["Mol", "n", "V"],
        name: { en: "Molarity", bn: "মোলারিটি" },
        formula: "Mol = n / V",
        tags: ["molarity", "volume", "concentration", "মোলারিটি", "আয়তন"]
    },
    "ideal_gas": {
        id: "ideal_gas",
        all_variables: ["P", "V", "n", "T"],
        name: { en: "Ideal Gas Equation", bn: "আদর্শ গ্যাস সমীকরণ" },
        formula: "P·V = n·0.0821·T",
        tags: ["gas", "pressure", "temperature", "গ্যাস", "চাপ"]
    }
};
