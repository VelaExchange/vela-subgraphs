import {
    ClosePosition as ClosePositionEvent,
    DecreasePosition as DecreasePositionEvent,
    IncreasePosition as IncreasePositionEvent,
    LiquidatePosition as LiquidatePositionEvent,
  } from "../generated/VaultUtils/VaultUtils"
  import {
    BaseGlobalInfo,
    BaseUserInfo,
    ClosePosition,
    DecreasePosition,
    IncreasePosition,
    Mint,
    LiquidatePosition,
    PositionStat,
    Redeem,
    TradeVolume,
    UserTradeStat,
    GlobalInfo,
    StrandedUSDCAmount
  } from "../generated/schema"
  import {
    Deposit as DepositEvent,
    Stake as StakeEvent,
    Unstake as UnstakeEvent,
    Withdraw as WithdrawEvent
  } from "../generated/Vault/Vault"
import { BigInt } from "@graphprotocol/graph-ts"
import { VLP_DECIMALS, MAX_VLP_FOR_Hyper } from "./constants"

  const getRewardAmount = (vlpAmount: BigInt, totalVLP: BigInt): BigInt => {
    if ((totalVLP.plus(vlpAmount)).lt(BigInt.fromString('500000').times(VLP_DECIMALS))) {
      return BigInt.fromString('500')
    } else if ((totalVLP.plus(vlpAmount)).lt(BigInt.fromString('1500000').times(VLP_DECIMALS))) {
      return BigInt.fromString('375')
    } else if ((totalVLP.plus(vlpAmount)).lt(BigInt.fromString('3000000').times(VLP_DECIMALS))) {
      return BigInt.fromString('333')
    } else if ((totalVLP.plus(vlpAmount)).lt(BigInt.fromString('5000000').times(VLP_DECIMALS))) {
      return BigInt.fromString('250')
    } else if ((totalVLP.plus(vlpAmount)).lt(BigInt.fromString('7500000').times(VLP_DECIMALS))) {
      return BigInt.fromString('200')
    } else if ((totalVLP.plus(vlpAmount)).le(BigInt.fromString('10000000').times(VLP_DECIMALS))) {
      return BigInt.fromString('150')
    } else {
      return BigInt.fromString('0')
    }
  }

  export function handleDeposit(event: DepositEvent): void {
    let tradeVolume = TradeVolume.load(event.params.account.toHexString());
    if (!tradeVolume) {
      tradeVolume = new TradeVolume(event.params.account.toHexString())
      tradeVolume.size = BigInt.fromString('0')
      tradeVolume.openLongs = BigInt.fromString('0')
      tradeVolume.openShorts = BigInt.fromString('0')
      tradeVolume.collateralUsage = BigInt.fromString('0') 
      tradeVolume.marginUsage = BigInt.fromString('0') 
      tradeVolume.vusdBalance = BigInt.fromString('0') 
    }
    tradeVolume.vusdBalance = tradeVolume.vusdBalance.plus(event.params.amount)
    tradeVolume.save()
  }

  export function handleWithdraw(event: WithdrawEvent): void {
    let tradeVolume = TradeVolume.load(event.params.account.toHexString());
    if (!tradeVolume) {
      tradeVolume = new TradeVolume(event.params.account.toHexString())
      tradeVolume.size = BigInt.fromString('0')
      tradeVolume.openLongs = BigInt.fromString('0')
      tradeVolume.openShorts = BigInt.fromString('0')
      tradeVolume.collateralUsage = BigInt.fromString('0') 
      tradeVolume.marginUsage = BigInt.fromString('0') 
      tradeVolume.vusdBalance = BigInt.fromString('0') 
    }
    tradeVolume.vusdBalance = tradeVolume.vusdBalance.minus(event.params.amount)
    tradeVolume.save()
  }
  
  export function handleStake(event: StakeEvent): void {
    let vlpMint = new Mint(event.params.account.toHexString() + "-" + event.block.timestamp.toString())
    vlpMint.account = event.params.account.toHexString()
    vlpMint.timestamp = event.block.timestamp.toI32()
    vlpMint.token = event.params.token.toHexString()
    vlpMint.usdAmount = event.params.amount 
    vlpMint.vlpAmount = event.params.mintAmount
    vlpMint.save()
    let baseGlobalInfo = BaseGlobalInfo.load("global")
    if (!baseGlobalInfo) {
      baseGlobalInfo = new BaseGlobalInfo("global")
      baseGlobalInfo.accumulatedSUM = BigInt.fromString('0') 
      baseGlobalInfo.totalVLP = BigInt.fromString('0')
      baseGlobalInfo.totalUSDC = BigInt.fromString('0') 
      baseGlobalInfo.hyper_ended = false
    }
    let baseUserInfo = BaseUserInfo.load(event.params.account.toHexString())
    if (!baseUserInfo) {
      baseUserInfo = new BaseUserInfo(event.params.account.toHexString())
      baseUserInfo.vlp = BigInt.fromString('0') 
      baseUserInfo.vela = BigInt.fromString('0') 
      baseUserInfo.ratio = BigInt.fromString('0') 
      baseUserInfo.baseVLP = BigInt.fromString('0') 
      baseUserInfo.minimumVLP = BigInt.fromString('0') 
      baseUserInfo.mintedVLP = BigInt.fromString('0') 
    }
    if (!baseGlobalInfo.hyper_ended && baseGlobalInfo.totalVLP.le(MAX_VLP_FOR_Hyper)) {
      let rewardAmount = getRewardAmount(event.params.mintAmount, baseGlobalInfo.totalVLP)
      baseGlobalInfo.totalVLP = baseGlobalInfo.totalVLP.plus(event.params.mintAmount)
      baseGlobalInfo.totalUSDC = baseGlobalInfo.totalUSDC.plus(event.params.amount)
      baseUserInfo.vlp = baseUserInfo.vlp.plus(event.params.mintAmount)
      baseUserInfo.vela = baseUserInfo.vela.plus(event.params.mintAmount.times(rewardAmount).div(BigInt.fromString('1000')))
      baseUserInfo.ratio = baseUserInfo.vela.times(BigInt.fromString('1000')).div(baseUserInfo.vlp)
      baseUserInfo.baseVLP = baseUserInfo.baseVLP.plus(event.params.mintAmount)
      baseUserInfo.mintedVLP = baseUserInfo.mintedVLP.plus(event.params.mintAmount)
      baseUserInfo.minimumVLP = baseUserInfo.minimumVLP.plus(event.params.mintAmount)
      if (baseGlobalInfo.totalVLP.ge(MAX_VLP_FOR_Hyper)) {
        baseGlobalInfo.hyper_ended = true
      }
    } else {
      baseGlobalInfo.totalVLP = baseGlobalInfo.totalVLP.plus(event.params.mintAmount)
      baseGlobalInfo.totalUSDC = baseGlobalInfo.totalUSDC.plus(event.params.amount)
      baseGlobalInfo.accumulatedSUM = baseGlobalInfo.accumulatedSUM.minus(baseUserInfo.minimumVLP.times(baseUserInfo.ratio))
      baseUserInfo.mintedVLP = baseUserInfo.mintedVLP.plus(event.params.mintAmount)
      if (baseUserInfo.mintedVLP.lt(baseUserInfo.minimumVLP)) {
        baseUserInfo.minimumVLP = baseUserInfo.mintedVLP
      }
      baseGlobalInfo.accumulatedSUM = baseGlobalInfo.accumulatedSUM.plus(baseUserInfo.minimumVLP.times(baseUserInfo.ratio))
    }
    baseGlobalInfo.save()
    baseUserInfo.save()
  }

  export function handleUnstake(event: UnstakeEvent): void {
    let vlpRedeem = new Redeem(event.params.account.toHexString() + "-" + event.block.timestamp.toString())
    vlpRedeem.account = event.params.account.toHexString()
    vlpRedeem.timestamp = event.block.timestamp.toI32()
    vlpRedeem.token = event.params.token.toHexString()
    vlpRedeem.usdAmount = event.params.amountOut 
    vlpRedeem.vlpAmount = event.params.vlpAmount
    vlpRedeem.save()
    let baseGlobalInfo = BaseGlobalInfo.load("global")
    if (!baseGlobalInfo) {
      baseGlobalInfo = new BaseGlobalInfo("global")
      baseGlobalInfo.accumulatedSUM = BigInt.fromString('0') 
      baseGlobalInfo.totalVLP = BigInt.fromString('0')
      baseGlobalInfo.totalUSDC = BigInt.fromString('0')
      baseGlobalInfo.hyper_ended = false
    }
    let baseUserInfo = BaseUserInfo.load(event.params.account.toHexString())
    if (!baseUserInfo) {
      baseUserInfo = new BaseUserInfo(event.params.account.toHexString())
      baseUserInfo.vlp = BigInt.fromString('0') 
      baseUserInfo.vela = BigInt.fromString('0') 
      baseUserInfo.ratio = BigInt.fromString('0') 
      baseUserInfo.baseVLP = BigInt.fromString('0') 
      baseUserInfo.minimumVLP = BigInt.fromString('0') 
      baseUserInfo.mintedVLP = BigInt.fromString('0') 
    }
    if (baseGlobalInfo.hyper_ended) {
      baseGlobalInfo.totalVLP = baseGlobalInfo.totalVLP.minus(event.params.vlpAmount)
      baseGlobalInfo.totalUSDC = baseGlobalInfo.totalUSDC.minus(event.params.amountOut)
      baseGlobalInfo.accumulatedSUM = baseGlobalInfo.accumulatedSUM.minus(baseUserInfo.minimumVLP.times(baseUserInfo.ratio))
      baseUserInfo.mintedVLP = baseUserInfo.mintedVLP.minus(event.params.vlpAmount)
      if (baseUserInfo.mintedVLP.lt(baseUserInfo.minimumVLP)) {
        baseUserInfo.minimumVLP = baseUserInfo.mintedVLP
      }
      baseGlobalInfo.accumulatedSUM = baseGlobalInfo.accumulatedSUM.plus(baseUserInfo.minimumVLP.times(baseUserInfo.ratio))
    } else {
      baseGlobalInfo.totalVLP = baseGlobalInfo.totalVLP.minus(event.params.vlpAmount)
      baseGlobalInfo.totalUSDC = baseGlobalInfo.totalUSDC.minus(event.params.amountOut)
    }
    baseGlobalInfo.save()
    baseUserInfo.save()
  }

  export function handleClosePosition(event: ClosePositionEvent): void {
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    let closePositionEntity = new ClosePosition(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
    if (positionStatsEntity) {
      let tradeVolumeEntity = TradeVolume.load(positionStatsEntity.account);
      if (!tradeVolumeEntity) {
        tradeVolumeEntity = new TradeVolume(positionStatsEntity.account)
        tradeVolumeEntity.size = BigInt.fromString('0')
        tradeVolumeEntity.openLongs = BigInt.fromString('0')
        tradeVolumeEntity.openShorts = BigInt.fromString('0')
        tradeVolumeEntity.collateralUsage = BigInt.fromString('0') 
        tradeVolumeEntity.marginUsage = BigInt.fromString('0') 
        tradeVolumeEntity.vusdBalance = BigInt.fromString('0') 
      }
      if (positionStatsEntity.isLong) {
        tradeVolumeEntity.openLongs = tradeVolumeEntity.openLongs.minus(positionStatsEntity.size)
      } else {
        tradeVolumeEntity.openShorts = tradeVolumeEntity.openShorts.minus(positionStatsEntity.size)
      }
      tradeVolumeEntity.collateralUsage = tradeVolumeEntity.collateralUsage.minus(positionStatsEntity.collateral)
      tradeVolumeEntity.vusdBalance = tradeVolumeEntity.vusdBalance.plus(positionStatsEntity.collateral.minus(event.params.feeUsd)).plus(event.params.realisedPnl)
      tradeVolumeEntity.marginUsage = tradeVolumeEntity.marginUsage.plus(event.params.feeUsd)
      tradeVolumeEntity.size = tradeVolumeEntity.size.plus(positionStatsEntity.size)
      tradeVolumeEntity.save()
      closePositionEntity.account = positionStatsEntity.account
      closePositionEntity.indexToken = positionStatsEntity.indexToken
      closePositionEntity.isLong = positionStatsEntity.isLong
      closePositionEntity.posId = positionStatsEntity.posId
      let userTradeStatsEntity = new UserTradeStat(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
      userTradeStatsEntity.key = event.params.key.toHexString()
      userTradeStatsEntity.account = positionStatsEntity.account
      userTradeStatsEntity.actionType = "CLOSE_POSITION"
      userTradeStatsEntity.amount = BigInt.fromString("0")
      userTradeStatsEntity.averagePrice = positionStatsEntity.averagePrice
      userTradeStatsEntity.collateral = positionStatsEntity.collateral
      userTradeStatsEntity.createdAt = event.block.timestamp.toI32()
      userTradeStatsEntity.fees = event.params.feeUsd
      userTradeStatsEntity.indexToken = positionStatsEntity.indexToken
      userTradeStatsEntity.isLong = positionStatsEntity.isLong
      userTradeStatsEntity.isPlus = true
      userTradeStatsEntity.isWin = true
      userTradeStatsEntity.markPrice = event.params.markPrice
      userTradeStatsEntity.posId = positionStatsEntity.posId
      userTradeStatsEntity.positionType = positionStatsEntity.positionType
      userTradeStatsEntity.profitLoss = event.params.realisedPnl
      userTradeStatsEntity.tradeVolume = positionStatsEntity.size
      userTradeStatsEntity.save()
      positionStatsEntity.closedAt = event.block.timestamp.toI32()
      positionStatsEntity.feeUsd = positionStatsEntity.feeUsd.plus(event.params.feeUsd)
      positionStatsEntity.markPrice = event.params.markPrice
      positionStatsEntity.realisedPnl = positionStatsEntity.realisedPnl.plus(event.params.realisedPnl)
      positionStatsEntity.positionStatus = "CLOSED"
      positionStatsEntity.save()
      let globaInfo = GlobalInfo.load(positionStatsEntity.indexToken)
      if (!globaInfo) {
        globaInfo = new GlobalInfo(positionStatsEntity.indexToken)
        globaInfo.token = positionStatsEntity.indexToken
        globaInfo.realisedPnl = BigInt.fromString('0')
        globaInfo.unRealisedPnl = BigInt.fromString('0')
        globaInfo.fees = BigInt.fromString('0')
      }
      globaInfo.realisedPnl = globaInfo.realisedPnl.minus(event.params.realisedPnl)
      globaInfo.fees = globaInfo.fees.plus(event.params.feeUsd)
      globaInfo.save()
      let side = positionStatsEntity.isLong ? "long" : "short"
      let sideGlobalInfo = GlobalInfo.load(positionStatsEntity.indexToken + "-" + side)
      if (!sideGlobalInfo) {
        sideGlobalInfo = new GlobalInfo(positionStatsEntity.indexToken + "-" + side)
        sideGlobalInfo.token = positionStatsEntity.indexToken
        sideGlobalInfo.realisedPnl = BigInt.fromString('0')
        sideGlobalInfo.unRealisedPnl = BigInt.fromString('0')
        sideGlobalInfo.fees = BigInt.fromString('0')
      }
      sideGlobalInfo.realisedPnl = sideGlobalInfo.realisedPnl.minus(event.params.realisedPnl)
      sideGlobalInfo.fees = sideGlobalInfo.fees.plus(event.params.feeUsd)
      sideGlobalInfo.save()
    } else {
      closePositionEntity.account = '0x0000000000000000000000000000000000000420'
      closePositionEntity.indexToken = '0x0000000000000000000000000000000000000420'
      closePositionEntity.isLong = false
      closePositionEntity.posId = BigInt.fromString('0')
    }
    closePositionEntity.key = event.params.key.toHexString()
    closePositionEntity.realisedPnl = event.params.realisedPnl
    closePositionEntity.markPrice = event.params.markPrice
    closePositionEntity.feeUsd = event.params.feeUsd
    closePositionEntity.timestamp = event.block.timestamp.toI32()
    closePositionEntity.transactionHash = event.transaction.hash.toHexString()
    closePositionEntity.save()
  }
  
  export function handleDecreasePosition(event: DecreasePositionEvent): void {
    let tradeVolumeEntity = TradeVolume.load(event.params.account.toHexString());
    if (!tradeVolumeEntity) {
      tradeVolumeEntity = new TradeVolume(event.params.account.toHexString())
      tradeVolumeEntity.size = BigInt.fromString('0')
      tradeVolumeEntity.openLongs = BigInt.fromString('0')
      tradeVolumeEntity.openShorts = BigInt.fromString('0')
      tradeVolumeEntity.collateralUsage = BigInt.fromString('0') 
      tradeVolumeEntity.marginUsage = BigInt.fromString('0') 
      tradeVolumeEntity.vusdBalance = BigInt.fromString('0') 
    }
    if (event.params.isLong) {
      tradeVolumeEntity.openLongs = tradeVolumeEntity.openLongs.minus(event.params.posData[1])
    } else {
      tradeVolumeEntity.openShorts = tradeVolumeEntity.openShorts.minus(event.params.posData[1])
    }
    tradeVolumeEntity.collateralUsage = tradeVolumeEntity.collateralUsage.minus(event.params.posData[0])
    tradeVolumeEntity.vusdBalance = tradeVolumeEntity.vusdBalance.plus(event.params.posData[0].minus(event.params.posData[6])).plus(event.params.realisedPnl)
    tradeVolumeEntity.marginUsage = tradeVolumeEntity.marginUsage.plus(event.params.posData[6])
    tradeVolumeEntity.size = tradeVolumeEntity.size.plus(event.params.posData[1])
    tradeVolumeEntity.save()
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    if (positionStatsEntity) {
      positionStatsEntity.size = positionStatsEntity.size.minus(event.params.posData[1])
      positionStatsEntity.collateral = positionStatsEntity.collateral.minus(event.params.posData[0])
      positionStatsEntity.reserveAmount = event.params.posData[2]
      positionStatsEntity.entryFundingRate = event.params.posData[3]
      let userTradeStatsEntity = new UserTradeStat(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
      if (positionStatsEntity.averagePrice.ge(BigInt.fromString('0'))) {
        let realisedPnl = event.params.posData[1].times(event.params.posData[5].minus(positionStatsEntity.averagePrice)).div(positionStatsEntity.averagePrice)
        positionStatsEntity.realisedPnl = positionStatsEntity.realisedPnl.plus(realisedPnl)
        userTradeStatsEntity.profitLoss = realisedPnl
        let globaInfo = GlobalInfo.load(positionStatsEntity.indexToken)
        if (!globaInfo) {
          globaInfo = new GlobalInfo(positionStatsEntity.indexToken)
          globaInfo.token = positionStatsEntity.indexToken
          globaInfo.realisedPnl = BigInt.fromString('0')
          globaInfo.unRealisedPnl = BigInt.fromString('0')
          globaInfo.fees = BigInt.fromString('0')
        }
        globaInfo.realisedPnl = globaInfo.realisedPnl.minus(realisedPnl)
        globaInfo.fees = globaInfo.fees.plus(event.params.posData[6])
        globaInfo.save()
        let side = positionStatsEntity.isLong ? "long" : "short"
        let sideGlobalInfo = GlobalInfo.load(positionStatsEntity.indexToken + "-" + side)
        if (!sideGlobalInfo) {
          sideGlobalInfo = new GlobalInfo(positionStatsEntity.indexToken + "-" + side)
          sideGlobalInfo.token = positionStatsEntity.indexToken
          sideGlobalInfo.realisedPnl = BigInt.fromString('0')
          sideGlobalInfo.unRealisedPnl = BigInt.fromString('0')
          sideGlobalInfo.fees = BigInt.fromString('0')
        }
        sideGlobalInfo.realisedPnl = sideGlobalInfo.realisedPnl.minus(realisedPnl)
        sideGlobalInfo.fees = sideGlobalInfo.fees.plus(event.params.posData[6])
        sideGlobalInfo.save()
      } else {
        userTradeStatsEntity.profitLoss = BigInt.fromString('0')
        let globaInfo = GlobalInfo.load(positionStatsEntity.indexToken)
        if (!globaInfo) {
          globaInfo = new GlobalInfo(positionStatsEntity.indexToken)
          globaInfo.token = positionStatsEntity.indexToken
          globaInfo.realisedPnl = BigInt.fromString('0')
          globaInfo.unRealisedPnl = BigInt.fromString('0')
          globaInfo.fees = BigInt.fromString('0')
        }
        globaInfo.fees = globaInfo.fees.plus(event.params.posData[6])
        globaInfo.save()
        let side = positionStatsEntity.isLong ? "long" : "short"
        let sideGlobalInfo = GlobalInfo.load(positionStatsEntity.indexToken + "-" + side)
        if (!sideGlobalInfo) {
          sideGlobalInfo = new GlobalInfo(positionStatsEntity.indexToken + "-" + side)
          sideGlobalInfo.token = positionStatsEntity.indexToken
          sideGlobalInfo.realisedPnl = BigInt.fromString('0')
          sideGlobalInfo.unRealisedPnl = BigInt.fromString('0')
          sideGlobalInfo.fees = BigInt.fromString('0')
        }
        sideGlobalInfo.fees = sideGlobalInfo.fees.plus(event.params.posData[6])
        sideGlobalInfo.save()
      }
      positionStatsEntity.feeUsd = positionStatsEntity.feeUsd.plus(event.params.posData[6])
      positionStatsEntity.averagePrice = event.params.posData[4]
      positionStatsEntity.markPrice = event.params.posData[5]
      positionStatsEntity.save()
      userTradeStatsEntity.key = event.params.key.toHexString()
      userTradeStatsEntity.account = event.params.account.toHexString()
      userTradeStatsEntity.actionType = "DECREASE_POSITION"
      userTradeStatsEntity.amount = BigInt.fromString("0")
      userTradeStatsEntity.averagePrice = positionStatsEntity.averagePrice
      userTradeStatsEntity.collateral = event.params.posData[0]
      userTradeStatsEntity.createdAt = event.block.timestamp.toI32()
      userTradeStatsEntity.fees = event.params.posData[6]
      userTradeStatsEntity.indexToken = event.params.indexToken.toHexString()
      userTradeStatsEntity.isLong = event.params.isLong
      userTradeStatsEntity.isPlus = true
      userTradeStatsEntity.isWin = true
      userTradeStatsEntity.markPrice = event.params.posData[5]
      userTradeStatsEntity.posId = event.params.posId
      userTradeStatsEntity.positionType = positionStatsEntity.positionType
      userTradeStatsEntity.tradeVolume = event.params.posData[1]
      userTradeStatsEntity.save()
    }
    let decreasePositionEntity = new DecreasePosition(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
    decreasePositionEntity.key = event.params.key.toHexString()
    decreasePositionEntity.account = event.params.account.toHexString()
    decreasePositionEntity.averagePrice = event.params.posData[4]
    decreasePositionEntity.collateral = event.params.posData[0]
    decreasePositionEntity.entryFundingRate = event.params.posData[3]
    decreasePositionEntity.feeUsd = event.params.posData[6]
    decreasePositionEntity.indexToken = event.params.indexToken.toHexString()
    decreasePositionEntity.isLong = event.params.isLong
    decreasePositionEntity.markPrice = event.params.posData[5]
    decreasePositionEntity.posId = event.params.posId
    decreasePositionEntity.realisedPnl = event.params.realisedPnl
    decreasePositionEntity.reserveAmount = event.params.posData[2]
    decreasePositionEntity.size = event.params.posData[1]
    decreasePositionEntity.timestamp = event.block.timestamp.toI32()
    decreasePositionEntity.transactionHash = event.transaction.hash.toHexString()
    decreasePositionEntity.save()
  }
  
  export function handleIncreasePosition(event: IncreasePositionEvent): void {
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    if (!positionStatsEntity) {
      positionStatsEntity = new PositionStat(event.params.key.toHexString())
      positionStatsEntity.account = event.params.account.toHexString()
      positionStatsEntity.averagePrice = BigInt.fromString('0')
      positionStatsEntity.collateral = BigInt.fromString('0')
      positionStatsEntity.closedAt = 0
      positionStatsEntity.createdAt = 0
      positionStatsEntity.entryFundingRate = BigInt.fromString('0')
      positionStatsEntity.feeUsd = BigInt.fromString('0')
      positionStatsEntity.indexToken = event.params.indexToken.toHexString()
      positionStatsEntity.isLong = event.params.isLong
      positionStatsEntity.key = event.params.key.toHexString()
      positionStatsEntity.lmtPrice = BigInt.fromString('0')
      positionStatsEntity.markPrice = BigInt.fromString('0')
      positionStatsEntity.orderStatus = "FILLED"
      positionStatsEntity.pendingCollateral = BigInt.fromString('0')
      positionStatsEntity.pendingDelayCollateral = BigInt.fromString('0')
      positionStatsEntity.pendingDelaySize = BigInt.fromString('0')
      positionStatsEntity.pendingSize = BigInt.fromString('0')
      positionStatsEntity.posId = event.params.posId
      positionStatsEntity.positionStatus = "OPEN"
      positionStatsEntity.positionType = "Market Order"
      positionStatsEntity.realisedPnl = BigInt.fromString('0')
      positionStatsEntity.reserveAmount = BigInt.fromString('0')
      positionStatsEntity.size = BigInt.fromString('0')
      positionStatsEntity.stpPrice = BigInt.fromString('0')
    }
    let tradeVolume = TradeVolume.load(event.params.account.toHexString());
    if (!tradeVolume) {
      tradeVolume = new TradeVolume(event.params.account.toHexString())
      tradeVolume.size = BigInt.fromString('0')
      tradeVolume.openLongs = BigInt.fromString('0')
      tradeVolume.openShorts = BigInt.fromString('0')
      tradeVolume.collateralUsage = BigInt.fromString('0') 
      tradeVolume.marginUsage = BigInt.fromString('0') 
      tradeVolume.vusdBalance = BigInt.fromString('0') 
    }
    if (event.params.isLong) {
      tradeVolume.openLongs = tradeVolume.openLongs.plus(event.params.posData[1])
    } else {
      tradeVolume.openShorts = tradeVolume.openShorts.plus(event.params.posData[1])
    }
    tradeVolume.collateralUsage = tradeVolume.collateralUsage.plus(event.params.posData[2].minus(event.params.posData[6]))
    tradeVolume.vusdBalance = tradeVolume.vusdBalance.minus(event.params.posData[2])
    tradeVolume.marginUsage = tradeVolume.marginUsage.plus(event.params.posData[6])
    tradeVolume.size = tradeVolume.size.plus(event.params.posData[1])
    tradeVolume.save()
    let realCollateral = event.params.posData[0].minus(event.params.posData[6])
    positionStatsEntity.averagePrice = event.params.posData[4]
    positionStatsEntity.collateral = positionStatsEntity.collateral.plus(realCollateral)
    positionStatsEntity.createdAt = event.block.timestamp.toI32()
    positionStatsEntity.entryFundingRate = event.params.posData[3]
    positionStatsEntity.feeUsd = positionStatsEntity.feeUsd.plus(event.params.posData[6])
    positionStatsEntity.markPrice = event.params.posData[5]
    positionStatsEntity.reserveAmount = event.params.posData[2]
    positionStatsEntity.size = positionStatsEntity.size.plus(event.params.posData[1])
    positionStatsEntity.save()
    let userTradeStatsEntity = new UserTradeStat(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
    userTradeStatsEntity.key = event.params.key.toHexString()
    userTradeStatsEntity.account = event.params.account.toHexString()
    userTradeStatsEntity.actionType = "OPEN_POSITION"
    userTradeStatsEntity.amount = BigInt.fromString("0")
    userTradeStatsEntity.averagePrice = event.params.posData[4]
    userTradeStatsEntity.collateral = event.params.posData[0].minus(event.params.posData[6])
    userTradeStatsEntity.createdAt = event.block.timestamp.toI32()
    userTradeStatsEntity.fees = event.params.posData[6]
    userTradeStatsEntity.indexToken = event.params.indexToken.toHexString()
    userTradeStatsEntity.isLong = event.params.isLong
    userTradeStatsEntity.isPlus = true
    userTradeStatsEntity.isWin = true
    userTradeStatsEntity.markPrice = event.params.posData[5]
    userTradeStatsEntity.posId = event.params.posId
    userTradeStatsEntity.positionType = positionStatsEntity.positionType
    userTradeStatsEntity.profitLoss = BigInt.fromString('0')
    userTradeStatsEntity.tradeVolume = positionStatsEntity.size
    userTradeStatsEntity.save()
    let globaInfo = GlobalInfo.load(positionStatsEntity.indexToken)
    if (!globaInfo) {
      globaInfo = new GlobalInfo(positionStatsEntity.indexToken)
      globaInfo.token = positionStatsEntity.indexToken
      globaInfo.realisedPnl = BigInt.fromString('0')
      globaInfo.unRealisedPnl = BigInt.fromString('0')
      globaInfo.fees = BigInt.fromString('0')
    }
    globaInfo.fees = globaInfo.fees.plus(event.params.posData[6])
    globaInfo.save()
    let side = positionStatsEntity.isLong ? "long" : "short"
    let sideGlobalInfo = GlobalInfo.load(positionStatsEntity.indexToken + "-" + side)
    if (!sideGlobalInfo) {
      sideGlobalInfo = new GlobalInfo(positionStatsEntity.indexToken + "-" + side)
      sideGlobalInfo.token = positionStatsEntity.indexToken
      sideGlobalInfo.realisedPnl = BigInt.fromString('0')
      sideGlobalInfo.unRealisedPnl = BigInt.fromString('0')
      sideGlobalInfo.fees = BigInt.fromString('0')
    }
    sideGlobalInfo.fees = sideGlobalInfo.fees.plus(event.params.posData[6])
    sideGlobalInfo.save()
    let increasePositionEntity = new IncreasePosition(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
    increasePositionEntity.key = event.params.key.toHexString()
    increasePositionEntity.account = event.params.account.toHexString()
    increasePositionEntity.averagePrice = event.params.posData[4]
    increasePositionEntity.collateral = realCollateral
    increasePositionEntity.entryFundingRate = positionStatsEntity.entryFundingRate
    increasePositionEntity.indexToken = event.params.indexToken.toHexString()
    increasePositionEntity.isLong = event.params.isLong
    increasePositionEntity.feeUsd = event.params.posData[6]
    increasePositionEntity.markPrice = event.params.posData[5]
    increasePositionEntity.posId = event.params.posId
    increasePositionEntity.reserveAmount = positionStatsEntity.reserveAmount
    increasePositionEntity.size = positionStatsEntity.size
    increasePositionEntity.timestamp = event.block.timestamp.toI32()
    increasePositionEntity.transactionHash = event.transaction.hash.toHexString()
    increasePositionEntity.save()
  }
  
  export function handleLiquidatePosition(event: LiquidatePositionEvent): void {
    let liquidatePositionEntity = new LiquidatePosition(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    if (positionStatsEntity) {
      let tradeVolumeEntity = TradeVolume.load(positionStatsEntity.account);
      if (!tradeVolumeEntity) {
        tradeVolumeEntity = new TradeVolume(positionStatsEntity.account)
        tradeVolumeEntity.size = BigInt.fromString('0')
        tradeVolumeEntity.openLongs = BigInt.fromString('0')
        tradeVolumeEntity.openShorts = BigInt.fromString('0')
        tradeVolumeEntity.collateralUsage = BigInt.fromString('0') 
        tradeVolumeEntity.marginUsage = BigInt.fromString('0') 
        tradeVolumeEntity.vusdBalance = BigInt.fromString('0') 
      }
      if (positionStatsEntity.isLong) {
        tradeVolumeEntity.openLongs = tradeVolumeEntity.openLongs.minus(positionStatsEntity.size)
      } else {
        tradeVolumeEntity.openShorts = tradeVolumeEntity.openShorts.minus(positionStatsEntity.size)
      }
      tradeVolumeEntity.collateralUsage = tradeVolumeEntity.collateralUsage.minus(positionStatsEntity.collateral)
      tradeVolumeEntity.marginUsage =  tradeVolumeEntity.marginUsage.plus(event.params.feeUsd)
      tradeVolumeEntity.size = tradeVolumeEntity.size.plus(positionStatsEntity.size)
      tradeVolumeEntity.save()
      liquidatePositionEntity.account = positionStatsEntity.account
      liquidatePositionEntity.indexToken = positionStatsEntity.indexToken
      liquidatePositionEntity.isLong = positionStatsEntity.isLong
      liquidatePositionEntity.posId = positionStatsEntity.posId
      let userTradeStatsEntity = new UserTradeStat(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
      userTradeStatsEntity.key = event.params.key.toHexString()
      userTradeStatsEntity.account = positionStatsEntity.account
      userTradeStatsEntity.actionType = "LIQUIDATE_POSITION"
      userTradeStatsEntity.amount = BigInt.fromString("0")
      userTradeStatsEntity.averagePrice = positionStatsEntity.averagePrice
      userTradeStatsEntity.collateral = positionStatsEntity.collateral
      userTradeStatsEntity.createdAt = event.block.timestamp.toI32()
      userTradeStatsEntity.fees = event.params.feeUsd
      userTradeStatsEntity.indexToken = positionStatsEntity.indexToken
      userTradeStatsEntity.isLong = positionStatsEntity.isLong
      userTradeStatsEntity.isPlus = true
      userTradeStatsEntity.isWin = true
      userTradeStatsEntity.markPrice = event.params.markPrice
      userTradeStatsEntity.posId = positionStatsEntity.posId
      userTradeStatsEntity.positionType = positionStatsEntity.positionType
      userTradeStatsEntity.profitLoss = BigInt.fromString('-1').times(positionStatsEntity.collateral)
      userTradeStatsEntity.tradeVolume = positionStatsEntity.size
      userTradeStatsEntity.save()
      positionStatsEntity.closedAt = event.block.timestamp.toI32()
      positionStatsEntity.markPrice = event.params.markPrice
      positionStatsEntity.feeUsd = positionStatsEntity.feeUsd.plus(event.params.feeUsd)
      positionStatsEntity.realisedPnl = BigInt.fromString('-1').times(positionStatsEntity.collateral)
      positionStatsEntity.positionStatus = "LIQUIDATED"
      positionStatsEntity.save()
      let globaInfo = GlobalInfo.load(positionStatsEntity.indexToken)
      if (!globaInfo) {
        globaInfo = new GlobalInfo(positionStatsEntity.indexToken)
        globaInfo.token = positionStatsEntity.indexToken
        globaInfo.realisedPnl = BigInt.fromString('0')
        globaInfo.unRealisedPnl = BigInt.fromString('0')
        globaInfo.fees = BigInt.fromString('0')
        globaInfo.save()
      }
      globaInfo.realisedPnl = globaInfo.realisedPnl.plus(positionStatsEntity.collateral)
      globaInfo.fees = globaInfo.fees.plus(event.params.feeUsd)
      globaInfo.save()
      let side = positionStatsEntity.isLong ? "long" : "short"
      let sideGlobalInfo = GlobalInfo.load(positionStatsEntity.indexToken + "-" + side)
      if (!sideGlobalInfo) {
        sideGlobalInfo = new GlobalInfo(positionStatsEntity.indexToken + "-" + side)
        sideGlobalInfo.token = positionStatsEntity.indexToken
        sideGlobalInfo.realisedPnl = BigInt.fromString('0')
        sideGlobalInfo.unRealisedPnl = BigInt.fromString('0')
        sideGlobalInfo.fees = BigInt.fromString('0')
      }
      sideGlobalInfo.realisedPnl = sideGlobalInfo.realisedPnl.plus(positionStatsEntity.collateral)
      sideGlobalInfo.fees = sideGlobalInfo.fees.plus(event.params.feeUsd)
      sideGlobalInfo.save()
      let strandedUsdc = StrandedUSDCAmount.load("total")
      if (!strandedUsdc) { 
        strandedUsdc = new StrandedUSDCAmount("total")
        strandedUsdc.amount = BigInt.fromString('0')
      }
      strandedUsdc.amount = strandedUsdc.amount.plus(positionStatsEntity.collateral.minus(event.params.feeUsd))
      strandedUsdc.save()
    } else {
      liquidatePositionEntity.account = '0x0000000000000000000000000000000000000420'
      liquidatePositionEntity.indexToken = '0x0000000000000000000000000000000000000420'
      liquidatePositionEntity.isLong = false
      liquidatePositionEntity.posId = BigInt.fromString('0')
    }
    liquidatePositionEntity.feeUsd = event.params.feeUsd
    liquidatePositionEntity.key = event.params.key.toHexString()
    liquidatePositionEntity.markPrice = event.params.markPrice
    liquidatePositionEntity.realisedPnl = event.params.realisedPnl
    liquidatePositionEntity.timestamp = event.block.timestamp.toI32()
    liquidatePositionEntity.from = event.transaction.from.toHexString()
    liquidatePositionEntity.transactionHash = event.transaction.hash.toHexString()
    liquidatePositionEntity.save()
  }