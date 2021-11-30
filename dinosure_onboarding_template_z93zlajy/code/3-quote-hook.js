/*
 ********************
 **** Quote hook ****
 ********************
 */

/**
 * Validates the input data sent as part of the get-quote request
 *
 * @param {object} data The input data required to generate a quote
 * @return {object} Joi validation schema
 */
const validateQuoteRequest = (data) =>
  Joi.validate(
    data,
    Joi.object()
      .keys({
        cover_amount: Joi.number()
          .integer()
          .min(100000 * 100)
          .max(5000000 * 100)
          .required(),
        age: Joi.number().integer().min(18).max(63).required(),
        cardio_fitness_level: Joi.valid(["couch potato", "marathon runner"]).required(),
        smoker: Joi.boolean().required(),
        early_warning_network_benefit: Joi.boolean().required(),
        extraction_benefit: Joi.boolean().required(),
      })
      .required(),
    { abortEarly: false }
  );

/**
 * Generates and returns a quote package using the input data (rating factors)
 *
 * @param {object} data The input data required to generate a quote
 * @return {object} Quote
 */
const getQuote = (data) => {
  // Do the math and logic to calculate the premium, benefits, etc.
  // using `data`, hardcoded rating tables, data stores, or external services/APIs

  const riskPremium = Math.round(calculateRiskPremium(data));
  const earlyWarningNetworkBenefitPremium = Math.round(calculateEarlyWarningNetworkBenefitPremium(data));
  const extractionBenefitPremium = Math.round(calculateExtractionBenefitPremium(data));

  const totalPremium = riskPremium + earlyWarningNetworkBenefitPremium + extractionBenefitPremium;

  return new QuotePackage({
    // Below are standard fields for all products
    package_name: "Dino protection", // The name of the "package" of cover
    sum_assured: data.cover_amount, // Set the total, aggregated cover amount
    base_premium: totalPremium, // Should be an integer, cents
    suggested_premium: totalPremium, // Should be an integer, cents
    billing_frequency: "monthly", // Can be monthly or yearly
    module: {
      // Save any data, calculations, or results here for future re-use.
      cover_amount: data.cover_amount,
      age: data.age,
      cardio_fitness_level: data.cardio_fitness_level,
      smoker: data.smoker,
      early_warning_network_benefit: data.early_warning_network_benefit,
      extraction_benefit: data.extraction_benefit,
      premium_breakdown: {
        risk_premium: riskPremium,
        early_warning_network_benefit_premium: earlyWarningNetworkBenefitPremium,
        extraction_benefit_premium: extractionBenefitPremium,
      },
    },
    input_data: { ...data },
  });
};
