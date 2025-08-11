// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MemeToken is ERC20, Ownable {
    uint256 public immutable INITIAL_SUPPLY;
    uint256 public immutable CREATION_TIME;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address creator
    ) ERC20(name, symbol) Ownable(creator) {
        INITIAL_SUPPLY = totalSupply;
        CREATION_TIME = block.timestamp;
        _mint(creator, totalSupply);
    }
}

contract SimpleTokenFactory is ReentrancyGuard {
    uint256 public constant PLATFORM_FEE = 0.001 ether; // 0.001 ETH platform fee
    address public immutable PLATFORM_WALLET;
    
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 initialLiquidity;
        uint256 lockPeriod;
        uint256 creationTime;
        address creator;
    }
    
    mapping(address => address[]) public createdTokens;
    mapping(address => TokenInfo) public tokenInfo;
    
    event PlatformFeeCollected(address indexed creator, uint256 amount);
    
    event TokenCreated(
        address indexed creator,
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 initialLiquidity,
        uint256 lockPeriod
    );
    
    constructor(address _platformWallet) {
        PLATFORM_WALLET = _platformWallet;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 initialLiquidity,
        uint256 lockPeriod
    ) external payable nonReentrant returns (address tokenAddress) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(msg.value >= PLATFORM_FEE, "Insufficient fee");
        require(lockPeriod >= 30 days, "Lock period must be at least 30 days");
        
        // Collect platform fee
        (bool feeSuccess, ) = PLATFORM_WALLET.call{value: PLATFORM_FEE}("");
        require(feeSuccess, "Platform fee transfer failed");
        emit PlatformFeeCollected(msg.sender, PLATFORM_FEE);
        
        // Deploy new token contract
        MemeToken token = new MemeToken(name, symbol, totalSupply, msg.sender);
        tokenAddress = address(token);
        
        // Store token info
        tokenInfo[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            name: name,
            symbol: symbol,
            totalSupply: totalSupply,
            initialLiquidity: initialLiquidity,
            lockPeriod: lockPeriod,
            creationTime: block.timestamp,
            creator: msg.sender
        });
        
        // Add to creator's tokens
        createdTokens[msg.sender].push(tokenAddress);
        
        // Refund excess ETH
        if (msg.value > PLATFORM_FEE) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - PLATFORM_FEE}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit TokenCreated(
            msg.sender,
            tokenAddress,
            name,
            symbol,
            totalSupply,
            initialLiquidity,
            lockPeriod
        );
        
        return tokenAddress;
    }
    
    function getCreatedTokens(address creator) external view returns (address[] memory) {
        return createdTokens[creator];
    }
    
    function getTokenInfo(address tokenAddress) external view returns (TokenInfo memory) {
        return tokenInfo[tokenAddress];
    }
}