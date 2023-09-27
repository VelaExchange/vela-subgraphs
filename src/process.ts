import {
    AllTrade,
    DailyTrade,
    GlobalInfo,
    UserTradeStat,
} from "../generated/schema"

import { BigInt } from "@graphprotocol/graph-ts"
import { 
    getDayStartDate,
    BIG_NUM_ZERO,
} from "./constants"
  
export function processAllTrades(
        account: string, 
        collateral: BigInt, 
        fees: BigInt, 
        isWin: boolean,
        isLoss: boolean,
        profitLoss: BigInt,
        size: BigInt,
        ): void {
    let allTrades = AllTrade.load(account)
    if (!allTrades) {
      allTrades = new AllTrade(account)
      allTrades.account = account
      allTrades.collateral = BIG_NUM_ZERO
      allTrades.fees = BIG_NUM_ZERO
      allTrades.tradeVolume = BIG_NUM_ZERO
      allTrades.profitLoss = BIG_NUM_ZERO
      allTrades.tradeCount = 0
      allTrades.winCount = 0 
      allTrades.lossCount = 0
      allTrades.leverage = BIG_NUM_ZERO
      allTrades.save()
    }
    allTrades.collateral = allTrades.collateral.plus(collateral)
    allTrades.fees = allTrades.fees.plus(fees)
    allTrades.profitLoss = allTrades.profitLoss.plus(profitLoss)
    allTrades.tradeVolume = allTrades.tradeVolume.plus(size)
    if (isWin) {
        allTrades.winCount += 1
    }
    if (isLoss) {
        allTrades.lossCount += 1
    }
    allTrades.tradeCount += 1
    if (allTrades.collateral.equals(BIG_NUM_ZERO)) {
      allTrades.leverage = BIG_NUM_ZERO
    } else {
      allTrades.leverage = allTrades.tradeVolume.times(BigInt.fromString('1000')).div(allTrades.collateral)
    }
    allTrades.save()
}

export function processDailyTrades(
    tradeId: string,
    account: string, 
    collateral: BigInt, 
    fees: BigInt, 
    isWin: boolean,
    isLoss: boolean,
    profitLoss: BigInt,
    size: BigInt,
    timestamp: BigInt
    ): void {
    let dailyTrades = DailyTrade.load(tradeId)
    if (!dailyTrades) {
        dailyTrades = new DailyTrade(tradeId)
        dailyTrades.account = account
        dailyTrades.collateral = BIG_NUM_ZERO
        dailyTrades.fees = BIG_NUM_ZERO
        dailyTrades.tradeVolume = BIG_NUM_ZERO
        dailyTrades.timestamp = getDayStartDate(timestamp)
        dailyTrades.profitLoss = BIG_NUM_ZERO
        dailyTrades.tradeCount = 0
        dailyTrades.winCount = 0 
        dailyTrades.lossCount = 0
        dailyTrades.leverage = BIG_NUM_ZERO
        dailyTrades.save()
    }
    dailyTrades.collateral = dailyTrades.collateral.plus(collateral)
    dailyTrades.fees = dailyTrades.fees.plus(fees)
    dailyTrades.profitLoss = dailyTrades.profitLoss.plus(profitLoss)
    dailyTrades.tradeVolume = dailyTrades.tradeVolume.plus(size)
    if (isWin) {
        dailyTrades.winCount += 1
    }
    if (isLoss) {
        dailyTrades.lossCount += 1
    }
    dailyTrades.tradeCount += 1
    if (dailyTrades.collateral.equals(BIG_NUM_ZERO)) {
        dailyTrades.leverage = BIG_NUM_ZERO
    } else {
        dailyTrades.leverage = dailyTrades.tradeVolume.times(BigInt.fromString('1000')).div(dailyTrades.collateral)
    }
    dailyTrades.save()
}

