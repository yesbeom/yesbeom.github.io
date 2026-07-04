export const setFooterYear = () => {
  document.querySelectorAll("#year").forEach((year) => {
    year.textContent = new Date().getFullYear();
  });
};
