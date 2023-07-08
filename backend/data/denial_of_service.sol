pragma solidity ^0.4.15;

//Auction susceptible to DoS attack
contract DosAuction {
  address currentFrontrunner;
  uint currentBid;

  //Takes in bid, refunding the frontrunner if they are outbid
  function bid() payable {
    require(msg.value > currentBid);

    //If the refund fails, the entire transaction reverts.
    //Therefore a frontrunner who always fails will win
    if (currentFrontrunner != 0) {
      //E.g. if recipients fallback function is just revert()
      require(currentFrontrunner.send(currentBid));
    }

    currentFrontrunner = msg.sender;
    currentBid         = msg.value;
  }
}


//Secure auction that cannot be DoS'd
contract SecureAuction {
  address currentFrontrunner;
  uint    currentBid;
  //Store refunds in mapping to avoid DoS
  mapping(address => uint) refunds;

  //Avoids "pushing" balance to users favoring "pull" architecture
  function bid() payable external {
    require(msg.value > currentBid);

    if (currentFrontrunner != 0) {
      refunds[currentFrontrunner] += currentBid;
    }

    currentFrontrunner = msg.sender;
    currentBid         = msg.value;
  }

  //Allows users to get their refund from auction
  function withdraw() external {
    //Do all state manipulation before external call to
    //avoid reentrancy attack
    uint refund = refunds[msg.sender];
    refunds[msg.sender] = 0;

    msg.sender.send(refund);
  }
}


pragma solidity ^0.4.15;

contract CrowdFundBad {
  address[] private refundAddresses;
  mapping(address => uint) public refundAmount;

  function refundDos() public {
    for(uint i; i < refundAddresses.length; i++) {
      require(refundAddresses[i].transfer(refundAmount[refundAddresses[i]]));
    }
  }
}

contract CrowdFundPull {
  address[] private refundAddresses;
  mapping(address => uint) public refundAmount;

  function withdraw() external {
    uint refund = refundAmount[msg.sender];
    refundAmount[msg.sender] = 0;
    msg.sender.transfer(refund);
  }
}


//This is safe against the list length causing out of gas issues
//but is not safe against the payee causing the execution to revert
contract CrowdFundSafe {
  address[] private refundAddresses;
  mapping(address => uint) public refundAmount;
  uint256 nextIdx;
  
  function refundSafe() public {
    uint256 i = nextIdx;
    while(i < refundAddresses.length && msg.gas > 200000) {
      refundAddresses[i].transfer(refundAmount[i]);
      i++;
    }
    nextIdx = i;
  }
}
