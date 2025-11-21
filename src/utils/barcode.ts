import JsBarcode from "jsbarcode";

export function makeCode128(value: string) {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    displayValue: false,
    margin: 0,
  });
  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.split(",")[1]; // только base64 без префикса
}
