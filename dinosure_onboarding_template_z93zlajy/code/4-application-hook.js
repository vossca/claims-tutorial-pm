/*
 **************************
 **** Application hook ****
 **************************
 */

/**
 * Validates the input data sent as part of the get-application request
 *
 * @param {object} data The input data required to generate an application
 * @return {object} Joi validation schema
 */
const validateApplicationRequest = (data, policyholder, quote_package) => {
  // Custom validation can be specified in the function body
  return Joi.validate(
    data,
    Joi.object()
      .keys({
        // The Joi validation schema can be completed here
      })
      .required()
  );
};

/**
 * Generates and returns an application using the input data, quote
 * and policyholder data
 *
 * @param {object} data The input data required to generate an application
 * @param {object} policyholder The policyholder object created using the create-policyholder endpoint
 * @param {object} quote_package The quote created using the get-quote endpoint
 * @return {object} Application
 */
const getApplication = (data, policyholder, quote_package) => {
  return new Application({
    // The top-level fields are standard across all product modules
    package_name: quote_package.package_name,
    sum_assured: quote_package.sum_assured,
    base_premium: quote_package.base_premium,
    monthly_premium: quote_package.suggested_premium,
    input_data: { ...data },
    module: {
      // The module object is used to store product-specific fields
      ...quote_package.module,
      ...data,
    },
  });
};
