import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeText, suggestTrade } from "./suggest-trade";

describe("normalizeText", () => {
  it("folds accents, case, and punctuation", () => {
    assert.equal(normalizeText("  ¡ÉléCtrico!  "), "electrico");
    assert.equal(normalizeText("Baño"), "bano");
    assert.equal(normalizeText("SE FUE LA LUZ"), "se fue la luz");
  });
});

describe("suggestTrade", () => {
  it("suggests Electricista for the acceptance description", () => {
    const result = suggestTrade(
      "se fue la luz en la cocina y huele a quemado",
    );

    assert.equal(result.oficio, "Electricista");
    assert.equal(result.category, "ELECTRICAL");
    assert.equal(result.confidence, "high");
    assert.deepEqual(result.keywords, ["luz", "quemado"]);
  });

  it("treats accents and case as the same description", () => {
    const result = suggestTrade(
      "SE FUE LA LUZ EN LA COCINA Y HUELE A QUEMADO",
    );
    assert.equal(result.oficio, "Electricista");
    assert.equal(result.confidence, "high");

    const accented = suggestTrade(
      "El apagador eléctrico no funciona y no hay luz",
    );
    assert.equal(accented.oficio, "Electricista");
    assert.equal(accented.confidence, "high");
    assert.ok(accented.keywords.includes("apagador"));
    assert.ok(accented.keywords.includes("eléctrico"));
  });

  it("suggests Plomero from a leak", () => {
    const result = suggestTrade(
      "Hay una gotera en la tubería del lavabo y el baño está tapado",
    );
    assert.equal(result.oficio, "Plomero");
    assert.equal(result.category, "PLUMBING");
    assert.equal(result.confidence, "high");
    assert.ok(result.keywords.includes("gotera"));
    assert.ok(result.keywords.includes("tubería"));
  });

  it("suggests a minisplit technician when the AC does not cool", () => {
    const result = suggestTrade(
      "El minisplit de la recámara no enfría desde ayer",
    );
    assert.equal(result.oficio, "Técnico en aire acondicionado");
    assert.equal(result.category, "HVAC");
    assert.equal(result.confidence, "high");
    assert.ok(result.keywords.includes("minisplit"));
  });

  it("suggests Manitas for mounting and drywall", () => {
    const result = suggestTrade(
      "Quiero colgar un cuadro y resanar la tablaroca de la sala",
    );
    assert.equal(result.oficio, "Manitas");
    assert.equal(result.category, "HANDYMAN");
    assert.equal(result.confidence, "high");
    assert.ok(result.keywords.includes("tablaroca"));
  });

  it("suggests appliance repair for a washer", () => {
    const result = suggestTrade(
      "La lavadora no centrifuga y deja la ropa empapada",
    );
    assert.equal(result.oficio, "Técnico en electrodomésticos");
    assert.equal(result.category, "APPLIANCE_REPAIR");
    assert.equal(result.confidence, "high");
    assert.deepEqual(result.keywords, ["lavadora", "centrifuga"]);
  });

  it("returns no suggestion when nothing matches", () => {
    const result = suggestTrade(
      "Necesito quien me ayude a mover cajas de la mudanza este sábado",
    );
    assert.equal(result.confidence, "none");
    assert.equal(result.category, null);
    assert.equal(result.oficio, null);
    assert.deepEqual(result.keywords, []);
  });

  it("does not match a keyword hidden inside a longer word", () => {
    const result = suggestTrade("El piso reluciente necesita una cera");
    assert.equal(result.confidence, "none");
  });

  it("returns low confidence for a single weak keyword", () => {
    const result = suggestTrade("Hay agua en el piso de la cocina");
    assert.equal(result.oficio, "Plomero");
    assert.equal(result.confidence, "low");
    assert.deepEqual(result.keywords, ["agua"]);
  });

  it("returns low confidence when two trades tie", () => {
    const result = suggestTrade("Hay una fuga junto al enchufe");
    assert.equal(result.confidence, "low");
    // Plumbing is listed first, so a tie breaks toward Plomero.
    assert.equal(result.oficio, "Plomero");
    assert.equal(result.category, "PLUMBING");
    assert.deepEqual(result.keywords, ["fuga"]);
  });

  it("returns no suggestion for empty text", () => {
    assert.equal(suggestTrade("   ").confidence, "none");
    assert.equal(suggestTrade("").confidence, "none");
  });
});
