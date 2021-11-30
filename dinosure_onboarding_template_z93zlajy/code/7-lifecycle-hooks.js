/*
 *************************
 **** Lifecycle hooks ****
 *************************
 */

/**
 * Performs updates after a claim block has been updated based on specific conditions
 *
 * @param {object} policy The policy object
 * @param {object} claim The claim object
 * @return {array} An array of actions to be performed by the platform
 */
 async function afterClaimBlockUpdated({ policy, claim }) {
  if (
    claim.block_states.extraction_fulfillment_request.fulfillment_request_id &&
    !policy.module.extraction_has_been_claimed
  ) {
    return [
      {
        name: "update_policy_module_data",
        data: {
          extraction_has_been_claimed: true,
        },
      },
    ];
  }
}