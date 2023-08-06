const express = require("express");
const app = express();
const port = 3000;
const ethers = require("ethers");
const { formatEther } = require("ethers");
const {
	symbol,
	name,
	decimals,
	totalSupply,
	balanceOfLp,
} = require("./fetchchain");
const { default: axios } = require("axios");

const Web3 = require("web3");
const { UniswapABI } = require("./uniswapABI");

const wwsurl =
	"wss://proud-white-yard.quiknode.pro/1ed81f6cc7d240e48f5b5a26a9df52562e577262/";
const ethersSocket = new ethers.WebSocketProvider(wwsurl);
const web3Socket = new Web3(wwsurl);

const interface = new ethers.Interface(UniswapABI);

const web3 = new Web3("https://eth.llamarpc.com");

const provider1 = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
const provider2 = new ethers.JsonRpcProvider(
	"https://ethereum.blockpi.network/v1/rpc/public"
);
const provider3 = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
const provider4 = new ethers.JsonRpcProvider("https://ethereum.publicnode.com");
const provider5 = new ethers.JsonRpcProvider(
	"https://eth-mainnet-public.unifra.io"
);
const provider6 = new ethers.JsonRpcProvider(
	"https://eth-mainnet.public.blastapi.io"
);

const node = [provider1, provider2, provider3, provider4, provider5, provider6];

