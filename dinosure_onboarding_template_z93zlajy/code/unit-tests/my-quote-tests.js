/* global expect moment ReactivationOption InvalidRequestError AlteredPolicy AlterationPackage QuotePackage Application Policy generatePolicyNumber Joi RequotePolicy root */
// This file is used by the 'rp test -u' unit testing command and allows you to write and run unit tests locally.
// This file automatically get's commented out by the CLI tool when being pushed to Root.
// This ensures that it does not interfere with production execution.

describe("getQuote", function () {
  const quoteData = {
    cover_amount: 200000 * 100,
    age: 30,
    cardio_fitness_level: "couch potato",
    smoker: false,
    early_warning_network_benefit: true,
    extraction_benefit: false,
  };

  it("should pass quote data validation for correct data", function () {
    const validation = validateQuoteRequest(quoteData);
    expect(validation.error).to.equal(null);
  });

  it("should return a suggested premium of R73.00 (in cents)", function () {
    const quotePackage = getQuote(quoteData);
    expect(quotePackage.suggested_premium).to.equal(7300); // cents
  });
});
