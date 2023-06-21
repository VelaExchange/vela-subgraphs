import { BigInt, JSONValue } from "@graphprotocol/graph-ts"

export const HOUR_IN_SECONDS = 3600
export const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24
export const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7
export const MONTH_IN_SECONDS = DAY_IN_SECONDS * 30
export const  VLP_DECIMALS = BigInt.fromString('1000000000000000000')
export const  MAX_VLP_FOR_Hyper = BigInt.fromString('20000000').times(VLP_DECIMALS)
export const HOUR_INFIX = '-hour-'
export const DAY_INFIX = '-day-'
export const WEEK_INFIX = '-week-'
export const MONTH_INFIX = '-month-'
export const BIG_NUM_ZERO = BigInt.fromString('0')
export const REWARDER1_ADDRESS = "0x40c3bD6D4A07117fcE69B60Eb1d446984e0a1383"
export const REWARDER2_ADDRESS = "0x12d4528E69e196a0c291DF3B28449E9Fc2769D11"
export const REWARDER3_ADDRESS = "0xf9C059A25Bf9431d70A4504bD1CE3BFD9c21B477"
export const VELA_ADDRESS = "0x088cd8f5ef3652623c22d48b1605dcfe860cd704"
export const EVELA_ADDRESS = "0xeFD5A713C5bd85e9Ced46070b2532E4a47a18102"
export const VLP_ADDRESS = "0xC5b2D9FDa8A82E8DcECD5e9e6e99b78a9188eB05"
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