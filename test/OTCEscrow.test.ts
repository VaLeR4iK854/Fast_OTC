import { expect } from "chai"
import { Wallet } from "zksync-web3"
import * as hre from "hardhat"
import { Deployer } from "@matterlabs/hardhat-zksync-deploy"
import * as ethers from "ethers"

describe("OTCEscrow", () => {
  let otcEscrow
  let testToken
  let deployer
  let seller
  let buyer
  let feeCollector
  let tradeId

  const amount = ethers.utils.parseUnits("100", 18) // 100 токенов
  const fiatAmount = ethers.utils.parseUnits("10000", 2) // 100.00 USD

  before(async function () {
    // Пропускаем тесты, если не запущены в локальной сети hardhat
    if (hre.network.name !== "hardhat") {
      this.skip()
    }

    // Создаем тестовые кошельки
    const deployerWallet = Wallet.createRandom()
    const sellerWallet = Wallet.createRandom()
    const buyerWallet = Wallet.createRandom()
    const feeCollectorWallet = Wallet.createRandom()

    deployer = new Deployer(hre, deployerWallet)
    seller = sellerWallet
    buyer = buyerWallet
    feeCollector = feeCollectorWallet.address

    // Деплоим тестовый ERC20 токен
    const testTokenArtifact = await deployer.loadArtifact("TestToken")
    testToken = await deployer.deploy(testTokenArtifact, ["Test Token", "TEST", 18])

    // Минтим токены для продавца
    await testToken.mint(seller.address, amount.mul(10))

    // Деплоим контракт OTCEscrow
    const otcEscrowArtifact = await deployer.loadArtifact("OTCEscrow")
    otcEscrow = await deployer.deploy(otcEscrowArtifact, [feeCollector])
  })

  it("Should create a trade", async () => {
    // Создаем сделку от имени продавца
    const tx = await otcEscrow.connect(seller).createTrade(testToken.address, amount, fiatAmount, "USD")
    const receipt = await tx.wait()

    // Получаем ID созданной сделки из события
    const tradeCreatedEvent = receipt.events.find((event) => event.event === "TradeCreated")
    tradeId = tradeCreatedEvent.args.tradeId

    // Проверяем, что сделка создана с правильными параметрами
    const tradeInfo = await otcEscrow.getTradeInfo(tradeId)
    expect(tradeInfo.seller).to.equal(seller.address)
    expect(tradeInfo.token).to.equal(testToken.address)
    expect(tradeInfo.amount).to.equal(amount)
    expect(tradeInfo.fiatAmount).to.equal(fiatAmount)
    expect(tradeInfo.fiatCurrency).to.equal("USD")
    expect(tradeInfo.status).to.equal(0) // CREATED
  })

  it("Should fund a trade", async () => {
    // Одобряем контракту OTCEscrow тратить токены от имени продавца
    await testToken.connect(seller).approve(otcEscrow.address, amount)

    // Финансируем сделку
    await otcEscrow.connect(seller).fundTrade(tradeId)

    // Проверяем, что статус сделки изменился на FUNDED
    const tradeInfo = await otcEscrow.getTradeInfo(tradeId)
    expect(tradeInfo.status).to.equal(1) // FUNDED

    // Проверяем, что токены переведены на контракт
    const contractBalance = await testToken.balanceOf(otcEscrow.address)
    expect(contractBalance).to.equal(amount)
  })

  it("Should assign a buyer", async () => {
    // Назначаем покупателя
    await otcEscrow.connect(seller).assignBuyer(tradeId, buyer.address)

    // Проверяем, что покупатель назначен
    const tradeInfo = await otcEscrow.getTradeInfo(tradeId)
    expect(tradeInfo.buyer).to.equal(buyer.address)
  })

  it("Should confirm fiat sent", async () => {
    // Подтверждаем отправку фиатных средств
    await otcEscrow.connect(buyer).confirmFiatSent(tradeId)

    // Проверяем, что статус сделки изменился на FIAT_SENT
    const tradeInfo = await otcEscrow.getTradeInfo(tradeId)
    expect(tradeInfo.status).to.equal(2) // FIAT_SENT
  })

  it("Should complete a trade", async () => {
    // Завершаем сделку
    await otcEscrow.connect(seller).completeTrade(tradeId)

    // Проверяем, что статус сделки изменился на COMPLETED
    const tradeInfo = await otcEscrow.getTradeInfo(tradeId)
    expect(tradeInfo.status).to.equal(3) // COMPLETED

    // Рассчитываем комиссию
    const platformFee = amount.mul(50).div(10000) // 0.5%
    const amountAfterFee = amount.sub(platformFee)

    // Проверяем, что токены переведены покупателю
    const buyerBalance = await testToken.balanceOf(buyer.address)
    expect(buyerBalance).to.equal(amountAfterFee)

    // Проверяем, что комиссия переведена на адрес для сбора комиссий
    const feeCollectorBalance = await testToken.balanceOf(feeCollector)
    expect(feeCollectorBalance).to.equal(platformFee)
  })

  it("Should cancel a trade", async () => {
    // Создаем новую сделку
    const tx = await otcEscrow.connect(seller).createTrade(testToken.address, amount, fiatAmount, "USD")
    const receipt = await tx.wait()
    const tradeCreatedEvent = receipt.events.find((event) => event.event === "TradeCreated")
    const newTradeId = tradeCreatedEvent.args.tradeId

    // Отменяем сделку
    await otcEscrow.connect(seller).cancelTrade(newTradeId)

    // Проверяем, что статус сделки изменился на CANCELLED
    const tradeInfo = await otcEscrow.getTradeInfo(newTradeId)
    expect(tradeInfo.status).to.equal(4) // CANCELLED
  })

  it("Should handle disputes", async () => {
    // Создаем новую сделку
    const tx = await otcEscrow.connect(seller).createTrade(testToken.address, amount, fiatAmount, "USD")
    const receipt = await tx.wait()
    const tradeCreatedEvent = receipt.events.find((event) => event.event === "TradeCreated")
    const newTradeId = tradeCreatedEvent.args.tradeId

    // Одобряем контракту OTCEscrow тратить токены от имени продавца
    await testToken.connect(seller).approve(otcEscrow.address, amount)

    // Финансируем сделку
    await otcEscrow.connect(seller).fundTrade(newTradeId)

    // Назначаем покупателя
    await otcEscrow.connect(seller).assignBuyer(newTradeId, buyer.address)

    // Открываем спор
    await otcEscrow.connect(buyer).disputeTrade(newTradeId)

    // Проверяем, что статус сделки изменился на DISPUTED
    let tradeInfo = await otcEscrow.getTradeInfo(newTradeId)
    expect(tradeInfo.status).to.equal(5) // DISPUTED

    // Разрешаем спор в пользу продавца (возврат средств)
    await otcEscrow.connect(deployer.zkWallet).refundToSeller(newTradeId)

    // Проверяем, что статус сделки изменился на REFUNDED
    tradeInfo = await otcEscrow.getTradeInfo(newTradeId)
    expect(tradeInfo.status).to.equal(6) // REFUNDED

    // Проверяем, что токены возвращены продавцу
    const sellerBalance = await testToken.balanceOf(seller.address)
    expect(sellerBalance).to.be.gt(0)
  })
})

