// import * as zksync from 'zksync';
// import { Wallet } from 'zksync';

const ethers = require("ethers")
const zksync = require("zksync")
//const Wallet = require("zksync/wallet")

do_it()

async function do_it() {
  const syncProvider = await zksync.getDefaultProvider('rinkeby');
  const ethersProvider = new ethers.getDefaultProvider('rinkeby');

  var MNEMONIC = "boat super strategy equip avoid clock cube original inflict awkward entry inflict";
  const ethWallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(ethersProvider);
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  const deposit = await syncWallet.depositToSyncFromEthereum({
    depositTo: syncWallet.address(),
    token: 'ETH',
    amount: ethers.utils.parseEther('0.01')
  });
  const depositReceipt = await deposit.awaitReceipt();

  depositReceipt = await deposit.awaitVerifyReceipt();
  console.log(depositReceipt)

}
