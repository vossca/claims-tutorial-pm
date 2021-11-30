/*
 *************************
 **** Lifecycle hooks ****
 *************************
 */
const PASSWORD = 'password123'

const validatePassword = async ({ claim, policy }) => {
	const password = claim.block_states.password.value;

	  const oldAppData = claim.app_data === null ? {} : claim.app_data;

	  const newAppData = {
	    ...oldAppData,
	    password_valid: password.trim() === PASSWORD ? true : false, 
	  };

	  await Promise.all([
	    httpRequest(false, 'PATCH', `/claims/${claim.claim_id}/blocks`, [
	      {
	        key: 'confirm_password',
	        block_state: {
	          type: 'radio',
	          option_key: 'no',
	          option_value: 'No',
	        },
	      },
	      {
	        key: 'password',
	        block_state: {
	          type: 'input.text',
	          value: ' ',
	        },
	      },
	    ]),
	    httpRequest(false, 'PATCH', `/claims/${claim.claim_id}`, {
	      app_data: {
	        ...newAppData,
	      },
	    }),
	  ]);
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
    blockStates.confirm_password.option_key &&
    blockStates.confirm_password.option_key === 'yes'
  ) {
    await validatePassword({ claim, policy })
  }
}
