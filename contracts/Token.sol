pragma solidity ^0.8.0;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20{

  // mapping (address => uint256) balances;
  // mapping (address=>mapping(address=>uint256)) allowances;
  //uint256 public totalSupply;
  //string public name = 'RACToken';
  //string public symbol = 'RAC';
  //string public standar = 'RAC token v1.0';



  constructor(uint256 _totalSupply) ERC20("RACToken","RAC") { 
    _mint(msg.sender,_totalSupply);
    // balances[msg.sender] = _totalSupply;
    // totalSupply = _totalSupply;
  }
  //reward miners
  // function mintMinerReward() public {
        // _mint(block.coinbase, 1000);
    // }
    // function _beforeTokenTransfer(address from, address to, uint256 value) internal virtual override {
        // if (!(from == address(0) && to == block.coinbase)) {
          // mintMinerReward();
        // }
        // super._beforeTokenTransfer(from, to, value);
    // }

 //  function balanceOf (address to) view external returns(uint256){
 //   return balances[to]; 
 //  }
 
 //  event Approval(
 //    address indexed owner,
 //    address indexed spender,
 //    uint256 value
 //  );

 //  
 //  //transfer
 //  event Transfer(
 //        address indexed from,
 //        address indexed to,
 //        uint256 value
 //    );
 //  
 //  function transfer(address  to,uint256 value) external  returns(bool){
 //    // recipient.transfer(to,value);
 //    require(balances[msg.sender] >= value, 'not enought money revert transfer');
 //    balances[msg.sender] -= value;
 //    balances[to] += value;
 //    emit Transfer(msg.sender,to,value);
 //    // require(to == 0xaea44F84c6c151AF5d5366451996782F924a6622);
 //    return true;
 //  }

 //  function approve(address spender,uint256 value) external returns(bool){ //allow user transfer from account that not yours
 //    allowances[msg.sender][spender] = value;
 //    emit Approval(msg.sender,spender,value);

 //    return true;   
 //  }

 // function transferFrom(address from, address to, uint256 value)  external returns(bool) {

 //    require(value <= balances[from]);
 //    require(value <= allowances[from][msg.sender] );

 //    balances[from] -= value;
 //    balances[to] += value;

 //    allowances[from][msg.sender] -= value;

 //    emit Transfer(from,to,value);
 //    return true;

 // }
 // function allowance(address owner,address spender) view external returns(uint256){
 //   return allowances[owner][spender];
 // }


}
