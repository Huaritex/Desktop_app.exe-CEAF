import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function parseFile(
  content: string,
  fileExtension: string
): Promise<unknown[]> {
  const buffer = Buffer.from(content, 'base64');

  if (fileExtension === '.csv') {
    return parseCsv(buffer);
  } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
    return parseXlsx(buffer);
  }

  throw new Error('Unsupported file type');
}

function parseCsv(buffer: Buffer): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const fileContent = buffer.toString('utf-8');
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: results => {
        if (results.errors.length > 0) {
          return reject(
            new Error(`CSV parsing error: ${results.errors[0].message}`)
          );
        }
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

function parseXlsx(buffer: Buffer): unknown[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}
