let ethersProvider
let zksProvider

let ethWallet
let ethWallet2

let SyncWallet
let SyncWallet2

let privateKey
let pubkeyHash

let MNEMONIC = "boat super strategy equip avoid clock cube original inflict awkward entry inflict";
let MNEMONIC2 = "trash copper theory piece clutch blouse poem gentle damage gossip delay predict"


async function init(){
  ethersProvider = new ethers.getDefaultProvider('rinkeby');
  ethWallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(ethersProvider);

  zksProvider = await zksync.getDefaultProvider('rinkeby');
  SyncWallet = await zksync.Wallet.fromEthSigner(ethWallet, zksProvider);
  console.log('ETH balance:', (await SyncWallet.getBalance('ETH')).toString());

  privateKey = await zksync.crypto.privateKeyFromSeed(new Uint8Array(32));
  pubkeyHash = await zksync.crypto.privateKeyToPubKeyHash(privateKey);
  console.log('PrivateKey', ethers.utils.hexlify(privateKey), 'PubkeyHash', pubkeyHash);

  ethWallet2 = ethers.Wallet.fromMnemonic(MNEMONIC2).connect(ethersProvider);
  SyncWallet2 = await zksync.Wallet.fromEthSigner(ethWallet2, zksProvider);
}

async function deposit(){
  console.log("depositing...")

  let deposit = await SyncWallet.depositToSyncFromEthereum({
    depositTo: SyncWallet.address(),
    token: 'ETH',
    amount: ethers.utils.parseEther('0.01')
  })
  // Await confirmation from the zkSync operator
// Completes when a promise is issued to process the tx

  let depositReceipt = await deposit.awaitReceipt()
  console.log("deposit Receipt:")
  console.log(depositReceipt)

// Await verification
// Completes when the tx reaches finality on Ethereum
  console.log("awaiting verification...")
  let depositVerificationReceipt = await deposit.awaitVerifyReceipt();
  console.log("deposit Verification Receipt:")

  console.log(depositVerificationReceipt)

}

async function unlock(){
  if (!(await SyncWallet.isSigningKeySet())) {
  if ((await SyncWallet.getAccountId()) == undefined) {
    throw new Error('Unknown account');
  }

  // As any other kind of transaction, `ChangePubKey` transaction requires fee.
  // User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
  // the lowest possible amount.
  let changePubkey = await SyncWallet.setSigningKey({ feeToken: 'ETH' });

  // Wait until the tx is committed
  let changePubKeyReceipt = await changePubkey.awaitReceipt();
  console.log(changePubKeyReceipt)
  }
}

async function checkBalance(){
  // Committed state is not final yet
  let committedETHBalance = await SyncWallet.getBalance('ETH');
  console.log("committed Eth Balance:")
  console.log(committedETHBalance)

  // Verified state is final
  let verifiedETHBalance = await SyncWallet.getBalance('ETH', 'verified');
  console.log("verified Eth Balance:")
  console.log(verifiedETHBalance)

  const state = await SyncWallet.getAccountState();

const committedBalances = state.committed.balances;
const committedETHBalance2 = committedBalances['ETH'];

const verifiedBalances = state.verified.balances;
const verifiedETHBalance2 = verifiedBalances['ETH'];
}

async function transfer(){
  let amount = zksync.utils.closestPackableTransactionAmount(ethers.utils.parseEther('0.01'));
  let fee = zksync.utils.closestPackableTransactionFee(ethers.utils.parseEther('0.001'));

  let transfer = await SyncWallet.syncTransfer({
    to: SyncWallet2.address(),
    token: 'ETH',
    amount,
    fee
  });
  let transferReceipt = await transfer.awaitReceipt();
  console.log("transfer Receipt:")
  console.log(transferReceipt)

}

async function withdraw() {
  console.log("withdrawing...")
  let withdraw = await SyncWallet.withdrawFromSyncToEthereum({
    ethAddress: ethWallet.address,
    token: 'ETH',
    amount: ethers.utils.parseEther('0.01')
  });


  let withdrawReceipt = await withdraw.awaitVerifyReceipt();
  console.log("withdrawReceipt:")
  console.log(withdrawReceipt)
}
