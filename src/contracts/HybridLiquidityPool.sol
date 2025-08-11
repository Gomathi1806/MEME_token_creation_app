// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title HybridSocialDrivenDynamicLiquidityPool
 * @dev Combines CPMM, CLMM, bonding curves, and social metrics for optimal liquidity management
 */
contract HybridLiquidityPool is ERC20, Ownable, ReentrancyGuard {
    using Math for uint256;

    // Pool configuration
    IERC20 public immutable token;
    IERC20 public immutable baseToken; // WETH on Base
    
    // Liquidity model parameters
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MIN_LIQUIDITY = 1000;
    uint256 public constant SOCIAL_MULTIPLIER_MAX = 2e18; // 2x max
    uint256 public constant BONDING_CURVE_STEEPNESS = 1e15; // 0.001
    
    // Pool state
    uint256 public reserve0; // token reserves
    uint256 public reserve1; // base token reserves
    uint256 public totalLiquidity;
    uint256 public lockEndTime;
    uint256 public socialScore;
    uint256 public volumeAccumulator;
    uint256 public lastUpdateTime;
    
    // Social metrics
    struct SocialMetrics {
        uint256 holderCount;
        uint256 volume24h;
        uint256 socialMentions;
        uint256 communityEngagement;
        uint256 lastUpdate;
    }
    
    SocialMetrics public metrics;
    
    // Liquidity provider tracking
    mapping(address => uint256) public liquidityBalance;
    mapping(address => uint256) public lockTime;
    mapping(address => bool) public isEarlySupporter;
    
    // Events
    event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 baseAmount, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 baseAmount, uint256 liquidity);
    event Swap(address indexed user, uint256 tokenIn, uint256 tokenOut, bool tokenToBase);
    event SocialMetricsUpdated(uint256 newScore, uint256 holderCount, uint256 volume);
    event BondingCurveActivated(uint256 threshold, uint256 newPrice);
    
    constructor(
        address _token,
        address _baseToken,
        string memory _name,
        string memory _symbol,
        uint256 _lockPeriod
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        token = IERC20(_token);
        baseToken = IERC20(_baseToken);
        lockEndTime = block.timestamp + _lockPeriod;
        lastUpdateTime = block.timestamp;
        socialScore = 1e18; // Start with neutral score
    }
    
    /**
     * @dev Add liquidity with social bonuses
     */
    function addLiquidity(
        uint256 tokenAmount,
        uint256 baseAmount,
        uint256 minLiquidity
    ) external nonReentrant returns (uint256 liquidity) {
        require(tokenAmount > 0 && baseAmount > 0, "Invalid amounts");
        
        // Calculate liquidity with social multiplier
        if (totalLiquidity == 0) {
            liquidity = Math.sqrt(tokenAmount * baseAmount) - MIN_LIQUIDITY;
            _mint(address(this), MIN_LIQUIDITY); // Lock minimum liquidity
        } else {
            uint256 liquidityFromToken = (tokenAmount * totalLiquidity) / reserve0;
            uint256 liquidityFromBase = (baseAmount * totalLiquidity) / reserve1;
            liquidity = Math.min(liquidityFromToken, liquidityFromBase);
            
            // Apply social multiplier for early supporters
            if (block.timestamp < lockEndTime + 30 days) {
                liquidity = (liquidity * getSocialMultiplier()) / PRECISION;
                isEarlySupporter[msg.sender] = true;
            }
        }
        
        require(liquidity >= minLiquidity, "Insufficient liquidity");
        
        // Transfer tokens
        token.transferFrom(msg.sender, address(this), tokenAmount);
        baseToken.transferFrom(msg.sender, address(this), baseAmount);
        
        // Update state
        reserve0 += tokenAmount;
        reserve1 += baseAmount;
        totalLiquidity += liquidity;
        liquidityBalance[msg.sender] += liquidity;
        lockTime[msg.sender] = block.timestamp + (isEarlySupporter[msg.sender] ? 90 days : 30 days);
        
        _mint(msg.sender, liquidity);
        
        emit LiquidityAdded(msg.sender, tokenAmount, baseAmount, liquidity);
    }
    
    /**
     * @dev Remove liquidity with time locks
     */
    function removeLiquidity(
        uint256 liquidity,
        uint256 minToken,
        uint256 minBase
    ) external nonReentrant returns (uint256 tokenAmount, uint256 baseAmount) {
        require(liquidity > 0, "Invalid liquidity");
        require(liquidityBalance[msg.sender] >= liquidity, "Insufficient balance");
        require(block.timestamp >= lockTime[msg.sender], "Liquidity locked");
        
        // Calculate amounts with bonding curve adjustment
        tokenAmount = (liquidity * reserve0) / totalLiquidity;
        baseAmount = (liquidity * reserve1) / totalLiquidity;
        
        // Apply bonding curve penalty for large withdrawals
        if (liquidity > totalLiquidity / 10) { // >10% of pool
            uint256 penalty = calculateBondingCurvePenalty(liquidity);
            tokenAmount = (tokenAmount * (PRECISION - penalty)) / PRECISION;
            baseAmount = (baseAmount * (PRECISION - penalty)) / PRECISION;
        }
        
        require(tokenAmount >= minToken && baseAmount >= minBase, "Insufficient output");
        
        // Update state
        reserve0 -= tokenAmount;
        reserve1 -= baseAmount;
        totalLiquidity -= liquidity;
        liquidityBalance[msg.sender] -= liquidity;
        
        _burn(msg.sender, liquidity);
        
        // Transfer tokens
        token.transfer(msg.sender, tokenAmount);
        baseToken.transfer(msg.sender, baseAmount);
        
        emit LiquidityRemoved(msg.sender, tokenAmount, baseAmount, liquidity);
    }
    
    /**
     * @dev Swap tokens with dynamic pricing
     */
    function swap(
        uint256 amountIn,
        uint256 minAmountOut,
        bool tokenToBase
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input");
        
        // Calculate output with hybrid model
        if (tokenToBase) {
            amountOut = getAmountOut(amountIn, reserve0, reserve1);
            require(amountOut >= minAmountOut, "Insufficient output");
            
            token.transferFrom(msg.sender, address(this), amountIn);
            baseToken.transfer(msg.sender, amountOut);
            
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            amountOut = getAmountOut(amountIn, reserve1, reserve0);
            require(amountOut >= minAmountOut, "Insufficient output");
            
            baseToken.transferFrom(msg.sender, address(this), amountIn);
            token.transfer(msg.sender, amountOut);
            
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
        
        // Update volume tracking
        volumeAccumulator += amountIn;
        updateSocialMetrics();
        
        emit Swap(msg.sender, amountIn, amountOut, tokenToBase);
    }
    
    /**
     * @dev Calculate output amount with hybrid pricing model
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public view returns (uint256) {
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "Invalid reserves");
        
        // Base CPMM calculation
        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        uint256 baseOutput = numerator / denominator;
        
        // Apply social multiplier
        uint256 socialMultiplier = getSocialMultiplier();
        uint256 adjustedOutput = (baseOutput * socialMultiplier) / PRECISION;
        
        // Apply bonding curve for large trades
        if (amountIn > reserveIn / 20) { // >5% of reserve
            uint256 bondingAdjustment = calculateBondingCurveAdjustment(amountIn, reserveIn);
            adjustedOutput = (adjustedOutput * bondingAdjustment) / PRECISION;
        }
        
        return adjustedOutput;
    }
    
    /**
     * @dev Calculate social multiplier based on community metrics
     */
    function getSocialMultiplier() public view returns (uint256) {
        if (socialScore == 0) return PRECISION;
        
        // Base multiplier from social score (0.5x to 2x)
        uint256 baseMultiplier = PRECISION / 2 + (socialScore * PRECISION / 2) / PRECISION;
        
        // Volume bonus (up to 1.5x additional)
        uint256 volumeBonus = Math.min(
            (volumeAccumulator * PRECISION / 2) / (reserve1 * 10), // Volume vs liquidity ratio
            PRECISION / 2
        );
        
        // Holder count bonus
        uint256 holderBonus = Math.min(
            (metrics.holderCount * PRECISION / 10) / 1000, // Per 1000 holders = 10% bonus
            PRECISION / 2
        );
        
        uint256 totalMultiplier = baseMultiplier + volumeBonus + holderBonus;
        return Math.min(totalMultiplier, SOCIAL_MULTIPLIER_MAX);
    }
    
    /**
     * @dev Calculate bonding curve penalty for large withdrawals
     */
    function calculateBondingCurvePenalty(uint256 liquidity) internal view returns (uint256) {
        uint256 withdrawalRatio = (liquidity * PRECISION) / totalLiquidity;
        return (withdrawalRatio * withdrawalRatio * BONDING_CURVE_STEEPNESS) / PRECISION;
    }
    
    /**
     * @dev Calculate bonding curve adjustment for large trades
     */
    function calculateBondingCurveAdjustment(
        uint256 amountIn,
        uint256 reserveIn
    ) internal pure returns (uint256) {
        uint256 tradeRatio = (amountIn * PRECISION) / reserveIn;
        uint256 penalty = (tradeRatio * tradeRatio * BONDING_CURVE_STEEPNESS) / PRECISION;
        return PRECISION - Math.min(penalty, PRECISION / 2); // Max 50% penalty
    }
    
    /**
     * @dev Update social metrics (called by oracle or authorized updater)
     */
    function updateSocialMetrics() internal {
        if (block.timestamp >= lastUpdateTime + 1 hours) {
            // Calculate 24h volume
            metrics.volume24h = volumeAccumulator;
            volumeAccumulator = 0;
            
            // Update social score based on various factors
            uint256 newScore = calculateSocialScore();
            socialScore = newScore;
            lastUpdateTime = block.timestamp;
            
            emit SocialMetricsUpdated(socialScore, metrics.holderCount, metrics.volume24h);
        }
    }
    
    /**
     * @dev Calculate social score from various metrics
     */
    function calculateSocialScore() internal view returns (uint256) {
        uint256 score = PRECISION; // Base score
        
        // Volume component (30%)
        if (metrics.volume24h > 0) {
            score += (metrics.volume24h * 3 * PRECISION / 10) / (reserve1 * 100);
        }
        
        // Holder count component (25%)
        score += (metrics.holderCount * PRECISION / 4) / 10000;
        
        // Social mentions component (25%)
        score += (metrics.socialMentions * PRECISION / 4) / 1000;
        
        // Community engagement component (20%)
        score += (metrics.communityEngagement * PRECISION / 5) / 100;
        
        return Math.min(score, SOCIAL_MULTIPLIER_MAX);
    }
    
    /**
     * @dev External function to update social metrics (called by oracle)
     */
    function updateSocialMetricsExternal(
        uint256 _holderCount,
        uint256 _socialMentions,
        uint256 _communityEngagement
    ) external onlyOwner {
        metrics.holderCount = _holderCount;
        metrics.socialMentions = _socialMentions;
        metrics.communityEngagement = _communityEngagement;
        metrics.lastUpdate = block.timestamp;
        
        updateSocialMetrics();
    }
    
    /**
     * @dev Get current pool state
     */
    function getPoolState() external view returns (
        uint256 _reserve0,
        uint256 _reserve1,
        uint256 _totalLiquidity,
        uint256 _socialScore,
        uint256 _socialMultiplier
    ) {
        return (reserve0, reserve1, totalLiquidity, socialScore, getSocialMultiplier());
    }
    
    /**
     * @dev Emergency functions
     */
    function emergencyWithdraw() external onlyOwner {
        require(block.timestamp > lockEndTime + 365 days, "Not in emergency period");
        
        uint256 tokenBalance = token.balanceOf(address(this));
        uint256 baseBalance = baseToken.balanceOf(address(this));
        
        if (tokenBalance > 0) token.transfer(owner(), tokenBalance);
        if (baseBalance > 0) baseToken.transfer(owner(), baseBalance);
    }
}