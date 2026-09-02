/*
 * PDF report generation, font loading, table drawing, and formatting.
 */

import jsPDF from "jspdf";
import type { Appointment } from "../types/appointment";
import regularFontUrl from "../assets/fonts/DejaVuSans-Latin.ttf?url";
import boldFontUrl from "../assets/fonts/DejaVuSans-Bold-Latin.ttf?url";

// Polish month names used in the generated report.
const MONTH_NAMES = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

// Inputs required to build a monthly PDF report.
type GenerateMonthlyReportOptions = {
  appointments: Appointment[];
  year: number;
  month: number;
  monthlyEarnings: number;
};

// Base64 font data cached for jsPDF font registration.
type PdfFontData = {
  regular: string;
  bold: string;
};

let fontsPromise: Promise<PdfFontData> | null = null;

// Converts font binary data into the Base64 representation jsPDF expects.
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

// Loads and caches the regular and bold DejaVu Sans fonts used in generated PDFs.
const loadFonts = async () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(regularFontUrl).then((response) => {
        if (!response.ok) {
          throw new Error("Nie udało się wczytać czcionki PDF.");
        }

        return response.arrayBuffer();
      }),
      fetch(boldFontUrl).then((response) => {
        if (!response.ok) {
          throw new Error("Nie udało się wczytać czcionki PDF.");
        }

        return response.arrayBuffer();
      }),
    ]).then(([regularBuffer, boldBuffer]) => ({
      regular: arrayBufferToBase64(regularBuffer),
      bold: arrayBufferToBase64(boldBuffer),
    }));
  }

  return fontsPromise;
};

// Formats a report amount using Polish decimal separators without a currency symbol.
const formatEarnings = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

// Converts YYYY-MM-DD into the report's DD.MM.YYYY format.
const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");

  return `${day}.${month}.${year}`;
};

// Adds the Swedish krona suffix to a formatted price.
const formatPrice = (price: number) =>
  `${formatEarnings(price)} kr`;

// Maps appointment status to the Polish label used in the PDF.
const getStatusLabel = (status: Appointment["status"]) => {
  switch (status) {
    case "completed":
      return "Zakończona";
    case "cancelled":
      return "Anulowana";
    case "scheduled":
      return "Zaplanowana";
  }
};

// Creates a date/time ordered copy of the appointments without mutating the input array.
const sortAppointments = (appointments: Appointment[]) =>
  [...appointments].sort((first, second) => {
    // appointment_date is stored as YYYY-MM-DD, so comparing the
    // date strings keeps the sort timezone-safe.
    const dateComparison = first.appointment_date.localeCompare(
      second.appointment_date,
    );

    if (dateComparison !== 0) {
      return dateComparison;
    }

    // If two appointments are on the same day, sort them by time.
    return first.appointment_time.localeCompare(second.appointment_time);
  });

