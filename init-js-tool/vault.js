const {
    getDeployerPK, getUserPK, network
} = require('./wallet');
const {
    makeContractCall,
    callReadOnlyFunction,
    AnchorMode,
    PostConditionMode,
    uintCV,
    someCV,
    contractPrincipalCV,
    broadcastTransaction,
    ClarityType,
    bufferCVFromString,
    bufferCV,
    makeSTXTokenTransfer
} = require('@stacks/transactions');
const { wait_until_confirmation } = require('./utils');
const { principalCV } = require('@stacks/transactions/dist/clarity/types/principalCV');


const flashloan = async(loan_contract, token, amount, expiry) => {
    console.log('[Vault] flash-loan...', loan_contract, token, amount, expiry);
    const privateKey = await getUserPK();
    const txOptions = {
        contractAddress: process.env.DEPLOYER_ACCOUNT_ADDRESS,
        contractName: 'alex-vault',
        functionName: 'flash-loan',
        functionArgs: [
            contractPrincipalCV(process.env.DEPLOYER_ACCOUNT_ADDRESS, loan_contract),
            contractPrincipalCV(process.env.DEPLOYER_ACCOUNT_ADDRESS, token),
            uintCV(amount),
            someCV(bufferCV(Buffer.from('0' + expiry.toString(16), 'hex')))
        ],
        senderKey: privateKey,
        validateWithAbi: true,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };
    try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);
        console.log(broadcastResponse);
        await wait_until_confirmation(broadcastResponse.txid)
    } catch (error) {
        console.log(error);
    }
}

const mint_sft = async(token, token_id, amount, recipient) => {
    console.log('[Token] mint...', token, recipient, amount);
    const privateKey = await getDeployerPK();
    const txOptions = {
        contractAddress: process.env.DEPLOYER_ACCOUNT_ADDRESS,
        contractName: token,
        functionName: 'mint-fixed',
        functionArgs: [
            uintCV(token_id),
            uintCV(amount),            
            principalCV(recipient)
        ],
        senderKey: privateKey,
        validateWithAbi: true,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };
    try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);
        console.log(broadcastResponse);
        await wait_until_confirmation(broadcastResponse.txid)
    } catch (error) {
        console.log(error);
    }
}

const mint_ft = async(token, amount, recipient) => {
    console.log('[Token] mint...', token, recipient, amount);
    const privateKey = await getDeployerPK();
    const txOptions = {
        contractAddress: process.env.DEPLOYER_ACCOUNT_ADDRESS,
        contractName: token,
        functionName: 'mint-fixed',
        functionArgs: [
            uintCV(amount),            
            principalCV(recipient)
        ],
        senderKey: privateKey,
        validateWithAbi: true,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };
    try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);
        console.log(broadcastResponse);
        await wait_until_confirmation(broadcastResponse.txid)
    } catch (error) {
        console.log(error);
    }
}

const burn = async(token, recipient, amount) => {
    console.log('[Token] burn...', token, recipient, amount);
    const privateKey = await getDeployerPK();
    const txOptions = {
        contractAddress: process.env.DEPLOYER_ACCOUNT_ADDRESS,
        contractName: token,
        functionName: 'burn-fixed',
        functionArgs: [            
            uintCV(amount),
            principalCV(recipient),
        ],
        senderKey: privateKey,
        validateWithAbi: true,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };
    try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);
        console.log(broadcastResponse);
        await wait_until_confirmation(broadcastResponse.txid)
    } catch (error) {
        console.log(error);
    }
}

const transfer = async(token, recipient, amount, deployer=false) => {
    console.log('[Token] transfer...', token, recipient, amount);
    const privateKey =  (deployer) ? await getDeployerPK() : await getUserPK();
    const txOptions = {
        contractAddress: process.env.DEPLOYER_ACCOUNT_ADDRESS,
        contractName: token,
        functionName: 'transfer-fixed',
        functionArgs: [
            uintCV(amount),
            principalCV((deployer) ? process.env.DEPLOYER_ACCOUNT_ADDRESS : process.env.USER_ACCOUNT_ADDRESS),
            principalCV(recipient),
            someCV(bufferCVFromString(""))
        ],
        senderKey: privateKey,
        validateWithAbi: true,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };
    try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);
        console.log(broadcastResponse);
        await wait_until_confirmation(broadcastResponse.txid)
    } catch (error) {
        console.log(error);
    }
}

const transferSTX = async(recipient, amount) => {
    console.log('transferSTX...', recipient, amount);

    const txOptions = {
      recipient: recipient,
      amount: amount,
      senderKey: await getDeployerPK(),
      network: network,
    };
    
    try {
        const transaction = await makeSTXTokenTransfer(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);
        console.log(broadcastResponse);
        await wait_until_confirmation(broadcastResponse.txid)
    } catch (error) {
        console.log(error);
    }
}

const balance = async(token, owner) => {
    console.log('[Token] get-balance...', token, owner);

    const options = {
        contractAddress: process.env.DEPLOYER_ACCOUNT_ADDRESS,
        contractName: token,
        functionName: 'get-balance-fixed',
        functionArgs: [
        principalCV(owner),
        ],
        network: network,
        senderAddress: process.env.USER_ACCOUNT_ADDRESS,
    };
    try {
        return callReadOnlyFunction(options);
    } catch (error) {
        console.log(error);
    }
}

const getBalance = async(token) => {
    console.log('[VAULT] get-balance...', token);

    const options = {
        contractAddress: process.env.DEPLOYER_ACCOUNT_ADDRESS,
        contractName: 'alex-vault',
        functionName: 'get-balance-fixed',
        functionArgs: [
        contractPrincipalCV(process.env.DEPLOYER_ACCOUNT_ADDRESS, token),
        ],
        network: network,
        senderAddress: process.env.USER_ACCOUNT_ADDRESS,
    };
    try {
        const result = await callReadOnlyFunction(options);
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

exports.flashloan = flashloan;
exports.mint_ft = mint_ft;
exports.mint_sft = mint_sft;
exports.burn = burn;
exports.balance = balance;
exports.getBalance = getBalance;
exports.transfer = transfer;
exports.transferSTX = transferSTX;