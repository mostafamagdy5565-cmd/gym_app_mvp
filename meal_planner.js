/**
 * محرك التغذية اليومية حسب الميزانية والهدف والعملة واللغة
 */
function buildDailyMealPlan({
  meals,
  dailyBudget,
  currency = "EGP",
  goal = "recomp",
  lang = "ar"
}) {
  const safeLang = lang === "en" ? "en" : "ar";
  const budget = Number(dailyBudget);

  if (!Array.isArray(meals) || isNaN(budget) || budget <= 0) {
    return {
      ok: false,
      message:
        safeLang === "ar"
          ? "من فضلك أدخل مبلغ ميزانية يومية صحيح أكبر من صفر."
          : "Please enter a valid daily budget greater than zero.",
      selectedMeals: [],
      totals: {
        cost: 0,
        remainingBudget: 0,
        calories: 0,
        protein_g: 0,
        currency
      }
    };
  }

  // فلترة الوجبات المناسبة للهدف والتي لها سعر محدد بالعملة المختارة
  const matchingMeals = meals.filter((meal) => {
    const goals = Array.isArray(meal.goal) ? meal.goal : [];
    const costValue = meal.estimated_cost ? meal.estimated_cost[currency] : undefined;
    return goals.includes(goal) && typeof costValue === "number" && !isNaN(costValue);
  });

  // ترتيب الوجبات من الأقل تكلفة للأعلى لتعظيم الاستفادة من الميزانية
  const sortedMeals = [...matchingMeals].sort(
    (a, b) => a.estimated_cost[currency] - b.estimated_cost[currency]
  );

  const selectedMeals = [];
  let totalCost = 0;
  let totalCalories = 0;
  let totalProtein = 0;

  for (const meal of sortedMeals) {
    const mealCost = meal.estimated_cost[currency];
    if (totalCost + mealCost <= budget) {
      const content = (meal.i18n && (meal.i18n[safeLang] || meal.i18n.en)) || {};
      selectedMeals.push({
        id: meal.id,
        title: content.title || meal.id,
        ingredients: content.ingredients || "",
        cost: mealCost,
        calories: meal.calories || 0,
        protein_g: meal.protein_g || 0
      });

      totalCost += mealCost;
      totalCalories += meal.calories || 0;
      totalProtein += meal.protein_g || 0;
    }
  }

  const remainingBudget = Number((budget - totalCost).toFixed(2));

  return {
    ok: true,
    selectedMeals,
    totals: {
      cost: Number(totalCost.toFixed(2)),
      remainingBudget,
      calories: totalCalories,
      protein_g: totalProtein,
      currency
    },
    note:
      selectedMeals.length === 0
        ? safeLang === "ar"
          ? `الميزانية (${budget} ${currency}) أقل من أقل وجبة متاحة لهذا الهدف حالياً؛ جرّب زيادة المبلغ أو تغيير الهدف.`
          : `Budget (${budget} ${currency}) is below the cheapest available meal for this goal; try increasing the budget or changing the goal.`
        : null
  };
}

// مثال تجربة سريع للتأكد من عمل المحرك
if (typeof require !== "undefined" && require.main === module) {
  const fs = require("fs");
  const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
  const plan = buildDailyMealPlan({
    meals: data.meals,
    dailyBudget: 200,
    currency: "EGP",
    goal: "lean_bulk",
    lang: "ar"
  });
  console.log(JSON.stringify(plan, null, 2));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildDailyMealPlan };
}