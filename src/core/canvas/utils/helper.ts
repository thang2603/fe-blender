import { toast } from "sonner";

export async function copyJsonToClipboard<T>(data: T): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(jsonString);
    toast.success("Copy JSON thành công!");
    return true;
  } catch (error) {
    toast.error("Lỗi khi copy JSON");
    console.error("Lỗi khi copy JSON:", error);
    return false;
  }
}

export async function pasteJsonFromClipboard<T>(): Promise<T | null> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return null;
    const parsedData = JSON.parse(text) as T;
    toast.success("Paste JSON thành công!");
    return parsedData;
  } catch (error) {
    console.error(
      "Clipboard không chứa JSON hợp lệ hoặc thiếu quyền truy cập:",
      error,
    );
    return null;
  }
}

export const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 15);
};
