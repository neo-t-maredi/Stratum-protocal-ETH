// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockPriceFeed
 * @notice Simulates Chainlink price oracle for testing
 * @dev Mimics AggregatorV3Interface for WTI Crude Oil price feed
 * 
 * WHAT THIS IS:
 * In production, we'd use real Chainlink price feeds (e.g., WTI/USD).
 * For testing, this lets us control the oil price to test liquidations.
 * 
 * HOW IT WORKS:
 * - Stores price in 8 decimals (Chainlink standard)
 * - Example: 7500000000 = $75.00 per barrel
 * - setPrice() lets us simulate price crashes for testing
 */
contract MockPriceFeed {
    int256 public price;           // Current oil price (8 decimals)
    uint8 public decimals = 8;     // Chainlink uses 8 decimal places
    
    /// @notice Initialize with starting oil price
    /// @param _initialPrice Price with 8 decimals (e.g., 75 * 10^8 = $75.00)
    constructor(int256 _initialPrice) {
        price = _initialPrice;
    }
    
    /// @notice Get latest price data (matches Chainlink's interface)
    /// @return roundId Round ID (always 1 for mock)
    /// @return answer Current price (8 decimals)
    /// @return startedAt Timestamp (current block)
    /// @return updatedAt Timestamp (current block)
    /// @return answeredInRound Answered round (always 1 for mock)
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (1, price, block.timestamp, block.timestamp, 1);
    }
    
    /// @notice Update price for testing (simulate market changes)
    /// @param _price New price with 8 decimals
    function setPrice(int256 _price) external {
        price = _price;
    }
}