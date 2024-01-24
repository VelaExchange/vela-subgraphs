import { BigDecimal, ethereum } from "@graphprotocol/graph-ts";

import { Approval, ERC20, Transfer } from "../generated/VelaToken/ERC20";
import {
  Account,
  Token,
  TokenApproval,
  TokenBalance,
  TokenTransfer,
} from "../generated/schema";

const zeroAddress = '0x0000000000000000000000000000000000000000';

function loadOrCreateAccount(address: string): Account | null {
  let account = Account.load(address);
  if (!account) {
    account = new Account(address);
    account.save();
  }
  return account;
}

function loadOrCreateToken(event: ethereum.Event): Token | null {
  let token = Token.load(event.address.toHex());
  if (!token) {
    let erc20 = ERC20.bind(event.address);

    let nameResult = erc20.try_name();
    if (nameResult.reverted) {
      return null;
    }

    let symbolResult = erc20.try_symbol();
    if (symbolResult.reverted) {
      return null;
    }

    let decimalsResult = erc20.try_decimals();
    if (decimalsResult.reverted) {
      return null;
    }

    // Ignore any weird tokens to avoid overflowing the `decimals` field (which is an i32)
    // On mainnet for example there is at least one token which has a huge value for `decimals`
    // and that would overflow the Token entity's i32 field for the decimals
    if (decimalsResult.value.toBigDecimal().gt(BigDecimal.fromString("255"))) {
      return null;
    }

    token = new Token(event.address.toHex());
    token.name = nameResult.value;
    token.symbol = symbolResult.value;
    token.decimals = decimalsResult.value.toI32();
    token.save();
  }
  return token;
}

export function handleApproval(event: Approval): void {
  let token = loadOrCreateToken(event);
  if (!token) {
    return;
  }

  let owner = event.params.owner.toHex();
  let spender = event.params.spender.toHex();
  let value = event.params.value.toBigDecimal();

  let ownerAccount = loadOrCreateAccount(owner);
  let spenderAccount = loadOrCreateAccount(spender);

  if (!ownerAccount || !spenderAccount) {
    return;
  }

  let tokenApproval = TokenApproval.load(
    token.id + "-" + ownerAccount.id + "-" + spenderAccount.id
  );
  if (!tokenApproval) {
    tokenApproval = new TokenApproval(
      token.id + "-" + ownerAccount.id + "-" + spenderAccount.id
    );
    tokenApproval.token = token.id;
    tokenApproval.ownerAccount = ownerAccount.id;
    tokenApproval.spenderAccount = spenderAccount.id;
  }
  tokenApproval.value = value;
  tokenApproval.save();
}

export function handleTransfer(event: Transfer): void {
  let from = event.params.from.toHex();
  let to = event.params.to.toHex();
  let value = event.params.value;
  let tokenTransfer = TokenTransfer.load(from + "-" + to + "-" + value.toString() + "-" + event.block.timestamp.toString());
  if (!tokenTransfer) {
    tokenTransfer = new TokenTransfer(from + "-" + to + "-" + value.toString() + "-" + event.block.timestamp.toString());
    tokenTransfer.from = from
    tokenTransfer.to = to;
    tokenTransfer.value = value;
    tokenTransfer.timestamp = event.block.timestamp.toI32()
  }
  tokenTransfer.value = tokenTransfer.value.plus(value);
  tokenTransfer.save();
}