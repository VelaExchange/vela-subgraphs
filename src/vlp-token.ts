import { Transfer as TransferEvent } from "../generated/VelaToken/ERC20";
import {
  VLPInfo,
  Transfer,
} from "../generated/schema";
import { BIG_NUM_ZERO } from "./constants";

const zeroAddress = '0x0000000000000000000000000000000000000000';
const deadAddress = '0x000000000000000000000000000000000000dead'
const tokenFarm = '0xfc527781ae973f8131dc26dddb2adb080c1c1f59'
export function handleTransfer(event: TransferEvent): void {
  let transfer = new Transfer(event.transaction.hash.toHexString())
  transfer.from = event.params.from.toHexString()
  transfer.to = event.params.to.toHexString()
  transfer.value = event.params.value
  transfer.save()
  if (event.params.from.toHexString() != tokenFarm || !(event.params.to.toHexString() == zeroAddress || event.params.to.toHexString() == deadAddress)) {
    if (event.params.from.toHexString() == zeroAddress) {
      let vlpInfo = VLPInfo.load(event.params.to.toHexString());
      if (!vlpInfo) {
        vlpInfo = new VLPInfo(event.params.to.toHexString());
        vlpInfo.account = event.params.to.toHexString()
        vlpInfo.balance = BIG_NUM_ZERO
        vlpInfo.farmBalance = BIG_NUM_ZERO
      }
      vlpInfo.balance = vlpInfo.balance.plus(event.params.value)
      vlpInfo.save()
    } else if (event.params.to.toHexString() == tokenFarm) {
      let vlpInfo = VLPInfo.load(event.params.to.toHexString());
      if (!vlpInfo) {
        vlpInfo = new VLPInfo(event.params.to.toHexString());
        vlpInfo.account = event.params.to.toHexString()
        vlpInfo.balance = BIG_NUM_ZERO
        vlpInfo.farmBalance = BIG_NUM_ZERO
      }
      vlpInfo.balance = vlpInfo.balance.minus(event.params.value)
      vlpInfo.farmBalance = vlpInfo.farmBalance.plus(event.params.value)
      vlpInfo.save()
    } else {
      let vlpInfo = VLPInfo.load(event.params.to.toHexString());
      if (!vlpInfo) {
        vlpInfo = new VLPInfo(event.params.to.toHexString());
        vlpInfo.account = event.params.to.toHexString()
        vlpInfo.balance = BIG_NUM_ZERO
        vlpInfo.farmBalance = BIG_NUM_ZERO
      }
      vlpInfo.balance = vlpInfo.balance.plus(event.params.value)
      vlpInfo.save()
      let fromVlpInfo = VLPInfo.load(event.params.from.toHexString());
      if (!fromVlpInfo) {
        fromVlpInfo = new VLPInfo(event.params.from.toHexString());
        fromVlpInfo.account = event.params.from.toHexString()
        fromVlpInfo.balance = BIG_NUM_ZERO
        fromVlpInfo.farmBalance = BIG_NUM_ZERO
      }
      fromVlpInfo.balance = fromVlpInfo.balance.minus(event.params.value)
      fromVlpInfo.save()
    }
  } else if (event.params.from.toHexString() == tokenFarm) {
    let vlpInfo = VLPInfo.load(event.params.to.toHexString());
    if (!vlpInfo) {
      vlpInfo = new VLPInfo(event.params.to.toHexString());
      vlpInfo.account = event.params.to.toHexString()
      vlpInfo.balance = BIG_NUM_ZERO
      vlpInfo.farmBalance = BIG_NUM_ZERO
    }
    vlpInfo.farmBalance = vlpInfo.farmBalance.minus(event.params.value)
    vlpInfo.save()
  } else if (event.params.to.toHexString() == deadAddress || event.params.to.toHexString() == zeroAddress) {
    let fromVlpInfo = VLPInfo.load(event.params.from.toHexString());
    if (!fromVlpInfo) {
      fromVlpInfo = new VLPInfo(event.params.from.toHexString());
      fromVlpInfo.account = event.params.from.toHexString()
      fromVlpInfo.balance = BIG_NUM_ZERO
      fromVlpInfo.farmBalance = BIG_NUM_ZERO
    }
    fromVlpInfo.balance = fromVlpInfo.balance.minus(event.params.value)
    fromVlpInfo.save()
  }
}