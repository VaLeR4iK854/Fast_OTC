// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev Тестовый ERC20 токен для использования в тестовой сети ZKsync Era
 */
contract TestToken is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @dev Конструктор контракта
     * @param name_ Название токена
     * @param symbol_ Символ токена
     * @param decimals_ Количество десятичных знаков
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) Ownable() {
        _decimals = decimals_;
    }

    /**
     * @dev Возвращает количество десятичных знаков токена
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Минтит токены на указанный адрес
     * @param to Адрес получателя
     * @param amount Количество токенов
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Сжигает токены с указанного адреса
     * @param from Адрес, с которого сжигаются токены
     * @param amount Количество токенов
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}