pragma solidity ^0.8.7;

contract DappToken{
  uint256 public totalSupply;
  mapping (address => uint) balances;
  string public name = 'DappToken';
  string public symbol = 'DAPP';
  string public standar = 'DAPP token v1.0';

  constructor(uint256 _totalSupply){
    balances[msg.sender] = _totalSupply;
    totalSupply = _totalSupply;
  }
  function balanceOf (address to) view external returns(uint256){
   return balances[to]; 
  }
  function balance () view external returns(uint256){
    return balances[msg.sender];
  }

  //transfer
  event Transfer(
        uint date,
        address indexed from,
        address indexed to,
        uint amount
    );
  
  function transfer(address payable to,uint value) external returns(bool){
    // recipient.transfer(to,value);
    require(balances[msg.sender] >= value, 'revert transfer');
    balances[msg.sender] -= value;
    balances[to] += value;
    emit Transfer(block.timestamp,msg.sender,to,value);
    // require(to == 0xaea44F84c6c151AF5d5366451996782F924a6622);
    return true;
  }

}
