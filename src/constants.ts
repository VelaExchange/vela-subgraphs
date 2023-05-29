import { BigInt, JSONValue } from "@graphprotocol/graph-ts"

export const HOUR_IN_SECONDS = 3600
export const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24
export const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7
export const MONTH_IN_SECONDS = DAY_IN_SECONDS * 30
export const  VLP_DECIMALS = BigInt.fromString('1000000000000000000')
export const  MAX_VLP_FOR_Hyper = BigInt.fromString('10000000').times(VLP_DECIMALS)
export const HOUR_INFIX = '-hour-'
export const DAY_INFIX = '-day-'
export const WEEK_INFIX = '-week-'
export const MONTH_INFIX = '-month-'
export const BIG_NUM_ZERO = BigInt.fromString('0')
export const REWARDER1_ADDRESS = "0x3c66017086e8582127b85f9d4f3e2d0cbdfd1e1e"
export const REWARDER2_ADDRESS = "0x53229a73dad665efa95de8192d91946e122567f0"
export const REWARDER3_ADDRESS = "0xdd09bf3d72d0b886e25a9f5557a612a2e09a3786"
export const VELA_ADDRESS = "0x7c5c1dc94c86b94c71deff059c39bed7f9c516e3"
export const EVELA_ADDRESS = "0x16535d4768acd2e26ddd7383f0d811bdcf61a313"
export const VLP_ADDRESS = "0xc44225204e77b64bb1cf34c7a840da8af695682f"
export const WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ legacy.whitelistedTokenAddresses }}'.split(',')

export function getHourStartDate(timestamp: BigInt): i32 {
    let hourIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique day within unix history
    return hourIndex * HOUR_IN_SECONDS // want the rounded effect
}

export function getDayStartDate(timestamp: BigInt): i32 {
    let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
    return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

export function getWeekStartDate(timestamp: BigInt): i32 {
    let weekIndex = timestamp.toI32() / WEEK_IN_SECONDS // get unique week within unix history
    return weekIndex * WEEK_IN_SECONDS // want the rounded effect
}

export function getMonthStartDate(timestamp: BigInt): i32 {
    let monthIndex = timestamp.toI32() / MONTH_IN_SECONDS // get unique month within unix history
    return monthIndex * MONTH_IN_SECONDS // want the rounded effect
}


  
export function getAccountDailyTradesId(account: string, timestamp: BigInt): string {
    let startDate = getDayStartDate(timestamp)
    return account + DAY_INFIX + BigInt.fromI32(startDate).toString()
}

export function getAccountHourlyTradesId(account: string, timestamp: BigInt): string {
    let startDate = getHourStartDate(timestamp)
    return account + HOUR_INFIX + BigInt.fromI32(startDate).toString()
}

export function getAccountWeeklyTradesId(account: string, timestamp: BigInt): string {
    let startDate = getWeekStartDate(timestamp)
    return account + WEEK_INFIX + BigInt.fromI32(startDate).toString()
}

export function getAccountMonthlyTradesId(account: string, timestamp: BigInt): string {
    let startDate = getMonthStartDate(timestamp)
    return account + MONTH_INFIX + BigInt.fromI32(startDate).toString()
}