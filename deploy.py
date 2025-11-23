import json
from web3 import Web3
from solcx import compile_standard, install_solc

# 1. Setup Connection
# Copy RPC SERVER URL from Ganache (usually http://127.0.0.1:7545)
ganache_url = "http://127.0.0.1:7545"
w3 = Web3(Web3.HTTPProvider(ganache_url))
chain_id = 1337  # Ganache default Chain ID
my_address = w3.eth.accounts[0]  # Use the first account
private_key = "0x8bac71f073fe9857a69c0f0a3fd1920c8fac6d9efd79912f019243cf78856c57" # CLICK THE KEY ICON IN GANACHE FOR ACCOUNT 0 TO GET THIS

# 2. Compile Solidity
print("Compiling Smart Contract...")
install_solc("0.8.0")
with open("UserLedger.sol", "r") as file:
    contract_source_code = file.read()

compiled_sol = compile_standard(
    {
        "language": "Solidity",
        "sources": {"UserLedger.sol": {"content": contract_source_code}},
        "settings": {"outputSelection": {"*": {"*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]}}},
    },
    solc_version="0.8.0",
)

bytecode = compiled_sol["contracts"]["UserLedger.sol"]["UserLedger"]["evm"]["bytecode"]["object"]
abi = compiled_sol["contracts"]["UserLedger.sol"]["UserLedger"]["abi"]

# 3. Deploy
print("Deploying...")
UserLedger = w3.eth.contract(abi=abi, bytecode=bytecode)

# Build Transaction
nonce = w3.eth.get_transaction_count(my_address)
transaction = UserLedger.constructor().build_transaction({
    "chainId": chain_id, 
    "gasPrice": w3.eth.gas_price, 
    "from": my_address, 
    "nonce": nonce
})

# Sign & Send
signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

print(f"✅ Contract Deployed at: {tx_receipt.contractAddress}")

# 4. Save Address & ABI so our API can find it
data = {"address": tx_receipt.contractAddress, "abi": abi}
with open("contract_data.json", "w") as outfile:
    json.dump(data, outfile)