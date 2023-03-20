import {
    AddPosition as AddPositionEvent,
    NewOrder as NewOrderEvent,
    UpdateOrder as UpdateOrderEvent,
    ConfirmDelayTransaction as ConfirmDelayTransactionEvent,
    AddOrRemoveCollateral as AddOrRemoveCollateralEvent
  } from "../generated/PositionVault/PositionVault"
  import {
    PositionStat,
    UserTradeStat,
    TradeVolume,
    ConfirmDelayTransaction
  } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
  
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
        positionStatsEntity.averagePrice = BigInt.fromString('0')
        positionStatsEntity.collateral = BigInt.fromString('0')
        positionStatsEntity.closedAt = 0
        positionStatsEntity.closeHash = ""
        positionStatsEntity.createdAt = event.block.timestamp.toI32()
        positionStatsEntity.createHash = event.transaction.hash.toHexString()
        positionStatsEntity.entryFundingRate = BigInt.fromString('0')
        positionStatsEntity.feeUsd = BigInt.fromString('0')
        positionStatsEntity.indexToken = event.params.indexToken.toHexString()
        positionStatsEntity.isLong = event.params.isLong
        positionStatsEntity.key = event.params.key.toHexString()
        positionStatsEntity.markPrice = BigInt.fromString('0')
        if (event.params.positionType.toI32() == 0) {
            positionStatsEntity.lmtPrice = BigInt.fromString('0')
            positionStatsEntity.pendingCollateral = BigInt.fromString('0')
            positionStatsEntity.pendingSize = BigInt.fromString('0')
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
        positionStatsEntity.pendingDelayCollateral = BigInt.fromString('0')
        positionStatsEntity.pendingDelaySize = BigInt.fromString('0')
        positionStatsEntity.positionStatus = "OPEN"
        positionStatsEntity.posId = event.params.posId
        positionStatsEntity.realisedPnl = BigInt.fromString('0')
        positionStatsEntity.reserveAmount = BigInt.fromString('0')
        positionStatsEntity.size = BigInt.fromString('0')
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
        userTradeStatsEntity.amount = BigInt.fromString("0")
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
        userTradeStatsEntity.profitLoss = BigInt.fromString('0')
        userTradeStatsEntity.tradeVolume = positionStatsEntity.pendingDelaySize
        userTradeStatsEntity.transactionHash = event.transaction.hash.toHexString()
        userTradeStatsEntity.save()
        positionStatsEntity.pendingDelayCollateral = BigInt.fromString('0')
        positionStatsEntity.pendingDelaySize = BigInt.fromString('0')
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
        userTradeStatsEntity.fees = BigInt.fromString('0')
        userTradeStatsEntity.indexToken = positionStatsEntity.indexToken
        userTradeStatsEntity.isLong = positionStatsEntity.isLong
        userTradeStatsEntity.isPlus = event.params.isPlus
        userTradeStatsEntity.isWin = true
        userTradeStatsEntity.markPrice = positionStatsEntity.markPrice
        userTradeStatsEntity.posId = positionStatsEntity.posId
        userTradeStatsEntity.positionType = positionStatsEntity.positionType
        userTradeStatsEntity.profitLoss = BigInt.fromString('0')
        userTradeStatsEntity.tradeVolume = event.params.size
        userTradeStatsEntity.transactionHash = event.transaction.hash.toHexString()
        userTradeStatsEntity.save()
        positionStatsEntity.collateral = event.params.collateral
        positionStatsEntity.size = event.params.size
        positionStatsEntity.save()
        let tradeVolume = TradeVolume.load(positionStatsEntity.account);
        if (!tradeVolume) {
          tradeVolume = new TradeVolume(positionStatsEntity.account)
          tradeVolume.size = BigInt.fromString('0')
          tradeVolume.openLongs = BigInt.fromString('0')
          tradeVolume.openShorts = BigInt.fromString('0')
          tradeVolume.collateralUsage = BigInt.fromString('0') 
          tradeVolume.marginUsage = BigInt.fromString('0') 
          tradeVolume.vusdBalance = BigInt.fromString('0') 
        }
        if (event.params.isPlus) {
            tradeVolume.collateralUsage = tradeVolume.collateralUsage.plus(event.params.amount)
            tradeVolume.vusdBalance = tradeVolume.vusdBalance.minus(event.params.amount)
        } else {
            tradeVolume.collateralUsage = tradeVolume.collateralUsage.minus(event.params.amount)
            tradeVolume.vusdBalance = tradeVolume.vusdBalance.plus(event.params.amount)
        }
        tradeVolume.save()
    }
}