export function processUserTradeStats(
    posId: BigInt,
    timestamp: BigInt,
    account: string,
    actionType: string,
    amount: BigInt,
    averagePrice: BigInt,
    collateral: BigInt,
    positionFee: BigInt,
    fundingFee: BigInt,
    borrowFee: BigInt,
    isLong: boolean,
    isPlus: boolean,
    isWin: boolean,
    markPrice: BigInt,
    positionType: string,
    profitLoss: BigInt,
    roi: BigInt,
    refer: string,
    size: BigInt,
    tokenId: BigInt,
    transactionHash: string
): void {
    let userTradeStatsEntity = new UserTradeStat(posId.toString() + "-" + timestamp.toString())
    userTradeStatsEntity.account = account
    userTradeStatsEntity.actionType = actionType
    userTradeStatsEntity.amount = amount
    userTradeStatsEntity.averagePrice = averagePrice
    userTradeStatsEntity.collateral = collateral
    userTradeStatsEntity.createdAt = timestamp.toI32()
    userTradeStatsEntity.borrowFee = borrowFee
    userTradeStatsEntity.fundingFee = fundingFee
    userTradeStatsEntity.positionFee = positionFee
    userTradeStatsEntity.tokenId = tokenId
    userTradeStatsEntity.isLong = isLong
    userTradeStatsEntity.isPlus = isPlus
    userTradeStatsEntity.isWin = isWin
    userTradeStatsEntity.markPrice = markPrice
    userTradeStatsEntity.posId = posId
    userTradeStatsEntity.positionType = positionType
    userTradeStatsEntity.profitLoss = profitLoss
    userTradeStatsEntity.roi = roi
    userTradeStatsEntity.refer = refer
    userTradeStatsEntity.tradeVolume = size
    userTradeStatsEntity.transactionHash = transactionHash
    userTradeStatsEntity.save()
}

export function processGlobalInfo(
    tokenId: BigInt,
    isLong: boolean,
    isWin: boolean,
    isLoss: boolean,
    realisedPnl: BigInt,
    fees: BigInt,
    size: BigInt
): void {
    let allGlobaInfo = GlobalInfo.load("all")
    if (!allGlobaInfo) {
      allGlobaInfo = new GlobalInfo("all")
      allGlobaInfo.tokenId = "all"
      allGlobaInfo.counts = BIG_NUM_ZERO;
      allGlobaInfo.wins = BIG_NUM_ZERO
      allGlobaInfo.losses = BIG_NUM_ZERO
      allGlobaInfo.fees = BIG_NUM_ZERO
      allGlobaInfo.volume = BIG_NUM_ZERO
      allGlobaInfo.save()
    }
    if (isWin) {
        allGlobaInfo.wins = allGlobaInfo.wins.plus(realisedPnl)
    }
    if (isLoss) {
        allGlobaInfo.losses = allGlobaInfo.losses.plus(realisedPnl)
    }
    allGlobaInfo.fees = allGlobaInfo.fees.plus(fees)
    allGlobaInfo.counts = allGlobaInfo.counts.plus(BigInt.fromString('1'))
    allGlobaInfo.volume = allGlobaInfo.volume.plus(size)
    allGlobaInfo.save()
    let globaInfo = GlobalInfo.load(tokenId.toString())
    if (!globaInfo) {
      globaInfo = new GlobalInfo(tokenId.toString())
      globaInfo.tokenId = tokenId.toString()
      globaInfo.counts = BIG_NUM_ZERO;
      globaInfo.wins = BIG_NUM_ZERO
      globaInfo.losses = BIG_NUM_ZERO
      globaInfo.fees = BIG_NUM_ZERO
      globaInfo.volume = BIG_NUM_ZERO
      globaInfo.save()
    }
    if (isWin) {
        globaInfo.wins = globaInfo.wins.plus(realisedPnl)
    }
    if (isLoss) {
        globaInfo.losses = globaInfo.losses.plus(realisedPnl)
    }
    globaInfo.fees = globaInfo.fees.plus(fees)
    globaInfo.counts = globaInfo.counts.plus(BigInt.fromString('1'))
    globaInfo.volume = globaInfo.volume.plus(size)
    globaInfo.save()
    let side = isLong ? "long" : "short"
    let sideGlobalInfo = GlobalInfo.load(tokenId.toString() + "-" + side)
    if (!sideGlobalInfo) {
      sideGlobalInfo = new GlobalInfo(tokenId.toString() + "-" + side)
      sideGlobalInfo.tokenId = tokenId.toString()
      sideGlobalInfo.counts = BIG_NUM_ZERO;
      sideGlobalInfo.wins = BIG_NUM_ZERO
      sideGlobalInfo.losses = BIG_NUM_ZERO
      sideGlobalInfo.fees = BIG_NUM_ZERO
      sideGlobalInfo.volume = BIG_NUM_ZERO
      sideGlobalInfo.save()
    }
    if (isWin) {
        sideGlobalInfo.wins = sideGlobalInfo.wins.plus(realisedPnl)
    }
    if (isLoss) {
        sideGlobalInfo.losses = sideGlobalInfo.losses.plus(realisedPnl)
    }
    sideGlobalInfo.fees = sideGlobalInfo.fees.plus(fees)
    sideGlobalInfo.counts = sideGlobalInfo.counts.plus(BigInt.fromString('1'))
    sideGlobalInfo.volume = sideGlobalInfo.volume.plus(size)
    sideGlobalInfo.save()
}