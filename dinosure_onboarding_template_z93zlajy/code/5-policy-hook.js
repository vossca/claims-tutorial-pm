/*
 *********************
 **** Policy hook ****
 *********************
 */

/**
 * Generates a policy using the application, policyholder and billing day
 *
 * @param {object} application The application created using the get-application endpoint
 * @param {object} policyholder The policyholder object created using the create-policyholder endpoint
 * @param {object} billing_day The billing day of the policy
 * @return {object} Policy
 */
const getPolicy = (application, policyholder, billing_day) => {
  return new Policy({
    policy_number: generatePolicyNumber(),
    package_name: application.package_name,
    sum_assured: application.sum_assured,
    base_premium: application.base_premium,
    monthly_premium: application.monthly_premium,
    start_date: moment().add(1, "day"), // start tomorrow
    end_date: moment().endOf("month").add(1, "year"), // in 1 year
    charges: application.module.charges,
    module: {
      ...application.module,
    },
  });
};
