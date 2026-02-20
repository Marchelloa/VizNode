// Хранение состояния приложения
export const state = {
  username: '',
  counter: 0
};

export function incrementCounter() {
  state.counter++;
}