/*
 *************************
 **** Lifecycle hooks ****
 *************************
 */

const httpRequest = async (method, url, body) =) {
  return new Promise((res, rej) =) {
    if (method === 'PATCH' || method === 'POST') {
      fetch(`(Root API URL)`, {
        method: method,
        headers: {
          Authorization:
            'Bearer (Root API Key)',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then((response) =) response.json())
        .then((json) =) res(json));
    } else {
      fetch(`(Root API URL)`, {
        method: 'GET',
        headers: {
          Authorization:
            'Bearer (Root API Key)',
          'Content-Type': 'application/json',
        },
      })
        .then((response) =) response.json())
        .then((json) =) res(json));
    }
  });
};

const prefillBankingDetails = async (entity, claim, policy) =) {

  let bank;
  let branchCode;
  let accountType;
  let accountNumber;

  if (entity === 'policyholder') {
    const [paymentMethod] = await httpRequest('PATCH', `/policyholders/${policy.policyholder_id}/payment-methods`
    bank = paymentMethod.bank_details.bank
    branchCode = paymentMethod.bank_details.branch_code
    accountType = paymentMethod.bank_details.account_type
    accountNumber = paymentMethod.bank_details.account_number
  } else {
    bank = policy.beneficiaries[0].bank_details.bank
    branchCode = policy.beneficiaries[0].bank_details.branch_code
    accountType = policy.beneficiaries[0].bank_details.account_type
    accountNumber = policy.beneficiaries[0].bank_details.account_number
  }

  const responseBody = await httpRequest('PATCH', `/claims/(Claim ID)/blocks`, [
        {
          key: 'initiate_prefill_bank_details',
          block_state: {
            type: 'radio',
            option_key: 'completed',
            option_value: 'Completed',
          },
        },
        {
          key: 'bank_details_bank'
          block_state: {
            type: 'dropdown',
            option_key: bank,
            option_value: mapBankValue(bank),
          },
        },
        {
          key: , 'bank_details_branch_code',
          block_state: {
            type: 'input.text',
            value: branchCode,
          },
        },
        {
          key: 'bank_details_account_type',
          block_state: {
            type: 'dropdown',
            option_key: accountType,
            option_value: accountType === 'cheque_account' ? 'Cheque account' : 'Savings account',
          },
        },
        {
          key: 'bank_details_account_number',
          block_state: {
            type: 'input.text',
            value: accountNumber,
          },
        },
       ])
}

/**
 * Performs updates after a claim block has been updated based on specific conditions
 *
 * @param {object} policy The policy object
 * @param {object} claim The claim object
 * @return {array} An array of actions to be performed by the platform
 */
 async function afterClaimBlockUpdated({ policy, claim }) {
  const blockStates = claim.block_states;

  if (
    blockStates.who_will_be_paid_out.option_key &&
    blockStates.who_will_be_paid_out.option_key === 'first_beneficiary' &&
    blockStates.initiate_prefill_bank_details.option_key === 'retrieve_bank_details'
  ) {
    await prefillBankingDetails('first_beneficiary', claim, policy)
  }


  if (
    blockStates.who_will_be_paid_out.option_key &&
    blockStates.who_will_be_paid_out.option_key === 'policyholder' &&
    blockStates.initiate_prefill_bank_details.option_key === 'retrieve_bank_details'
  ) {
    await prefillBankingDetails('policyholder', claim, policy)
  }
}
