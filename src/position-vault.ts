import {
    ClosePosition as ClosePositionEvent,
    DecreasePosition as DecreasePositionEvent,
    IncreasePosition as IncreasePositionEvent,
    CreateAddPositionOrder,
    AddOrRemoveCollateral,
    AddOrRemoveCollateral2,
    AddPositionExecutionError,
    CreateDecreasePositionOrder,
    DecreasePositionExecutionError,
    ExecuteAddPositionOrder,
    ExecuteDecreasePositionOrder,
    MarketOrderExecutionError
  } from "../generated/PositionVault/PositionVault"

import {
    DailyInfo,
    DailyTrade,
    DailyVolume,
    AllTrade,
    ClosePosition,
    DecreasePosition,
    DailyGlobalInfo,
    IncreasePosition,
    PositionStat,
    PositionTrigger,
    TradeVolume,
    UserAccountStat,
    DailyUserAccountStat,
  } from "../generated/schema"
import { processAllTrades, processDailyTrades, processGlobalInfo, processUserTradeStats  } from "./process"
import { BigInt } from "@graphprotocol/graph-ts"
import { 
    BIG_NUM_ZERO,
    ZERO_ADDRESS,
    getAccountDailyTradesId,
    getDailyInfoId,
    getDayStartDate,
 } from "./constants"


  export function handleAddOrRemoveCollateral(event: AddOrRemoveCollateral): void {
    let positionStatsEntity = PositionStat.load(event.params.posId.toString())
    if (positionStatsEntity) {
      processUserTradeStats(
        event.params.posId,
        event.block.timestamp,
        positionStatsEntity.account,
        "EDIT_COLLATERAL",
        event.params.amount,
        positionStatsEntity.averagePrice,
        event.params.collateral,
        BIG_NUM_ZERO,
        BIG_NUM_ZERO,
        BIG_NUM_ZERO,
        positionStatsEntity.isLong,
        event.params.isPlus,
        true,
        positionStatsEntity.markPrice,
        positionStatsEntity.positionType,
        BIG_NUM_ZERO,
        BIG_NUM_ZERO,
        positionStatsEntity.refer,
        event.params.size,
        positionStatsEntity.tokenId,
        event.transaction.hash.toHexString()
      )
      let dailyInfoId = getDailyInfoId(event.block.timestamp)
      let dailyTradesId = getAccountDailyTradesId(positionStatsEntity.account, event.block.timestamp)
      let dailyTrades = DailyTrade.load(dailyTradesId)
      if (!dailyTrades) {
          dailyTrades = new DailyTrade(dailyTradesId)
          dailyTrades.account = positionStatsEntity.account
          dailyTrades.collateral = BIG_NUM_ZERO
          dailyTrades.fees = BIG_NUM_ZERO
          dailyTrades.timestamp = getDayStartDate(event.block.timestamp);
          dailyTrades.tradeVolume = BIG_NUM_ZERO
          dailyTrades.profitLoss = BIG_NUM_ZERO
          dailyTrades.tradeCount = 0
          dailyTrades.winCount = 0 
          dailyTrades.lossCount = 0
          dailyTrades.leverage = BIG_NUM_ZERO
      }
      if (event.params.isPlus) {
          dailyTrades.collateral = dailyTrades.collateral.plus(event.params.amount)
      } else {
          dailyTrades.collateral = dailyTrades.collateral.minus(event.params.amount)
      }
      if (dailyTrades.collateral.equals(BIG_NUM_ZERO)) {
          dailyTrades.leverage = BIG_NUM_ZERO
      } else {
          dailyTrades.leverage = dailyTrades.tradeVolume.times(BigInt.fromString("1000")).div(dailyTrades.collateral)
      }
      dailyTrades.save()
      let allTrades = AllTrade.load(positionStatsEntity.account)
      if (!allTrades) {
      allTrades = new AllTrade(positionStatsEntity.account)
      allTrades.account = positionStatsEntity.account
      allTrades.collateral = BIG_NUM_ZERO
      allTrades.fees = BIG_NUM_ZERO
      allTrades.tradeVolume = BIG_NUM_ZERO
      allTrades.profitLoss = BIG_NUM_ZERO
      allTrades.tradeCount = 0
      allTrades.winCount = 0 
      allTrades.lossCount = 0
      allTrades.leverage = BIG_NUM_ZERO
      }
      if (event.params.isPlus) {
          allTrades.collateral = allTrades.collateral.plus(event.params.amount)
      } else {
          allTrades.collateral = allTrades.collateral.minus(event.params.amount)
      }
      if (allTrades.collateral.equals(BIG_NUM_ZERO)) {
          allTrades.leverage = BIG_NUM_ZERO
      } else {
          allTrades.leverage = allTrades.tradeVolume.times(BigInt.fromString("1000")).div(allTrades.collateral)
      }
      allTrades.save()
      if (event.params.isPlus) {
        positionStatsEntity.totalCollateral = positionStatsEntity.totalCollateral.plus(event.params.amount)
        positionStatsEntity.totalIncreasedCollateral = positionStatsEntity.totalIncreasedCollateral.plus(event.params.amount)
        if (event.params.collateral.gt(positionStatsEntity.maxCollateral)){
          positionStatsEntity.maxCollateral = event.params.collateral
        }
      } else {
        positionStatsEntity.totalCollateral = positionStatsEntity.totalCollateral.minus(event.params.amount)
      }
      positionStatsEntity.collateral = event.params.collateral
      positionStatsEntity.size = event.params.size
      positionStatsEntity.save()
      let userAccountStatsEntity = UserAccountStat.load(positionStatsEntity.account)
      if (userAccountStatsEntity) {
        if (event.params.isPlus) {
          userAccountStatsEntity.collateral = userAccountStatsEntity.collateral.plus(event.params.amount)
          userAccountStatsEntity.trades = userAccountStatsEntity.trades.plus(BigInt.fromString('1'))
          userAccountStatsEntity.leverage = BigInt.fromString('1000').times(userAccountStatsEntity.volume).div(userAccountStatsEntity.collateral)
        } else {
          if (userAccountStatsEntity.collateral.gt(event.params.amount)) {
            userAccountStatsEntity.collateral = userAccountStatsEntity.collateral.minus(event.params.amount)
            userAccountStatsEntity.trades = userAccountStatsEntity.trades.plus(BigInt.fromString('1'))
            userAccountStatsEntity.leverage = BigInt.fromString('1000').times(userAccountStatsEntity.volume).div(userAccountStatsEntity.collateral)
          }
        }
        userAccountStatsEntity.save()
      }
      let dailyInfo = DailyInfo.load(dailyInfoId)
      if (!dailyInfo) {
        dailyInfo = new DailyInfo(dailyInfoId)
        dailyInfo.fees = BIG_NUM_ZERO
        dailyInfo.trades = BIG_NUM_ZERO
        dailyInfo.users = BIG_NUM_ZERO
        dailyInfo.newUsers = BIG_NUM_ZERO
        dailyInfo.volumes = BIG_NUM_ZERO
        dailyInfo.longOI = BIG_NUM_ZERO
        dailyInfo.shortOI = BIG_NUM_ZERO
        dailyInfo.pnls = BIG_NUM_ZERO
        dailyInfo.liquidations = BIG_NUM_ZERO
        dailyInfo.timestamp = getDayStartDate(event.block.timestamp)
        dailyInfo.save()
      }
      let userDailyAccountStatsEntity = DailyUserAccountStat.load(dailyTradesId)
      if (!userDailyAccountStatsEntity) {
        dailyInfo.users = dailyInfo.users.plus(BigInt.fromString('1'))
        userDailyAccountStatsEntity = new DailyUserAccountStat(dailyTradesId)
        userDailyAccountStatsEntity.account = positionStatsEntity.account
        userDailyAccountStatsEntity.biggestWin = BIG_NUM_ZERO
        userDailyAccountStatsEntity.collateral = BIG_NUM_ZERO
        userDailyAccountStatsEntity.leverage = BIG_NUM_ZERO
        userDailyAccountStatsEntity.losses = BIG_NUM_ZERO
        userDailyAccountStatsEntity.profitLoss = BIG_NUM_ZERO
        userDailyAccountStatsEntity.trades = BIG_NUM_ZERO
        userDailyAccountStatsEntity.timestamp = getDayStartDate(event.block.timestamp)
        userDailyAccountStatsEntity.volume = BIG_NUM_ZERO
        userDailyAccountStatsEntity.wins = BIG_NUM_ZERO       
      }
      if (event.params.isPlus) {
        userDailyAccountStatsEntity.collateral = userDailyAccountStatsEntity.collateral.plus(event.params.amount)
        userDailyAccountStatsEntity.trades = userDailyAccountStatsEntity.trades.plus(BigInt.fromString('1'))
        userDailyAccountStatsEntity.leverage = BigInt.fromString('1000').times(userDailyAccountStatsEntity.volume).div(userDailyAccountStatsEntity.collateral)
      } else {
        if (userDailyAccountStatsEntity.collateral.gt(event.params.amount)) {
          userDailyAccountStatsEntity.collateral = userDailyAccountStatsEntity.collateral.minus(event.params.amount)
          userDailyAccountStatsEntity.trades = userDailyAccountStatsEntity.trades.plus(BigInt.fromString('1'))
          userDailyAccountStatsEntity.leverage = BigInt.fromString('1000').times(userDailyAccountStatsEntity.volume).div(userDailyAccountStatsEntity.collateral)
        }
      }
      userDailyAccountStatsEntity.save()
      dailyInfo.trades = dailyInfo.trades.plus(BigInt.fromString('1'))
      dailyInfo.save()
      let tradeVolume = TradeVolume.load(positionStatsEntity.account);
      if (!tradeVolume) {
        tradeVolume = new TradeVolume(positionStatsEntity.account)
        tradeVolume.account = positionStatsEntity.account
        tradeVolume.size = BIG_NUM_ZERO
        tradeVolume.openLongs = BIG_NUM_ZERO
        tradeVolume.openShorts = BIG_NUM_ZERO
        tradeVolume.collateralUsage = BIG_NUM_ZERO
        tradeVolume.marginUsage = BIG_NUM_ZERO
        tradeVolume.vusdBalance = BIG_NUM_ZERO 
      }
      if (event.params.isPlus) {
          tradeVolume.collateralUsage = tradeVolume.collateralUsage.plus(event.params.amount)
      } else {
          tradeVolume.collateralUsage = tradeVolume.collateralUsage.minus(event.params.amount)
      }
      tradeVolume.save()
    }   
  }

  export function handleAddOrRemoveCollateral2(event: AddOrRemoveCollateral2): void {
    let positionStatsEntity = PositionStat.load(event.params.posId.toString())
    if (positionStatsEntity) {
      processUserTradeStats(
        event.params.posId,
        event.block.timestamp,
        positionStatsEntity.account,
        "EDIT_COLLATERAL",
        event.params.amount,
        positionStatsEntity.averagePrice,
        event.params.collateral,
        BIG_NUM_ZERO,
        BIG_NUM_ZERO,
        BIG_NUM_ZERO,
        positionStatsEntity.isLong,
        event.params.isPlus,
        true,
        positionStatsEntity.markPrice,
        positionStatsEntity.positionType,
        BIG_NUM_ZERO,
        BIG_NUM_ZERO,
        positionStatsEntity.refer,
        event.params.size,
        positionStatsEntity.tokenId,
        event.transaction.hash.toHexString()
      )
      let dailyInfoId = getDailyInfoId(event.block.timestamp)
      let dailyTradesId = getAccountDailyTradesId(positionStatsEntity.account, event.block.timestamp)
      let dailyTrades = DailyTrade.load(dailyTradesId)
      if (!dailyTrades) {
          dailyTrades = new DailyTrade(dailyTradesId)
          dailyTrades.account = positionStatsEntity.account
          dailyTrades.collateral = BIG_NUM_ZERO
          dailyTrades.fees = BIG_NUM_ZERO
          dailyTrades.timestamp = getDayStartDate(event.block.timestamp);
          dailyTrades.tradeVolume = BIG_NUM_ZERO
          dailyTrades.profitLoss = BIG_NUM_ZERO
          dailyTrades.tradeCount = 0
          dailyTrades.winCount = 0 
          dailyTrades.lossCount = 0
          dailyTrades.leverage = BIG_NUM_ZERO
      }
      if (event.params.isPlus) {
          dailyTrades.collateral = dailyTrades.collateral.plus(event.params.amount)
      } else {
          dailyTrades.collateral = dailyTrades.collateral.minus(event.params.amount)
      }
      if (dailyTrades.collateral.equals(BIG_NUM_ZERO)) {
          dailyTrades.leverage = BIG_NUM_ZERO
      } else {
          dailyTrades.leverage = dailyTrades.tradeVolume.times(BigInt.fromString("1000")).div(dailyTrades.collateral)
      }
      dailyTrades.save()
      let allTrades = AllTrade.load(positionStatsEntity.account)
      if (!allTrades) {
      allTrades = new AllTrade(positionStatsEntity.account)
      allTrades.account = positionStatsEntity.account
      allTrades.collateral = BIG_NUM_ZERO
      allTrades.fees = BIG_NUM_ZERO
      allTrades.tradeVolume = BIG_NUM_ZERO
      allTrades.profitLoss = BIG_NUM_ZERO
      allTrades.tradeCount = 0
      allTrades.winCount = 0 
      allTrades.lossCount = 0
      allTrades.leverage = BIG_NUM_ZERO
      }
      if (event.params.isPlus) {
          allTrades.collateral = allTrades.collateral.plus(event.params.amount)
      } else {
          allTrades.collateral = allTrades.collateral.minus(event.params.amount)
      }
      if (allTrades.collateral.equals(BIG_NUM_ZERO)) {
          allTrades.leverage = BIG_NUM_ZERO
      } else {
          allTrades.leverage = allTrades.tradeVolume.times(BigInt.fromString("1000")).div(allTrades.collateral)
      }
      allTrades.save()
      if (event.params.isPlus) {
        positionStatsEntity.totalCollateral = positionStatsEntity.totalCollateral.plus(event.params.amount)
        positionStatsEntity.totalIncreasedCollateral = positionStatsEntity.totalIncreasedCollateral.plus(event.params.amount)
        if (event.params.collateral.gt(positionStatsEntity.maxCollateral)){
          positionStatsEntity.maxCollateral = event.params.collateral
        }
      } else {
        positionStatsEntity.totalCollateral = positionStatsEntity.totalCollateral.minus(event.params.amount)
      }
      positionStatsEntity.collateral = event.params.collateral
      positionStatsEntity.size = event.params.size
      positionStatsEntity.save()
      let userAccountStatsEntity = UserAccountStat.load(positionStatsEntity.account)
      if (userAccountStatsEntity) {
        if (event.params.isPlus) {
          userAccountStatsEntity.collateral = userAccountStatsEntity.collateral.plus(event.params.amount)
          userAccountStatsEntity.trades = userAccountStatsEntity.trades.plus(BigInt.fromString('1'))
          userAccountStatsEntity.leverage = BigInt.fromString('1000').times(userAccountStatsEntity.volume).div(userAccountStatsEntity.collateral)
        } else {
          if (userAccountStatsEntity.collateral.gt(event.params.amount)) {
            userAccountStatsEntity.collateral = userAccountStatsEntity.collateral.minus(event.params.amount)
            userAccountStatsEntity.trades = userAccountStatsEntity.trades.plus(BigInt.fromString('1'))
            userAccountStatsEntity.leverage = BigInt.fromString('1000').times(userAccountStatsEntity.volume).div(userAccountStatsEntity.collateral)
          }
        }
        userAccountStatsEntity.save()
      }
      let dailyInfo = DailyInfo.load(dailyInfoId)
      if (!dailyInfo) {
        dailyInfo = new DailyInfo(dailyInfoId)
        dailyInfo.fees = BIG_NUM_ZERO
        dailyInfo.trades = BIG_NUM_ZERO
        dailyInfo.users = BIG_NUM_ZERO
        dailyInfo.newUsers = BIG_NUM_ZERO
        dailyInfo.volumes = BIG_NUM_ZERO
        dailyInfo.longOI = BIG_NUM_ZERO
        dailyInfo.shortOI = BIG_NUM_ZERO
        dailyInfo.pnls = BIG_NUM_ZERO
        dailyInfo.liquidations = BIG_NUM_ZERO
        dailyInfo.timestamp = getDayStartDate(event.block.timestamp)
        dailyInfo.save()
      }
      let userDailyAccountStatsEntity = DailyUserAccountStat.load(dailyTradesId)
      if (!userDailyAccountStatsEntity) {
        dailyInfo.users = dailyInfo.users.plus(BigInt.fromString('1'))
        userDailyAccountStatsEntity = new DailyUserAccountStat(dailyTradesId)
        userDailyAccountStatsEntity.account = positionStatsEntity.account
        userDailyAccountStatsEntity.biggestWin = BIG_NUM_ZERO
        userDailyAccountStatsEntity.collateral = BIG_NUM_ZERO
        userDailyAccountStatsEntity.leverage = BIG_NUM_ZERO
        userDailyAccountStatsEntity.losses = BIG_NUM_ZERO
        userDailyAccountStatsEntity.profitLoss = BIG_NUM_ZERO
        userDailyAccountStatsEntity.trades = BIG_NUM_ZERO
        userDailyAccountStatsEntity.timestamp = getDayStartDate(event.block.timestamp)
        userDailyAccountStatsEntity.volume = BIG_NUM_ZERO
        userDailyAccountStatsEntity.wins = BIG_NUM_ZERO       
      }
      if (event.params.isPlus) {
        userDailyAccountStatsEntity.collateral = userDailyAccountStatsEntity.collateral.plus(event.params.amount)
        userDailyAccountStatsEntity.trades = userDailyAccountStatsEntity.trades.plus(BigInt.fromString('1'))
        userDailyAccountStatsEntity.leverage = BigInt.fromString('1000').times(userDailyAccountStatsEntity.volume).div(userDailyAccountStatsEntity.collateral)
      } else {
        if (userDailyAccountStatsEntity.collateral.gt(event.params.amount)) {
          userDailyAccountStatsEntity.collateral = userDailyAccountStatsEntity.collateral.minus(event.params.amount)
          userDailyAccountStatsEntity.trades = userDailyAccountStatsEntity.trades.plus(BigInt.fromString('1'))
          userDailyAccountStatsEntity.leverage = BigInt.fromString('1000').times(userDailyAccountStatsEntity.volume).div(userDailyAccountStatsEntity.collateral)
        }
      }
      userDailyAccountStatsEntity.save()
      dailyInfo.trades = dailyInfo.trades.plus(BigInt.fromString('1'))
      dailyInfo.save()
      let tradeVolume = TradeVolume.load(positionStatsEntity.account);
      if (!tradeVolume) {
        tradeVolume = new TradeVolume(positionStatsEntity.account)
        tradeVolume.account = positionStatsEntity.account
        tradeVolume.size = BIG_NUM_ZERO
        tradeVolume.openLongs = BIG_NUM_ZERO
        tradeVolume.openShorts = BIG_NUM_ZERO
        tradeVolume.collateralUsage = BIG_NUM_ZERO
        tradeVolume.marginUsage = BIG_NUM_ZERO
        tradeVolume.vusdBalance = BIG_NUM_ZERO 
      }
      if (event.params.isPlus) {
          tradeVolume.collateralUsage = tradeVolume.collateralUsage.plus(event.params.amount)
      } else {
          tradeVolume.collateralUsage = tradeVolume.collateralUsage.minus(event.params.amount)
      }
      tradeVolume.save()
    }   
  }
 export function handleClosePosition(event: ClosePositionEvent): void {
    let positionStatsEntity = PositionStat.load(event.params.posId.toString())
    let closePositionEntity = new ClosePosition(event.params.posId.toString() + "-" + event.block.timestamp.toString())
    let feeUsd = event.params.posData[4].plus(event.params.pnlData[1]).plus(event.params.pnlData[2])
    let realisedPnl = event.params.pnlData[0].minus(event.params.posData[4])
    let newROI = BIG_NUM_ZERO
    if (positionStatsEntity) {
      if (positionStatsEntity.maxCollateral.gt(BIG_NUM_ZERO)) {
        newROI = BigInt.fromString('100000').times(realisedPnl).div(positionStatsEntity.maxCollateral)
      }
      let tradeVolumeEntity = TradeVolume.load(positionStatsEntity.account);
      if (!tradeVolumeEntity) {
        tradeVolumeEntity = new TradeVolume(positionStatsEntity.account)
        tradeVolumeEntity.account = positionStatsEntity.account
        tradeVolumeEntity.size = BIG_NUM_ZERO
        tradeVolumeEntity.openLongs = BIG_NUM_ZERO
        tradeVolumeEntity.openShorts = BIG_NUM_ZERO
        tradeVolumeEntity.collateralUsage = BIG_NUM_ZERO
        tradeVolumeEntity.marginUsage = BIG_NUM_ZERO
        tradeVolumeEntity.vusdBalance = BIG_NUM_ZERO
        tradeVolumeEntity.save()
      }
      if (positionStatsEntity.isLong) {
        tradeVolumeEntity.openLongs = tradeVolumeEntity.openLongs.minus(positionStatsEntity.size)
      } else {
        tradeVolumeEntity.openShorts = tradeVolumeEntity.openShorts.minus(positionStatsEntity.size)
      }
      tradeVolumeEntity.collateralUsage = tradeVolumeEntity.collateralUsage.minus(positionStatsEntity.collateral)
      tradeVolumeEntity.marginUsage = tradeVolumeEntity.marginUsage.plus(feeUsd)
      tradeVolumeEntity.size = tradeVolumeEntity.size.plus(positionStatsEntity.size)
      tradeVolumeEntity.save()
      closePositionEntity.account = positionStatsEntity.account
      closePositionEntity.tokenId = positionStatsEntity.tokenId
      closePositionEntity.isLong = positionStatsEntity.isLong
      closePositionEntity.posId = positionStatsEntity.posId
      processUserTradeStats(
        positionStatsEntity.posId,
        event.block.timestamp,
        positionStatsEntity.account,
        "CLOSE_POSITION",
        BIG_NUM_ZERO,
        positionStatsEntity.averagePrice,
        positionStatsEntity.collateral,
        event.params.posData[4],
        event.params.pnlData[1],
        event.params.pnlData[2],
        positionStatsEntity.isLong,
        true,
        true,
        event.params.posData[3],
        positionStatsEntity.positionType,
        realisedPnl,
        newROI,
        positionStatsEntity.refer,
        positionStatsEntity.size,
        positionStatsEntity.tokenId,
        event.transaction.hash.toHexString()
      )
      let dailyInfoId = getDailyInfoId(event.block.timestamp)
      let dailyTradesId = getAccountDailyTradesId(positionStatsEntity.account, event.block.timestamp)
      let dailyVolumeId = getAccountDailyTradesId(positionStatsEntity.tokenId.toString(), event.block.timestamp)
      processDailyTrades(
        dailyTradesId,
        positionStatsEntity.account, 
        positionStatsEntity.collateral, 
        feeUsd,
        realisedPnl.gt(BIG_NUM_ZERO),
        realisedPnl.lt(BIG_NUM_ZERO),
        realisedPnl,
        positionStatsEntity.size,
        event.block.timestamp
      )
      processAllTrades(
        positionStatsEntity.account, 
        positionStatsEntity.collateral, 
        feeUsd,
        realisedPnl.gt(BIG_NUM_ZERO),
        realisedPnl.lt(BIG_NUM_ZERO),
        realisedPnl,
        positionStatsEntity.size
      )
      let dailyVolume = DailyVolume.load(dailyVolumeId)
      if (!dailyVolume) {
        dailyVolume = new DailyVolume(dailyVolumeId)
        dailyVolume.volume = BIG_NUM_ZERO
        dailyVolume.tokenId = positionStatsEntity.tokenId
        dailyVolume.timestamp = getDayStartDate(event.block.timestamp)
        dailyVolume.tradeCounts = 0
      }
      dailyVolume.volume = dailyVolume.volume.plus(positionStatsEntity.size)
      dailyVolume.tradeCounts += 1
      dailyVolume.save()
      let dailyGlobalInfoId = getAccountDailyTradesId("global", event.block.timestamp)
      let dailyGlobalInfo = DailyGlobalInfo.load(dailyGlobalInfoId)
      if (!dailyGlobalInfo) {
        dailyGlobalInfo = new DailyGlobalInfo(dailyGlobalInfoId)
        dailyGlobalInfo.fees = BIG_NUM_ZERO
        dailyGlobalInfo.timestamp = getDayStartDate(event.block.timestamp)
        dailyGlobalInfo.openInterests = BIG_NUM_ZERO
        dailyGlobalInfo.tradeVolume = BIG_NUM_ZERO
        dailyGlobalInfo.tradeCounts = 0
      }
      dailyGlobalInfo.fees = dailyGlobalInfo.fees.plus(feeUsd)
      dailyGlobalInfo.openInterests = dailyGlobalInfo.openInterests.minus(positionStatsEntity.size)
      dailyGlobalInfo.tradeVolume = dailyGlobalInfo.tradeVolume.plus(positionStatsEntity.size)
      dailyGlobalInfo.tradeCounts += 1
      dailyGlobalInfo.save()
      positionStatsEntity.closedAt = event.block.timestamp.toI32()
      positionStatsEntity.lastUpdateTime = event.block.timestamp.toI32()
      positionStatsEntity.closeHash = event.transaction.hash.toHexString()
      positionStatsEntity.positionFee = positionStatsEntity.positionFee.plus(event.params.posData[4])
      positionStatsEntity.fundingFee = positionStatsEntity.fundingFee.plus(event.params.pnlData[1])
      positionStatsEntity.borrowFee = positionStatsEntity.borrowFee.plus(event.params.pnlData[2])
      positionStatsEntity.markPrice = event.params.posData[3]
      positionStatsEntity.realisedPnl = positionStatsEntity.realisedPnl.plus(realisedPnl)
      positionStatsEntity.totalROI = positionStatsEntity.totalROI.plus(newROI)
      positionStatsEntity.positionStatus = "CLOSED"
      positionStatsEntity.totalClosedSize = positionStatsEntity.totalClosedSize.plus(positionStatsEntity.size)
      positionStatsEntity.save()
      let userAccountStatsEntity = UserAccountStat.load(positionStatsEntity.account)
      if (userAccountStatsEntity) {
        if (positionStatsEntity.realisedPnl.gt(userAccountStatsEntity.biggestWin)) {
          userAccountStatsEntity.biggestWin = positionStatsEntity.realisedPnl;
        }
        if (realisedPnl.gt(BIG_NUM_ZERO)) {
          userAccountStatsEntity.wins = userAccountStatsEntity.wins.plus(BigInt.fromString("1"))
        } else if (realisedPnl.lt(BIG_NUM_ZERO)){
          userAccountStatsEntity.losses = userAccountStatsEntity.losses.plus(BigInt.fromString("1"))
        }
        userAccountStatsEntity.collateral = userAccountStatsEntity.collateral.plus(event.params.posData[0])
        userAccountStatsEntity.profitLoss = userAccountStatsEntity.profitLoss.plus(realisedPnl)
        userAccountStatsEntity.trades = userAccountStatsEntity.trades.plus(BigInt.fromString('1'))
        userAccountStatsEntity.volume = userAccountStatsEntity.volume.plus(event.params.posData[1])
        userAccountStatsEntity.leverage = BigInt.fromString('1000').times(userAccountStatsEntity.volume).div(userAccountStatsEntity.collateral)
        userAccountStatsEntity.save()
      }
      let dailyInfo = DailyInfo.load(dailyInfoId)
      if (!dailyInfo) {
        dailyInfo = new DailyInfo(dailyInfoId)
        dailyInfo.fees = BIG_NUM_ZERO
        dailyInfo.trades = BIG_NUM_ZERO
        dailyInfo.users = BIG_NUM_ZERO
        dailyInfo.newUsers = BIG_NUM_ZERO
        dailyInfo.volumes = BIG_NUM_ZERO
        dailyInfo.longOI = BIG_NUM_ZERO
        dailyInfo.shortOI = BIG_NUM_ZERO
        dailyInfo.pnls = BIG_NUM_ZERO
        dailyInfo.liquidations = BIG_NUM_ZERO
        dailyInfo.timestamp = getDayStartDate(event.block.timestamp)
        dailyInfo.save()
      }
      let userDailyAccountStatsEntity = DailyUserAccountStat.load(dailyTradesId)
      if (!userDailyAccountStatsEntity) {
        dailyInfo.users = dailyInfo.users.plus(BigInt.fromString('1'))
        userDailyAccountStatsEntity = new DailyUserAccountStat(dailyTradesId)
        userDailyAccountStatsEntity.account = positionStatsEntity.account
        userDailyAccountStatsEntity.biggestWin = BIG_NUM_ZERO
        userDailyAccountStatsEntity.collateral = BIG_NUM_ZERO
        userDailyAccountStatsEntity.leverage = BIG_NUM_ZERO
        userDailyAccountStatsEntity.losses = BIG_NUM_ZERO
        userDailyAccountStatsEntity.profitLoss = BIG_NUM_ZERO
        userDailyAccountStatsEntity.trades = BIG_NUM_ZERO
        userDailyAccountStatsEntity.timestamp = getDayStartDate(event.block.timestamp)
        userDailyAccountStatsEntity.volume = BIG_NUM_ZERO
        userDailyAccountStatsEntity.wins = BIG_NUM_ZERO       
      }
      if (positionStatsEntity.realisedPnl.gt(userDailyAccountStatsEntity.biggestWin)) {
        userDailyAccountStatsEntity.biggestWin = positionStatsEntity.realisedPnl;
      }
      if (realisedPnl.gt(BIG_NUM_ZERO)) {
        userDailyAccountStatsEntity.wins = userDailyAccountStatsEntity.wins.plus(BigInt.fromString("1"))
      } else if (realisedPnl.lt(BIG_NUM_ZERO)){
        userDailyAccountStatsEntity.losses = userDailyAccountStatsEntity.losses.plus(BigInt.fromString("1"))
      }
      userDailyAccountStatsEntity.collateral = userDailyAccountStatsEntity.collateral.plus(event.params.posData[0])
      userDailyAccountStatsEntity.profitLoss = userDailyAccountStatsEntity.profitLoss.plus(realisedPnl)
      userDailyAccountStatsEntity.trades = userDailyAccountStatsEntity.trades.plus(BigInt.fromString('1'))
      userDailyAccountStatsEntity.volume = userDailyAccountStatsEntity.volume.plus(event.params.posData[1])
      userDailyAccountStatsEntity.leverage = BigInt.fromString('1000').times(userDailyAccountStatsEntity.volume).div(userDailyAccountStatsEntity.collateral)
      userDailyAccountStatsEntity.save()
      dailyInfo.pnls = dailyInfo.pnls.plus(realisedPnl)
      dailyInfo.trades = dailyInfo.trades.plus(BigInt.fromString('1'))
      dailyInfo.volumes = dailyInfo.volumes.plus(event.params.posData[1])
      dailyInfo.fees = dailyInfo.fees.plus(event.params.posData[4]).plus(event.params.pnlData[1]).plus(event.params.pnlData[2])
      dailyInfo.save()
      let positionTriggerEntity = PositionTrigger.load(event.params.posId.toString())
      if (positionTriggerEntity) {
        positionTriggerEntity.status = "CLOSED";
        positionTriggerEntity.save()
      }
      processGlobalInfo(
        positionStatsEntity.tokenId, 
        positionStatsEntity.isLong, 
        event.params.pnlData[0].gt(BIG_NUM_ZERO),
        event.params.pnlData[0].lt(BIG_NUM_ZERO),
        event.params.pnlData[0],
        event.params.posData[4],
        positionStatsEntity.size)
    } else {
      closePositionEntity.account = '0x0000000000000000000000000000000000000420'
      closePositionEntity.tokenId = BIG_NUM_ZERO
      closePositionEntity.isLong = false
      closePositionEntity.posId = BIG_NUM_ZERO
    }
    closePositionEntity.realisedPnl = realisedPnl
    closePositionEntity.markPrice = event.params.posData[3]
    closePositionEntity.positionFee = event.params.posData[4]
    closePositionEntity.fundingFee = event.params.pnlData[1]
    closePositionEntity.borrowFee = event.params.pnlData[2]
    closePositionEntity.timestamp = event.block.timestamp.toI32()
    closePositionEntity.transactionHash = event.transaction.hash.toHexString()
    closePositionEntity.save()
  }
  
  export function handleDecreasePosition(event: DecreasePositionEvent): void {
    let decreasePositionEntity = new DecreasePosition(event.params.posId.toString() + "-" + event.block.timestamp.toString())
    let feeUsd = event.params.posData[4].plus(event.params.pnlData[1]).plus(event.params.pnlData[2])
    let realisedPnl = event.params.pnlData[0].minus(event.params.posData[4])
    decreasePositionEntity.account = event.params.account.toHexString()
    decreasePositionEntity.averagePrice = event.params.posData[2]
    decreasePositionEntity.collateral = event.params.posData[0]
    decreasePositionEntity.positionFee = event.params.posData[4]
    decreasePositionEntity.fundingFee = event.params.pnlData[1]
    decreasePositionEntity.borrowFee = event.params.pnlData[2]
    decreasePositionEntity.tokenId = event.params.tokenId
    decreasePositionEntity.isLong = event.params.isLong
    decreasePositionEntity.markPrice = event.params.posData[3]
    decreasePositionEntity.posId = event.params.posId
    decreasePositionEntity.realisedPnl = realisedPnl
    decreasePositionEntity.size = event.params.posData[1]
    decreasePositionEntity.timestamp = event.block.timestamp.toI32()
    decreasePositionEntity.transactionHash = event.transaction.hash.toHexString()
    decreasePositionEntity.save()
    let positionStatsEntity = PositionStat.load(event.params.posId.toString())
    if (positionStatsEntity) {
      positionStatsEntity.size = positionStatsEntity.size.minus(event.params.posData[1])
      positionStatsEntity.totalClosedSize = positionStatsEntity.totalClosedSize.plus(event.params.posData[1])
      positionStatsEntity.collateral = positionStatsEntity.collateral.minus(event.params.posData[0])
      positionStatsEntity.realisedPnl = positionStatsEntity.realisedPnl.plus(realisedPnl)
      let newROI = BIG_NUM_ZERO
      if (positionStatsEntity.maxCollateral.gt(BIG_NUM_ZERO)) {
        newROI = BigInt.fromString('100000').times(realisedPnl).div(positionStatsEntity.maxCollateral)
        positionStatsEntity.totalROI = positionStatsEntity.totalROI.plus(newROI)
      }
      processGlobalInfo(
        positionStatsEntity.tokenId, 
        positionStatsEntity.isLong, 
        realisedPnl.gt(BIG_NUM_ZERO),
        realisedPnl.lt(BIG_NUM_ZERO),
        realisedPnl,
        feeUsd,
        event.params.posData[1])
      positionStatsEntity.positionFee = positionStatsEntity.positionFee.plus(event.params.posData[4])
      positionStatsEntity.fundingFee = positionStatsEntity.fundingFee.plus(event.params.pnlData[1])
      positionStatsEntity.borrowFee = positionStatsEntity.borrowFee.plus(event.params.pnlData[2])
      positionStatsEntity.averagePrice = event.params.posData[2]
      positionStatsEntity.markPrice = event.params.posData[3]
      positionStatsEntity.lastUpdateTime = event.block.timestamp.toI32()
      positionStatsEntity.save()
      let dailyInfoId = getDailyInfoId(event.block.timestamp)
      let dailyTradesId = getAccountDailyTradesId(event.params.account.toHexString(), event.block.timestamp)
      let dailyVolumeId = getAccountDailyTradesId(event.params.tokenId.toString(), event.block.timestamp)
      let userAccountStatsEntity = UserAccountStat.load(positionStatsEntity.account)
      if (userAccountStatsEntity) {
        if (positionStatsEntity.realisedPnl.gt(userAccountStatsEntity.biggestWin)) {
          userAccountStatsEntity.biggestWin = positionStatsEntity.realisedPnl;
        }
        if (realisedPnl.gt(BIG_NUM_ZERO)) {
          userAccountStatsEntity.wins = userAccountStatsEntity.wins.plus(BigInt.fromString("1"))
        } else if (realisedPnl.lt(BIG_NUM_ZERO)) {
          userAccountStatsEntity.losses = userAccountStatsEntity.losses.plus(BigInt.fromString("1"))
        }
        userAccountStatsEntity.collateral = userAccountStatsEntity.collateral.plus(event.params.posData[0])
        userAccountStatsEntity.profitLoss = userAccountStatsEntity.profitLoss.plus(realisedPnl)
        userAccountStatsEntity.trades = userAccountStatsEntity.trades.plus(BigInt.fromString('1'))
        userAccountStatsEntity.volume = userAccountStatsEntity.volume.plus(event.params.posData[1])
        userAccountStatsEntity.leverage = BigInt.fromString('1000').times(userAccountStatsEntity.volume).div(userAccountStatsEntity.collateral)
        userAccountStatsEntity.save()      
      }
      let dailyInfo = DailyInfo.load(dailyInfoId)
      if (!dailyInfo) {
        dailyInfo = new DailyInfo(dailyInfoId)
        dailyInfo.fees = BIG_NUM_ZERO
        dailyInfo.trades = BIG_NUM_ZERO
        dailyInfo.users = BIG_NUM_ZERO
        dailyInfo.newUsers = BIG_NUM_ZERO
        dailyInfo.volumes = BIG_NUM_ZERO
        dailyInfo.longOI = BIG_NUM_ZERO
        dailyInfo.shortOI = BIG_NUM_ZERO
        dailyInfo.pnls = BIG_NUM_ZERO
        dailyInfo.liquidations = BIG_NUM_ZERO
        dailyInfo.timestamp = getDayStartDate(event.block.timestamp)
        dailyInfo.save()
      }
      let userDailyAccountStatsEntity = DailyUserAccountStat.load(dailyTradesId)
      if (!userDailyAccountStatsEntity) {
        dailyInfo.users = dailyInfo.users.plus(BigInt.fromString('1'))
        userDailyAccountStatsEntity = new DailyUserAccountStat(dailyTradesId)
        userDailyAccountStatsEntity.account = positionStatsEntity.account
        userDailyAccountStatsEntity.biggestWin = BIG_NUM_ZERO
        userDailyAccountStatsEntity.collateral = BIG_NUM_ZERO
        userDailyAccountStatsEntity.leverage = BIG_NUM_ZERO
        userDailyAccountStatsEntity.losses = BIG_NUM_ZERO
        userDailyAccountStatsEntity.profitLoss = BIG_NUM_ZERO
        userDailyAccountStatsEntity.trades = BIG_NUM_ZERO
        userDailyAccountStatsEntity.timestamp = getDayStartDate(event.block.timestamp)
        userDailyAccountStatsEntity.volume = BIG_NUM_ZERO
        userDailyAccountStatsEntity.wins = BIG_NUM_ZERO       
      }
      if (positionStatsEntity.realisedPnl.gt(userDailyAccountStatsEntity.biggestWin)) {
        userDailyAccountStatsEntity.biggestWin = positionStatsEntity.realisedPnl;
      }
      if (realisedPnl.gt(BIG_NUM_ZERO)) {
        userDailyAccountStatsEntity.wins = userDailyAccountStatsEntity.wins.plus(BigInt.fromString("1"))
      } else if (realisedPnl.lt(BIG_NUM_ZERO)){
        userDailyAccountStatsEntity.losses = userDailyAccountStatsEntity.losses.plus(BigInt.fromString("1"))
      }
      userDailyAccountStatsEntity.collateral = userDailyAccountStatsEntity.collateral.plus(event.params.posData[0])
      userDailyAccountStatsEntity.profitLoss = userDailyAccountStatsEntity.profitLoss.plus(realisedPnl)
      userDailyAccountStatsEntity.trades = userDailyAccountStatsEntity.trades.plus(BigInt.fromString('1'))
      userDailyAccountStatsEntity.volume = userDailyAccountStatsEntity.volume.plus(event.params.posData[1])
      userDailyAccountStatsEntity.leverage = BigInt.fromString('1000').times(userDailyAccountStatsEntity.volume).div(userDailyAccountStatsEntity.collateral)
      userDailyAccountStatsEntity.save()
      dailyInfo.pnls = dailyInfo.pnls.plus(realisedPnl)
      dailyInfo.trades = dailyInfo.trades.plus(BigInt.fromString('1'))
      dailyInfo.volumes = dailyInfo.volumes.plus(event.params.posData[1])
      dailyInfo.fees = dailyInfo.fees.plus(event.params.posData[4]).plus(event.params.pnlData[1]).plus(event.params.pnlData[2])
      dailyInfo.save()
      let dailyVolume = DailyVolume.load(dailyVolumeId)
      if (!dailyVolume) {
        dailyVolume = new DailyVolume(dailyVolumeId)
        dailyVolume.volume = BIG_NUM_ZERO
        dailyVolume.tokenId = positionStatsEntity.tokenId
        dailyVolume.timestamp = getDayStartDate(event.block.timestamp)
        dailyVolume.tradeCounts = 0
      }
      dailyVolume.volume = dailyVolume.volume.plus(event.params.posData[1])
      dailyVolume.tradeCounts += 1
      dailyVolume.save()
      processUserTradeStats(
        event.params.posId,
        event.block.timestamp,
        event.params.account.toHexString(),
        "DECREASE_POSITION",
        BIG_NUM_ZERO,
        positionStatsEntity.averagePrice,
        event.params.posData[0],
        event.params.posData[4],
        event.params.pnlData[1],
        event.params.pnlData[2],
        event.params.isLong,
        true,
        true,
        event.params.posData[3],
        positionStatsEntity.positionType,
        realisedPnl,
        newROI,
        positionStatsEntity.refer,
        event.params.posData[1],
        event.params.tokenId,
        event.transaction.hash.toHexString()
      )
      processDailyTrades(
        dailyTradesId,
        event.params.account.toHexString(),
        event.params.posData[0],
        feeUsd,
        realisedPnl.gt(BIG_NUM_ZERO),
        realisedPnl.lt(BIG_NUM_ZERO),
        realisedPnl,
        event.params.posData[1],
        event.block.timestamp
      )
      processAllTrades(
        event.params.account.toHexString(),
        event.params.posData[0],
        feeUsd,
        realisedPnl.gt(BIG_NUM_ZERO),
        realisedPnl.lt(BIG_NUM_ZERO),
        realisedPnl,
        event.params.posData[1],
      )
      let dailyGlobalInfoId = getAccountDailyTradesId("global", event.block.timestamp)
      let dailyGlobalInfo = DailyGlobalInfo.load(dailyGlobalInfoId)
      if (!dailyGlobalInfo) {
        dailyGlobalInfo = new DailyGlobalInfo(dailyGlobalInfoId)
        dailyGlobalInfo.timestamp = getDayStartDate(event.block.timestamp)
        dailyGlobalInfo.fees = BIG_NUM_ZERO
        dailyGlobalInfo.openInterests = BIG_NUM_ZERO
        dailyGlobalInfo.tradeVolume = BIG_NUM_ZERO
        dailyGlobalInfo.tradeCounts = 0
        dailyGlobalInfo.save()
      }
      dailyGlobalInfo.fees = dailyGlobalInfo.fees.plus(feeUsd)
      dailyGlobalInfo.openInterests = dailyGlobalInfo.openInterests.minus(event.params.posData[1])
      dailyGlobalInfo.tradeVolume = dailyGlobalInfo.tradeVolume.plus(event.params.posData[1])
      dailyGlobalInfo.tradeCounts += 1
      dailyGlobalInfo.save()
    }
    let tradeVolumeEntity = TradeVolume.load(event.params.account.toHexString());
    if (!tradeVolumeEntity) {
      tradeVolumeEntity = new TradeVolume(event.params.account.toHexString())
      tradeVolumeEntity.account = event.params.account.toHexString()
      tradeVolumeEntity.size = BIG_NUM_ZERO
      tradeVolumeEntity.openLongs = BIG_NUM_ZERO
      tradeVolumeEntity.openShorts = BIG_NUM_ZERO
      tradeVolumeEntity.collateralUsage = BIG_NUM_ZERO
      tradeVolumeEntity.marginUsage = BIG_NUM_ZERO
      tradeVolumeEntity.vusdBalance = BIG_NUM_ZERO
      tradeVolumeEntity.save()
    }
    if (event.params.isLong) {
      tradeVolumeEntity.openLongs = tradeVolumeEntity.openLongs.minus(event.params.posData[1])
    } else {
      tradeVolumeEntity.openShorts = tradeVolumeEntity.openShorts.minus(event.params.posData[1])
    }
    tradeVolumeEntity.collateralUsage = tradeVolumeEntity.collateralUsage.minus(event.params.posData[0])
    tradeVolumeEntity.marginUsage = tradeVolumeEntity.marginUsage.plus(event.params.posData[4])
    tradeVolumeEntity.size = tradeVolumeEntity.size.plus(event.params.posData[1])
    tradeVolumeEntity.save()
  }
  
  export function handleIncreasePosition(event: IncreasePositionEvent): void {
    let increasePositionEntity = new IncreasePosition(event.params.posId.toString() + "-" + event.block.timestamp.toString())
    increasePositionEntity.account = event.params.account.toHexString()
    increasePositionEntity.averagePrice = event.params.posData[2]
    increasePositionEntity.collateral = event.params.posData[0]
    increasePositionEntity.tokenId = event.params.tokenId
    increasePositionEntity.isLong = event.params.isLong
    increasePositionEntity.feeUsd = event.params.posData[4]
    increasePositionEntity.markPrice = event.params.posData[3]
    increasePositionEntity.posId = event.params.posId
    increasePositionEntity.size = event.params.posData[1]
    increasePositionEntity.timestamp = event.block.timestamp.toI32()
    increasePositionEntity.transactionHash = event.transaction.hash.toHexString()
    increasePositionEntity.save()
    let positionStatsEntity = PositionStat.load(event.params.posId.toString())
    if (!positionStatsEntity) {
      positionStatsEntity = new PositionStat(event.params.posId.toString())
      positionStatsEntity.account = event.params.account.toHexString()
      positionStatsEntity.averagePrice = BIG_NUM_ZERO
      positionStatsEntity.collateral = BIG_NUM_ZERO
      positionStatsEntity.totalCollateral = BIG_NUM_ZERO
      positionStatsEntity.totalSize = BIG_NUM_ZERO
      positionStatsEntity.totalClosedSize = BIG_NUM_ZERO
      positionStatsEntity.totalIncreasedCollateral = BIG_NUM_ZERO
      positionStatsEntity.maxCollateral = BIG_NUM_ZERO
      positionStatsEntity.totalROI = BIG_NUM_ZERO
      positionStatsEntity.closedAt = 0
      positionStatsEntity.closeHash = ""
      positionStatsEntity.createdAt = 0
      positionStatsEntity.createHash = ""
      positionStatsEntity.positionFee = BIG_NUM_ZERO
      positionStatsEntity.fundingFee = BIG_NUM_ZERO
      positionStatsEntity.fundingFee = BIG_NUM_ZERO
      positionStatsEntity.tokenId = event.params.tokenId
      positionStatsEntity.isLong = event.params.isLong
      positionStatsEntity.lastUpdateTime = 0
      positionStatsEntity.lmtPrice = BIG_NUM_ZERO
      positionStatsEntity.markPrice = BIG_NUM_ZERO
      positionStatsEntity.orderStatus = "FILLED"
      positionStatsEntity.pendingCollateral = BIG_NUM_ZERO
      positionStatsEntity.pendingDelayCollateral = BIG_NUM_ZERO
      positionStatsEntity.pendingDelaySize = BIG_NUM_ZERO
      positionStatsEntity.pendingSize = BIG_NUM_ZERO
      positionStatsEntity.posId = event.params.posId
      positionStatsEntity.positionStatus = "OPEN"
      positionStatsEntity.positionType = "Market Order"
      positionStatsEntity.realisedPnl = BIG_NUM_ZERO
      positionStatsEntity.size = BIG_NUM_ZERO
      positionStatsEntity.stpPrice = BIG_NUM_ZERO
      positionStatsEntity.refer = ZERO_ADDRESS
    }
    let dailyInfoId = getDailyInfoId(event.block.timestamp)
    let dailyTradesId = getAccountDailyTradesId(positionStatsEntity.account, event.block.timestamp)
    let dailyVolumeId = getAccountDailyTradesId(event.params.tokenId.toString(), event.block.timestamp)
    if (positionStatsEntity.pendingDelayCollateral.gt(BIG_NUM_ZERO)) {
      processUserTradeStats(
        event.params.posId,
        event.block.timestamp,
        event.params.account.toHexString(),
        "ADD_POSITION",
        BIG_NUM_ZERO,
        event.params.posData[2],
        event.params.posData[0],
        event.params.posData[4],
        BIG_NUM_ZERO,
        BIG_NUM_ZERO,
        event.params.isLong,
        true,
        true,
        event.params.posData[3],
        positionStatsEntity.positionType,
        BIG_NUM_ZERO.minus(event.params.posData[4]),
        BIG_NUM_ZERO,
        positionStatsEntity.refer,
        event.params.posData[1],
        event.params.tokenId,
        event.transaction.hash.toHexString()
      )
      positionStatsEntity.averagePrice = event.params.posData[2]
      positionStatsEntity.collateral = positionStatsEntity.collateral.plus(event.params.posData[0])
      if (positionStatsEntity.collateral.gt(positionStatsEntity.maxCollateral)){
        positionStatsEntity.maxCollateral = positionStatsEntity.collateral
      }
      positionStatsEntity.totalCollateral = positionStatsEntity.totalCollateral.plus(event.params.posData[0])
      positionStatsEntity.totalIncreasedCollateral = positionStatsEntity.totalIncreasedCollateral.plus(event.params.posData[0])
      positionStatsEntity.positionFee = positionStatsEntity.positionFee.plus(event.params.posData[4])
      positionStatsEntity.realisedPnl = positionStatsEntity.realisedPnl.minus(event.params.posData[4])
      positionStatsEntity.size = positionStatsEntity.size.plus(event.params.posData[1])
      positionStatsEntity.totalSize = positionStatsEntity.totalSize.plus(event.params.posData[1])
      positionStatsEntity.markPrice = event.params.posData[3]
      positionStatsEntity.lastUpdateTime = event.block.timestamp.toI32()
      positionStatsEntity.pendingDelayCollateral = BIG_NUM_ZERO
      positionStatsEntity.pendingDelaySize = BIG_NUM_ZERO
      positionStatsEntity.save()
      let userAccountStatsEntity = UserAccountStat.load(positionStatsEntity.account)
      if (userAccountStatsEntity) {
        userAccountStatsEntity.collateral = userAccountStatsEntity.collateral.plus(event.params.posData[0])
        userAccountStatsEntity.volume = userAccountStatsEntity.volume.plus(event.params.posData[1])
        userAccountStatsEntity.leverage = BigInt.fromString('1000').times(userAccountStatsEntity.volume).div(userAccountStatsEntity.collateral)
        userAccountStatsEntity.profitLoss = userAccountStatsEntity.profitLoss.minus(event.params.posData[4])
        userAccountStatsEntity.trades = userAccountStatsEntity.trades.plus(BigInt.fromString('1'))
        userAccountStatsEntity.save()   
      }
      let dailyInfo = DailyInfo.load(dailyInfoId)
      if (!dailyInfo) {
        dailyInfo = new DailyInfo(dailyInfoId)
        dailyInfo.fees = BIG_NUM_ZERO
        dailyInfo.trades = BIG_NUM_ZERO
        dailyInfo.users = BIG_NUM_ZERO
        dailyInfo.newUsers = BIG_NUM_ZERO
        dailyInfo.volumes = BIG_NUM_ZERO
        dailyInfo.longOI = BIG_NUM_ZERO
        dailyInfo.shortOI = BIG_NUM_ZERO
        dailyInfo.pnls = BIG_NUM_ZERO
        dailyInfo.liquidations = BIG_NUM_ZERO
        dailyInfo.timestamp = getDayStartDate(event.block.timestamp)
        dailyInfo.save()
      }
      let userDailyAccountStatsEntity = DailyUserAccountStat.load(dailyTradesId)
      if (!userDailyAccountStatsEntity) {
        dailyInfo.users = dailyInfo.users.plus(BigInt.fromString('1'))
        userDailyAccountStatsEntity = new DailyUserAccountStat(dailyTradesId)
        userDailyAccountStatsEntity.account = positionStatsEntity.account
        userDailyAccountStatsEntity.biggestWin = BIG_NUM_ZERO
        userDailyAccountStatsEntity.collateral = BIG_NUM_ZERO
        userDailyAccountStatsEntity.leverage = BIG_NUM_ZERO
        userDailyAccountStatsEntity.losses = BIG_NUM_ZERO
        userDailyAccountStatsEntity.profitLoss = BIG_NUM_ZERO
        userDailyAccountStatsEntity.trades = BIG_NUM_ZERO
        userDailyAccountStatsEntity.timestamp = getDayStartDate(event.block.timestamp)
        userDailyAccountStatsEntity.volume = BIG_NUM_ZERO
        userDailyAccountStatsEntity.wins = BIG_NUM_ZERO       
      }
      userDailyAccountStatsEntity.collateral = userDailyAccountStatsEntity.collateral.plus(event.params.posData[0])
      userDailyAccountStatsEntity.profitLoss = userDailyAccountStatsEntity.profitLoss.minus(event.params.posData[4])
      userDailyAccountStatsEntity.trades = userDailyAccountStatsEntity.trades.plus(BigInt.fromString('1'))
      userDailyAccountStatsEntity.volume = userDailyAccountStatsEntity.volume.plus(event.params.posData[1])
      userDailyAccountStatsEntity.leverage = BigInt.fromString('1000').times(userDailyAccountStatsEntity.volume).div(userDailyAccountStatsEntity.collateral)
      userDailyAccountStatsEntity.save()
      dailyInfo.pnls = dailyInfo.pnls.minus(event.params.posData[4])
      dailyInfo.trades = dailyInfo.trades.plus(BigInt.fromString('1'))
      dailyInfo.volumes = dailyInfo.volumes.plus(event.params.posData[1])
      dailyInfo.fees = dailyInfo.fees.plus(event.params.posData[4])
      dailyInfo.save()
      let dailyVolume = DailyVolume.load(dailyVolumeId)
      if (!dailyVolume) {
        dailyVolume = new DailyVolume(dailyVolumeId)
        dailyVolume.volume = BIG_NUM_ZERO
        dailyVolume.tokenId = positionStatsEntity.tokenId
        dailyVolume.timestamp = getDayStartDate(event.block.timestamp)
        dailyVolume.tradeCounts = 0
      }
      dailyVolume.volume = dailyVolume.volume.plus(event.params.posData[1])
      dailyVolume.tradeCounts += 1
      dailyVolume.save()
    } else {
      positionStatsEntity.averagePrice = event.params.posData[2]
      positionStatsEntity.collateral = positionStatsEntity.collateral.plus(event.params.posData[0])
      if (positionStatsEntity.collateral.gt(positionStatsEntity.maxCollateral)){
        positionStatsEntity.maxCollateral = positionStatsEntity.collateral
      }
      positionStatsEntity.totalCollateral = positionStatsEntity.totalCollateral.plus(event.params.posData[0])
      positionStatsEntity.totalIncreasedCollateral = positionStatsEntity.totalIncreasedCollateral.plus(event.params.posData[0])
      positionStatsEntity.positionFee = positionStatsEntity.positionFee.plus(event.params.posData[4])
      positionStatsEntity.realisedPnl = positionStatsEntity.realisedPnl.minus(event.params.posData[4])
      positionStatsEntity.size = positionStatsEntity.size.plus(event.params.posData[1])
      positionStatsEntity.totalSize = positionStatsEntity.totalSize.plus(event.params.posData[1])
      positionStatsEntity.createdAt = event.block.timestamp.toI32()
      positionStatsEntity.createHash = event.transaction.hash.toHexString()
      positionStatsEntity.lastUpdateTime = event.block.timestamp.toI32()
      positionStatsEntity.markPrice = event.params.posData[3]
      positionStatsEntity.save()
      processUserTradeStats(
        event.params.posId,
        event.block.timestamp,
        event.params.account.toHexString(),
        "OPEN_POSITION",
        BIG_NUM_ZERO,
        event.params.posData[2],
        event.params.posData[0],
        event.params.posData[4],
        BIG_NUM_ZERO,
        BIG_NUM_ZERO,
        event.params.isLong,
        true,
        true,
        event.params.posData[3],
        positionStatsEntity.positionType,
        BIG_NUM_ZERO.minus(event.params.posData[4]),
        BIG_NUM_ZERO,
        positionStatsEntity.refer,
        event.params.posData[1],
        event.params.tokenId,
        event.transaction.hash.toHexString()
      )
      let dailyInfo = DailyInfo.load(dailyInfoId)
      if (!dailyInfo) {
        dailyInfo = new DailyInfo(dailyInfoId)
        dailyInfo.fees = BIG_NUM_ZERO
        dailyInfo.trades = BIG_NUM_ZERO
        dailyInfo.users = BIG_NUM_ZERO
        dailyInfo.newUsers = BIG_NUM_ZERO
        dailyInfo.volumes = BIG_NUM_ZERO
        dailyInfo.longOI = BIG_NUM_ZERO
        dailyInfo.shortOI = BIG_NUM_ZERO
        dailyInfo.pnls = BIG_NUM_ZERO
        dailyInfo.liquidations = BIG_NUM_ZERO
        dailyInfo.timestamp = getDayStartDate(event.block.timestamp)
        dailyInfo.save()
      }
      let userAccountStatsEntity = UserAccountStat.load(event.params.account.toHexString())
      if (!userAccountStatsEntity) {
        dailyInfo.newUsers = dailyInfo.newUsers.plus(BigInt.fromString("1"))
        userAccountStatsEntity = new UserAccountStat(event.params.account.toHexString())
        userAccountStatsEntity.account = event.params.account.toHexString()
        userAccountStatsEntity.biggestWin = BIG_NUM_ZERO
        userAccountStatsEntity.collateral = BIG_NUM_ZERO
        userAccountStatsEntity.leverage = BIG_NUM_ZERO
        userAccountStatsEntity.losses = BIG_NUM_ZERO
        userAccountStatsEntity.profitLoss = BIG_NUM_ZERO
        userAccountStatsEntity.trades = BIG_NUM_ZERO
        userAccountStatsEntity.volume = BIG_NUM_ZERO
        userAccountStatsEntity.wins = BIG_NUM_ZERO       
      }
      userAccountStatsEntity.collateral = userAccountStatsEntity.collateral.plus(event.params.posData[0])
      userAccountStatsEntity.volume = userAccountStatsEntity.volume.plus(event.params.posData[1])
      userAccountStatsEntity.leverage = BigInt.fromString('1000').times(userAccountStatsEntity.volume).div(userAccountStatsEntity.collateral)
      userAccountStatsEntity.profitLoss = userAccountStatsEntity.profitLoss.minus(event.params.posData[4])
      userAccountStatsEntity.trades = userAccountStatsEntity.trades.plus(BigInt.fromString('1'))
      userAccountStatsEntity.save()
      let userDailyAccountStatsEntity = DailyUserAccountStat.load(dailyTradesId)
      if (!userDailyAccountStatsEntity) {
        dailyInfo.users = dailyInfo.users.plus(BigInt.fromString('1'))
        userDailyAccountStatsEntity = new DailyUserAccountStat(dailyTradesId)
        userDailyAccountStatsEntity.account = positionStatsEntity.account
        userDailyAccountStatsEntity.biggestWin = BIG_NUM_ZERO
        userDailyAccountStatsEntity.collateral = BIG_NUM_ZERO
        userDailyAccountStatsEntity.leverage = BIG_NUM_ZERO
        userDailyAccountStatsEntity.losses = BIG_NUM_ZERO
        userDailyAccountStatsEntity.profitLoss = BIG_NUM_ZERO
        userDailyAccountStatsEntity.trades = BIG_NUM_ZERO
        userDailyAccountStatsEntity.timestamp = getDayStartDate(event.block.timestamp)
        userDailyAccountStatsEntity.volume = BIG_NUM_ZERO
        userDailyAccountStatsEntity.wins = BIG_NUM_ZERO       
      }
      userDailyAccountStatsEntity.collateral = userDailyAccountStatsEntity.collateral.plus(event.params.posData[0])
      userDailyAccountStatsEntity.profitLoss = userDailyAccountStatsEntity.profitLoss.minus(event.params.posData[4])
      userDailyAccountStatsEntity.trades = userDailyAccountStatsEntity.trades.plus(BigInt.fromString('1'))
      userDailyAccountStatsEntity.volume = userDailyAccountStatsEntity.volume.plus(event.params.posData[1])
      userDailyAccountStatsEntity.leverage = BigInt.fromString('1000').times(userDailyAccountStatsEntity.volume).div(userDailyAccountStatsEntity.collateral)
      userDailyAccountStatsEntity.save()   
      dailyInfo.pnls = dailyInfo.pnls.minus(event.params.posData[4])
      dailyInfo.trades = dailyInfo.trades.plus(BigInt.fromString('1'))
      dailyInfo.volumes = dailyInfo.volumes.plus(event.params.posData[1])
      dailyInfo.fees = dailyInfo.fees.plus(event.params.posData[4])
      dailyInfo.save()
      let dailyVolume = DailyVolume.load(dailyVolumeId)
      if (!dailyVolume) {
        dailyVolume = new DailyVolume(dailyVolumeId)
        dailyVolume.volume = BIG_NUM_ZERO
        dailyVolume.tokenId = positionStatsEntity.tokenId
        dailyVolume.timestamp = getDayStartDate(event.block.timestamp)
        dailyVolume.tradeCounts = 0
      }
      dailyVolume.volume = dailyVolume.volume.plus(event.params.posData[1])
      dailyVolume.tradeCounts += 1
      dailyVolume.save()
    }
    let tradeVolume = TradeVolume.load(event.params.account.toHexString());
    if (!tradeVolume) {
      tradeVolume = new TradeVolume(event.params.account.toHexString())
      tradeVolume.account = event.params.account.toHexString()
      tradeVolume.size = BIG_NUM_ZERO
      tradeVolume.openLongs = BIG_NUM_ZERO
      tradeVolume.openShorts = BIG_NUM_ZERO
      tradeVolume.collateralUsage = BIG_NUM_ZERO
      tradeVolume.marginUsage = BIG_NUM_ZERO
      tradeVolume.vusdBalance = BIG_NUM_ZERO
    }
    if (event.params.isLong) {
      tradeVolume.openLongs = tradeVolume.openLongs.plus(event.params.posData[1])
    } else {
      tradeVolume.openShorts = tradeVolume.openShorts.plus(event.params.posData[1])
    }
    tradeVolume.collateralUsage = tradeVolume.collateralUsage.plus(event.params.posData[0])
    tradeVolume.marginUsage = tradeVolume.marginUsage.plus(event.params.posData[4])
    tradeVolume.size = tradeVolume.size.plus(event.params.posData[1])
    tradeVolume.save()
    processDailyTrades(
      dailyTradesId,
      positionStatsEntity.account,
      event.params.posData[0],
      event.params.posData[4],
      false,
      false,
      BIG_NUM_ZERO.minus(event.params.posData[4]),
      event.params.posData[1],
      event.block.timestamp
    )
    processAllTrades(
      positionStatsEntity.account,
      event.params.posData[0],
      event.params.posData[4],
      false,
      false,
      BIG_NUM_ZERO.minus(event.params.posData[4]),
      event.params.posData[1],
    )
    let dailyGlobalInfoId = getAccountDailyTradesId("global", event.block.timestamp)
    let dailyGlobalInfo = DailyGlobalInfo.load(dailyGlobalInfoId)
    if (!dailyGlobalInfo) {
      dailyGlobalInfo = new DailyGlobalInfo(dailyGlobalInfoId)
      dailyGlobalInfo.timestamp = getDayStartDate(event.block.timestamp)      
      dailyGlobalInfo.fees = BIG_NUM_ZERO
      dailyGlobalInfo.openInterests = BIG_NUM_ZERO
      dailyGlobalInfo.tradeVolume = BIG_NUM_ZERO
      dailyGlobalInfo.tradeCounts = 0
      dailyGlobalInfo.save()
    }
    dailyGlobalInfo.fees = dailyGlobalInfo.fees.plus(event.params.posData[4])
    dailyGlobalInfo.openInterests = dailyGlobalInfo.openInterests.plus(event.params.posData[1])
    dailyGlobalInfo.tradeVolume = dailyGlobalInfo.tradeVolume.plus(event.params.posData[1])
    dailyGlobalInfo.tradeCounts += 1
    dailyGlobalInfo.save()
    processGlobalInfo(
      positionStatsEntity.tokenId, 
      positionStatsEntity.isLong, 
      false,
      false,
      BIG_NUM_ZERO.minus(event.params.posData[4]),
      event.params.posData[4],
      event.params.posData[1])
  }

 export function handleCreateAddPositionOrder(event: CreateAddPositionOrder): void {
    let positionStatsEntity = PositionStat.load(event.params.posId.toString())
    if (positionStatsEntity) {
        positionStatsEntity.pendingDelayCollateral = event.params.collateral
        positionStatsEntity.pendingDelaySize = event.params.size
        positionStatsEntity.save()
    }
 }

 export function handleAddPositionExecutionError(event: AddPositionExecutionError): void {
    
 }

 export function handleCreateDecreasePositionOrder(event: CreateDecreasePositionOrder): void {
    
 }

 export function handleDecreasePositionExecutionError(event: DecreasePositionExecutionError): void {

 }

 export function handleMarketOrderExecutionError(event: MarketOrderExecutionError): void {
    let positionStatsEntity = PositionStat.load(event.params.posId.toString())
    if (positionStatsEntity) {
      positionStatsEntity.orderStatus = "CANCELED";
      positionStatsEntity.positionStatus = "CANCELED"
      positionStatsEntity.closeHash = event.transaction.hash.toHexString()
      positionStatsEntity.save()
    }    
 }

 export function handleExecuteAddPositionOrder(event: ExecuteAddPositionOrder): void {
    let positionStatsEntity = PositionStat.load(event.params.posId.toString())
    if (positionStatsEntity) {
        positionStatsEntity.pendingDelayCollateral = BIG_NUM_ZERO
        positionStatsEntity.pendingDelaySize = BIG_NUM_ZERO
        positionStatsEntity.save()
    }
 }

 export function handleExecuteDecreasePositionOrder(event: ExecuteDecreasePositionOrder): void {
    
 }

