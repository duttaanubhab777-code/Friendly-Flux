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
    "newtons_second_law": {
        id: "newtons_second_law", 
        all_variables: ["F", "m", "a"],
        name: { en: "Newton's Second Law", bn: "নিউটনের দ্বিতীয় সূত্র" },
        formula: "F = ma",
        tags: ["newton", "force", "mass", "acceleration", "বল", "ভর", "ত্বরণ"]
    },
    "kinetic_energy": {
        id: "kinetic_energy", 
        all_variables: ["KE", "m", "v"],
        name: { en: "Kinetic Energy", bn: "গতিশক্তি" },
        formula: "KE = ½mv²",
        tags: ["energy", "kinetic", "velocity", "শক্তি", "গতি", "বেগ"]
    },
    "ohms_law": {
        id: "ohms_law", 
        all_variables: ["V", "I", "R"],
        name: { en: "Ohm's Law", bn: "ওমের সূত্র" },
        formula: "V = IR",
        tags: ["ohm", "voltage", "current", "resistance", "ভোল্টেজ", "বিদ্যুৎ", "রোধ"]
    }
};
