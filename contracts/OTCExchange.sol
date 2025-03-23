// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract OTCExchange is Ownable {
    // Enum for order status
    enum OrderStatus {
        OPEN,
        LOCKED,
        PAYMENT_SENT,
        COMPLETED,
        CANCELLED
    }

    // Enum for order type
    enum OrderType {
        BUY,
        SELL
    }

    // Struct for order details
    struct Order {
        string id;
        address creator;
        address taker;
        OrderType orderType;
        address stablecoin;
        uint256 amount;
        uint256 price;
        string paymentMethod;
        OrderStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Mapping from order ID to Order
    mapping(string => Order) public orders;
    
    // Array to store all order IDs
    string[] public orderIds;
    
    // Mapping from user address to their order IDs
    mapping(address => string[]) public userOrders;
    
    // Mapping of supported stablecoins
    mapping(address => bool) public supportedStablecoins;
    
    // Events
    event OrderCreated(string orderId, address creator, OrderType orderType, address stablecoin, uint256 amount, uint256 price);
    event OrderTaken(string orderId, address taker);
    event PaymentSent(string orderId);
    event PaymentReceived(string orderId);
    event OrderCompleted(string orderId);
    event OrderCancelled(string orderId);
    
    constructor() Ownable() {
        // Initialize supported stablecoins
        // These would be actual stablecoin contract addresses on the network
        supportedStablecoins[address(0x1)] = true; // USDT
        supportedStablecoins[address(0x2)] = true; // USDC
        supportedStablecoins[address(0x3)] = true; // DAI
    }
    
    // Остальной код контракта остается без изменений
    // ...
}