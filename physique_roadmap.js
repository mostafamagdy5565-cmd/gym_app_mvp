/**
 * محرك فحص الجسم ومقارنة الهدف مع خارطة الطريق الزمنية
 */
function buildPhysiqueRoadmap({
  roadmaps,
  targetBodyType = "lean_athletic",
  userPriorities = [],
  lang = "ar"
}) {
  const safeLang = lang === "en" ? "en" : "ar";
  const list = Array.isArray(roadmaps) ? roadmaps : [];

  if (list.length === 0) {
    return {
      ok: false,
      message:
        safeLang === "ar"
          ? "لا توجد قوالب خارطة طريق متاحة حالياً."
          : "No goal roadmaps available right now.",
      roadmap: null
    };
  }

  const matched =
    list.find((item) => item.target_body_type === targetBodyType) || list[0];

  const i18nData =
    (matched.i18n && (matched.i18n[safeLang] || matched.i18n.en)) || {};

  const focusTags = new Set(["symmetry"]);
  let suggestedGoal = "recomp";

  if (matched.target_body_type === "classic_v_taper") {
    focusTags.add("lateral_delt");
    focusTags.add("upper_back");
    focusTags.add("upper_chest");
    suggestedGoal = "lean_bulk";
  } else {
    focusTags.add("lateral_delt");
    focusTags.add("upper_back");
    suggestedGoal = "recomp";
  }

  const prioritiesText = Array.isArray(userPriorities)
    ? userPriorities.join(" ").toLowerCase()
    : String(userPriorities || "").toLowerCase();

  if (prioritiesText.includes("تضخيم") || prioritiesText.includes("bulk")) {
    suggestedGoal = "lean_bulk";
  } else if (prioritiesText.includes("تنشيف") || prioritiesText.includes("cut")) {
    suggestedGoal = "cut";
  }

  if (prioritiesText.includes("صدر") || prioritiesText.includes("chest")) {
    focusTags.add("upper_chest");
  }
  if (prioritiesText.includes("رجل") || prioritiesText.includes("leg")) {
    focusTags.add("quads");
  }

  return {
    ok: true,
    target_body_type: matched.target_body_type,
    estimated_duration_weeks: matched.estimated_duration_weeks || 16,
    title: i18nData.title || matched.target_body_type,
    steps: Array.isArray(i18nData.steps) ? i18nData.steps : [],
    recommendedFocusTags: Array.from(focusTags),
    suggestedGoal,
    comparisonNote:
      safeLang === "ar"
        ? "قارن صورتك الحالية بنفس الإضاءة والزاوية والوضعية مقابل الصورة المرجعية للهدف كل أسبوعين لمتابعة التقدم بوضوح."
        : "Compare your current photo under matching lighting, angle, and pose against your target physique every two weeks to track progress clearly."
  };
}

// مثال تجربة سريع للتأكد من عمل المحرك
if (typeof require !== "undefined" && require.main === module) {
  const fs = require("fs");
  const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
  const plan = buildPhysiqueRoadmap({
    roadmaps: data.goal_roadmaps,
    targetBodyType: "classic_v_taper",
    userPriorities: ["تضخيم", "الكتف والظهر"],
    lang: "ar"
  });
  console.log(JSON.stringify(plan, null, 2));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildPhysiqueRoadmap };
}