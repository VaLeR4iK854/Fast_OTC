import { Wallet, Provider, Contract } from "zksync-web3"
import * as ethers from "ethers"
import type { HardhatRuntimeEnvironment } from "hardhat/types"

// Скрипт для взаимодействия с контрактом OTCEscrow в тестовой сети ZKsync Era
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running interaction script for the OTCEscrow contract`)

  // Инициализируем провайдер для тестовой сети ZKsync Era
  const provider = new Provider("https://testnet.era.zksync.dev")

  // Инициализируем кошелек на основе приватного ключа
  // ВАЖНО: Это должен быть приватный ключ тестового кошелька, не используйте реальные ключи
  const wallet = new Wallet("<PRIVATE_KEY>", provider)

  // Адрес задеплоенного контракта OTCEscrow
  const otcEscrowAddress = "<OTC_ESCROW_CONTRACT_ADDRESS>"

  // Адрес тестового ERC20 токена
  const testTokenAddress = "<TEST_TOKEN_ADDRESS>"

  // Загружаем артефакт контракта
  const artifact = await hre.artifacts.readArtifact("OTCEscrow")

  // Создаем инстанс контракта
  const otcEscrow = new Contract(otcEscrowAddress, artifact.abi, wallet)

  // Загружаем артефакт ERC20 токена
  const erc20Artifact = await hre.artifacts.readArtifact("IERC20")

  // Создаем инстанс ERC20 токена
  const testToken = new Contract(testTokenAddress, erc20Artifact.abi, wallet)

  // Проверяем баланс токенов
  const balance = await testToken.balanceOf(wallet.address)
  console.log(`Token balance: ${ethers.utils.formatUnits(balance, 18)} TEST`)

  // Одобряем контракту OTCEscrow тратить токены от имени кошелька
  const amount = ethers.utils.parseUnits("100", 18) // 100 токенов
  const approveTx = await testToken.approve(otcEscrowAddress, amount)
  await approveTx.wait()
  console.log(`Approved ${ethers.utils.formatUnits(amount, 18)} TEST tokens for OTCEscrow contract`)

  // Создаем новую сделку
  const fiatAmount = ethers.utils.parseUnits("10000", 2) // 100.00 USD
  const createTradeTx = await otcEscrow.createTrade(testTokenAddress, amount, fiatAmount, "USD")
  const createTradeReceipt = await createTradeTx.wait()

  // Получаем ID созданной сделки из события
  const tradeCreatedEvent = createTradeReceipt.events?.find((event) => event.event === "TradeCreated")
  const tradeId = tradeCreatedEvent?.args?.tradeId
  console.log(`Created trade with ID: ${tradeId}`)

  // Финансируем сделку (переводим токены на контракт)
  const fundTradeTx = await otcEscrow.fundTrade(tradeId)
  await fundTradeTx.wait()
  console.log(`Funded trade with ID: ${tradeId}`)

  // Назначаем покупателя для сделки
  const buyerAddress = "<BUYER_ADDRESS>"
  const assignBuyerTx = await otcEscrow.assignBuyer(tradeId, buyerAddress)
  await assignBuyerTx.wait()
  console.log(`Assigned buyer ${buyerAddress} to trade with ID: ${tradeId}`)

  // Имитируем подтверждение отправки фиатных средств покупателем
  // Для этого нам нужно переключиться на кошелек покупателя
  const buyerWallet = new Wallet("<BUYER_PRIVATE_KEY>", provider)
  const otcEscrowAsBuyer = new Contract(otcEscrowAddress, artifact.abi, buyerWallet)

  const confirmFiatSentTx = await otcEscrowAsBuyer.confirmFiatSent(tradeId)
  await confirmFiatSentTx.wait()
  console.log(`Buyer confirmed fiat sent for trade with ID: ${tradeId}`)

  // Завершаем сделку и переводим токены покупателю
  // Переключаемся обратно на кошелек продавца
  const completeTradeTx = await otcEscrow.completeTrade(tradeId)
  await completeTradeTx.wait()
  console.log(`Completed trade with ID: ${tradeId}`)

  // Проверяем баланс токенов у покупателя
  const buyerBalance = await testToken.balanceOf(buyerAddress)
  console.log(`Buyer token balance: ${ethers.utils.formatUnits(buyerBalance, 18)} TEST`)

  console.log("Interaction with OTCEscrow contract completed successfully!")
}