function convertConmons(s) {
	return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getWei(w, dec) {
	const number1 = Number(w.slice(0, Number(dec) * -1));
	const number2 = w.slice(Number(dec) * -1, Number(dec) * -1 + 3);
	return Number(number1 + Number("0." + number2));
}
//============CUSTOM=====================
async function sendMessage(
	percent,
	percentLP,
	name1,
	contractToken1,
	symbol1,
	symbol2,
	owner,
	supply1_,
	decimals1_,
	amountToken1,
	amountToken2,
	amountTokenLP,
	balance
) {
	const url =
		"https://api.telegram.org/bot6493636914:AAGkbVBePEY6qDbuI_Gw1Rs6jn0D23Fk-b4/sendMessage";
	const data = {
		chat_id: "@xrugbotalert",
		text: `⚠️ Warning Remove Liquidity: ${
			percentLP < 10 ? "🟢" : percentLP >= 10 && percentLP < 50 ? "🟡" : "🔴"
		} 

🏷️  *Name: ${name1} (${symbol1})*

*Remove details:*
❌  Removed Token:  *${amountToken1}* ${symbol1} about  *${percent.toFixed(4)}*% of Supply
❌  Removed Liquidity: *${amountTokenLP}* LP about *${percentLP == 100 ? 100 : percentLP.toFixed(4)}* % of Supply LP
✋  Action:   Remove *${amountToken1}* ${symbol1} And *${amountToken2}* ${symbol2} Liquidity From Uniswap V2

*Token Details:*
📈  Contract:  \`${contractToken1}\` ([View Contract](https://etherscan.io/address/${contractToken1}))
🥮  Supply:  *${supply1_}* (+*${decimals1_}* decimals)
👩‍💻  Owner Address:  [${owner}](https://etherscan.io/address/${owner})
💰  Balance:  *${Number(balance).toFixed(3)}* ETH`,
		parse_mode: "MarkDown",
		disable_web_page_preview: 1,
	};
	try {
		await axios.post(url, data);
		return;
	} catch (error) {
		await axios.post(url, {
			chat_id: "@detectethprivate",
			text: `Error Send Mess Telegram
            Error: ${error}`,
		});
	}
}

async function getpair(_contract) {
	try {
		// get info token
		const _symbol = await symbol(_contract);
		const _name = await name(_contract);
		const _decimals = await decimals(_contract);
		const supplyres = await totalSupply(_contract);
		let _supply;
		if (_decimals == 18) {
			_supply = web3.utils.fromWei(supplyres, "ether");
		} else {
			_supply =
				supplyres &&
				supplyres.slice(0, supplyres.length - Number(_decimals));
		}
		if (!_symbol || !_name || !_decimals || !_supply) return;
		return { _symbol, _name, _decimals, _supply };
	} catch (error) {
		return;
	}
}

const checkMethod = (data) => {
	if (
		data.includes("0xbaa2abde") ||
		data.includes("0x02751cec") ||
		data.includes("0xaf2979eb") ||
		data.includes("0xded9382a") ||
		data.includes("0x5b0d5984") ||
		data.includes("0x2195995c")
	) {
		return true;
	} else {
		return false;
	}
};
const decodeFunction = [
	"removeLiquidity(address tokenA,address tokenB,uint liquidity,uint amountAMin,uint amountBMin,address to,uint deadline)",
	"removeLiquidityETH(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline)",
	"removeLiquidityETHWithPermit(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s)",
	"removeLiquidityWithPermit(address tokenA,address tokenB,uint liquidity,uint amountAMin,uint amountBMin,address to,uint deadline,bool approveMax, uint8 v, bytes32 r, bytes32 s)",
	"removeLiquidityETHSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline)",
	"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s)",
];
const getContract = (data) => {
	let decoded;
	decodeFunction.forEach((a) => {
		try {
			decoded = interface.decodeFunctionData(a, data);
		} catch (error) {}
	});
	return decoded?.[0];
};

async function _handleToken(
	_tokenLp,
	_token1,
	_token2,
	_amountToken1,
	_amountToken2,
	_amountTokenLp,
	_owner
) {
	if (!_token2 || !_token1 || !_tokenLp) {
		console.log("token1", _token1);
		console.log("token2", _token2);
		console.log("tokenLP", _tokenLp);
		console.log("No token Found");
		return;
	}
	let percent,
		percentLP,
		token1 = _token1,
		amountToken1,
		symbol1,
		supply1,
		decimals1,
		name1,
		token2 = _token2,
		amountToken2,
		symbol2,
		balanceOwner;
	try {
		const infoToken1 = await getpair(_token1);
		const convertAmount1 = convertConmons(_amountToken1.toString());
		amountToken1 = convertAmount1;
		symbol1 = infoToken1._symbol;
		supply1 = Number(infoToken1._supply).toLocaleString();
		decimals1 = infoToken1._decimals;
		name1 = infoToken1._name;
		percent = (Number(_amountToken1) * 100) / Number(infoToken1._supply);

		const getBalanceOwner = await provider1.getBalance(_owner);
		balanceOwner = formatEther(getBalanceOwner);

		const infoTokenLp = await getpair(_tokenLp);
		const balanceLpOfOwner = await balanceOfLp(_tokenLp, _owner);
		if (Number(infoTokenLp._supply) > Number(_amountTokenLp)) {
			percentLP =
				(Number(_amountTokenLp) * 100) / Number(infoTokenLp._supply);
		} else {
			percentLP = 100;
		}
		if (
			_token2.toLowerCase() ==
			"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()
		) {
			amountToken2 = _amountToken2;
			symbol2 = "ETH";
		} else {
			const infoToken2 = await getpair(_token2);
			const convertAmount2 = convertConmons(_amountToken2.toString());
			amountToken2 = convertAmount2;
			symbol2 = infoToken2._symbol;
		}
		sendMessage(percent,percentLP,name1,token1,symbol1,symbol2,_owner,supply1,decimals1,amountToken1,amountToken2,Number(_amountTokenLp).toFixed(6),balanceOwner)
	} catch (error) {}
}

async function _waitForTransaction(tx, _provider) {
	try {
		const res = await _provider.getTransaction(tx);
		if (res && res["data"]) {
			if (checkMethod(res["data"])) {
				web3.eth
					.getTransactionReceipt(res["hash"])
					.then(async (txn) => {
						console.log("tx: ", tx);
						console.log(".");
						let result = [];
						txn.logs.forEach((a) => {
							try {
								if (a.topics.length >= 3) {
									let transaction = web3.eth.abi.decodeLog(
										[
											{
												type: "address",
												name: "from",
												indexed: true,
											},
											{
												type: "address",
												name: "to",
												indexed: true,
											},
											{
												type: "uint256",
												name: "value",
												indexed: false,
											},
										],
										txn.data,
										[
											a.topics[1],
											a.topics[2],
											web3.utils.hexToNumberString(
												a.data
											),
										]
									);
									result.push({
										from: transaction.from,
										to: transaction.to,
										contract: a.address,
										value: web3.utils.hexToNumberString(
											a.data
										),
									});
								}
							} catch (error) {
								console.log("error: ", error);
							}
						});

						if (result.length > 3) {
							const caddress = getContract(res["data"]);
							let _ownerAddress = txn["from"],
								token1,
								token2,
								tokenLp,
								amountToken1 = 0,
								amountToken2 = 0,
								amountTokenLp = 0,
								amountETH = 0;
							result.forEach(async (a, i) => {
								//Get Info LP
								if (i === 0) {
									const getInfo = await getpair(a.contract);
									if (
										getInfo?._name.toLowerCase() ==
											"uniswap v2" &&
										!tokenLp
									) {
										tokenLp = a.contract;
										amountTokenLp = web3.utils.fromWei(
											a.value,
											"ether"
										);
									}
								}

								// Get ETH if have
								if (
									a.contract.toLowerCase() ==
									"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()
								) {
									amountETH = Number(
										formatEther(a.value)
									).toFixed(3);
								}

								// Get all contract info be sended to owner
								if (
									a.to.toLowerCase() ==
									_ownerAddress.toLowerCase()
								) {
									if (!a?.value || a.value.length > 50)
										return;
									const getInfo = await getpair(a.contract);
									if (!getInfo?._name) return;
									if (!token1 && !token2) {
										token1 = a.contract;
										amountToken1 += getWei(
											a.value,
											getInfo._decimals
										);
									}
									if (
										token1 &&
										!token2 &&
										a.contract.toLowerCase() !==
											token1.toLowerCase()
									) {
										token2 = a.contract;
										amountToken2 += getWei(
											a.value,
											getInfo._decimals
										);
									}
									if (!token2 && result.length === i + 1) {
										token2 =
											"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
										amountToken2 = amountETH;
									}

									if (result.length === i + 1) {
										setTimeout(() => {
											_handleToken(
												tokenLp,
												token1,
												token2,
												amountToken1,
												amountToken2,
												amountTokenLp,
												_ownerAddress
											);
										}, 5000);
									}
								}
							});
						}
					});
			}
		}
	} catch (error) {
		console.log("error wait: ", error);
	}
}

function func() {
	console.clear();
	console.log("============RUNNING===============");
	// const provider = node[Math.floor(Math.random() * 6)];
	// _waitForTransaction(
	// 	"0x537f7cb28c911fda19b7e31159ea9c3e4b33ab6ef180fa0db05348bcf7d94fb2",
	// 	provider
	// );
	// return;
	web3Socket.eth.subscribe("newBlockHeaders", (err, result) => {
		const { number } = result;
		web3.eth.getBlock(number).then(async (_result) => {
			const _txs = _result?.transactions;
			if (_txs) {
				for (let i = 0; i < _txs.length; i++) {
					if (i % 10 === 0) {
						const provider = node[Math.floor(Math.random() * 6)];
						await _waitForTransaction(_txs[i], provider);
					} else {
						const provider = node[Math.floor(Math.random() * 6)];
						_waitForTransaction(_txs[i], provider);
					}
				}
			}
		});
	});
}
function main() {
	try {
		func();
	} catch (error) {
		main();
	}
}
app.listen(port, async function (error) {
	main();
});
