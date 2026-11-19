/**
 * محرك توليد الجداول التدريبية حسب عدد الأيام والنظام ونقاط التركيز واللغة
 */
const SPLIT_TEMPLATES = {
  full_body: {
    ar: ["يوم كامل الجسم A", "يوم كامل الجسم B", "يوم كامل الجسم C"],
    en: ["Full Body A", "Full Body B", "Full Body C"],
    muscleGroups: [
      ["upper_chest", "upper_back", "lateral_delt", "quads"],
      ["lateral_delt", "upper_back", "upper_chest", "quads"],
      ["upper_back", "upper_chest", "quads", "lateral_delt"]
    ]
  },
  upper_lower: {
    ar: ["علوي A", "سفلي A", "علوي B", "سفلي B"],
    en: ["Upper A", "Lower A", "Upper B", "Lower B"],
    muscleGroups: [
      ["upper_chest", "upper_back", "lateral_delt"],
      ["quads", "lateral_delt"],
      ["upper_back", "upper_chest", "lateral_delt"],
      ["quads", "upper_back"]
    ]
  },
  ppl: {
    ar: ["دفع (Push)", "سحب (Pull)", "أرجل (Legs)"],
    en: ["Push", "Pull", "Legs"],
    muscleGroups: [
      ["upper_chest", "lateral_delt"],
      ["upper_back", "lateral_delt"],
      ["quads", "upper_back"]
    ]
  },
  arnold: {
    ar: ["صدر وظهر A", "كتف وذراع A", "أرجل A", "صدر وظهر B", "كتف وذراع B", "أرجل B"],
    en: ["Chest & Back A", "Shoulders & Arms A", "Legs A", "Chest & Back B", "Shoulders & Arms B", "Legs B"],
    muscleGroups: [
      ["upper_chest", "upper_back"],
      ["lateral_delt", "upper_back"],
      ["quads", "lateral_delt"],
      ["upper_back", "upper_chest"],
      ["lateral_delt", "upper_chest"],
      ["quads", "upper_back"]
    ]
  }
};

function resolveSplitType(daysPerWeek, requestedSplit) {
  if (requestedSplit && SPLIT_TEMPLATES[requestedSplit]) {
    return requestedSplit;
  }
  const days = Number(daysPerWeek) || 4;
  if (days <= 3) return "full_body";
  if (days === 4) return "upper_lower";
  if (days === 5) return "ppl";
  return "arnold";
}

function scoreExercise(exercise, targetMuscles, focusTags) {
  let score = 0;
  const exFocus = Array.isArray(exercise.focus_tags) ? exercise.focus_tags : [];
  const targets = Array.isArray(targetMuscles) ? targetMuscles : [];
  const focuses = Array.isArray(focusTags) ? focusTags : [];

  if (targets.includes(exercise.primary_muscle)) {
    score += 10;
  }
  for (const tag of focuses) {
    if (exFocus.includes(tag) || exercise.primary_muscle === tag) {
      score += 6;
    }
  }
  return score;
}

function generateWorkoutSchedule({
  exercises,
  daysPerWeek = 4,
  splitType = null,
  focusTags = [],
  excludedIds = [],
  lang = "ar"
}) {
  const safeLang = lang === "en" ? "en" : "ar";
  const days = Math.min(6, Math.max(2, Number(daysPerWeek) || 4));
  const activeSplitKey = resolveSplitType(days, splitType);
  const template = SPLIT_TEMPLATES[activeSplitKey];

  const cleanExercises = Array.isArray(exercises)
    ? exercises.filter((ex) => !excludedIds.includes(ex.id))
    : [];

  if (cleanExercises.length === 0) {
    return {
      ok: false,
      splitType: activeSplitKey,
      days: [],
      message:
        safeLang === "ar"
          ? "لا توجد تمارين متاحة بعد تطبيق الاستبعادات."
          : "No exercises available after applying exclusions."
    };
  }

  const scheduleDays = [];

  for (let i = 0; i < days; i++) {
    const dayNames = template[safeLang] || template.en;
    const dayTitle =
      dayNames[i % dayNames.length] ||
      (safeLang === "ar" ? `يوم ${i + 1}` : `Day ${i + 1}`);
    const dayMuscles =
      template.muscleGroups[i % template.muscleGroups.length] || [];

    const ranked = [...cleanExercises]
      .sort(
        (a, b) =>
          scoreExercise(b, dayMuscles, focusTags) -
          scoreExercise(a, dayMuscles, focusTags)
      )
      .slice(0, Math.min(3, cleanExercises.length))
      .map((ex) => {
        const i18nData = (ex.i18n && (ex.i18n[safeLang] || ex.i18n.en)) || {};
        const repRange = ex.rep_range || { min: 8, max: 12 };
        return {
          id: ex.id,
          name: i18nData.name || ex.id,
          primary_muscle: ex.primary_muscle,
          sets: ex.default_sets || 3,
          reps: `${repRange.min}-${repRange.max}`,
          rest_seconds: ex.rest_seconds || 90,
          video_asset: ex.video_asset || "",
          ai_video_prompt: ex.ai_video_prompt || "",
          cues: i18nData.cues || [],
          mistakes: i18nData.mistakes || []
        };
      });

    scheduleDays.push({
      dayNumber: i + 1,
      title: dayTitle,
      exercises: ranked
    });
  }

  return {
    ok: true,
    splitType: activeSplitKey,
    daysPerWeek: days,
    days: scheduleDays
  };
}

// مثال تجربة سريع للتأكد من عمل المحرك
if (typeof require !== "undefined" && require.main === module) {
  const fs = require("fs");
  const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
  const schedule = generateWorkoutSchedule({
    exercises: data.exercises,
    daysPerWeek: 4,
    focusTags: ["lateral_delt", "upper_back", "symmetry"],
    lang: "ar"
  });
  console.log(JSON.stringify(schedule, null, 2));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { generateWorkoutSchedule };
}