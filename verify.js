function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

exports.makeVerify = () => {
  var sym = '+';
  switch (Math.floor(Math.random() * 3)) {
    case 0:
      sym = '-';
      break;
    case 1:
      sym = '*';
      break;
    default:
      break;
  }
  return {
    lhs: Math.floor(Math.random() * 50),
    rhs: Math.floor(Math.random() * 50),
    sym: sym
  };
}

exports.auditVerify = (verify, verifyAns) => {
  verifyAns = parseInt(verifyAns, 10);
  if (verifyAns != NaN) {
    switch (verify.sym) {
      case '+':
        return verify.lhs + verify.rhs === verifyAns;
      case '-':
        return verify.lhs - verify.rhs === verifyAns;
      case '*':
        return verify.lhs * verify.rhs === verifyAns;
      default:
        return false;
    }
  } else {
    return false;
  }
}