import {
    VestingDeposit,
    VestingWithdraw,
} from "../generated/TokenFarm/TokenFarm"
import {
    Rewarder, RewardInfo, RewardStat, VestingStat
} from "../generated/schema"
import {
    AddPool as AddPool1,
    AddRewardInfo as AddRewardInfo1,
    OnReward as OnReward1,
} from "../generated/ComplexRewardPerSec1/ComplexRewardPerSec"

import {
    AddPool as AddPool2,
    AddRewardInfo as AddRewardInfo2,
    OnReward as OnReward2,
} from "../generated/ComplexRewardPerSec2/ComplexRewardPerSec"

import {
    AddPool as AddPool3,
    AddRewardInfo as AddRewardInfo3,
    OnReward as OnReward3,
} from "../generated/ComplexRewardPerSec3/ComplexRewardPerSec"

import { BIG_NUM_ZERO, REWARDER1_ADDRESS, REWARDER2_ADDRESS, REWARDER3_ADDRESS } from "./constants"

export function handleVestingDeposit(event: VestingDeposit): void {
    let vestingStats = VestingStat.load(event.params.account.toHexString())
    if (!vestingStats) {
        vestingStats = new VestingStat(event.params.account.toHexString())
        vestingStats.account = event.params.account.toHexString()
        vestingStats.claimedAmount = BIG_NUM_ZERO
        vestingStats.lockedAmount = BIG_NUM_ZERO
    }
    vestingStats.lockedAmount = vestingStats.lockedAmount.plus(event.params.amount)
    vestingStats.save()
    let allVestingStats = VestingStat.load("all")
    if (!allVestingStats) {
        allVestingStats = new VestingStat("all")
        allVestingStats.account = "all"
        allVestingStats.claimedAmount = BIG_NUM_ZERO
        allVestingStats.lockedAmount = BIG_NUM_ZERO
    }
    allVestingStats.lockedAmount = allVestingStats.lockedAmount.plus(event.params.amount)
    allVestingStats.save()
}

export function handleVestingWithdraw(event: VestingWithdraw): void {
    let vestingStats = VestingStat.load(event.params.account.toHexString())
    if (!vestingStats) {
        vestingStats = new VestingStat(event.params.account.toHexString())
        vestingStats.account = event.params.account.toHexString()
        vestingStats.claimedAmount = BIG_NUM_ZERO
        vestingStats.lockedAmount = BIG_NUM_ZERO
    }
    vestingStats.claimedAmount = vestingStats.claimedAmount.plus(event.params.claimedAmount)
    vestingStats.lockedAmount = vestingStats.lockedAmount.minus(event.params.balance)
    vestingStats.save()
    let allVestingStats = VestingStat.load("all")
    if (!allVestingStats) {
        allVestingStats = new VestingStat("all")
        allVestingStats.account = "all"
        allVestingStats.claimedAmount = BIG_NUM_ZERO
        allVestingStats.lockedAmount = BIG_NUM_ZERO
    }
    allVestingStats.claimedAmount = allVestingStats.claimedAmount.plus(event.params.claimedAmount)
    vestingStats.lockedAmount = vestingStats.lockedAmount.minus(event.params.balance)
    allVestingStats.save()
}

export function handleAddPool1(event: AddPool1): void {
    let addRewardInfo = new RewardInfo(event.params.pid.toString())
    addRewardInfo.pId = event.params.pid
    addRewardInfo.startTimestamp = event.block.timestamp.toI32()
    addRewardInfo.save()
}

export function handleAddPool2(event: AddPool2): void {
    let addRewardInfo = new RewardInfo(event.params.pid.toString())
    addRewardInfo.pId = event.params.pid
    addRewardInfo.startTimestamp = event.block.timestamp.toI32()
    addRewardInfo.save()
}

export function handleAddRewardInfo1(event: AddRewardInfo1): void {
    let addRewardInfo = RewardInfo.load(event.params.pid.toString())
    if (addRewardInfo) {
        let rewarder = new Rewarder(event.params.pid.toString() + "-" + REWARDER1_ADDRESS + "-" + event.block.timestamp.toString())
        rewarder.address = event.params.pid
        rewarder.endTimestamp = event.params.endTimestamp.toI32()
        rewarder.rewardPerSec = event.params.rewardPerSec
        rewarder.rewarder = addRewardInfo.id
        rewarder.save()
    }
}

