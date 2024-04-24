export function paginationGen(count: number, limit: number, page: number) {
  const lastPage = Math.ceil(count / limit);
  // const nextPage
  // const prevPage
  return {
    count,
    limit,
    page,
    lastPage,
  };
}
