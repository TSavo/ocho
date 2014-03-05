"use strict";

function ClientError(message) {
  Error.apply(this, arguments);
  this.message = message;
}
ClientError.prototype = new Error();

function InsufficientBalance() {
  ClientError.apply(this, arguments);
}
InsufficientBalance.prototype = new ClientError();

module.exports.ClientError = ClientError;
module.exports.InsufficientBalance = InsufficientBalance;

