// ---------------- APP STATE ----------------
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


// ---------------- STATE HELPERS ----------------
/**
 * Записывает значение во вложенное поле объекта по пути с точечной нотацией.
 *
 * Если хотя бы одна часть пути отсутствует, состояние не изменяется,
 * а функция сообщает об ошибке в консоли.
 *
 * @param {object} obj — объект, который требуется изменить.
 * @param {string} path — путь к полю, например `transferForm.amount`.
 * @param {*} value — новое значение поля.
 * @returns {boolean} `true` при успешной записи, иначе `false`.
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
