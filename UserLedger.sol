// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserLedger {
    // Define the "Block" structure
    struct UserBlock {
        uint256 index;
        string username;
        string role;
        uint256 timestamp;
        string reason;
    }

    // A list to hold all blocks (The Chain)
    UserBlock[] public chain;

    // Event to broadcast changes (like a log for your frontend)
    event UserAdded(uint256 indexed index, string username, uint256 timestamp);

    // Function to Add a User
    function addUser(string memory _username, string memory _role, string memory _reason) public {
        uint256 newIndex = chain.length; // Next index is current length
        
        // Add to the array
        chain.push(UserBlock({
            index: newIndex,
            username: _username,
            role: _role,
            timestamp: block.timestamp,
            reason: _reason
        }));

        // Emit event so listeners know
        emit UserAdded(newIndex, _username, block.timestamp);
    }

    // Function to get the total number of blocks
    function getChainLength() public view returns (uint256) {
        return chain.length;
    }

    // Function to get a specific block
    function getBlock(uint256 _index) public view returns (UserBlock memory) {
        return chain[_index];
    }
}