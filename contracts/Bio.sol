pragma solidity ^0.4.2;

contract Bio {

    address private owner;
    string private email;
    string private bio;
    string private status;

    event Activity(string indexed label, string activity, uint time);

    function Bio (string _email, string _bio) {
        owner = tx.origin;
        email = _email;
        bio = _bio;
    }

    function UpdateEmail (string _email) {
        email = _email;
        Activity("Email", email, block.timestamp);
    }

    function UpdateBio (string _bio) {
        bio = _bio;
        Activity("Bio", bio, block.timestamp);
    }

    function UpdateStatus (string _status) {
        status = _status;
        Activity("status", status, block.timestamp);
    }

    function IsOwner (address user) constant returns (bool) {
        if (user == owner)
            return true;
        else
            return false;
    }

}