import { BigInt } from "@graphprotocol/graph-ts"

export const HOUR_IN_SECONDS = 3600
export const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24
export const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7
export const MONTH_IN_SECONDS = DAY_IN_SECONDS * 30
export const  VLP_DECIMALS = BigInt.fromString('1000000000000000000')
export const  MAX_VLP_FOR_Hyper = BigInt.fromString('10000000').times(VLP_DECIMALS)