import { NextRequest, NextResponse } from "next/server";

// Polyfills para APIs del navegador necesarias para pdfjs-dist en Node.js
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    m11 = 1;
    m12 = 0;
    m21 = 0;
    m22 = 1;
    m41 = 0;
    m42 = 0;
    
    constructor(init?: string | number[]) {
      if (init) {
        // Implementación básica
      }
    }
    
    static fromMatrix(other?: DOMMatrix) {
      return new DOMMatrix();
    }
    static fromFloat32Array(array32: Float32Array) {
      return new DOMMatrix();
    }
    static fromFloat64Array(array64: Float64Array) {
      return new DOMMatrix();
    }
    
    multiply(other?: DOMMatrix) {
      return new DOMMatrix();
    }
    translate(tx?: number, ty?: number) {
      return new DOMMatrix();
    }
    scale(scaleX?: number, scaleY?: number) {
      return new DOMMatrix();
    }
    rotate(angle?: number) {
      return new DOMMatrix();
    }
  } as any;
}

if (typeof globalThis.DOMMatrixReadOnly === 'undefined') {
  globalThis.DOMMatrixReadOnly = class DOMMatrixReadOnly {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    
    constructor(init?: string | number[]) {
      if (init) {
        // Implementación básica
      }
    }
  } as any;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar que sea PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "El archivo debe ser un PDF" },
        { status: 400 }
      );
    }

    // Validar tamaño (10 MB máximo)
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Tamaño máximo: 10 MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)} MB` },
        { status: 400 }
      );
    }

    // Convertir File a Uint8Array (pdfjs-dist requiere Uint8Array, no Buffer)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Usar pdfjs-dist directamente con build legacy (compatible con Node.js)
    const pdfjs = require("pdfjs-dist/legacy/build/pdf.mjs");
    
    // Configurar GlobalWorkerOptions para Node.js
    // Necesitamos especificar una ruta válida al worker file usando file://
    if (pdfjs.GlobalWorkerOptions) {
      const path = require("path");
      const workerPath = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = `file://${workerPath}`;
    }

    // Cargar el documento PDF
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    // Extraer texto de todas las páginas
    let fullText = '';
    const numPages = pdfDocument.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    // Verificar que se extrajo texto
    if (!fullText || fullText.trim().length === 0) {
      return NextResponse.json(
        { error: "No se pudo extraer texto del PDF. El archivo podría estar vacío o contener solo imágenes." },
        { status: 400 }
      );
    }

    // Obtener información del PDF
    const metadata = await pdfDocument.getMetadata();

    return NextResponse.json({
      text: fullText.trim(),
      pages: numPages,
      info: {
        title: metadata?.info?.Title || null,
        author: metadata?.info?.Author || null,
      },
    });
  } catch (error) {
    console.error("Error extrayendo texto del PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al procesar el PDF";
    
    // Errores comunes
    if (errorMessage.includes("Invalid PDF")) {
      return NextResponse.json(
        { error: "El archivo PDF está corrupto o no es válido" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Error al extraer texto: ${errorMessage}` },
      { status: 500 }
    );
  }
}
