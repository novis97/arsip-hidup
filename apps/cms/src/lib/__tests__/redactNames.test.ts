import { describe, expect, it } from "vitest";
import { redactNames } from "../redactNames";

describe("redactNames", () => {
  it("menyapu nama lengkap walau semua katanya stopword", () => {
    const result = redactNames(
      "Laras Wening menceritakan",
      ["Laras Wening"],
      "Narasumber (anonim)",
    );

    expect(result.text).toBe("Narasumber (anonim) menceritakan");
    expect(result.redactions).toEqual([{ word: "Laras Wening", count: 1 }]);
  });

  it("tidak menyapu stopword berhuruf kecil", () => {
    const result = redactNames(
      "campuran sari daun indigo",
      ["Sari Ningsih"],
      "Ibu S.N.",
    );

    expect(result.text).toBe("campuran sari daun indigo");
    expect(result.redactions).toEqual([]);
  });

  it("menyapu nama lengkap tanpa mencatat stopword sebagai kata tersendiri", () => {
    const result = redactNames(
      "Sari Ningsih menjelaskan",
      ["Sari Ningsih"],
      "Ibu S.N.",
    );

    expect(result.text).toBe("Ibu S.N. menjelaskan");
    expect(result.redactions).toContainEqual({
      word: "Sari Ningsih",
      count: 1,
    });
    expect(result.redactions).not.toContainEqual(
      expect.objectContaining({ word: "Sari" }),
    );
  });

  it("menyapu kata nama non-stopword yang diawali huruf kapital", () => {
    const result = redactNames(
      "Ningsih menjelaskan, tetapi ningsih tetap huruf kecil",
      ["Sari Ningsih"],
      "Ibu S.N.",
    );

    expect(result.text).toBe(
      "Ibu S.N. menjelaskan, tetapi ningsih tetap huruf kecil",
    );
    expect(result.redactions).toContainEqual({ word: "Ningsih", count: 1 });
  });

  it("tidak menyapu substring di dalam kata lain", () => {
    const result = redactNames(
      "Weningnya",
      ["Laras Wening"],
      "Narasumber (anonim)",
    );

    expect(result.text).toBe("Weningnya");
    expect(result.redactions).toEqual([]);
  });

  it("tidak mengubah teks narasumber full_name", () => {
    const result = redactNames(
      "[SEED] Ratmi menjelaskan",
      [],
      "[SEED] Ratmi",
    );

    expect(result.text).toBe("[SEED] Ratmi menjelaskan");
    expect(result.redactions).toEqual([]);
  });

  it("menerima teks null dan undefined", () => {
    expect(redactNames(null, ["Sari Ningsih"], "Ibu S.N.")).toEqual({
      text: null,
      redactions: [],
    });
    expect(
      redactNames(undefined, ["Sari Ningsih"], "Ibu S.N."),
    ).toEqual({ text: undefined, redactions: [] });
  });

  it("meng-escape karakter khusus regex dalam nama", () => {
    const result = redactNames(
      "Ayu (Ningsih) berbicara",
      ["Ayu (Ningsih)"],
      "Narasumber",
    );

    expect(result.text).toBe("Narasumber berbicara");
  });
});