export function handleAddRewardInfo2(event: AddRewardInfo2): void {
    let addRewardInfo = RewardInfo.load(event.params.pid.toString())
    if (addRewardInfo) {
        let rewarder = new Rewarder(event.params.pid.toString() + "-" + REWARDER2_ADDRESS + "-" + event.block.timestamp.toString())
        rewarder.address = event.params.pid
        rewarder.endTimestamp = event.params.endTimestamp.toI32()
        rewarder.rewardPerSec = event.params.rewardPerSec
        rewarder.rewarder = addRewardInfo.id
        rewarder.save()
    }
}

export function handleAddRewardInfo3(event: AddRewardInfo3): void {
    let addRewardInfo = RewardInfo.load(event.params.pid.toString())
    if (addRewardInfo) {
        let rewarder = new Rewarder(event.params.pid.toString() + "-" + REWARDER3_ADDRESS + "-" + event.block.timestamp.toString())
        rewarder.address = event.params.pid
        rewarder.endTimestamp = event.params.endTimestamp.toI32()
        rewarder.rewardPerSec = event.params.rewardPerSec
        rewarder.rewarder = addRewardInfo.id
        rewarder.save()
    }
}

export function handleOnReward1(event: OnReward1): void {
    let account = event.params.user.toHexString()
    let rewardStats = RewardStat.load(account)
    if (!rewardStats) {
        rewardStats = new RewardStat(account)
        rewardStats.account = account
        rewardStats.rewarder1 = BIG_NUM_ZERO
        rewardStats.rewarder2 = BIG_NUM_ZERO
    }
    rewardStats.rewarder1 = rewardStats.rewarder1.plus(event.params.amount)
    rewardStats.save()

    let allRewardStats = RewardStat.load("all")
    if (!allRewardStats) {
        allRewardStats = new RewardStat("all")
        allRewardStats.account = "all"
        allRewardStats.rewarder1 = BIG_NUM_ZERO
        allRewardStats.rewarder2 = BIG_NUM_ZERO
    }
    allRewardStats.rewarder1 = allRewardStats.rewarder1.plus(event.params.amount)
    allRewardStats.save()
}

export function handleOnReward2(event: OnReward2): void {
    let account = event.params.user.toHexString()
    let rewardStats = RewardStat.load(account)
    if (!rewardStats) {
        rewardStats = new RewardStat(account)
        rewardStats.account = account
        rewardStats.rewarder1 = BIG_NUM_ZERO
        rewardStats.rewarder2 = BIG_NUM_ZERO
    }
    rewardStats.rewarder2 = rewardStats.rewarder2.plus(event.params.amount)
    rewardStats.save()

    let allRewardStats = RewardStat.load("all")
    if (!allRewardStats) {
        allRewardStats = new RewardStat("all")
        allRewardStats.account = "all"
        allRewardStats.rewarder1 = BIG_NUM_ZERO
        allRewardStats.rewarder2 = BIG_NUM_ZERO
    }
    allRewardStats.rewarder2 = allRewardStats.rewarder2.plus(event.params.amount)
    allRewardStats.save()
}

export function handleOnReward3(event: OnReward3): void {
    let account = event.params.user.toHexString()
    let rewardStats = RewardStat.load(account)
    if (!rewardStats) {
        rewardStats = new RewardStat(account)
        rewardStats.account = account
        rewardStats.rewarder1 = BIG_NUM_ZERO
        rewardStats.rewarder2 = BIG_NUM_ZERO
    }
    rewardStats.rewarder1 = rewardStats.rewarder1.plus(event.params.amount)
    rewardStats.save()

    let allRewardStats = RewardStat.load("all")
    if (!allRewardStats) {
        allRewardStats = new RewardStat("all")
        allRewardStats.account = "all"
        allRewardStats.rewarder1 = BIG_NUM_ZERO
        allRewardStats.rewarder2 = BIG_NUM_ZERO
    }
    allRewardStats.rewarder1 = allRewardStats.rewarder1.plus(event.params.amount)
    allRewardStats.save()
}