import XLSX from "xlsx";
import path from "path";

const exportToExcel = (
  UserList,
  workSheetColumnName,
  workSheetName,
  filePath
) => {
  const data = UserList.map((user) => {
    return [user.fname, user.lname, user.email, user.gender];
  });
  const wb = XLSX.utils.book_new();
  const workSheetData = [workSheetColumnName, ...data];
  const ws = XLSX.utils.aoa_to_sheet(workSheetData);
  XLSX.utils.book_append_sheet(wb, ws, workSheetName);
  XLSX.writeFile(wb, path.resolve(filePath));
};

export { exportToExcel };