// Draws the monthly-report appointment table header and returns the next Y position.
const drawTableHeader = (
  pdf: jsPDF,
  columns: Array<{ label: string; x: number; width: number }>,
  y: number,
) => {
  const rowHeight = 9;

  pdf.setFillColor(248, 239, 243);
  pdf.setDrawColor(226, 214, 219);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(15, y - 6, 180, rowHeight, 1.5, 1.5, "FD");

  pdf.setFont("DejaVuSans", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(70, 65, 68);

  columns.forEach(({ label, x, width }) => {
    pdf.text(label, x + 2, y, {
      maxWidth: width - 4,
    });
  });

  pdf.setTextColor(0, 0, 0);

  return y + rowHeight;
};

// Draws the current page number in the PDF footer.
const drawPageNumber = (pdf: jsPDF) => {
  const pageNumber = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFont("DejaVuSans", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(110, 110, 110);
  pdf.text(`Strona ${pageNumber}`, pageWidth - 15, pageHeight - 10, {
    align: "right",
  });
  pdf.setTextColor(0, 0, 0);
};

// Builds and downloads the monthly appointment PDF report.
export async function generateMonthlyReport({
  appointments,
  year,
  month,
  monthlyEarnings,
}: GenerateMonthlyReportOptions) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const fonts = await loadFonts();

  pdf.addFileToVFS("DejaVuSans-Latin.ttf", fonts.regular);
  pdf.addFont("DejaVuSans-Latin.ttf", "DejaVuSans", "normal");

  pdf.addFileToVFS("DejaVuSans-Bold-Latin.ttf", fonts.bold);
  pdf.addFont("DejaVuSans-Bold-Latin.ttf", "DejaVuSans", "bold");

  const monthName = MONTH_NAMES[month];
  const sortedAppointments = sortAppointments(appointments);

  const pageWidth = pdf.internal.pageSize.getWidth();

  // Minimal PDF header
  // Small pink accent line
  pdf.setDrawColor(218, 126, 157);
  pdf.setLineWidth(0.8);
  pdf.line(15, 31, pageWidth - 15, 31);

  // Title
  pdf.setTextColor(30, 30, 30);
  pdf.setFont("DejaVuSans", "bold");
  pdf.setFontSize(19);
  pdf.text("Raport miesięczny", 15, 20);

  // Month
  pdf.setTextColor(218, 91, 127);
  pdf.setFont("DejaVuSans", "normal");
  pdf.setFontSize(11);
  pdf.text(`${monthName} ${year}`, 15, 27);

  // Report period
  const firstDay = `01.${String(month + 1).padStart(2, "0")}.${year}`;
  const lastDayNumber = new Date(year, month + 1, 0).getDate();
  const lastDay = `${String(lastDayNumber).padStart(2, "0")}.${String(
    month + 1,
    ).padStart(2, "0")}.${year}`;

  pdf.setTextColor(105, 105, 105);
  pdf.setFont("DejaVuSans", "normal");
  pdf.setFontSize(7);
  pdf.text("Okres raportu", pageWidth - 15, 17, {
    align: "right",
  });

  pdf.setTextColor(45, 45, 45);
  pdf.setFont("DejaVuSans", "bold");
  pdf.setFontSize(8);
  pdf.text(`${firstDay} - ${lastDay}`, pageWidth - 15, 24, {
    align: "right",
  });

  // Minimal summary row
  const summaryY = 43;

  pdf.setTextColor(105, 105, 105);
  pdf.setFont("DejaVuSans", "normal");
  pdf.setFontSize(8);
  pdf.text("Liczba wizyt", 15, summaryY);

  pdf.setTextColor(45, 45, 45);
  pdf.setFont("DejaVuSans", "bold");
  pdf.setFontSize(11);
  pdf.text(String(appointments.length), 15, summaryY + 7);

  pdf.setDrawColor(232, 214, 221);
  pdf.setLineWidth(0.4);
  pdf.line(55, summaryY - 2, 55, summaryY + 9);

  pdf.setTextColor(105, 105, 105);
  pdf.setFont("DejaVuSans", "normal");
  pdf.setFontSize(8);
  pdf.text("Zarobek", 65, summaryY);

  pdf.setTextColor(218, 91, 127);
  pdf.setFont("DejaVuSans", "bold");
  pdf.setFontSize(11);
  pdf.text(`${formatEarnings(monthlyEarnings)} kr`, 65, summaryY + 7);

  pdf.setTextColor(0, 0, 0);

  const columns = [
    { label: "Data", x: 15, width: 27 },
    { label: "Godzina", x: 42, width: 20 },
    { label: "Pies", x: 62, width: 39 },
    { label: "Rasa", x: 101, width: 42 },
    { label: "Cena", x: 143, width: 22 },
    { label: "Status", x: 165, width: 30 },
  ];

  let y = 62;
  y = drawTableHeader(pdf, columns, y);

  sortedAppointments.forEach((appointment) => {
    const rowData = [
      formatDate(appointment.appointment_date),
      appointment.appointment_time.slice(0, 5),
      appointment.dog_name || "—",
      appointment.breed || "—",
      formatPrice(appointment.price),
      getStatusLabel(appointment.status),
    ];

    const wrappedCells = rowData.map((value, index) =>
      pdf.splitTextToSize(value, columns[index].width - 4),
    );

    const rowHeight = Math.max(
      8,
      ...wrappedCells.map((lines) => lines.length * 4 + 4),
    );

    if (y + rowHeight > 278) {
      drawPageNumber(pdf);
      pdf.addPage();

      y = 22;
      y = drawTableHeader(pdf, columns, y);
    }

    // The table header uses the bold font, so reset the font before
    // drawing every appointment row.
    pdf.setFont("DejaVuSans", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(45, 45, 45);

    // Subtle zebra striping keeps long reports easier to scan.
    const appointmentIndex = sortedAppointments.indexOf(appointment);
    pdf.setFillColor(appointmentIndex % 2 === 0 ? 255 : 252, 255, 255);
    pdf.setDrawColor(232, 226, 229);
    pdf.setLineWidth(0.3);
    pdf.rect(15, y - 6, 180, rowHeight, "FD");

    wrappedCells.forEach((lines, index) => {
      const column = columns[index];
      const text = lines;

      if (index === 1) {
        pdf.text(text, column.x + column.width / 2, y, {
          align: "center",
          maxWidth: column.width - 4,
        });
      } else if (index === 4) {
        pdf.text(text, column.x + column.width - 2, y, {
          align: "right",
          maxWidth: column.width - 4,
        });
      } else {
        pdf.text(text, column.x + 2, y, {
          maxWidth: column.width - 4,
        });
      }
    });

    y += rowHeight;
  });

  drawPageNumber(pdf);

  const filenameMonth = monthName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  pdf.save(`raport-${filenameMonth}-${year}.pdf`);
}
