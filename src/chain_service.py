import json
import os
from web3 import Web3
from typing import Dict, Any
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()

# 2. Setup Web3 Connection
# We use os.getenv so you can switch to Sepolia later easily
NETWORK_URL = os.getenv("NETWORK_URL", "http://127.0.0.1:7545")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

if not PRIVATE_KEY:
    raise ValueError("❌ Error: PRIVATE_KEY not found in .env file")

w3 = Web3(Web3.HTTPProvider(NETWORK_URL))

# Derive the sender address from the private key
try:
    my_address = w3.eth.account.from_key(PRIVATE_KEY).address
except Exception as e:
    raise ValueError(f"❌ Error: Invalid PRIVATE_KEY. Check your .env file. Details: {e}")

# 3. Load Contract Data
# This file is created by your deploy.py script
CONTRACT_PATH = "contract_data.json"
if not os.path.exists(CONTRACT_PATH):
    raise FileNotFoundError(f"❌ Error: {CONTRACT_PATH} not found. Run deploy.py first.")

with open(CONTRACT_PATH, "r") as f:
    contract_info = json.load(f)

contract = w3.eth.contract(
    address=contract_info["address"], 
    abi=contract_info["abi"]
)

def add_user_to_chain(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Writes new user data to the Blockchain.
    """
    try:
        nonce = w3.eth.get_transaction_count(my_address)
        
        # Call Solidity: addUser(username, role, reason)
        txn = contract.functions.addUser(
            user_data["username"],
            user_data["role"],
            user_data.get("reason", "New User Created")
        ).build_transaction({
            "chainId": int(os.getenv("CHAIN_ID", 1337)),
            "gasPrice": w3.eth.gas_price,
            "from": my_address,
            "nonce": nonce
        })

        # Sign & Send
        signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
        
        # Use .raw_transaction (snake_case)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "status": True,
            "message": "User added to blockchain",
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber
        }

    except Exception as e:
        print(f"Blockchain Error: {e}")
        return {"status": False, "message": str(e)}

def update_user_state(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Updates a user by appending a NEW block.
    
    NOVEL FEATURE: Since the Smart Contract only accepts (username, role, reason),
    we serialize the extra medical data (glucose, etc.) into the 'reason' field
    so it gets stored on-chain safely without needing a contract redeploy.
    """
    try:
        username = user_id 
        
        # Extract known fields
        # If 'role' is not in updates, we use a placeholder or keep it generic
        new_role = updates.get("role", "Update: Medical Record")
        audit_reason = updates.get("reason", "Routine Update")
        
        # PACKING STRATEGY: 
        # Identify all extra fields (Medical Data) to save them
        medical_data = {}
        for key, value in updates.items():
            if key not in ["role", "reason", "user_id"]:
                medical_data[key] = value
        
        # Create a "Smart String" that holds both the reason AND the data
        # Example: "Monthly Checkup | Data: {"glucose": 90, "bp": 120}"
        if medical_data:
            data_string = json.dumps(medical_data)
            final_reason = f"{audit_reason} | Data: {data_string}"
        else:
            final_reason = audit_reason

        # Build Transaction
        nonce = w3.eth.get_transaction_count(my_address)
        
        txn = contract.functions.addUser(
            username,
            new_role,
            final_reason  # <--- We send the packed data here
        ).build_transaction({
            "chainId": int(os.getenv("CHAIN_ID", 1337)),
            "gasPrice": w3.eth.gas_price,
            "from": my_address,
            "nonce": nonce
        })

        signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "status": True,
            "message": f"User updated (Block #{receipt.blockNumber})",
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "data_stored": final_reason
        }

    except Exception as e:
        return {"status": False, "message": str(e)}

def get_chain_data():
    """
    Reads all blocks from the Smart Contract.
    """
    try:
        total_blocks = contract.functions.getChainLength().call()
        history = []
        
        for i in range(total_blocks):
            # Returns: (index, username, role, timestamp, reason)
            block = contract.functions.getBlock(i).call()
            history.append({
                "index": block[0],
                "username": block[1],
                "role": block[2],
                "timestamp": block[3],
                "reason": block[4]
            })
            
        return history
    except Exception as e:
        print(f"Read Error: {e}")
        return []