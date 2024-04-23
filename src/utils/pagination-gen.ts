export function paginationGen(count: number, limit: number, page: number) {
  const lastPage = Math.ceil(count / limit);
  return {
    count,
    limit,
    page,
    lastPage,
  };
}
