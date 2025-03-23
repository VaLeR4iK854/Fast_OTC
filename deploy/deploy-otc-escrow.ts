import { Wallet } from "zksync-ethers"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { Deployer } from "@matterlabs/hardhat-zksync-deploy"

// Скрипт для деплоя контракта OTCEscrow в тестовую сеть ZKsync Era
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the OTCEscrow contract`)

  // Инициализируем кошелек на основе приватного ключа
  // ВАЖНО: Это должен быть приватный ключ тестового кошелька, не используйте реальные ключи
  const wallet = new Wallet("26a05d92176bb394ec2c6cbcc2ca0193af896f616b0f6c88541e63ba55f85f1d")

  // Создаем инстанс Deployer
  const deployer = new Deployer(hre, wallet)

  // Адрес для сбора комиссий - замените на свой тестовый адрес
  const feeCollector = "0xc2f3aB27224418A5fCA0bc76D350E3670b198d27"

  // Загружаем артефакт контракта
  const artifact = await deployer.loadArtifact("OTCEscrow")

  // Деплоим контракт с аргументами конструктора
  const otcEscrow = await deployer.deploy(artifact, [feeCollector])

  // Выводим адрес задеплоенного контракта
  console.log(`OTCEscrow was deployed to ${otcEscrow.address}`)

  // Верифицируем контракт в ZKsync Explorer
  console.log("Verifying contract on ZKsync Explorer...")
  await hre.run("verify:verify", {
    address: otcEscrow.address,
    constructorArguments: [feeCollector],
  })

  console.log("Contract verified successfully!")
}

