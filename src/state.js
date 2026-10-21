const state = {
  screen: "main",
  balance: 12500,
  transferForm: {
    recipient: "",
    amount: "",
  },
  status: {
    phase: "idle",
    message: "",
  },
};

/**
 * Записывает значение по существующему пути, например transferForm.amount.
 * При отсутствующем ключе выводит ошибку и возвращает false без записи.
 * @returns {boolean} Удалось ли записать значение.
 */
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
