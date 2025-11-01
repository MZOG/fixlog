"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Roboto",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 30 },
  qrCode: { width: 400, height: 400, alignSelf: "center", marginBottom: 40 },
  publicIdText: {
    fontSize: 12,
    textAlign: "center",
    color: "#888",
    marginTop: 10,
  },
});

interface PdfDocumentProps {
  buildingName: string;
  qrCodeBase64: string; // SVG Base64
  publicId: string;
}

const svgToPng = (svgBase64: string, scale = 4): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image() as HTMLImageElement;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = (img.width || 400) * scale; // zwiększamy rozdzielczość
      canvas.height = (img.height || 400) * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Brak ctx w canvas");

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // rysujemy skalując
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = svgBase64;
  });
};

const QrPosterDocument = ({
  buildingName,
  qrCodeBase64,
  publicId,
}: PdfDocumentProps & { qrCodeBase64: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Zgłoś awarię / usterkę</Text>
      <Text style={styles.subtitle}>
        Zeskanuj kod QR i szybko zgłoś awarię lub usterkę w obiekcie:
      </Text>
      <Text style={styles.subtitle}>{buildingName}</Text>
      {qrCodeBase64 ? (
        <Image style={styles.qrCode} src={qrCodeBase64} />
      ) : (
        <Text style={styles.subtitle}>Brak kodu QR</Text>
      )}
      <View style={{ position: "absolute", bottom: 30, left: 0, right: 0 }}>
        <Text style={styles.publicIdText}>ID obiektu: {publicId}</Text>
      </View>
    </Page>
  </Document>
);

// 2️⃣ Funkcja generująca PDF z konwersją QR
export const generateQR = async (props: PdfDocumentProps) => {
  try {
    // Konwertujemy SVG -> PNG
    const pngBase64 = await svgToPng(props.qrCodeBase64);

    const blob = await pdf(
      <QrPosterDocument {...props} qrCodeBase64={pngBase64} />
    ).toBlob();

    saveAs(blob, `FixLog_QR_${props.buildingName.replace(/\s/g, "_")}.pdf`);
    return true;
  } catch (error) {
    console.error("Błąd przy generowaniu PDF:", error);
    return false;
  }
};
