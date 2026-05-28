// ---------------- APP STATE ----------------
const state = {
  screen: "main",
  balance: 12500,
  transferForm: {
    recipient: "",
    amount: "",
  },
};


// ---------------- STATE HELPERS ----------------
function setByPath(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();

  let target = obj;

  for (const key of keys) {
    if (!(key in target)) {
      console.log(`Invalid bind path: ${path}`);
      return false;
    }

    target = target[key];
  }

  if (!(lastKey in target)) {
    console.log(`Invalid bind path: ${path}`);
    return false;
  }

  target[lastKey] = value;
  return true;
}


export {
  state,
  setByPath,
}
