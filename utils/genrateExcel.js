import XLSX from "xlsx";
import path from "path";

const exportToExcel = (data, workSheetColumnName, workSheetName, filePath) => {
  const wb = XLSX.utils.book_new();
  const workSheetData = [workSheetColumnName, ...data];
  const ws = XLSX.utils.aoa_to_sheet(workSheetData);
  XLSX.utils.book_append_sheet(wb, ws, workSheetName);
  XLSX.writeFile(wb, path.resolve(filePath));
};

export { exportToExcel };
