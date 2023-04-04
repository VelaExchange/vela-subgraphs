import {
    AddPosition as AddPositionEvent,
    NewOrder as NewOrderEvent,
    UpdateOrder as UpdateOrderEvent,
    ConfirmDelayTransaction as ConfirmDelayTransactionEvent,
    AddOrRemoveCollateral as AddOrRemoveCollateralEvent
  } from "../generated/PositionVault/PositionVault"
  import {
    DailyTrade,
    AllTrade,
    MonthlyTrade,
    WeeklyTrade,
    PositionStat,
    UserTradeStat,
    TradeVolume,
    ConfirmDelayTransaction,
    HourlyTrade
  } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { 
    BIG_NUM_ZERO,
    getAccountDailyTradesId,
    getAccountHourlyTradesId,
    getAccountMonthlyTradesId,
    getAccountWeeklyTradesId,
    getDayStartDate,
    getHourStartDate,
    getMonthStartDate,
    getWeekStartDate
 } from "./constants"

export function handleAddPosition(event: AddPositionEvent): void {
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    if (positionStatsEntity) {
        positionStatsEntity.pendingDelayCollateral = event.params.collateral
        positionStatsEntity.pendingDelaySize = event.params.size
        positionStatsEntity.save()
    }
}

export function handleNewOrder(event: NewOrderEvent): void {
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    if (!positionStatsEntity) {
        positionStatsEntity = new PositionStat(event.params.key.toHexString())
        positionStatsEntity.account = event.params.account.toHexString()
        positionStatsEntity.averagePrice = BIG_NUM_ZERO
        positionStatsEntity.collateral = BIG_NUM_ZERO
        positionStatsEntity.closedAt = 0
        positionStatsEntity.closeHash = ""
        positionStatsEntity.createdAt = event.block.timestamp.toI32()
        positionStatsEntity.createHash = event.transaction.hash.toHexString()
        positionStatsEntity.entryFundingRate = BIG_NUM_ZERO
        positionStatsEntity.feeUsd = BIG_NUM_ZERO
        positionStatsEntity.indexToken = event.params.indexToken.toHexString()
        positionStatsEntity.isLong = event.params.isLong
        positionStatsEntity.key = event.params.key.toHexString()
        positionStatsEntity.markPrice = BIG_NUM_ZERO
        if (event.params.positionType.toI32() == 0) {
            positionStatsEntity.lmtPrice = BIG_NUM_ZERO
            positionStatsEntity.pendingCollateral = BIG_NUM_ZERO
            positionStatsEntity.pendingSize = BIG_NUM_ZERO
            positionStatsEntity.positionType = "Market Order"
        } else if (event.params.positionType.toI32() == 1) {
            positionStatsEntity.lmtPrice = event.params.triggerData[0]
            positionStatsEntity.pendingCollateral = event.params.triggerData[2]
            positionStatsEntity.pendingSize = event.params.triggerData[3]
            positionStatsEntity.positionType = "Limit Order"
        } else if (event.params.positionType.toI32() == 2) {
            positionStatsEntity.lmtPrice = event.params.triggerData[0]
            positionStatsEntity.pendingCollateral = event.params.triggerData[2]
            positionStatsEntity.pendingSize = event.params.triggerData[3]
            positionStatsEntity.positionType = "Stop Market"
        } else if (event.params.positionType.toI32() == 3) {
            positionStatsEntity.lmtPrice = event.params.triggerData[0]
            positionStatsEntity.pendingCollateral = event.params.triggerData[2]
            positionStatsEntity.pendingSize = event.params.triggerData[3]
            positionStatsEntity.positionType = "Stop Limit"
        } else {
            positionStatsEntity.lmtPrice = event.params.triggerData[0]
            positionStatsEntity.pendingCollateral = event.params.triggerData[2]
            positionStatsEntity.pendingSize = event.params.triggerData[3]
            positionStatsEntity.positionType = "Trailing Stop"
        }
        if (event.params.orderStatus == 0) {
            positionStatsEntity.orderStatus = "NONE";
        } else if (event.params.orderStatus == 1) {
            positionStatsEntity.orderStatus = "PENDING";
        } else if (event.params.orderStatus == 2) {
            positionStatsEntity.orderStatus = "FILLED";
        } else {
            positionStatsEntity.orderStatus = "CANCELED";
        }
        positionStatsEntity.pendingDelayCollateral = BIG_NUM_ZERO
        positionStatsEntity.pendingDelaySize = BIG_NUM_ZERO
        positionStatsEntity.positionStatus = "OPEN"
        positionStatsEntity.posId = event.params.posId
        positionStatsEntity.realisedPnl = BIG_NUM_ZERO
        positionStatsEntity.reserveAmount = BIG_NUM_ZERO
        positionStatsEntity.size = BIG_NUM_ZERO
        positionStatsEntity.stpPrice = event.params.triggerData[1]
        positionStatsEntity.save()
    }
}

