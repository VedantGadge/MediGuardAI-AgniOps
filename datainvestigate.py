import json
import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# 1. Setup
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
# Load the ABI (The Dictionary required to decode)
with open("contract_data.json", "r") as f:
    data = json.load(f)
    abi = data["abi"]
    address = data["address"]

contract = w3.eth.contract(address=address, abi=abi)

def investigate_data():
    print("🕵️‍♂️ INVESTIGATING DATA ON GANACHE...\n")

    # First, get the total number of blocks
    try:
        block_count = contract.functions.getBlockCount().call()
        print(f"📊 Total blocks stored: {block_count}\n")
    except:
        print("⚠️  Could not get block count. Trying to read blocks...\n")
        block_count = None

    # Try to read all blocks
    if block_count:
        for i in range(block_count):
            try:
                raw_data = contract.functions.getBlock(i).call()
                print(f"✅ BLOCK #{i} - DECODED DATA:")
                print(f"   - Index:    {raw_data[0]}")
                print(f"   - Username: {raw_data[1]}")
                print(f"   - Role:     {raw_data[2]}")
                print(f"   - Time:     {raw_data[3]}")
                print("-" * 40)
            except Exception as e:
                print(f"❌ Could not read block {i}: {e}")
                print("-" * 40)
    else:
        # If getBlockCount doesn't exist, try reading up to 20 blocks
        found_blocks = []
        max_check = 20  # Check up to index 20
        
        for i in range(max_check):
            try:
                raw_data = contract.functions.getBlock(i).call()
                found_blocks.append(i)
                print(f"✅ BLOCK #{i} - DECODED DATA:")
                print(f"   - Index:    {raw_data[0]}")
                print(f"   - Username: {raw_data[1]}")
                print(f"   - Role:     {raw_data[2]}")
                print(f"   - Time:     {raw_data[3]}")
                print("-" * 40)
            except:
                # Block doesn't exist at this index, continue checking
                pass
        
        print(f"\n📍 Found {len(found_blocks)} blocks total at indices: {found_blocks}")

    # 2. THE RAW HEX (What Ganache actually stores)
    # To see this, we look at the transaction input data
    # Get the last block
    block = w3.eth.get_block('latest', full_transactions=True)
    if len(block.transactions) > 0:
        tx = block.transactions[0]
        print(f"🤖 RAW HEX DATA (What Ganache stores):")
        print(f"   - Input: {tx['input'][:60]}... (This continues for miles)")
        print("\n   (This massive hex string contains 'Alice' hidden inside it!)")

if __name__ == "__main__":
    investigate_data()