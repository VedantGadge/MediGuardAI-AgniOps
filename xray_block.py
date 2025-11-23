from web3 import Web3

# Connect to Ganache
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

# 1. Get Block 3 (The one in your screenshot)
block_3  = w3.eth.get_block(3)
print(f"🔍 BLOCK 3 X-RAY:")
print(f"   Current Hash: {block_3['hash'].hex()}")
print(f"   Parent Hash:  {block_3['parentHash'].hex()}") # <--- THIS is what the GUI is hiding!

print("-" * 40)

# 2. Get Block 1
block_1 = w3.eth.get_block(1)
print(f"🔍 BLOCK 1 DETAILS:")
print(f"   Current Hash: {block_1['hash'].hex()}")

print("-" * 40)

# 3. The Proof
if block_2['parentHash'] == block_1['hash']:
    print("✅ VERIFIED: Block 2 is cryptographically linked to Block 1.")
else:
    print("❌ ERROR: Chain is broken.")