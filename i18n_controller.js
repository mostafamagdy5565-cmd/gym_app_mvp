/**
 * متحكم اللغات والاتجاهات (RTL / LTR) والنصوص الأساسية للتطبيق
 */
const UI_STRINGS = {
  ar: {
    appName: "مخطط الجيم الذكي",
    goalLabel: "الهدف",
    goals: {
      lean_bulk: "تضخيم نظيف",
      cut: "تنشيف",
      recomp: "إعادة تشكيل الجسم"
    },
    currencies: {
      EGP: "جنيه مصري",
      SAR: "ريال سعودي",
      AED: "درهم إماراتي",
      USD: "دولار أمريكي"
    },
    budgetLabel: "الميزانية اليومية",
    workoutTab: "جدول التمرين",
    mealsTab: "النظام الغذائي",
    roadmapTab: "فحص الجسم وخارطة الطريق",
    aiPromptLabel: "وصف فيديو التمرين (AI Avatar)"
  },
  en: {
    appName: "Smart Gym Planner",
    goalLabel: "Goal",
    goals: {
      lean_bulk: "Lean Bulk",
      cut: "Cut",
      recomp: "Body Recomposition"
    },
    currencies: {
      EGP: "Egyptian Pound",
      SAR: "Saudi Riyal",
      AED: "UAE Dirham",
      USD: "US Dollar"
    },
    budgetLabel: "Daily Budget",
    workoutTab: "Workout Plan",
    mealsTab: "Meal Plan",
    roadmapTab: "Physique Scan & Roadmap",
    aiPromptLabel: "AI Avatar Video Prompt"
  }
};

function getLanguageConfig(lang = "ar") {
  const normalized = String(lang || "ar").toLowerCase() === "en" ? "en" : "ar";
  const isArabic = normalized === "ar";
  return {
    lang: normalized,
    dir: isArabic ? "rtl" : "ltr",
    isRTL: isArabic,
    strings: UI_STRINGS[normalized]
  };
}

function getGoalLabel(goalKey, lang = "ar") {
  const config = getLanguageConfig(lang);
  return (config.strings.goals && config.strings.goals[goalKey]) || goalKey;
}

function getCurrencyLabel(currencyCode, lang = "ar") {
  const config = getLanguageConfig(lang);
  const code = String(currencyCode || "EGP").toUpperCase();
  return (config.strings.currencies && config.strings.currencies[code]) || code;
}

// مثال تجربة سريع للتأكد من عمل المتحكم
if (typeof require !== "undefined" && require.main === module) {
  console.log(JSON.stringify(getLanguageConfig("ar"), null, 2));
  console.log(JSON.stringify(getLanguageConfig("en"), null, 2));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    UI_STRINGS,
    getLanguageConfig,
    getGoalLabel,
    getCurrencyLabel
  };
}