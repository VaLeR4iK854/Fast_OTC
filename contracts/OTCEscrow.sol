// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OTCEscrow
 * @dev Контракт для безопасной OTC-торговли криптовалютами через эскроу
 * Работает в тестовой сети ZKsync Era
 */
contract OTCEscrow is Ownable, ReentrancyGuard {
    // Структура для хранения информации о сделке
    struct Trade {
        address seller;
        address buyer;
        address token;
        uint256 amount;
        uint256 fiatAmount;
        string fiatCurrency;
        uint256 createdAt;
        uint256 lockedUntil;
        TradeStatus status;
    }

    // Статусы сделки
    enum TradeStatus {
        CREATED,
        FUNDED,
        FIAT_SENT,
        COMPLETED,
        CANCELLED,
        DISPUTED,
        REFUNDED
    }

    // Маппинг для хранения сделок
    mapping(bytes32 => Trade) public trades;
    
    // Массив для хранения всех ID сделок
    bytes32[] public tradeIds;
    
    // Маппинг для хранения сделок пользователя
    mapping(address => bytes32[]) public userTrades;
    
    // Комиссия платформы (0.5%)
    uint256 public constant PLATFORM_FEE = 50; // 0.5% = 50 базисных пунктов
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Адрес для сбора комиссий
    address public feeCollector;
    
    // Период блокировки средств по умолчанию (24 часа)
    uint256 public defaultLockPeriod = 24 hours;

    // События
    event TradeCreated(bytes32 indexed tradeId, address indexed seller, address token, uint256 amount, uint256 fiatAmount, string fiatCurrency);
    event TradeFunded(bytes32 indexed tradeId, address indexed seller);
    event BuyerAssigned(bytes32 indexed tradeId, address indexed buyer);
    event FiatSent(bytes32 indexed tradeId);
    event TradeCompleted(bytes32 indexed tradeId);
    event TradeCancelled(bytes32 indexed tradeId);
    event TradeDisputed(bytes32 indexed tradeId);
    event TradeRefunded(bytes32 indexed tradeId);
    event FeeCollected(bytes32 indexed tradeId, uint256 feeAmount);

    /**
     * @dev Конструктор контракта
     * @param _feeCollector Адрес для сбора комиссий
     */
    constructor(address _feeCollector) Ownable() {
        require(_feeCollector != address(0), "Fee collector cannot be zero address");
        feeCollector = _feeCollector;
    }

    // Остальной код контракта остается без изменений
    // ...
}