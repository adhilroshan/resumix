declare module 'pdf-parse' {
  type PDFData = {
    text: string;
    numpages: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    };
    metadata: any;
    version: string;
  };

  type PDFParseOptions = {
    pagerender?: (pageData: {
      pageIndex: number;
      renderOptions: {
        normalizeWhitespace: boolean;
        disableCombineTextItems: boolean;
      };
    }) => Promise<string>;
    max?: number;
  };

  function parse(
    dataBuffer: Uint8Array,
    options?: PDFParseOptions
  ): Promise<PDFData>;

  export = parse;
} 