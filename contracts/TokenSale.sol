pragma solidity ^0.8.0;
import './Token.sol';
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract TokenSale{
  using SafeMath for uint256;
  address admin;
  Token public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold; 

  constructor(Token _tokenContract, uint256 _tokenPrice){
    //Assign admin
    admin = msg.sender;
    //Token contract
    tokenContract = _tokenContract;
    //Token price
    tokenPrice = _tokenPrice;
  }
  event Sell(
    address indexed buyer,
    uint256 indexed numberOfTokens
  );
  // Buy tokens
  function buyTokens(uint256 _numberOfTokens) external payable{
    // Require that value is equal to tokens
    require(msg.value == _numberOfTokens.mul(tokenPrice));
    // Require that the contract have enought tokens
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
    // Require that a tranfer successfull
    require(tokenContract.transfer(msg.sender,_numberOfTokens));

    // keep track number of tokens sold
    tokensSold += _numberOfTokens;
    
    // emit Sell event
    emit Sell(msg.sender,_numberOfTokens);
   
  }

    //Require Admin
  modifier onlyAdmin(){
    require(msg.sender == admin);
    _;
  } 
  //end token sell
  function endSale() onlyAdmin() external {
    //transfer remaining tokens to admin
    require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
    // destroy contract
    selfdestruct(payable(admin));
    
    
  }
}
