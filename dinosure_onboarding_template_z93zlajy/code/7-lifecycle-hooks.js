/*
 *************************
 **** Lifecycle hooks ****
 *************************
 */

const httpRequest = async (isExternal, method, url, body) =) {
  return new Promise((res, rej) =) {
    if (isExternal) {
      fetch(`https://api.example.com/verify/`, {
        method: method,
        headers: {
          Authorization:
            'Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then((response) =) response.json())
        .then((json) =) res(json));
    } else {
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
    }
  });
};

const sendVerificationRequest = async ({ claim, policy }) => {
	const beneficiaryId = claim.block_states.beneficiary_id.value;

	const ex = /^(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/;

	  if (ex.test(beneficiaryId) === false) {
	    
		  const oldAppData = claim.app_data === null ? {} : claim.app_data;

		  const newAppData = {
		    ...oldAppData,
		    beneficiary_id_verification: {
		    	status: 'invalid',
		    	message: 'ID number is not a valid South African ID number'
		    },
		  };

		 await Promise.all([
		    httpRequest(false, 'PATCH', `/claims/${claim.claim_id}/blocks`, [
		      {
		        key: 'beneficiary_id_verification_status',
		        block_state: {
		          type: 'radio',
		          option_key: 'complete',
		          option_value: 'Complete',
		        },
		      },
		      {
		        key: 'start_verification_process',
		        block_state: {
		          type: 'radio',
		          option_key: 'no',
		          option_value: 'No',
		        },
		      },
		    ]),
		    httpRequest(false, 'PATCH', `/claims/${claim.claim_id}`, {
		      app_data: {
		        ...newAppData,
		      },
		    }),
		  ]);

	  } else {
		 await Promise.all([
		    httpRequest(false, 'PATCH', `/claims/${claim.claim_id}/blocks`, [
		      {
		        key: 'beneficiary_id_verification_status',
		        block_state: {
		          type: 'radio',
		          option_key: 'processing',
		          option_value: 'Processing',
		        },
		      }, 
		      {
		        key: 'start_verification_process',
		        block_state: {
		          type: 'radio',
		          option_key: 'no',
		          option_value: 'No',
		        },
		      },
		    ]),
		    httpRequest(true, 'POST', `https://api.example.com/verify/`, {
				beneficiary_id: beneficiaryId,
				callback_url: '(Root API URL)/blocks/beneficiary_id_verification_response',
		    }),
		  ]);
	  }
}

const receiveVerificationResponse = async ({ claim, policy }) => {
	const response = JSON.parse(claim.block_states.beneficiary_id_verification_response.value);

	  const oldAppData = claim.app_data === null ? {} : claim.app_data;

	  const newAppData = {
	    ...oldAppData,
	    beneficiary_id_verification: {
	    	...response,
	    },
	  };

	  await Promise.all([
	    httpRequest(false, 'PATCH', `/claims/${claim.claim_id}/blocks`, [
	      {
	        key: 'beneficiary_id_verification_status',
	        block_state: {
	          type: 'radio',
	          option_key: 'complete',
	          option_value: 'Complete',
	        },
	      },
	      {
	        key: 'beneficiary_id_verification_response',
	        block_state: {
	          type: 'input.text',
	          value: 'none',
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
    blockStates.start_verification_process.value &&
    blockStates.start_verification_process.value === 'yes' &&
  ) {
  	await sendVerificationRequest({ claim, policy })
  }


  if (
    blockStates.beneficiary_id_verification_status.option_key &&
    blockStates.beneficiary_id_verification_status.option_key === 'processing' &&
    blockStates.beneficiary_id_verification_response.value &&
    blockStates.beneficiary_id_verification_response.value !== 'none' &&
  ) {
  	await receiveVerificationResponse({ claim, policy })
  }
}