export function handleUpdateOrder(event: UpdateOrderEvent): void {
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    if (positionStatsEntity) {
        if (event.params.positionType.toI32() == 0) {
            positionStatsEntity.positionType = "Market Order"
        } else if (event.params.positionType.toI32() == 1) {
            positionStatsEntity.positionType = "Limit Order"
        } else if (event.params.positionType.toI32() == 2) {
            positionStatsEntity.positionType = "Stop Market"
        } else if (event.params.positionType.toI32() == 3) {
            positionStatsEntity.positionType = "Stop Limit"
        } else {
            positionStatsEntity.positionType = "Trailing Stop"
        }
        if (event.params.orderStatus == 0) {
            positionStatsEntity.orderStatus = "NONE";
        } else if (event.params.orderStatus == 1) {
            positionStatsEntity.orderStatus = "PENDING";
        } else if (event.params.orderStatus == 2) {
            positionStatsEntity.orderStatus = "FILLED";
        } else {
            positionStatsEntity.orderStatus = "CANCELED";
        }
        positionStatsEntity.save()
    }
}

export function handleConfirmDelayTransaction(event: ConfirmDelayTransactionEvent): void {
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    if (positionStatsEntity) {
        let confirmDlayTransactionsEntity = new ConfirmDelayTransaction(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
        confirmDlayTransactionsEntity.key = event.params.key.toHexString()
        confirmDlayTransactionsEntity.confirmDelayStatus = event.params.confirmDelayStatus
        confirmDlayTransactionsEntity.collateral = positionStatsEntity.pendingDelayCollateral
        confirmDlayTransactionsEntity.size = positionStatsEntity.pendingDelaySize
        confirmDlayTransactionsEntity.feeUsd = event.params.feeUsd
        confirmDlayTransactionsEntity.timestamp = event.block.timestamp.toI32()
        confirmDlayTransactionsEntity.transactionHash = event.transaction.hash.toHexString()
        confirmDlayTransactionsEntity.save()
        let userTradeStatsEntity = new UserTradeStat(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
        userTradeStatsEntity.key = event.params.key.toHexString()
        userTradeStatsEntity.account = positionStatsEntity.account
        userTradeStatsEntity.actionType = "ADD_POSITION"
        userTradeStatsEntity.amount = BIG_NUM_ZERO
        userTradeStatsEntity.averagePrice = positionStatsEntity.averagePrice
        userTradeStatsEntity.collateral = positionStatsEntity.pendingDelayCollateral
        userTradeStatsEntity.createdAt = event.block.timestamp.toI32()
        userTradeStatsEntity.fees = event.params.feeUsd
        userTradeStatsEntity.indexToken = positionStatsEntity.indexToken
        userTradeStatsEntity.isLong = positionStatsEntity.isLong
        userTradeStatsEntity.isPlus = true
        userTradeStatsEntity.isWin = true
        userTradeStatsEntity.markPrice = positionStatsEntity.markPrice
        userTradeStatsEntity.posId = positionStatsEntity.posId
        userTradeStatsEntity.positionType = positionStatsEntity.positionType
        userTradeStatsEntity.profitLoss = BIG_NUM_ZERO
        userTradeStatsEntity.tradeVolume = positionStatsEntity.pendingDelaySize
        userTradeStatsEntity.transactionHash = event.transaction.hash.toHexString()
        userTradeStatsEntity.save()
        positionStatsEntity.pendingDelayCollateral = BIG_NUM_ZERO
        positionStatsEntity.pendingDelaySize = BIG_NUM_ZERO
        positionStatsEntity.save()
    }
}

export function handleAddOrRemoveCollateral(event: AddOrRemoveCollateralEvent): void {
    let positionStatsEntity = PositionStat.load(event.params.key.toHexString())
    if (positionStatsEntity) {
        let userTradeStatsEntity = new UserTradeStat(event.params.key.toHexString() + "-" + event.block.timestamp.toString())
        userTradeStatsEntity.key = event.params.key.toHexString()
        userTradeStatsEntity.account = positionStatsEntity.account
        userTradeStatsEntity.actionType = "EDIT_COLLATERAL"
        userTradeStatsEntity.amount = event.params.amount
        userTradeStatsEntity.averagePrice = positionStatsEntity.averagePrice
        userTradeStatsEntity.collateral = event.params.collateral
        userTradeStatsEntity.createdAt = event.block.timestamp.toI32()
        userTradeStatsEntity.fees = BIG_NUM_ZERO
        userTradeStatsEntity.indexToken = positionStatsEntity.indexToken
        userTradeStatsEntity.isLong = positionStatsEntity.isLong
        userTradeStatsEntity.isPlus = event.params.isPlus
        userTradeStatsEntity.isWin = true
        userTradeStatsEntity.markPrice = positionStatsEntity.markPrice
        userTradeStatsEntity.posId = positionStatsEntity.posId
        userTradeStatsEntity.positionType = positionStatsEntity.positionType
        userTradeStatsEntity.profitLoss = BIG_NUM_ZERO
        userTradeStatsEntity.tradeVolume = event.params.size
        userTradeStatsEntity.transactionHash = event.transaction.hash.toHexString()
        userTradeStatsEntity.save()
        let dailyTradesId = getAccountDailyTradesId(positionStatsEntity.account, event.block.timestamp)
        let hourlyTradesId = getAccountHourlyTradesId(positionStatsEntity.account, event.block.timestamp)
        let monthlyTradesId = getAccountMonthlyTradesId(positionStatsEntity.account, event.block.timestamp)
        let weeklyTradesId = getAccountWeeklyTradesId(positionStatsEntity.account, event.block.timestamp)
        let hourlyTrades = HourlyTrade.load(hourlyTradesId)
        if (!hourlyTrades) {
            hourlyTrades = new HourlyTrade(hourlyTradesId)
            hourlyTrades.account = positionStatsEntity.account
            hourlyTrades.collateral = BIG_NUM_ZERO
            hourlyTrades.fees = BIG_NUM_ZERO
            hourlyTrades.timestamp = getHourStartDate(event.block.timestamp);
            hourlyTrades.tradeVolume = BIG_NUM_ZERO
            hourlyTrades.profitLoss = BIG_NUM_ZERO
            hourlyTrades.tradeCount = 0
            hourlyTrades.winCount = 0 
            hourlyTrades.lossCount = 0
            hourlyTrades.leverage = BIG_NUM_ZERO
        }
        if (event.params.isPlus) {
            hourlyTrades.collateral = hourlyTrades.collateral.plus(event.params.amount)
        } else {
            hourlyTrades.collateral = hourlyTrades.collateral.minus(event.params.amount)
        }
        if (hourlyTrades.collateral.equals(BIG_NUM_ZERO)) {
            hourlyTrades.leverage = BIG_NUM_ZERO
        } else {
            hourlyTrades.leverage = hourlyTrades.tradeVolume.times(BigInt.fromString("1000")).div(hourlyTrades.collateral)
        }
        hourlyTrades.save()
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
        let monthlyTrades = MonthlyTrade.load(monthlyTradesId)
        if (!monthlyTrades) {
            monthlyTrades = new MonthlyTrade(monthlyTradesId)
            monthlyTrades.account = positionStatsEntity.account
            monthlyTrades.collateral = BIG_NUM_ZERO
            monthlyTrades.fees = BIG_NUM_ZERO
            monthlyTrades.timestamp = getMonthStartDate(event.block.timestamp);
            monthlyTrades.tradeVolume = BIG_NUM_ZERO
            monthlyTrades.profitLoss = BIG_NUM_ZERO
            monthlyTrades.tradeCount = 0
            monthlyTrades.winCount = 0 
            monthlyTrades.lossCount = 0
            monthlyTrades.leverage = BIG_NUM_ZERO
        }
        if (event.params.isPlus) {
            monthlyTrades.collateral = monthlyTrades.collateral.plus(event.params.amount)
        } else {
            monthlyTrades.collateral = monthlyTrades.collateral.minus(event.params.amount)
        }
        if (monthlyTrades.collateral.equals(BIG_NUM_ZERO)) {
            monthlyTrades.leverage = BIG_NUM_ZERO
        } else {
            monthlyTrades.leverage = monthlyTrades.tradeVolume.times(BigInt.fromString("1000")).div(monthlyTrades.collateral)
        }
        monthlyTrades.save()
        let weeklyTrades = WeeklyTrade.load(weeklyTradesId)
        if (!weeklyTrades) {
            weeklyTrades = new WeeklyTrade(weeklyTradesId)
            weeklyTrades.account = positionStatsEntity.account
            weeklyTrades.collateral = BIG_NUM_ZERO
            weeklyTrades.fees = BIG_NUM_ZERO
            weeklyTrades.timestamp = getWeekStartDate(event.block.timestamp);
            weeklyTrades.tradeVolume = BIG_NUM_ZERO
            weeklyTrades.profitLoss = BIG_NUM_ZERO
            weeklyTrades.tradeCount = 0
            weeklyTrades.winCount = 0 
            weeklyTrades.lossCount = 0
            weeklyTrades.leverage = BIG_NUM_ZERO
        }
        if (event.params.isPlus) {
            weeklyTrades.collateral = weeklyTrades.collateral.plus(event.params.amount)
        } else {
            weeklyTrades.collateral = weeklyTrades.collateral.minus(event.params.amount)
        }
        if (weeklyTrades.collateral.equals(BIG_NUM_ZERO)) {
            weeklyTrades.leverage = BIG_NUM_ZERO
        } else {
            weeklyTrades.leverage = weeklyTrades.tradeVolume.times(BigInt.fromString("1000")).div(weeklyTrades.collateral)
        }
        weeklyTrades.save()
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
        positionStatsEntity.collateral = event.params.collateral
        positionStatsEntity.size = event.params.size
        positionStatsEntity.save()
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