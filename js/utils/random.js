// Fisher–Yates 셔플 후 앞에서 count개를 반환한다. 원본 배열은 변경하지 않는다.
export const pickRandomItems = (items, count) => {
  const pool = [...items];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
};
