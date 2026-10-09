/**
 * Robust Body Assessment PDF Extractor
 * Parses raw PDF buffer and extracts verifiable body composition metrics
 * without fabricating or guessing missing metrics.
 */

export interface ExtractedBodyMetrics {
  weightKg: number | null;
  bmi: number | null;
  bodyFatPercentage: number | null;
  muscleMassKg: number | null;
  bodyWaterPercentage: number | null;
  visceralFat: number | null;
  boneMassKg: number | null;
  bmrKcal: number | null;
  bodyAge: number | null;
  skeletalMusclePercentage: number | null;
  metrics: Record<string, number | string>;
  rawSnippet?: string;
}

/**
 * Validates that extracted values fall within reasonable physical boundaries
 */
function isValidRange(val: number, min: number, max: number): boolean {
  return typeof val === "number" && !isNaN(val) && val >= min && val <= max;
}

/**
 * Helper to match floating or integer numbers following specific keywords
 */
function extractValue(text: string, patterns: RegExp[], min: number, max: number): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const num = parseFloat(match[1]);
      if (isValidRange(num, min, max)) {
        return Math.round(num * 100) / 100;
      }
    }
  }
  return null;
}

export async function parseAssessmentPdf(pdfBuffer: Buffer): Promise<ExtractedBodyMetrics> {
  let extractedText = "";

  try {
    // Dynamic import / require of pdf-parse to be safe across environments
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParsePkg = require("pdf-parse");
    const PDFParseClass = pdfParsePkg.PDFParse || pdfParsePkg;

    if (typeof PDFParseClass === "function" && PDFParseClass.prototype?.getText) {
      const parser = new PDFParseClass({ data: pdfBuffer });
      const result = await parser.getText();
      extractedText = result.text || "";
    } else if (typeof pdfParsePkg === "function") {
      const result = await pdfParsePkg(pdfBuffer);
      extractedText = result.text || "";
    }
  } catch (err) {
    console.warn("PDF extraction warning (fallback to raw search):", err);
  }

  // Strip page numbering artifacts from pdf-parse (e.g. "-- 1 of 1 --")
  const strippedText = extractedText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();

  // If text is empty or minimal, also attempt scanning uncompressed string segments
  if (!strippedText || strippedText.length < 5) {
    try {
      const rawStr = pdfBuffer.toString("utf-8");
      // Search for literal text blocks (e.g. (Text) Tj)
      const textMatches = rawStr.match(/\(([^()]{3,100})\)\s*Tj/g);
      if (textMatches && textMatches.length > 0) {
        extractedText = textMatches
          .map((m) => m.replace(/^\(/, "").replace(/\)\s*Tj$/, ""))
          .join("\n");
      } else {
        // Search inside uncompressed stream ... endstream blocks
        const streamMatches = rawStr.match(/stream\r?\n([\s\S]*?)\r?\nendstream/g);
        if (streamMatches && streamMatches.length > 0) {
          extractedText = streamMatches
            .map((s) => s.replace(/^stream\r?\n/, "").replace(/\r?\nendstream$/, ""))
            .join("\n");
        } else {
          // Fallback: extract any ASCII lines containing body composition keywords
          extractedText = rawStr
            .split("\n")
            .filter((l) => /(?:Weight|BMI|Body\s*Fat|Muscle|Visceral|BMR|Water)/i.test(l))
            .join("\n");
        }
      }
    } catch {
      // Ignore fallback failures
    }
  }

  const cleanText = extractedText.replace(/\r\n/g, "\n");

  // 1. Weight (kg): 20 - 300
  const weightKg = extractValue(
    cleanText,
    [
      /(?:Weight|Body\s*Weight|WT|Target\s*Weight)\s*[:=]?\s*([0-9]{2,3}(?:\.[0-9]{1,2})?)\s*(?:kg|kgs)?/i,
      /([0-9]{2,3}(?:\.[0-9]{1,2})?)\s*kg\s*(?:Weight|Body\s*Weight)/i,
    ],
    20,
    300
  );

  // 2. BMI: 10 - 65
  const bmi = extractValue(
    cleanText,
    [
      /(?:BMI|Body\s*Mass\s*Index)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)/i,
      /(?:BMI|Body\s*Mass\s*Index)\s+([0-9]{1,2}(?:\.[0-9]{1,2})?)/i,
    ],
    10,
    65
  );

  // 3. Body Fat % (PBF): 3 - 65%
  const bodyFatPercentage = extractValue(
    cleanText,
    [
      /(?:Percent\s*Body\s*Fat|Body\s*Fat\s*(?:Percentage|%)?|PBF|FAT\s*%?)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%?/i,
      /(?:Fat\s*Rate|Fat\s*Ratio)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%?/i,
    ],
    3,
    65
  );

  // 4. Muscle Mass (kg) / SMM: 10 - 150 kg
  const muscleMassKg = extractValue(
    cleanText,
    [
      /(?:Skeletal\s*Muscle\s*Mass|Muscle\s*Mass|SMM|Lean\s*Mass)\s*[:=]?\s*([0-9]{1,3}(?:\.[0-9]{1,2})?)\s*(?:kg)?/i,
      /(?:Muscle\s*Weight)\s*[:=]?\s*([0-9]{1,3}(?:\.[0-9]{1,2})?)\s*(?:kg)?/i,
    ],
    10,
    150
  );

  // 5. Total Body Water %: 20 - 85%
  const bodyWaterPercentage = extractValue(
    cleanText,
    [
      /(?:Total\s*Body\s*Water|Body\s*Water\s*(?:Percentage|%)?|TBW)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%?/i,
      /(?:Hydration|Water\s*Rate)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%?/i,
    ],
    20,
    85
  );

  // 6. Visceral Fat: 1 - 30
  const visceralFat = extractValue(
    cleanText,
    [
      /(?:Visceral\s*Fat\s*(?:Level|Rating)?|VFL|Visceral\s*Rating)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)/i,
    ],
    1,
    30
  );

  // 7. Bone Mass (kg): 0.5 - 10 kg
  const boneMassKg = extractValue(
    cleanText,
    [
      /(?:Bone\s*Mass|Bone\s*Mineral\s*Content|BMC|Bone)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*(?:kg)?/i,
    ],
    0.5,
    10
  );

  // 8. BMR (kcal): 500 - 4500
  const bmrKcal = extractValue(
    cleanText,
    [
      /(?:Basal\s*Metabolic\s*Rate|BMR|Metabolic\s*Rate)\s*[:=]?\s*([0-9]{3,4}(?:\.[0-9]{1,2})?)\s*(?:kcal)?/i,
    ],
    500,
    4500
  );

  // 9. Body Age: 12 - 100
  const bodyAgeMatch = cleanText.match(/(?:Body\s*Age|Metabolic\s*Age)\s*[:=]?\s*([0-9]{1,2})/i);
  let bodyAge: number | null = null;
  if (bodyAgeMatch && bodyAgeMatch[1]) {
    const age = parseInt(bodyAgeMatch[1], 10);
    if (isValidRange(age, 12, 100)) {
      bodyAge = age;
    }
  }

  // 10. Skeletal Muscle %: 10 - 70%
  const skeletalMusclePercentage = extractValue(
    cleanText,
    [
      /(?:Skeletal\s*Muscle\s*(?:Percentage|%)?|SMM\s*%)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%?/i,
    ],
    10,
    70
  );

  // Aggregate any discovered metrics into structured dictionary
  const metrics: Record<string, number | string> = {};
  if (weightKg !== null) metrics["weightKg"] = weightKg;
  if (bmi !== null) metrics["bmi"] = bmi;
  if (bodyFatPercentage !== null) metrics["bodyFatPercentage"] = bodyFatPercentage;
  if (muscleMassKg !== null) metrics["muscleMassKg"] = muscleMassKg;
  if (bodyWaterPercentage !== null) metrics["bodyWaterPercentage"] = bodyWaterPercentage;
  if (visceralFat !== null) metrics["visceralFat"] = visceralFat;
  if (boneMassKg !== null) metrics["boneMassKg"] = boneMassKg;
  if (bmrKcal !== null) metrics["bmrKcal"] = bmrKcal;
  if (bodyAge !== null) metrics["bodyAge"] = bodyAge;
  if (skeletalMusclePercentage !== null) metrics["skeletalMusclePercentage"] = skeletalMusclePercentage;

  return {
    weightKg,
    bmi,
    bodyFatPercentage,
    muscleMassKg,
    bodyWaterPercentage,
    visceralFat,
    boneMassKg,
    bmrKcal,
    bodyAge,
    skeletalMusclePercentage,
    metrics,
    rawSnippet: cleanText.slice(0, 300).trim(),
  };
}
