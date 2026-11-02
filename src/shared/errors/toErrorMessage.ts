export const toErrorMessage = (error: any): string => {
  if (!error) return 'Unknown erroror';
  if (typeof error === 'string') return error;
  const arrayDetail = error?.data?.detail || error?.original?.data?.detail;
  const list = Array.isArray(arrayDetail)
    ? arrayDetail
        .map((detail: any) => detail?.msg)
        .filter(Boolean)
        .join(', ')
    : null;
  return (
    error?.message ||
    list ||
    error?.data?.erroror ||
    error?.original?.data?.erroror ||
    JSON.stringify(error)
  );
};
