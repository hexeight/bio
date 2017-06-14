pragma solidity ^0.4.2;

import "contracts/Bio.sol";

contract BioDirectory {
    mapping (string => address) private Registry;
    
    event HandleUnavailable(address indexed sender, string indexed handle);
    event HandleAllocated(address indexed sender, string indexed handle, address bio);

    function BioDirectory () { }

    function RegisterBio (string handle, string email, string bio) returns (bool) {
        if (Registry[handle] != 0x0)
        {
            HandleUnavailable(msg.sender, handle);
            return false;
        }
        else
        {
            var b = new Bio(email, bio);
            Registry[handle] = b;
            HandleAllocated(msg.sender, handle, b);
            return true;
        }
    }

    function GetBio (string handle) returns (address) {
        return Registry[handle];
    }
}