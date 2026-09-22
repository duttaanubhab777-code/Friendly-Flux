// মূল dictionary অবজেক্টটি আগে থেকেই আছে কিনা চেক করে নেওয়া
window.dictionary = window.dictionary || {};

// অ্যালজেব্রার অনুবাদগুলো মূল dictionary-তে যোগ করা
Object.assign(window.dictionary, {
    algHeroTitle: {
        en: "Algebra Problem Solver",
        bn: "অ্যালজেব্রা সমাধানকারী"
    },
    algHeroSub: {
        en: "Select a category and solve equations, matrices, systems, and more — with full steps.",
        bn: "একটি ক্যাটাগরি বেছে নিন এবং সমীকরণ, ম্যাট্রিক্স বা সমীকরণজোট সহজে সমাধান করুন — সম্পূর্ণ ধাপে ধাপে।"
    },
    algCategoryLabel: {
        en: "Problem Category",
        bn: "সমস্যার ধরন"
    },
    algTabGeneral: {
        en: "Equations & Expr",
        bn: "সমীকরণ ও রাশি"
    },
    algTabMatrix: {
        en: "Matrices",
        bn: "ম্যাট্রিক্স"
    },
    algTabLinsys: {
        en: "Linear Systems",
        bn: "সমীকরণজোট"
    },
    algTabComb: {
        en: "Combinatorics",
        bn: "বিন্যাস ও সমবায়"
    },
    algInputLabel: {
        en: "Write your problem here",
        bn: "আপনার গাণিতিক সমস্যাটি এখানে লিখুন"
    },
    algInputPlaceholder: {
        en: "e.g. x^2-5x+6=0   or   |x-3|<5",
        bn: "যেমন: x^2-5x+6=0 অথবা |x-3|<5"
    },
    algVarLabel: {
        en: "Solve for (optional)",
        bn: "চলক নির্ধারণ (অপশনাল)"
    },
    algVarPlaceholder: {
        en: "auto",
        bn: "অটো"
    },
    algMatrixOp: {
        en: "Operation:",
        bn: "অপারেশন:"
    },
    algOpDet: {
        en: "Determinant",
        bn: "নির্ণায়ক (Determinant)"
    },
    algOpInv: {
        en: "Inverse",
        bn: "ইনভার্স (Inverse)"
    },
    algOpTrans: {
        en: "Transpose",
        bn: "ট্রান্সপোজ (Transpose)"
    },
    algOpRank: {
        en: "Rank",
        bn: "র‍্যাঙ্ক (Rank)"
    },
    algOpTrace: {
        en: "Trace",
        bn: "ট্রেস (Trace)"
    },
    algOpEigen: {
        en: "Eigenvalues & Vectors",
        bn: "আইগেন মান ও ভেক্টর"
    },
    algOpAdd: {
        en: "A + B",
        bn: "A + B"
    },
    algOpMul: {
        en: "A × B",
        bn: "A × B"
    },
    algMatrixA: {
        en: "Matrix A",
        bn: "ম্যাট্রিক্স A"
    },
    algMatrixB: {
        en: "Matrix B",
        bn: "ম্যাট্রিক্স B"
    },
    algLinsysSize: {
        en: "Number of Equations/Variables:",
        bn: "সমীকরণ / চলকের সংখ্যা:"
    },
    algCombType: {
        en: "Type:",
        bn: "ধরন:"
    },
    algCombNcr: {
        en: "Combination (nCr)",
        bn: "সমবায় (nCr)"
    },
    algCombNpr: {
        en: "Permutation (nPr)",
        bn: "বিন্যাস (nPr)"
    },
    algCombBinom: {
        en: "Binomial Expansion (x+y)ⁿ",
        bn: "দ্বিপদী বিস্তৃতি (x+y)ⁿ"
    },
    algTerm1: {
        en: "Term 1 (a)",
        bn: "প্রথম পদ (a)"
    },
    algTerm2: {
        en: "Term 2 (b)",
        bn: "দ্বিতীয় পদ (b)"
    },
    algTerm1Place: {
        en: "e.g. 2x",
        bn: "যেমন: 2x"
    },
    algTerm2Place: {
        en: "e.g. 3y",
        bn: "যেমন: 3y"
    }
});
